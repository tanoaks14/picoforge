const express = require('express');
const router = express.Router();
const fileController = require('../controllers/file_controller');
const { validate, Joi } = require('../core/validator');

const saveFileSchema = Joi.object({
    projectName: Joi.string().required(),
    filePath: Joi.string().required(),
    content: Joi.string().allow('').required(),
});

router.get('/', fileController.getFile);
router.post('/', validate(saveFileSchema), fileController.saveFile);

module.exports = router;
