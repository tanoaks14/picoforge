const fs = require('fs').promises;
const path = require('path');
const config = require('../config');
const logger = require('../core/logger');

class FileService {
    get workspacePath() {
        return config.workspacePath;
    }

    _getFilePath(projectName, filePath) {
        const fullPath = path.join(this.workspacePath, projectName, filePath);
        // Security check: ensure path is within project directory
        const resolvedPath = path.resolve(fullPath);
        const resolvedProjectPath = path.resolve(path.join(this.workspacePath, projectName));

        if (!resolvedPath.startsWith(resolvedProjectPath)) {
            throw new Error('Access denied: Path outside project directory');
        }
        return fullPath;
    }

    async readFile(projectName, filePath) {
        try {
            const fullPath = this._getFilePath(projectName, filePath);
            const content = await fs.readFile(fullPath, 'utf8');
            return content;
        } catch (error) {
            if (error.code === 'ENOENT') {
                throw new Error('File not found');
            }
            throw error;
        }
    }

    async writeFile(projectName, filePath, content) {
        try {
            const fullPath = this._getFilePath(projectName, filePath);
            // Ensure directory exists
            await fs.mkdir(path.dirname(fullPath), { recursive: true });
            await fs.writeFile(fullPath, content, 'utf8');
            logger.info(`Wrote file: ${filePath} in project ${projectName}`);
        } catch (error) {
            throw error;
        }
    }

    async deleteFile(projectName, filePath) {
        try {
            const fullPath = this._getFilePath(projectName, filePath);
            await fs.unlink(fullPath);
            logger.info(`Deleted file: ${filePath} in project ${projectName}`);
        } catch (error) {
            if (error.code === 'ENOENT') {
                throw new Error('File not found');
            }
            throw error;
        }
    }

    async listFiles(projectName) {
        try {
            const projectPath = path.join(this.workspacePath, projectName);
            const files = await fs.readdir(projectPath, { withFileTypes: true });

            // Filter out build directory and hidden files
            return files
                .filter(dirent => dirent.isFile() && !dirent.name.startsWith('.'))
                .map(dirent => dirent.name);
        } catch (error) {
            if (error.code === 'ENOENT') {
                throw new Error('Project not found');
            }
            throw error;
        }
    }
}

module.exports = new FileService();
