const buildService = require('../services/build_service');
const artifactService = require('../services/artifact_service');
const logger = require('../core/logger');

const triggerBuild = async (req, res, next) => {
    try {
        const { projectName } = req.params;
        const { stream } = await buildService.triggerBuild(projectName);

        // Naive streaming implementation - just pipe raw logs for now
        // In a real app we might use SSE or WebSockets
        res.setHeader('Content-Type', 'text/plain');
        stream.pipe(res);
    } catch (error) {
        next(error);
    }
};

const downloadArtifact = async (req, res, next) => {
    try {
        const { projectName } = req.params;
        const artifactPath = await artifactService.getArtifactPath(projectName);

        if (!artifactPath) {
            return res.status(404).json({ error: 'Artifact not found' });
        }

        res.download(artifactPath);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    triggerBuild,
    downloadArtifact
};
