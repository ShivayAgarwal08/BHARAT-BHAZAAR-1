const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const projectController = require('../controllers/projectController');

router.get('/', requireAuth, projectController.getMyProjects);
router.get('/:id', requireAuth, projectController.getProjectById);
router.put('/:id/complete', requireAuth, projectController.completeProject);

router.get('/:id/messages', requireAuth, projectController.getProjectMessages);
router.post('/:id/messages', requireAuth, projectController.createMessage);

router.post('/:id/rating', requireAuth, projectController.rateProject);
router.get('/intern/:internId/reputation', projectController.getInternReputation);

router.get('/:id/reports', requireAuth, projectController.getProjectReports);
router.post('/:id/reports', requireAuth, projectController.createProjectReport);

router.get('/:id/support', requireAuth, projectController.getProjectSupport);
router.post('/:id/support', requireAuth, projectController.createProjectSupport);

module.exports = router;
