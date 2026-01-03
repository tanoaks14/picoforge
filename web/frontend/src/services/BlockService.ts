/**
 * Block Service - Frontend API for Custom Blocks
 * Implements EXTENSION_GUIDE.md Section 2B - Frontend fetching
 */

import { getJson } from './http';

export interface BlockInput {
    name: string;
    type: 'text' | 'number' | 'select';
    label: string;
    default?: string | number;
    options?: string[];
}

export interface CustomBlockDefinition {
    id: string;
    label: string;
    category: 'setup' | 'loop';
    color: string;
    description?: string;
    inputs: BlockInput[];
}

export interface CustomBlocksResponse {
    version: string;
    count: number;
    blocks: CustomBlockDefinition[];
}

export interface CodePreview {
    headers: string[];
    setup: string | null;
    code: string | null;
    libraries: string[];
}

/**
 * Fetch all custom block definitions
 */
export async function getCustomBlocks(): Promise<CustomBlockDefinition[]> {
    const response = await getJson<CustomBlocksResponse>('/api/v1/blocks/custom');
    return response.blocks;
}

/**
 * Fetch a specific custom block definition
 */
export async function getCustomBlock(blockId: string): Promise<CustomBlockDefinition | null> {
    try {
        return await getJson<CustomBlockDefinition>(`/api/v1/blocks/custom/${blockId}`);
    } catch {
        return null;
    }
}

/**
 * Preview generated code for a custom block
 */
export async function previewBlockCode(type: string, params: Record<string, any>): Promise<CodePreview> {
    const response = await fetch('/api/v1/blocks/custom/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, params }),
    });
    
    if (!response.ok) {
        throw new Error('Failed to preview block code');
    }
    
    return response.json();
}

/**
 * Check if a block type is a custom block (cached)
 */
let customBlockIds: Set<string> | null = null;

export async function isCustomBlockType(blockType: string): Promise<boolean> {
    if (!customBlockIds) {
        const blocks = await getCustomBlocks();
        customBlockIds = new Set(blocks.map(b => b.id));
    }
    return customBlockIds.has(blockType);
}

/**
 * Invalidate custom block cache
 */
export function invalidateBlockCache(): void {
    customBlockIds = null;
}
