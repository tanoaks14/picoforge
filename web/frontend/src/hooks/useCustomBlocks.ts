/**
 * useCustomBlocks Hook - React integration for Custom Block Registry
 * Implements EXTENSION_GUIDE.md Section 2B - Generic Renderer Support
 */

import { useState, useEffect, useCallback } from 'react';
import { 
    getCustomBlocks, 
    CustomBlockDefinition, 
    invalidateBlockCache 
} from '../services/BlockService';

// Re-export the type so consumers can use it
export type { CustomBlockDefinition } from '../services/BlockService';

interface UseCustomBlocksResult {
    customBlocks: CustomBlockDefinition[];
    setupBlocks: CustomBlockDefinition[];
    loopBlocks: CustomBlockDefinition[];
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    getBlockById: (id: string) => CustomBlockDefinition | undefined;
}

/**
 * Hook to fetch and manage custom block definitions
 */
export function useCustomBlocks(): UseCustomBlocksResult {
    const [customBlocks, setCustomBlocks] = useState<CustomBlockDefinition[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadBlocks = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const blocks = await getCustomBlocks();
            setCustomBlocks(blocks);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load custom blocks');
            setCustomBlocks([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const refresh = useCallback(async () => {
        invalidateBlockCache();
        await loadBlocks();
    }, [loadBlocks]);

    useEffect(() => {
        loadBlocks();
    }, [loadBlocks]);

    const getBlockById = useCallback(
        (id: string) => customBlocks.find(b => b.id === id),
        [customBlocks]
    );

    const setupBlocks = customBlocks.filter(b => b.category === 'setup');
    const loopBlocks = customBlocks.filter(b => b.category === 'loop');

    return {
        customBlocks,
        setupBlocks,
        loopBlocks,
        isLoading,
        error,
        refresh,
        getBlockById
    };
}

/**
 * Get default params for a custom block from its definition
 */
export function getDefaultParams(definition: CustomBlockDefinition): Record<string, any> {
    const params: Record<string, any> = {};
    for (const input of definition.inputs) {
        if (input.default !== undefined) {
            params[input.name] = input.default;
        } else if (input.type === 'select' && input.options?.length) {
            params[input.name] = input.options[0];
        } else if (input.type === 'number') {
            params[input.name] = 0;
        } else {
            params[input.name] = '';
        }
    }
    return params;
}
