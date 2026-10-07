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
  getContractPdf
} = require('../controllers/contractController');

router.post('/', requireAuth, createContract);
router.get('/my', requireAuth, getMyContracts);
router.get('/:id', requireAuth, getContractById);
router.get('/:id/pdf', requireAuth, getContractPdf);
router.put('/:id/agree', requireAuth, agreeContract);
router.post('/:id/tasks', requireAuth, createContractTask);
router.put('/tasks/:taskId/toggle', requireAuth, toggleContractTask);

module.exports = router;
