const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project_controller');
const { validate, Joi } = require('../core/validator');

const createProjectSchema = Joi.object({
    name: Joi.string().pattern(/^[a-zA-Z0-9_-]+$/).required(),
}).unknown(true);

router.get('/', projectController.listProjects);
router.post('/', validate(createProjectSchema), projectController.createProject);

module.exports = router;
