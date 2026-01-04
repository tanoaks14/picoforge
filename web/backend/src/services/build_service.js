const path = require('path');
const dockerService = require('./docker_service');
const config = require('../config');
const logger = require('../core/logger');

class BuildService {
    async triggerBuild(projectName, options = {}) {
        const projectPath = path.join(config.workspacePath, projectName);
        
        
        const image = 'picoforge-pico-forge-dev:latest';

        
        
        
        

        
        

        
        const hostProjectPath = path.join(config.hostWorkspacePath, projectName).replace(/\\/g, '/');
        const binds = [`${hostProjectPath}:/app/workspace/${projectName}`];

        logger.info(`[BuildService] Triggering build for ${projectName}`);
        logger.info(`[BuildService] Binds: ${JSON.stringify(binds)}`);

        
        
        const cmd = ['/bin/bash', '-c', `cd /app/workspace/${projectName} && mkdir -p build && cd build && cmake .. && make`];

        try {
            const { stream } = await dockerService.runBuild(image, cmd, binds);

            
            return { status: 'started', stream };
        } catch (error) {
            logger.error(`Build failed for ${projectName}: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new BuildService();
