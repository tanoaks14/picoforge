const fileService = require('../services/file_service');

const getFile = async (req, res, next) => {
    try {
        const { projectName, filePath } = req.query; // ?projectName=&filePath=

        if (!projectName) {
            return res.status(400).json({ error: 'projectName is required' });
        }

        if (!filePath) {
            const files = await fileService.listFiles(projectName);
            return res.json({ files });
        }

        const content = await fileService.readFile(projectName, filePath);
        res.json({ content });
    } catch (error) {
        if (error.message === 'File not found') {
            return res.status(404).json({ error: error.message });
        }
        next(error);
    }
};

const saveFile = async (req, res, next) => {
    try {
        const { projectName, filePath, content } = req.body;
        await fileService.writeFile(projectName, filePath, content);
        res.json({ status: 'ok' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getFile,
    saveFile,
};
