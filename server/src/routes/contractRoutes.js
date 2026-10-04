const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const {
  createContract,
  getMyContracts,
  getContractById,
  agreeContract,
  createContractTask,
  toggleContractTask,
} = require('../controllers/contractController');

router.post('/', requireAuth, createContract);
router.get('/my', requireAuth, getMyContracts);
router.get('/:id', requireAuth, getContractById);
router.put('/:id/agree', requireAuth, agreeContract);
router.post('/:id/tasks', requireAuth, createContractTask);
router.put('/tasks/:taskId/toggle', requireAuth, toggleContractTask);

module.exports = router;
