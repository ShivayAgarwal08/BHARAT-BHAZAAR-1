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

    // Check if there is an existing project for this request or artisan-intern pair
    let existingProjectId = null;
    if (requestId) {
      const proj = await prisma.project.findUnique({ where: { requestId } });
      if (proj) existingProjectId = proj.id;
    }
    if (!existingProjectId) {
      const proj = await prisma.project.findFirst({
        where: { artisanId: artisan.id, internId: intern.id, status: 'IN_PROGRESS' },
        orderBy: { createdAt: 'desc' },
      });
      if (proj) existingProjectId = proj.id;
    }

    const contract = await prisma.contract.create({
      data: {
        artisanId: artisan.id,
        internId: intern.id,
        projectId: existingProjectId || null,
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
    let contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        artisan: { include: { user: { select: { id: true, name: true, phone: true } } } },
        intern: { include: { user: { select: { id: true, name: true, phone: true } } } },
        tasks: { orderBy: { createdAt: 'asc' } },
        project: true,
        request: true,
      },
    });

    if (!contract) return res.status(404).json({ error: 'Contract not found' });

    const isArtisan = contract.artisan.userId === req.user.id || contract.artisan.user.phone === req.user.phone;
    const isIntern = contract.intern.userId === req.user.id || contract.intern.user.phone === req.user.phone;

    if (!isArtisan && !isIntern) {
      return res.status(403).json({ error: 'Unauthorized to view this contract' });
    }

    // Proactively connect / self-heal Project relation if missing (Strictly deterministic)
    if (!contract.projectId) {
      let linkedProject = null;
      if (contract.requestId) {
        linkedProject = await prisma.project.findUnique({
          where: { requestId: contract.requestId },
        });
      }
      if (!linkedProject) {
        const candidateProjects = await prisma.project.findMany({
          where: {
            artisanId: contract.artisanId,
            internId: contract.internId,
          },
        });
        // ONLY link if exactly ONE unambiguous project exists between this pair
        if (candidateProjects.length === 1) {
          linkedProject = candidateProjects[0];
        } else if (candidateProjects.length > 1) {
          console.warn(`Ambiguous projects for contract ${contract.id}: found ${candidateProjects.length} candidate projects. Will not guess.`);
        }
      }

      // If contract is active/agreed but project record was never created, deterministically create it now
      if (!linkedProject && (contract.status === 'ACTIVE' || (contract.artisanAgreed && contract.internAgreed))) {
        let reqId = contract.requestId;
        let appId = null;

        if (!reqId) {
          const newReq = await prisma.managerRequest.create({
            data: {
              artisanId: contract.artisanId,
              title: `Partnership: ${contract.title}`,
              description: 'Growth and operational partnership.',
              category: 'Growth Partnership',
              status: 'IN_PROGRESS',
            },
          });
          reqId = newReq.id;
          const newApp = await prisma.application.create({
            data: {
              requestId: reqId,
              internId: contract.internId,
              message: 'Partnership initiated.',
              status: 'ACCEPTED',
            },
          });
          appId = newApp.id;
        } else {
          let existingApp = await prisma.application.findFirst({
            where: { requestId: reqId, internId: contract.internId },
          });
          if (existingApp) {
            if (existingApp.status !== 'ACCEPTED') {
              await prisma.application.update({
                where: { id: existingApp.id },
                data: { status: 'ACCEPTED' },
              });
            }
            appId = existingApp.id;
          } else {
            const newApp = await prisma.application.create({
              data: {
                requestId: reqId,
                internId: contract.internId,
                message: 'Partnership initiated.',
                status: 'ACCEPTED',
              },
            });
            appId = newApp.id;
          }
        }

        // Check if project exists for reqId or appId
        linkedProject = await prisma.project.findFirst({
          where: { OR: [{ requestId: reqId }, { applicationId: appId }] }
        });

        if (!linkedProject) {
          linkedProject = await prisma.project.create({
            data: {
              requestId: reqId,
              applicationId: appId,
              artisanId: contract.artisanId,
              internId: contract.internId,
              status: 'IN_PROGRESS',
            },
          });
        }
      }

      if (linkedProject) {
        await prisma.contract.update({
          where: { id: contract.id },
          data: { projectId: linkedProject.id },
        });
        contract.projectId = linkedProject.id;
        contract.project = linkedProject;
      }
    }

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
          // If request exists, ensure an ACCEPTED application exists
          let existingApp = await tx.application.findFirst({
            where: { requestId: reqId, internId: contract.internId },
          });
          if (existingApp) {
            if (existingApp.status !== 'ACCEPTED') {
              await tx.application.update({
                where: { id: existingApp.id },
                data: { status: 'ACCEPTED' },
              });
            }
            appId = existingApp.id;
          } else {
            const newApp = await tx.application.create({
              data: {
                requestId: reqId,
                internId: contract.internId,
                message: 'Partnership initiated.',
                status: 'ACCEPTED',
              },
            });
            appId = newApp.id;
          }
        }

        if (reqId && appId) {
          // Check if project exists before creating
          let project = await tx.project.findFirst({
            where: { OR: [{ requestId: reqId }, { applicationId: appId }] }
          });
          if (!project) {
            project = await tx.project.create({
              data: {
                requestId: reqId,
                applicationId: appId,
                artisanId: contract.artisanId,
                internId: contract.internId,
                status: 'IN_PROGRESS',
              },
            });
          }
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


const getContractPdf = async (req, res) => {
  const { id } = req.params;

  try {
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        artisan: { include: { user: true } },
        intern: { include: { user: true } },
        tasks: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!contract) return res.status(404).json({ error: 'Contract not found' });

    // Multi-factor authorization: checks user id against artisan/intern relation or role
    const isArtisan = contract.artisan?.userId === req.user.id ||
                      contract.artisanId === req.user.id ||
                      (req.user.role === 'ARTISAN' && contract.artisan?.user?.phone === req.user.phone);
    const isIntern = contract.intern?.userId === req.user.id ||
                     contract.internId === req.user.id ||
                     (req.user.role === 'INTERN' && contract.intern?.user?.phone === req.user.phone);
    const isAdmin = req.user.role === 'ADMIN';

    if (!isArtisan && !isIntern && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized to download this partnership agreement' });
    }

    const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      const safeRef = (contract.id || id).slice(0, 8).toUpperCase();
      const filename = `Bharat-Bazaar-Partnership-Agreement-${safeRef}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
      return res.status(200).send(pdfBuffer);
    });

    doc.on('error', (pdfErr) => {
      console.error('PDFKit stream error:', pdfErr);
      if (!res.headersSent) {
        return res.status(500).json({ error: 'Failed to generate partnership agreement PDF' });
      }
    });

    // HEADER
    doc.fontSize(18).font('Helvetica-Bold').fillColor('#78350f').text('BHARAT BAZAAR', { align: 'center' }); // amber-900
    doc.fontSize(10).font('Helvetica').fillColor('#b45309').text('Local craft. Limitless possibilities.', { align: 'center' }); // amber-700
    doc.moveDown(1.5);

    doc.fontSize(22).font('Times-Bold').fillColor('#111827').text('PARTNERSHIP AGREEMENT', { align: 'center' }); // gray-900
    doc.moveDown(0.5);

    const safeContractId = contract.id || id;
    const refCode = safeContractId.slice(0, 8).toUpperCase();
    const createdDate = contract.createdAt ? new Date(contract.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#4b5563').text(`REF: ${refCode}   |   DATE: ${createdDate}   |   STATUS: ${contract.status || 'ACTIVE'}`, { align: 'center' });
    doc.moveDown(2);

    const drawLine = () => {
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e5e7eb').stroke();
      doc.moveDown(1);
    };

    // PARTIES
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#9ca3af').text('PARTIES', { align: 'left', tracking: 2 });
    drawLine();

    const partyY = doc.y;

    // Client / Artisan
    const artisanName = contract.artisan?.user?.name || 'Artisan Partner';
    const artisanLoc = contract.artisan?.location || contract.artisan?.state || '';
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#6b7280').text('Client / Business Owner', 50, partyY);
    doc.fontSize(14).font('Times-Bold').fillColor('#111827').text(artisanName, 50, doc.y + 5);
    doc.fontSize(10).font('Helvetica').fillColor('#4b5563').text('Business/Brand Owner', 50, doc.y + 2);
    if (artisanLoc) doc.text(artisanLoc, 50, doc.y + 2);

    // Growth Manager
    const internName = contract.intern?.user?.name || 'Growth Manager Partner';
    const internCollege = contract.intern?.college || contract.intern?.institution || '';
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#6b7280').text('Growth Manager / Partner', 300, partyY);
    doc.fontSize(14).font('Times-Bold').fillColor('#111827').text(internName, 300, doc.y + 5);
    doc.fontSize(10).font('Helvetica').fillColor('#4b5563').text('Professional Growth Partner', 300, doc.y + 2);
    if (internCollege) doc.text(internCollege, 300, doc.y + 2);

    doc.moveDown(2);
    doc.x = 50;

    // 1. PURPOSE
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#9ca3af').text('1. PURPOSE OF THE PARTNERSHIP', { tracking: 2 });
    drawLine();
    doc.fontSize(10).font('Times-Roman').fillColor('#374151').text(
      contract.description || `The purpose of this agreement is to define the terms of the growth and operational partnership regarding: ${contract.title || 'Digital Growth'}. Both parties commit to collaborating professionally through the Bharat Bazaar platform.`,
      { lineGap: 4 }
    );
    doc.moveDown(2);

    // 2. SCOPE OF WORK
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#9ca3af').text('2. SCOPE OF WORK', { tracking: 2 });
    drawLine();
    if (Array.isArray(contract.responsibilities) && contract.responsibilities.length > 0) {
      contract.responsibilities.forEach((resp) => {
        doc.fontSize(10).font('Times-Roman').fillColor('#374151').text(`•  ${resp}`, { lineGap: 4, indent: 10 });
      });
    } else {
      doc.fontSize(10).font('Times-Italic').fillColor('#374151').text('The specific responsibilities will be detailed within the Execution Plan on the platform.');
    }
    doc.moveDown(2);

    // 3. DELIVERABLES
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#9ca3af').text('3. DELIVERABLES (EXECUTION PLAN)', { tracking: 2 });
    drawLine();
    if (Array.isArray(contract.tasks) && contract.tasks.length > 0) {
      contract.tasks.forEach((task) => {
        const dateStr = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-IN') : 'No Date';
        const statusStr = task.isCompleted ? 'DONE' : 'PENDING';
        const roleStr = task.assignedRole ? ` [${task.assignedRole}]` : '';
        doc.fontSize(10).font('Times-Roman').fillColor('#374151').text(`[${statusStr}] ${task.title}${roleStr} (Due: ${dateStr})`, { lineGap: 4, indent: 10 });
      });
    } else {
      doc.fontSize(10).font('Times-Italic').fillColor('#374151').text('No deliverables have been formally attached to this document yet. Both parties may define deliverables within the workspace.');
    }
    doc.moveDown(2);

    // 4. PARTNERSHIP PERIOD
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#9ca3af').text('4. PARTNERSHIP PERIOD', { tracking: 2 });
    drawLine();
    doc.fontSize(10).font('Times-Roman').fillColor('#374151').text(`Commencement Date: ${contract.startDate ? new Date(contract.startDate).toLocaleDateString('en-IN') : '—'}`, { lineGap: 4 });
    doc.text(`Duration: ${contract.duration || 'Not specified'}`, { lineGap: 4 });
    doc.text(`End Date: ${contract.endDate ? new Date(contract.endDate).toLocaleDateString('en-IN') : 'Ongoing/Variable'}`, { lineGap: 4 });
    doc.moveDown(2);

    // 5. COMMERCIAL TERMS
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#9ca3af').text('5. COMMERCIAL TERMS', { tracking: 2 });
    drawLine();
    doc.fontSize(10).font('Times-Roman').fillColor('#374151').text(`Engagement Type: ${contract.paymentType || 'FIXED'}`, { lineGap: 4 });
    doc.text(`Agreed Value: ${contract.paymentAmount !== null && contract.paymentAmount !== undefined && contract.paymentAmount > 0 ? 'Rs. ' + contract.paymentAmount : 'Pro Bono / Mutual Agreement'}`, { lineGap: 4 });
    doc.moveDown(2);

    // 6. REPORTING & COLLABORATION GUIDELINES
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#9ca3af').text('6. COLLABORATION GUIDELINES', { tracking: 2 });
    drawLine();
    doc.fontSize(10).font('Times-Roman').fillColor('#374151').text('Reporting: The Growth Manager is expected to submit periodic performance updates via the "Partnership Reports" module in the workspace.', { lineGap: 4 });
    doc.moveDown(0.5);
    doc.text('Communication: All official project-related communications shall occur via the secure platform "Communication" channels to maintain transparency.', { lineGap: 4 });
    doc.moveDown(2);

    // 7. PLATFORM ACKNOWLEDGEMENT
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#9ca3af').text('7. PLATFORM ACKNOWLEDGEMENT', { tracking: 2 });
    drawLine();
    doc.fontSize(10).font('Times-Italic').fillColor('#6b7280').text('By utilizing this service, both parties acknowledge that Bharat Bazaar operates solely as a facilitator providing digital tools, analytics, and infrastructure for this partnership. Bharat Bazaar is not a legal party to this specific agreement and this document serves as a structured digital record of the mutually agreed scope between the Client and Growth Manager.', { lineGap: 4 });
    doc.moveDown(3);

    // 8. SIGNATURES
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#9ca3af').text('8. DIGITAL ACKNOWLEDGEMENT & SIGNATURES', { tracking: 2, align: 'center' });
    doc.moveDown(1);

    const sigY = doc.y;

    // Client Signature
    if (contract.artisanAgreed) {
      doc.fontSize(16).font('Times-Italic').fillColor('#111827').text(artisanName, 50, sigY);
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#059669').text('Digitally Verified', 50, sigY + 20);
    } else {
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#d97706').text('Pending Signature', 50, sigY + 20);
    }
    doc.moveTo(50, sigY + 40).lineTo(200, sigY + 40).strokeColor('#111827').stroke();
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#6b7280').text('Client Signature', 50, sigY + 45);

    // Manager Signature
    if (contract.internAgreed) {
      doc.fontSize(16).font('Times-Italic').fillColor('#111827').text(internName, 300, sigY);
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#059669').text('Digitally Verified', 300, sigY + 20);
    } else {
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#d97706').text('Pending Signature', 300, sigY + 20);
    }
    doc.moveTo(300, sigY + 40).lineTo(450, sigY + 40).strokeColor('#111827').stroke();
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#6b7280').text('Growth Partner Signature', 300, sigY + 45);

    // Footer - Safe pagination across buffered pages
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).font('Helvetica').fillColor('#9ca3af').text(
        `Bharat Bazaar Platform-Facilitated Partnership Agreement • Document Ref: ${safeContractId} • Page ${i + 1} of ${pages.count}`,
        50,
        doc.page.height - 40,
        { align: 'center' }
      );
    }

    doc.end();

  } catch (error) {
    console.error('PDF generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate PDF agreement. Please try again.' });
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
