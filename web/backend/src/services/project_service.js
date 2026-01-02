const fs = require('fs').promises;
const path = require('path');
const config = require('../config');
const logger = require('../core/logger');
const scaffoldService = require('./scaffold_service');

class ProjectService {
    get workspacePath() {
        return config.workspacePath;
    }

    async listProjects() {
        try {
            const entries = await fs.readdir(this.workspacePath, { withFileTypes: true });
            return entries
                .filter(entry => entry.isDirectory())
                .map(entry => ({ name: entry.name }));
        } catch (error) {
            // If workspace doesn't exist, try to create it and return empty list
            if (error.code === 'ENOENT') {
                await fs.mkdir(this.workspacePath, { recursive: true });
                return [];
            }
            logger.error(`Error listing projects: ${error.message}`);
            throw error;
        }
    }

    async createProject(name, config = {}) {
        if (!name || !/^[a-zA-Z0-9_-]+$/.test(name)) {
            throw new Error('Invalid project name. Only alphanumeric characters, dashes, and underscores are allowed.');
        }

        const reservedNames = ['all', 'test', 'clean', 'install', 'package', 'build', 'rebuild'];
        if (reservedNames.includes(name.toLowerCase())) {
            throw new Error(`Project name '${name}' is reserved by the build system. Please choose another name.`);
        }

        const projectPath = path.join(this.workspacePath, name);
        try {
            await fs.mkdir(projectPath);

            // Scaffolding Logic
            const forgeConfig = {
                project_name: name,
                version: "1.0.0",
                modules: config.modules || [], // Array of module names/configs
                build_options: config.build_options || {}
            };

            await fs.writeFile(path.join(projectPath, 'forge.json'), JSON.stringify(forgeConfig, null, 2));

            // Generate main.cpp with ScaffoldService
            const modules = config.modules || [];
            // helper to normalize module names if they are objects
            const normModules = modules.map(m => typeof m === 'string' ? m : m.module);

            // Pass full config including blocks to ScaffoldService
            const scaffoldConfig = {
                modules: normModules,
                blocks: config.blocks || []
            };

            const mainCpp = scaffoldService.generateMainCpp(name, scaffoldConfig);
            await fs.writeFile(path.join(projectPath, 'main.cpp'), mainCpp);

            // Generate CMakeLists.txt with ScaffoldService
            const cmakeContent = scaffoldService.generateCMakeLists(name, scaffoldConfig);
            await fs.writeFile(path.join(projectPath, 'CMakeLists.txt'), cmakeContent);

            // Generate .gitignore
            await fs.writeFile(path.join(projectPath, '.gitignore'), 'build/\n.vscode/\n');

            logger.info(`Created project: ${name} at ${projectPath}`);
            return { name, path: projectPath };
        } catch (error) {
            if (error.code === 'EEXIST') {
                throw new Error(`Project '${name}' already exists`);
            }
            throw error;
        }
    }
}

module.exports = new ProjectService();
