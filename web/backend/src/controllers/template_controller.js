const projectService = require('../services/project_service');

const SYSTEM_TEMPLATES = [
    {
        id: 'blink',
        name: 'Blinky (System)',
        blocks: [
            { id: 'sys1', type: 'gpio_set', params: { pin: 25, level: 1 } },
            { id: 'sys2', type: 'sleep', params: { ms: 500 } },
            { id: 'sys3', type: 'gpio_set', params: { pin: 25, level: 0 } },
            { id: 'sys4', type: 'sleep', params: { ms: 500 } }
        ]
    },
    {
        id: 'counter',
        name: 'Logic Counter (System)',
        blocks: [
            { id: 'sys_c1', type: 'var_int', params: { name: 'counter', value: 0 } },
            { id: 'sys_c2', type: 'log', params: { text: 'Looping...' } },
            { id: 'sys_c3', type: 'var_set', params: { name: 'counter', value: 'counter + 1' } },
            {
                id: 'sys_c4', type: 'if_block', params: {
                    left: 'counter', operator: '>', right: '5',
                    innerBlocks: [
                        { id: 't4_1', type: 'log', params: { text: "Resetting!" } },
                        { id: 't4_2', type: 'var_set', params: { name: 'counter', value: '0' } }
                    ]
                }
            }
        ]
    }
];

exports.listTemplates = async (req, res, next) => {
    try {
        const userTemplates = await projectService.listTemplates();
        // Merge - favor user templates if ID conflict? User templates usually have unique file-based IDs.
        res.json([...SYSTEM_TEMPLATES, ...userTemplates]);
    } catch (e) {
        next(e);
    }
};

exports.createTemplate = async (req, res, next) => {
    try {
        const { name, blocks } = req.body;
        if (!name || !blocks) return res.status(400).json({ error: 'Missing name or blocks' });
        const result = await projectService.saveTemplate(name, blocks);
        res.status(201).json(result);
    } catch (e) {
        next(e);
    }
};
