

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


export async function getCustomBlocks(): Promise<CustomBlockDefinition[]> {
    const response = await getJson<CustomBlocksResponse>('/api/v1/blocks/custom');
    return response.blocks;
}


export async function getCustomBlock(blockId: string): Promise<CustomBlockDefinition | null> {
    try {
        return await getJson<CustomBlockDefinition>(`/api/v1/blocks/custom/${blockId}`);
    } catch {
        return null;
    }
}


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


let customBlockIds: Set<string> | null = null;

export async function isCustomBlockType(blockType: string): Promise<boolean> {
    if (!customBlockIds) {
        const blocks = await getCustomBlocks();
        customBlockIds = new Set(blocks.map(b => b.id));
    }
    return customBlockIds.has(blockType);
}


export function invalidateBlockCache(): void {
    customBlockIds = null;
}
