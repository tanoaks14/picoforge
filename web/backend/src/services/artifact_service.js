
const fs = require('fs').promises;
const path = require('path');
const config = require('../config');

class ArtifactService {
    get workspacePath() {
        return config.workspacePath;
    }

    async getArtifactPath(projectName, artifactName) {
        if (!artifactName) {
            artifactName = `${projectName}.uf2`;
        }
        
        const artifactPath = path.join(this.workspacePath, projectName, 'build', artifactName);

        
        const resolvedPath = path.resolve(artifactPath);
        if (!resolvedPath.startsWith(path.resolve(this.workspacePath))) {
            throw new Error('Access denied');
        }

        try {
            await fs.access(resolvedPath);
            return resolvedPath;
        } catch (error) {
            return null;
        }
    }
}

module.exports = new ArtifactService();
