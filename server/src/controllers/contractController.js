const prisma = require('../prisma');
const PDFDocument = require('pdfkit');

const createContract = async (req, res) => {
  const {
    requestId,
    internId,
    title,
    description,
    startDate,
    endDate,
    duration,
    paymentType = 'FIXED',
    paymentAmount = 0,
    responsibilities = [],
    tier = 'STARTER',
    tasks = [],
  } = req.body;

  if (req.user.role !== 'ARTISAN') {
    return res.status(403).json({ error: 'Only artisans can initiate contracts' });
  }

  if (!internId || !title) {
    return res.status(400).json({ error: 'Intern ID and contract title are required' });
  }

  try {
    const artisan = await prisma.artisan.findUnique({ where: { userId: req.user.id } });
    if (!artisan) return res.status(404).json({ error: 'Artisan profile not found' });

    const intern = await prisma.intern.findUnique({ where: { id: internId } });
    if (!intern) return res.status(404).json({ error: 'Growth Manager not found' });

    const contract = await prisma.contract.create({
      data: {
        artisanId: artisan.id,
        internId: intern.id,
        requestId: requestId || null,
        title,
        description: description || '',
        tier: tier || intern.tier || 'STARTER',
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        duration: duration || '1 Month',
        paymentType,
        paymentAmount: parseFloat(paymentAmount) || 0,
        responsibilities: Array.isArray(responsibilities) ? responsibilities : [responsibilities],
        artisanAgreed: true, // Artisan created it so agreed
        internAgreed: false,
        status: 'PROPOSED',
        tasks: {
          create: Array.isArray(tasks)
            ? tasks.map((t) => ({
                title: typeof t === 'string' ? t : t.title,
                description: typeof t === 'object' ? t.description : '',
                assignedRole: 'GROWTH_MANAGER',
                isCompleted: false,
                status: 'TODO',
              }))
            : [],
        },
      },
      include: {
        tasks: true,
        artisan: { include: { user: { select: { name: true } } } },
        intern: { include: { user: { select: { name: true } } } },
      },
    });

    res.status(201).json(contract);
  } catch (error) {
    console.error('Create contract error:', error);
    res.status(500).json({ error: 'Failed to create contract' });
  }
};

const getMyContracts = async (req, res) => {
  try {
    let contracts = [];

    if (req.user.role === 'ARTISAN') {
      const artisan = await prisma.artisan.findUnique({ where: { userId: req.user.id } });
      if (!artisan) return res.status(404).json({ error: 'Artisan profile not found' });

      contracts = await prisma.contract.findMany({
        where: { artisanId: artisan.id },
        include: {
          intern: { include: { user: { select: { name: true } } } },
          tasks: true,
          project: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (req.user.role === 'INTERN') {
      const intern = await prisma.intern.findUnique({ where: { userId: req.user.id } });
      if (!intern) return res.status(404).json({ error: 'Intern profile not found' });

      contracts = await prisma.contract.findMany({
        where: { internId: intern.id },
        include: {
          artisan: { include: { user: { select: { name: true } } } },
          tasks: true,
          project: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(contracts);
  } catch (error) {
    console.error('Get my contracts error:', error);
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
};

const getContractById = async (req, res) => {
  const { id } = req.params;

  try {
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        artisan: { include: { user: { select: { name: true, phone: true } } } },
        intern: { include: { user: { select: { name: true, phone: true } } } },
        tasks: { orderBy: { createdAt: 'asc' } },
        project: true,
        request: true,
      },
    });

    if (!contract) return res.status(404).json({ error: 'Contract not found' });

    const isArtisan = contract.artisan.user.phone === req.user.phone || contract.artisanId === req.user.id;
    const isIntern = contract.intern.user.phone === req.user.phone || contract.internId === req.user.id;

    res.json(contract);
  } catch (error) {
    console.error('Get contract by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch contract' });
  }
};

const agreeContract = async (req, res) => {
  const { id } = req.params;

  try {
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: { artisan: true, intern: true },
    });

    if (!contract) return res.status(404).json({ error: 'Contract not found' });

    let dataToUpdate = {};

    if (req.user.role === 'ARTISAN' && contract.artisan.userId === req.user.id) {
      dataToUpdate.artisanAgreed = true;
    } else if (req.user.role === 'INTERN' && contract.intern.userId === req.user.id) {
      dataToUpdate.internAgreed = true;
    } else {
      return res.status(403).json({ error: 'Unauthorized to agree to this contract' });
    }

    const willBeBothAgreed =
      (dataToUpdate.artisanAgreed || contract.artisanAgreed) &&
      (dataToUpdate.internAgreed || contract.internAgreed);

    if (willBeBothAgreed) {
      dataToUpdate.status = 'ACTIVE';
    }

    const updatedContract = await prisma.$transaction(async (tx) => {
      let projectId = contract.projectId;

      if (willBeBothAgreed && !projectId) {
        let reqId = contract.requestId;
        let appId = null;

        // If no request exists, create a dummy one for the direct hire
        if (!reqId) {
          const newReq = await tx.managerRequest.create({
            data: {
              artisanId: contract.artisanId,
              title: `Direct Hire: ${contract.title}`,
              description: 'Automatically generated request for direct hire.',
              category: 'Direct Hire',
              status: 'IN_PROGRESS',
            },
          });
          reqId = newReq.id;

          // Also create an application to satisfy Project relations
          const newApp = await tx.application.create({
            data: {
              requestId: reqId,
              internId: contract.internId,
              message: 'Directly hired via directory.',
              status: 'ACCEPTED',
            },
          });
          appId = newApp.id;
        } else {
          // If request exists, find the accepted application
          const existingApp = await tx.application.findFirst({
            where: { requestId: reqId, internId: contract.internId, status: 'ACCEPTED' },
          });
          if (existingApp) appId = existingApp.id;
        }

        if (reqId && appId) {
          const project = await tx.project.create({
            data: {
              requestId: reqId,
              applicationId: appId,
              artisanId: contract.artisanId,
              internId: contract.internId,
              status: 'IN_PROGRESS',
            },
          });
          projectId = project.id;
          dataToUpdate.projectId = project.id;
          dataToUpdate.requestId = reqId; // Update contract's requestId too
        }
      }
      
      return tx.contract.update({
        where: { id },
        data: dataToUpdate,
        include: { tasks: true },
      });
    });

    res.json(updatedContract);
  } catch (error) {
    console.error('Agree contract error:', error);
    res.status(500).json({ error: 'Failed to update contract agreement' });
  }
};

const createContractTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, assignedRole = 'GROWTH_MANAGER', dueDate } = req.body;

  if (!title) return res.status(400).json({ error: 'Task title is required' });

  try {
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: { artisan: true, intern: true },
    });

    if (!contract) return res.status(404).json({ error: 'Contract not found' });

    const isArtisan = contract.artisan.userId === req.user.id;
    const isIntern = contract.intern.userId === req.user.id;

    if (!isArtisan && !isIntern) {
      return res.status(403).json({ error: 'Unauthorized to add tasks to this contract' });
    }

    const task = await prisma.contractTask.create({
      data: {
        contractId: id,
        title,
        description: description || '',
        assignedRole,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Create contract task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

const toggleContractTask = async (req, res) => {
  const { taskId } = req.params;
  const { isCompleted } = req.body;

  try {
    const task = await prisma.contractTask.findUnique({
      where: { id: taskId },
      include: { contract: { include: { artisan: true, intern: true } } },
    });

    if (!task) return res.status(404).json({ error: 'Task not found' });

    const isArtisan = task.contract.artisan.userId === req.user.id;
    const isIntern = task.contract.intern.userId === req.user.id;

    if (!isArtisan && !isIntern) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const newCompleted = isCompleted !== undefined ? isCompleted : !task.isCompleted;

    const updatedTask = await prisma.contractTask.update({
      where: { id: taskId },
      data: {
        isCompleted: newCompleted,
        status: newCompleted ? 'COMPLETED' : 'TODO',
        completedAt: newCompleted ? new Date() : null,
      },
    });

    res.json(updatedTask);
  } catch (error) {
    console.error('Toggle contract task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

module.exports = {
  createContract,
  getMyContracts,
  getContractById,
  agreeContract,
  createContractTask,
  toggleContractTask,
};

const getContractPdf = async (req, res) => {
  const { id } = req.params;

  try {
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        artisan: { include: { user: true } },
        intern: { include: { user: true } },
        tasks: true,
      },
    });

    if (!contract) return res.status(404).json({ error: 'Contract not found' });

    const isArtisan = contract.artisan.userId === req.user.id;
    const isIntern = contract.intern.userId === req.user.id;

    if (!isArtisan && !isIntern) {
      return res.status(403).json({ error: 'Unauthorized to download this contract' });
    }

    const doc = new PDFDocument({ margin: 50 });
    const filename = `Bharat-Bazaar-Growth-Agreement-${contract.id}.pdf`;
    
    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    doc.fontSize(20).font('Helvetica-Bold').text('BHARAT BAZAAR', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(16).text('GROWTH PARTNERSHIP AGREEMENT', { align: 'center' });
    doc.moveDown(1);

    doc.fontSize(10).font('Helvetica').text(`Agreement ID: ${contract.id}`);
    doc.text(`Generated date: ${new Date().toLocaleDateString('en-IN')}`);
    doc.moveDown(1);

    doc.fontSize(14).font('Helvetica-Bold').text('PARTIES');
    doc.moveDown(0.5);
    doc.fontSize(12).text('Artisan:');
    doc.font('Helvetica').text(`Name: ${contract.artisan.user.name}`);
    doc.text(`Location: ${contract.artisan.location || 'India'}`);
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('Growth Manager:');
    doc.font('Helvetica').text(`Name: ${contract.intern.user.name}`);
    doc.moveDown(1);

    doc.fontSize(14).font('Helvetica-Bold').text('PROJECT');
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Project Title: ${contract.title}`);
    doc.font('Helvetica').text(`Description: ${contract.description || 'N/A'}`);
    doc.moveDown(1);

    doc.fontSize(14).font('Helvetica-Bold').text('TERM');
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').text(`Start Date: ${new Date(contract.startDate).toLocaleDateString('en-IN')}`);
    doc.text(`Duration: ${contract.duration || 'Not specified'}`);
    doc.moveDown(1);

    doc.fontSize(14).font('Helvetica-Bold').text('PAYMENT');
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').text(`Payment Type: ${contract.paymentType}`);
    doc.text(`Amount: ${contract.paymentAmount > 0 ? 'Rs. ' + contract.paymentAmount : 'Negotiable'}`);
    doc.moveDown(1);

    doc.fontSize(14).font('Helvetica-Bold').text('RESPONSIBILITIES');
    doc.moveDown(0.5);
    contract.responsibilities.forEach((resp, idx) => {
      doc.fontSize(10).font('Helvetica').text(`${idx + 1}. ${resp}`);
    });
    if (contract.responsibilities.length === 0) {
      doc.fontSize(10).font('Helvetica').text('No responsibilities explicitly listed.');
    }
    doc.moveDown(1);

    doc.fontSize(14).font('Helvetica-Bold').text('SIGNATURE / ACCEPTANCE');
    doc.moveDown(0.5);
    doc.fontSize(12).text('Artisan:');
    doc.font('Helvetica').text(`Status: ${contract.artisanAgreed ? 'Accepted' : 'Pending'}`);
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('Growth Manager:');
    doc.font('Helvetica').text(`Status: ${contract.internAgreed ? 'Accepted' : 'Pending'}`);
    doc.moveDown(2);

    doc.fontSize(9).font('Helvetica-Oblique').text('This agreement is generated by Bharat Bazaar as a platform record and is not legal advice.', { align: 'center' });

    doc.end();

  } catch (error) {
    console.error('PDF generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate PDF' });
    }
  }
};

module.exports = {
  createContract,
  getMyContracts,
  getContractById,
  agreeContract,
  createContractTask,
  toggleContractTask,
  getContractPdf,
};
