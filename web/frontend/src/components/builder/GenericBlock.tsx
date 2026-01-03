/**
 * GenericBlock Component - Data-driven block renderer
 * Implements EXTENSION_GUIDE.md Section 2B - Generic Renderer
 * 
 * Renders any custom block based on its JSON definition,
 * eliminating the need for hardcoded switch statements.
 */

import React from 'react';
import { CustomBlockDefinition, BlockInput } from '../../services/BlockService';

interface GenericBlockProps {
    definition: CustomBlockDefinition;
    params: Record<string, any>;
    onChange: (params: Record<string, any>) => void;
    embedded?: boolean; // When true, renders only inputs (for use inside SortableBlock)
}

export type { GenericBlockProps };

const inputStyle: React.CSSProperties = {
    padding: '4px 8px',
    border: '1px solid var(--color-border)',
    borderRadius: '4px',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    fontSize: '0.85em'
};

/**
 * Render a single input field based on its definition
 */
const renderInput = (
    input: BlockInput,
    value: any,
    onChange: (name: string, value: any) => void
) => {
    const handleChange = (newValue: any) => {
        onChange(input.name, newValue);
    };

    switch (input.type) {
        case 'select':
            return (
                <select
                    key={input.name}
                    value={value ?? input.default ?? ''}
                    onChange={e => handleChange(e.target.value)}
                    style={inputStyle}
                    title={input.label}
                >
                    {input.options?.map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            );

        case 'number':
            return (
                <input
                    key={input.name}
                    type="number"
                    value={value ?? input.default ?? 0}
                    onChange={e => handleChange(Number(e.target.value))}
                    placeholder={input.label}
                    style={{ ...inputStyle, width: '70px' }}
                    title={input.label}
                />
            );

        case 'text':
        default:
            return (
                <input
                    key={input.name}
                    type="text"
                    value={value ?? input.default ?? ''}
                    onChange={e => handleChange(e.target.value)}
                    placeholder={input.label}
                    style={{ ...inputStyle, flex: 1, minWidth: '80px' }}
                    title={input.label}
                />
            );
    }
};

/**
 * Generic Block Component
 * Renders any custom block based on its JSON definition
 */
const GenericBlock: React.FC<GenericBlockProps> = ({ definition, params, onChange, embedded = false }) => {
    const handleInputChange = (name: string, value: any) => {
        onChange({ ...params, [name]: value });
    };

    // When embedded, render only the inputs (used inside SortableBlock)
    if (embedded) {
        return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', width: '100%' }}>
                {definition.inputs.map((input: BlockInput) => (
                    <div key={input.name} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <label 
                            style={{ 
                                fontSize: '0.75em', 
                                color: 'var(--color-muted)',
                                minWidth: 'fit-content'
                            }}
                        >
                            {input.label}:
                        </label>
                        {renderInput(input, params[input.name], handleInputChange)}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div style={{ width: '100%' }}>
            {/* Block Description (hover tooltip) */}
            {definition.description && (
                <div 
                    style={{ 
                        fontSize: '0.7em', 
                        color: 'var(--color-muted)', 
                        marginBottom: '6px',
                        opacity: 0.8
                    }}
                    title={definition.description}
                >
                    {definition.description.length > 50 
                        ? definition.description.slice(0, 50) + '...' 
                        : definition.description}
                </div>
            )}
            
            {/* Input Fields */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                {definition.inputs.map((input: BlockInput) => (
                    <div key={input.name} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <label 
                            style={{ 
                                fontSize: '0.75em', 
                                color: 'var(--color-muted)',
                                minWidth: 'fit-content'
                            }}
                        >
                            {input.label}:
                        </label>
                        {renderInput(input, params[input.name], handleInputChange)}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GenericBlock;

/**
 * Check if a block type matches a custom block definition
 */
export function isCustomBlockType(
    blockType: string, 
    customBlocks: CustomBlockDefinition[]
): boolean {
    return customBlocks.some(b => b.id === blockType);
}

/**
 * Get custom block definition by type
 */
export function getCustomBlockDefinition(
    blockType: string,
    customBlocks: CustomBlockDefinition[]
): CustomBlockDefinition | undefined {
    return customBlocks.find(b => b.id === blockType);
}
