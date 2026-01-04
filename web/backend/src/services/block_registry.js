

const fs = require('fs').promises;
const path = require('path');


const CUSTOM_BLOCKS_PATH = path.join(__dirname, '../data/custom_blocks.json');


let blockRegistry = null;
let lastLoadTime = 0;
const CACHE_TTL = 5000; 


async function loadCustomBlocks() {
    const now = Date.now();
    if (blockRegistry && (now - lastLoadTime) < CACHE_TTL) {
        return blockRegistry;
    }

    try {
        const data = await fs.readFile(CUSTOM_BLOCKS_PATH, 'utf-8');
        const parsed = JSON.parse(data);
        blockRegistry = new Map();

        for (const block of parsed.blocks || []) {
            blockRegistry.set(block.id, block);
        }

        lastLoadTime = now;
        console.log(`[BlockRegistry] Loaded ${blockRegistry.size} custom blocks`);
        return blockRegistry;
    } catch (err) {
        console.warn('[BlockRegistry] Could not load custom_blocks.json:', err.message);
        return new Map();
    }
}


async function getAllBlocks() {
    const registry = await loadCustomBlocks();
    return Array.from(registry.values());
}


async function getBlock(blockId) {
    const registry = await loadCustomBlocks();
    return registry.get(blockId) || null;
}


function interpolate(template, params) {
    if (!template) return '';
    return template.replace(/\$\{(\w+)\}/g, (match, key) => {
        return params[key] !== undefined ? params[key] : match;
    });
}


async function generateCode(block) {
    const definition = await getBlock(block.type);
    if (!definition || !definition.generator) {
        return null;
    }

    const gen = definition.generator;
    const params = block.params || {};

    return {
        headers: (gen.headers || []).map(h =>
            h.startsWith('"') || h.startsWith('<') ? `#include ${h}` : `#include "${h}"`
        ),
        setup: gen.setup ? interpolate(gen.setup, params) : null,
        code: gen.code ? interpolate(gen.code, params) : null,
        libraries: gen.libraries || []
    };
}


async function isCustomBlock(blockType) {
    const registry = await loadCustomBlocks();
    return registry.has(blockType);
}


async function getLibraries(blocks) {
    const libs = new Set();
    for (const block of blocks) {
        const def = await getBlock(block.type);
        if (def?.generator?.libraries) {
            def.generator.libraries.forEach(lib => libs.add(lib));
        }
    }
    return Array.from(libs);
}


function invalidateCache() {
    blockRegistry = null;
    lastLoadTime = 0;
}

module.exports = {
    loadCustomBlocks,
    getAllBlocks,
    getBlock,
    generateCode,
    isCustomBlock,
    getLibraries,
    interpolate,
    invalidateCache
};
