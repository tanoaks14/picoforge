const path = require('path');
const dockerService = require('./docker_service');
const config = require('../config');
const logger = require('../core/logger');

class BuildService {
    async triggerBuild(projectName, options = {}) {
        const projectPath = path.join(config.workspacePath, projectName);
        // Docker binds: mount project path to /app in container
        // Using the dev image constructed by docker-compose
        const image = 'picoforge-pico-forge-dev:latest';

        // Command to run inside container: 
        // 1. generate code (pico-forge tool)
        // 2. cmake
        // 3. make

        // We'll use a shell script entrypoint or a composed command
        // For now, let's assume the container has an entrypoint that takes the project dir

        // For binding to the container, we need the HOST path if we are running the backend in a container
        const hostProjectPath = path.join(config.hostWorkspacePath, projectName).replace(/\\/g, '/');
        const binds = [`${hostProjectPath}:/app/workspace/${projectName}`];

        logger.info(`[BuildService] Triggering build for ${projectName}`);
        logger.info(`[BuildService] Binds: ${JSON.stringify(binds)}`);

        // TODO: This command needs to align with what the pico-forge container expects
        // Assuming a builder script that takes project name 
        const cmd = ['/bin/bash', '-c', `cd /app/workspace/${projectName} && mkdir -p build && cd build && cmake .. && make`];

        try {
            const { stream } = await dockerService.runBuild(image, cmd, binds);

            // Stream logs back? specialized handling might be needed in controller
            return { status: 'started', stream };
        } catch (error) {
            logger.error(`Build failed for ${projectName}: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new BuildService();
