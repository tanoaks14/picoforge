/**
 * Custom Blocks API Routes
 * Implements EXTENSION_GUIDE.md Section 2A - GET /api/blocks/custom
 */

const express = require('express');
const blockRegistry = require('../services/block_registry');
const router = express.Router();

/**
 * GET /api/blocks/custom
 * Returns all custom block definitions for the frontend
 */
router.get('/custom', async (req, res, next) => {
    try {
        const blocks = await blockRegistry.getAllBlocks();
        res.json({
            version: '1.0',
            count: blocks.length,
            blocks: blocks.map(block => ({
                id: block.id,
                label: block.label,
                category: block.category,
                color: block.color,
                description: block.description,
                inputs: block.inputs
            }))
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/blocks/custom/:id
 * Returns a specific block definition
 */
router.get('/custom/:id', async (req, res, next) => {
    try {
        const block = await blockRegistry.getBlock(req.params.id);
        if (!block) {
            return res.status(404).json({ error: 'Block not found' });
        }
        res.json(block);
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/blocks/custom/preview
 * Generate code preview for a custom block (without saving)
 */
router.post('/custom/preview', async (req, res, next) => {
    try {
        const { type, params } = req.body;
        if (!type) {
            return res.status(400).json({ error: 'Missing block type' });
        }

        const code = await blockRegistry.generateCode({ type, params: params || {} });
        if (!code) {
            return res.status(404).json({ error: 'Unknown custom block type' });
        }

        res.json(code);
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/blocks/invalidate-cache
 * Force reload of custom blocks (development only)
 */
router.post('/invalidate-cache', (req, res) => {
    blockRegistry.invalidateCache();
    res.json({ message: 'Block registry cache invalidated' });
});

module.exports = router;
