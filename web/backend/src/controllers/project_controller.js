const projectService = require('../services/project_service');

const listProjects = async (req, res, next) => {
    try {
        const projects = await projectService.listProjects();
        res.json(projects);
    } catch (error) {
        next(error);
    }
};

const createProject = async (req, res, next) => {
    try {
        const { name, ...config } = req.body;
        const project = await projectService.createProject(name, config);
        res.status(201).json(project);
    } catch (error) {
        if (error.message.includes('already exists')) {
            return res.status(409).json({ error: error.message });
        }
        if (error.message.includes('Invalid project name')) {
            return res.status(400).json({ error: error.message });
        }
        next(error);
    }
};

module.exports = {
    listProjects,
    createProject,
};
