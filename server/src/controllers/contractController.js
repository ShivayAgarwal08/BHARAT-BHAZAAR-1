const prisma = require('../prisma');

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

    const updatedContract = await prisma.contract.update({
      where: { id },
      data: dataToUpdate,
      include: { tasks: true },
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
