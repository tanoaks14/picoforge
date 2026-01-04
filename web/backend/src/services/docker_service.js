const Docker = require('dockerode');
const config = require('../config');
const logger = require('../core/logger');

class DockerService {
    constructor() {
        this.docker = new Docker({ socketPath: config.docker.socketPath });
    }

    async listContainers() {
        try {
            const containers = await this.docker.listContainers({ all: true });
            return containers;
        } catch (error) {
            logger.error(`Error listing containers: ${error.message}`);
            throw error;
        }
    }

    async runBuild(image, cmd, binds, env = []) {
        try {
            logger.info(`Starting Docker build container with image: ${image}`);
            const container = await this.docker.createContainer({
                Image: image,
                Cmd: cmd,
                HostConfig: {
                    Binds: binds
                },
                Env: env,
                Tty: false,
                AttachStdout: true,
                AttachStderr: true
            });

            await container.start();
            const stream = await container.logs({ follow: true, stdout: true, stderr: true });

            return { container, stream };
        } catch (error) {
            logger.error(`Error running Docker container: ${error.message}`);
            throw error;
        }
    }

    async getImage(imageName) {
        try {
            const images = await this.docker.listImages();
            return images.find(img => img.RepoTags && img.RepoTags.includes(imageName));
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new DockerService();
