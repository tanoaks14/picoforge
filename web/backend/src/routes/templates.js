const express = require('express');
const controller = require('../controllers/template_controller');
const router = express.Router();

router.get('/', controller.listTemplates);
router.post('/', controller.createTemplate);

module.exports = router;
