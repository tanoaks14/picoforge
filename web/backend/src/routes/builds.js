const express = require('express');
const router = express.Router();
const buildController = require('../controllers/build_controller');

router.post('/:projectName', buildController.triggerBuild);
router.get('/:projectName/artifact', buildController.downloadArtifact);

module.exports = router;
