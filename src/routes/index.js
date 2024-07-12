const express = require('express');
const router = express.Router();
const projectController = require('../Controllers/projectController');

router.post('/', projectController.createProject);
router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.put('/:id', projectController.updateProject);
router.delete('/', projectController.deleteProject);

module.exports = router;
