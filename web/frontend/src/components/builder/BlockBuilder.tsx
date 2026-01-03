import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Card from '../primitives/Card';
import Button from '../primitives/Button';
import Select from '../primitives/Select';
import Input from '../primitives/Input';
import { useCustomBlocks, type CustomBlockDefinition } from '../../hooks/useCustomBlocks';
import { type BlockInput } from '../../services/BlockService';
import GenericBlock from './GenericBlock';

// Built-in block types
type BuiltinBlockType = 'gpio_set' | 'sleep' | 'uart_write' | 'log' | 'spi_config' | 'i2c_config' | 'spi_write' | 'spi_read' | 'i2c_write' | 'i2c_read' | 'adc_config' | 'pwm_config' | 'adc_read' | 'pwm_set' | 'function_def' | 'function_call' | 'if_block' | 'var_int' | 'var_set' | 'code_snippet';

export type Block = {
    id: string;
    type: BuiltinBlockType | string; // string allows custom block types
    params: any;
};

// Check if a block type is a custom block (not a builtin)
const BUILTIN_TYPES: BuiltinBlockType[] = ['gpio_set', 'sleep', 'uart_write', 'log', 'spi_config', 'i2c_config', 'spi_write', 'spi_read', 'i2c_write', 'i2c_read', 'adc_config', 'pwm_config', 'adc_read', 'pwm_set', 'function_def', 'function_call', 'if_block', 'var_int', 'var_set', 'code_snippet'];
const isCustomBlockType = (type: string): boolean => !BUILTIN_TYPES.includes(type as BuiltinBlockType);

// Valid Pins for Pico
const VALID_GPIOS = [
    ...Array.from({ length: 23 }, (_, i) => i), // 0-22
    25, // LED
    26, 27, 28 // ADC/GPIO
];

const VALID_ADC_PINS = [26, 27, 28]; // Exposed ADC pins

// SPI Pin Mappings (per Pico datasheet)
const SPI_PINS = {
    spi0: { rx: [0, 4, 16, 20], tx: [3, 7, 19, 23], sck: [2, 6, 18, 22], csn: [1, 5, 17, 21] },
    spi1: { rx: [8, 12], tx: [11, 15], sck: [10, 14], csn: [9, 13] }
};

// I2C Pin Mappings (per Pico datasheet)
const I2C_PINS = {
    i2c0: { sda: [0, 4, 8, 12, 16, 20], scl: [1, 5, 9, 13, 17, 21] },
    i2c1: { sda: [2, 6, 10, 14, 18, 26], scl: [3, 7, 11, 15, 19, 27] }
};

// Utility: Extract pins DEFINED by a block (only config blocks define pins)
// Action blocks (spi_write, gpio_set) USE pins defined elsewhere, so they shouldn't cause conflicts
const getPinsFromBlock = (block: Block): number[] => {
    const pins: number[] = [];
    const p = block.params;

    // Only CONFIG blocks define pins - action blocks just reference them
    if (block.type === 'spi_config') pins.push(p.rx, p.csn, p.sck, p.tx);
    if (block.type === 'i2c_config') pins.push(p.sda, p.scl);
    if (block.type === 'adc_config') pins.push(p.pin);
    if (block.type === 'pwm_config') pins.push(p.pin);

    // GPIO is special - it DOES define a pin usage (conflicts with peripherals)
    if (block.type === 'gpio_set') pins.push(p.pin);

    return pins.filter(pin => typeof pin === 'number');
};

// --- Sortable Item Component ---
const SortableBlock = ({
    block,
    onDelete,
    onChange,
    availableSpi,
    availableI2c,
    availablePwmPins,
    availableAdcPins,
    availableFunctions,
    availableVars,
    pinUsage,
    customBlockDefs
}: {
    block: Block;
    onDelete: (id: string) => void;
    onChange: (id: string, params: any) => void;
    availableSpi: string[];
    availableI2c: string[];
    availablePwmPins: number[];
    availableAdcPins: number[];
    availableFunctions: string[];
    availableVars: string[];
    pinUsage: Map<number, string[]>;
    customBlockDefs: Map<string, CustomBlockDefinition>;
}) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        marginBottom: '8px',
        padding: '12px',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    };

    const isSetup = block.type.endsWith('_config');
    const isMissingConfig =
        (block.type === 'spi_write' && availableSpi.length === 0) ||
        (block.type === 'spi_read' && availableSpi.length === 0) ||
        (block.type === 'i2c_write' && availableI2c.length === 0) ||
        (block.type === 'i2c_read' && availableI2c.length === 0) ||
        (block.type === 'pwm_set' && availablePwmPins.length === 0) ||
        (block.type === 'adc_read' && availableAdcPins.length === 0);

    // Detect pin conflicts for THIS block
    const myPins = getPinsFromBlock(block);
    const conflictingPins = myPins.filter(pin => {
        const users = pinUsage.get(pin) || [];
        return users.length > 1; // More than one block uses this pin
    });
    const hasPinConflict = conflictingPins.length > 0;

    // Helper to style conflicting pin selects
    const getPinStyle = (pin: number) => {
        const users = pinUsage.get(pin) || [];
        return users.length > 1 ? { ...inputStyle, borderColor: 'orange', background: 'rgba(255,165,0,0.1)' } : inputStyle;
    };

    // Determine linked config for action blocks
    let linkedTo: string | null = null;
    if (block.type === 'spi_write' && block.params.inst) {
        linkedTo = `→ ${block.params.inst.toUpperCase()} Config`;
    }
    if (block.type === 'spi_read' && block.params.inst) {
        linkedTo = `→ ${block.params.inst.toUpperCase()} Config`;
    }
    if (block.type === 'i2c_write' && block.params.inst) {
        linkedTo = `→ ${block.params.inst.toUpperCase()} Config`;
    }
    if (block.type === 'i2c_read' && block.params.inst) {
        linkedTo = `→ ${block.params.inst.toUpperCase()} Config`;
    }
    if (block.type === 'adc_read') {
        linkedTo = `→ ADC (GP${block.params.pin})`;
    }
    if (block.type === 'pwm_set') {
        linkedTo = `→ PWM (GP${block.params.pin})`;
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <div {...listeners} style={{ cursor: 'grab', fontSize: '1.2rem', color: 'var(--color-muted)' }}>⋮⋮</div>
            <div style={{ flex: 1 }}>
                <div style={{
                    fontWeight: 'bold',
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                    fontSize: '0.8rem',
                    color: isSetup ? 'var(--color-accent)' : 'var(--color-primary)',
                    display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                    {block.type.replace('_', ' ')}
                    {linkedTo && !isMissingConfig && <span style={{ color: 'var(--color-success)', fontSize: '0.7em', opacity: 0.8 }}>{linkedTo}</span>}
                    {isMissingConfig && <span style={{ color: 'var(--color-danger)', fontSize: '0.7em', border: '1px solid var(--color-danger)', padding: '0 4px', borderRadius: '4px' }}>MISSING CONFIG</span>}
                    {hasPinConflict && <span style={{ color: 'orange', fontSize: '0.7em', border: '1px solid orange', padding: '0 4px', borderRadius: '4px' }}>PIN CONFLICT</span>}
                </div>

                {/* Inline Params Form */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>

                    {/* GPIO Set */}
                    {block.type === 'gpio_set' && (
                        <>
                            <select value={block.params.pin} onChange={e => onChange(block.id, { ...block.params, pin: parseInt(e.target.value) })} style={inputStyle}>
                                {VALID_GPIOS.map(p => (
                                    <option key={p} value={p}>GP{p} {p === 25 ? '(LED)' : ''}</option>
                                ))}
                            </select>
                            <select value={block.params.level} onChange={e => onChange(block.id, { ...block.params, level: e.target.value })} style={inputStyle}>
                                <option value={1}>HIGH</option>
                                <option value={0}>LOW</option>
                            </select>
                        </>
                    )}

                    {/* Sleep */}
                    {block.type === 'sleep' && (
                        <input placeholder="ms" type="number" value={block.params.ms} onChange={e => onChange(block.id, { ...block.params, ms: e.target.value })} style={inputStyle} />
                    )}

                    {/* UART/Log */}
                    {(block.type === 'uart_write' || block.type === 'log') && (
                        <input placeholder="Text" value={block.params.text} onChange={e => onChange(block.id, { ...block.params, text: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                    )}

                    {/* SPI Config */}
                    {block.type === 'spi_config' && (() => {
                        const inst = block.params.inst as 'spi0' | 'spi1';
                        const pins = SPI_PINS[inst] || SPI_PINS.spi0;
                        return (
                            <>
                                <select value={block.params.inst} onChange={e => {
                                    const newInst = e.target.value as 'spi0' | 'spi1';
                                    const newPins = SPI_PINS[newInst];
                                    onChange(block.id, { ...block.params, inst: newInst, rx: newPins.rx[0], tx: newPins.tx[0], sck: newPins.sck[0], csn: newPins.csn[0] });
                                }} style={inputStyle}>
                                    <option value="spi0">SPI0</option>
                                    <option value="spi1">SPI1</option>
                                </select>
                                <input placeholder="Baud" type="number" value={block.params.baud} onChange={e => onChange(block.id, { ...block.params, baud: e.target.value })} style={{ ...inputStyle, width: '70px' }} />

                                <select value={block.params.rx} onChange={e => onChange(block.id, { ...block.params, rx: parseInt(e.target.value) })} style={inputStyle} title="RX (MISO) Pin">
                                    {pins.rx.map(p => <option key={p} value={p}>RX: GP{p}</option>)}
                                </select>
                                <select value={block.params.tx} onChange={e => onChange(block.id, { ...block.params, tx: parseInt(e.target.value) })} style={inputStyle} title="TX (MOSI) Pin">
                                    {pins.tx.map(p => <option key={p} value={p}>TX: GP{p}</option>)}
                                </select>
                                <select value={block.params.sck} onChange={e => onChange(block.id, { ...block.params, sck: parseInt(e.target.value) })} style={inputStyle} title="SCK Pin">
                                    {pins.sck.map(p => <option key={p} value={p}>SCK: GP{p}</option>)}
                                </select>
                                <select value={block.params.csn} onChange={e => onChange(block.id, { ...block.params, csn: parseInt(e.target.value) })} style={inputStyle} title="CS Pin">
                                    {pins.csn.map(p => <option key={p} value={p}>CS: GP{p}</option>)}
                                </select>
                            </>
                        );
                    })()}

                    {/* SPI Write */}
                    {block.type === 'spi_write' && (() => {
                        const inst = block.params.inst as 'spi0' | 'spi1';
                        const csPins = SPI_PINS[inst]?.csn || SPI_PINS.spi0.csn;
                        return (
                            <>
                                <select value={block.params.inst} onChange={e => onChange(block.id, { ...block.params, inst: e.target.value })} style={isMissingConfig ? { ...inputStyle, borderColor: 'var(--color-danger)' } : inputStyle}>
                                    {availableSpi.length === 0 ? <option value="">No Config</option> : null}
                                    {availableSpi.map(inst => <option key={inst} value={inst}>{inst.toUpperCase()}</option>)}
                                </select>
                                <input placeholder="Data" value={block.params.data} onChange={e => onChange(block.id, { ...block.params, data: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                                <select value={block.params.csn} onChange={e => onChange(block.id, { ...block.params, csn: parseInt(e.target.value) })} style={inputStyle}>
                                    {csPins.map(p => <option key={p} value={p}>CS: GP{p}</option>)}
                                </select>
                            </>
                        );
                    })()}

                    {/* SPI Read */}
                    {block.type === 'spi_read' && (() => {
                        const inst = block.params.inst as 'spi0' | 'spi1';
                        const csPins = SPI_PINS[inst]?.csn || SPI_PINS.spi0.csn;
                        return (
                            <>
                                <select value={block.params.inst} onChange={e => onChange(block.id, { ...block.params, inst: e.target.value })} style={isMissingConfig ? { ...inputStyle, borderColor: 'var(--color-danger)' } : inputStyle}>
                                    {availableSpi.length === 0 ? <option value="">No Config</option> : null}
                                    {availableSpi.map(inst => <option key={inst} value={inst}>{inst.toUpperCase()}</option>)}
                                </select>
                                <input placeholder="Bytes" type="number" value={block.params.len} onChange={e => onChange(block.id, { ...block.params, len: parseInt(e.target.value) || 1 })} style={{ ...inputStyle, width: '60px' }} />
                                <select value={block.params.csn} onChange={e => onChange(block.id, { ...block.params, csn: parseInt(e.target.value) })} style={inputStyle}>
                                    {csPins.map(p => <option key={p} value={p}>CS: GP{p}</option>)}
                                </select>
                            </>
                        );
                    })()}

                    {/* I2C Config */}
                    {block.type === 'i2c_config' && (() => {
                        const inst = block.params.inst as 'i2c0' | 'i2c1';
                        const pins = I2C_PINS[inst] || I2C_PINS.i2c0;
                        return (
                            <>
                                <select value={block.params.inst} onChange={e => {
                                    const newInst = e.target.value as 'i2c0' | 'i2c1';
                                    const newPins = I2C_PINS[newInst];
                                    onChange(block.id, { ...block.params, inst: newInst, sda: newPins.sda[0], scl: newPins.scl[0] });
                                }} style={inputStyle}>
                                    <option value="i2c0">I2C0</option>
                                    <option value="i2c1">I2C1</option>
                                </select>
                                <input placeholder="Baud" type="number" value={block.params.baud} onChange={e => onChange(block.id, { ...block.params, baud: e.target.value })} style={{ ...inputStyle, width: '70px' }} />

                                <select value={block.params.sda} onChange={e => onChange(block.id, { ...block.params, sda: parseInt(e.target.value) })} style={inputStyle} title="SDA Pin">
                                    {pins.sda.map(p => <option key={p} value={p}>SDA: GP{p}</option>)}
                                </select>
                                <select value={block.params.scl} onChange={e => onChange(block.id, { ...block.params, scl: parseInt(e.target.value) })} style={inputStyle} title="SCL Pin">
                                    {pins.scl.map(p => <option key={p} value={p}>SCL: GP{p}</option>)}
                                </select>
                            </>
                        );
                    })()}

                    {/* I2C Write */}
                    {block.type === 'i2c_write' && (
                        <>
                            <select value={block.params.inst} onChange={e => onChange(block.id, { ...block.params, inst: e.target.value })} style={isMissingConfig ? { ...inputStyle, borderColor: 'var(--color-danger)' } : inputStyle}>
                                {availableI2c.length === 0 ? <option value="">No Config</option> : null}
                                {availableI2c.map(inst => <option key={inst} value={inst}>{inst.toUpperCase()}</option>)}
                            </select>
                            <input placeholder="Addr (0x)" value={block.params.addr} onChange={e => onChange(block.id, { ...block.params, addr: e.target.value })} style={{ ...inputStyle, width: '60px' }} />
                            <input placeholder="Data (string)" value={block.params.data} onChange={e => onChange(block.id, { ...block.params, data: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                        </>
                    )}

                    {/* I2C Read */}
                    {block.type === 'i2c_read' && (
                        <>
                            <select value={block.params.inst} onChange={e => onChange(block.id, { ...block.params, inst: e.target.value })} style={isMissingConfig ? { ...inputStyle, borderColor: 'var(--color-danger)' } : inputStyle}>
                                {availableI2c.length === 0 ? <option value="">No Config</option> : null}
                                {availableI2c.map(inst => <option key={inst} value={inst}>{inst.toUpperCase()}</option>)}
                            </select>
                            <input placeholder="Addr (0x)" value={block.params.addr} onChange={e => onChange(block.id, { ...block.params, addr: e.target.value })} style={{ ...inputStyle, width: '60px' }} />
                            <input placeholder="Bytes" type="number" value={block.params.len} onChange={e => onChange(block.id, { ...block.params, len: parseInt(e.target.value) || 1 })} style={{ ...inputStyle, width: '60px' }} />
                        </>
                    )}

                    {/* ADC Config */}
                    {block.type === 'adc_config' && (
                        <select value={block.params.pin} onChange={e => onChange(block.id, { ...block.params, pin: parseInt(e.target.value) })} style={inputStyle}>
                            {VALID_ADC_PINS.map(p => (
                                <option key={p} value={p}>ADC{p - 26} (GP{p})</option>
                            ))}
                        </select>
                    )}

                    {/* ADC Read */}
                    {block.type === 'adc_read' && (
                        <select value={block.params.pin} onChange={e => onChange(block.id, { ...block.params, pin: parseInt(e.target.value) })} style={isMissingConfig ? { ...inputStyle, borderColor: 'var(--color-danger)' } : inputStyle}>
                            {availableAdcPins.length === 0 ? <option value="">No Config</option> : null}
                            {availableAdcPins.map(p => <option key={p} value={p}>ADC{p - 26} (GP{p})</option>)}
                        </select>
                    )}

                    {/* PWM Config */}
                    {block.type === 'pwm_config' && (
                        <select value={block.params.pin} onChange={e => onChange(block.id, { ...block.params, pin: parseInt(e.target.value) })} style={inputStyle}>
                            {VALID_GPIOS.map(p => (
                                <option key={p} value={p}>GP{p} {p === 25 ? '(LED)' : ''}</option>
                            ))}
                        </select>
                    )}

                    {/* PWM Set */}
                    {block.type === 'pwm_set' && (
                        <>
                            <select value={block.params.pin} onChange={e => onChange(block.id, { ...block.params, pin: parseInt(e.target.value) })} style={isMissingConfig ? { ...inputStyle, borderColor: 'var(--color-danger)' } : inputStyle}>
                                {availablePwmPins.length === 0 ? <option value="">No Config</option> : null}
                                {availablePwmPins.map(p => <option key={p} value={p}>GP{p}</option>)}
                            </select>
                            <input placeholder="Level (0-65535)" type="number" value={block.params.level} onChange={e => onChange(block.id, { ...block.params, level: e.target.value })} style={{ ...inputStyle, width: '100px' }} />
                        </>
                    )}

                    {/* Function Definition */}
                    {block.type === 'function_def' && (() => {
                        const innerBlocks = block.params.innerBlocks || [];
                        const addInnerBlock = (type: string) => {
                            let params: any = {};
                            if (type === 'gpio_set') params = { pin: 25, level: 1 };
                            if (type === 'sleep') params = { ms: 250 };
                            if (type === 'log') params = { text: 'Hello' };
                            if (type === 'spi_write') params = { inst: availableSpi[0] || 'spi0', data: 'Hi', csn: 1 };
                            if (type === 'i2c_write') params = { inst: availableI2c[0] || 'i2c0', addr: '0x3C', data: 'Hi' };
                            const newInner = { id: crypto.randomUUID(), type, params };
                            onChange(block.id, { ...block.params, innerBlocks: [...innerBlocks, newInner] });
                        };
                        const updateInnerBlock = (innerId: string, newParams: any) => {
                            const updated = innerBlocks.map((b: any) => b.id === innerId ? { ...b, params: newParams } : b);
                            onChange(block.id, { ...block.params, innerBlocks: updated });
                        };
                        const removeInnerBlock = (innerId: string) => {
                            onChange(block.id, { ...block.params, innerBlocks: innerBlocks.filter((b: any) => b.id !== innerId) });
                        };
                        return (
                            <div style={{ width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <input
                                        placeholder="Function Name"
                                        value={block.params.name || ''}
                                        onChange={e => onChange(block.id, { ...block.params, name: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') })}
                                        style={{ ...inputStyle, fontFamily: 'monospace', fontWeight: 'bold', flex: 1 }}
                                    />
                                    <span style={{ color: 'var(--color-muted)', fontSize: '0.75em' }}>
                                        {innerBlocks.length} steps
                                    </span>
                                </div>

                                {/* Inner Blocks with Full Controls */}
                                <div style={{ marginLeft: '12px', borderLeft: '2px solid var(--color-accent)', paddingLeft: '12px' }}>
                                    {innerBlocks.map((inner: any, idx: number) => (
                                        <div key={inner.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px', background: 'rgba(0,0,0,0.15)', borderRadius: '4px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '0.7em', color: 'var(--color-muted)', minWidth: '20px' }}>{idx + 1}.</span>
                                            <span style={{ fontFamily: 'monospace', fontSize: '0.8em', fontWeight: 'bold', minWidth: '70px' }}>{inner.type.replace('_', ' ').toUpperCase()}</span>

                                            {/* GPIO Set Controls */}
                                            {inner.type === 'gpio_set' && (
                                                <>
                                                    <select value={inner.params.pin} onChange={e => updateInnerBlock(inner.id, { ...inner.params, pin: parseInt(e.target.value) })} style={{ ...inputStyle, fontSize: '0.8em' }}>
                                                        {VALID_GPIOS.map(p => <option key={p} value={p}>GP{p}</option>)}
                                                    </select>
                                                    <select value={inner.params.level} onChange={e => updateInnerBlock(inner.id, { ...inner.params, level: parseInt(e.target.value) })} style={{ ...inputStyle, fontSize: '0.8em', width: '55px' }}>
                                                        <option value={1}>HIGH</option>
                                                        <option value={0}>LOW</option>
                                                    </select>
                                                </>
                                            )}

                                            {/* Sleep Controls */}
                                            {inner.type === 'sleep' && (
                                                <input type="number" value={inner.params.ms} onChange={e => updateInnerBlock(inner.id, { ...inner.params, ms: parseInt(e.target.value) || 0 })} style={{ ...inputStyle, fontSize: '0.8em', width: '70px' }} placeholder="ms" />
                                            )}

                                            {/* Log Controls */}
                                            {inner.type === 'log' && (
                                                <input value={inner.params.text} onChange={e => updateInnerBlock(inner.id, { ...inner.params, text: e.target.value })} style={{ ...inputStyle, fontSize: '0.8em', flex: 1 }} placeholder="Text" />
                                            )}

                                            {/* SPI Write Controls */}
                                            {inner.type === 'spi_write' && (
                                                <>
                                                    <select value={inner.params.inst} onChange={e => updateInnerBlock(inner.id, { ...inner.params, inst: e.target.value })} style={{ ...inputStyle, fontSize: '0.8em' }}>
                                                        {availableSpi.map(i => <option key={i} value={i}>{i.toUpperCase()}</option>)}
                                                    </select>
                                                    <input value={inner.params.data} onChange={e => updateInnerBlock(inner.id, { ...inner.params, data: e.target.value })} style={{ ...inputStyle, fontSize: '0.8em', width: '60px' }} placeholder="Data" />
                                                </>
                                            )}

                                            {/* I2C Write Controls */}
                                            {inner.type === 'i2c_write' && (
                                                <>
                                                    <select value={inner.params.inst} onChange={e => updateInnerBlock(inner.id, { ...inner.params, inst: e.target.value })} style={{ ...inputStyle, fontSize: '0.8em' }}>
                                                        {availableI2c.map(i => <option key={i} value={i}>{i.toUpperCase()}</option>)}
                                                    </select>
                                                    <input value={inner.params.addr} onChange={e => updateInnerBlock(inner.id, { ...inner.params, addr: e.target.value })} style={{ ...inputStyle, fontSize: '0.8em', width: '50px' }} placeholder="Addr" />
                                                    <input value={inner.params.data} onChange={e => updateInnerBlock(inner.id, { ...inner.params, data: e.target.value })} style={{ ...inputStyle, fontSize: '0.8em', width: '50px' }} placeholder="Data" />
                                                </>
                                            )}

                                            <button onClick={() => removeInnerBlock(inner.id)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', fontSize: '1.2em', padding: '0 4px' }}>×</button>
                                        </div>
                                    ))}

                                    <div style={{ display: 'flex', gap: '4px', marginTop: '10px', flexWrap: 'wrap' }}>
                                        <button onClick={() => addInnerBlock('gpio_set')} style={{ padding: '3px 8px', fontSize: '0.75em', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+GPIO</button>
                                        <button onClick={() => addInnerBlock('sleep')} style={{ padding: '3px 8px', fontSize: '0.75em', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+Wait</button>
                                        <button onClick={() => addInnerBlock('log')} style={{ padding: '3px 8px', fontSize: '0.75em', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+Log</button>
                                        {availableSpi.length > 0 && <button onClick={() => addInnerBlock('spi_write')} style={{ padding: '3px 8px', fontSize: '0.75em', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+SPI</button>}
                                        {availableI2c.length > 0 && <button onClick={() => addInnerBlock('i2c_write')} style={{ padding: '3px 8px', fontSize: '0.75em', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+I2C</button>}
                                        {/* Variables in Inner Blocks */}
                                        {availableVars.length > 0 && <button onClick={() => addInnerBlock('var_set')} style={{ padding: '3px 8px', fontSize: '0.75em', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+Var</button>}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Var Int (Setup) */}
                    {block.type === 'var_int' && (
                        <>
                            <span style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>int</span>
                            <input placeholder="varName" value={block.params.name} onChange={e => onChange(block.id, { ...block.params, name: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') })} style={inputStyle} />
                            <span>=</span>
                            <input type="number" placeholder="0" value={block.params.value} onChange={e => onChange(block.id, { ...block.params, value: Number(e.target.value) })} style={{ ...inputStyle, width: '60px' }} />
                        </>
                    )}

                    {/* Var Set (Loop) */}
                    {block.type === 'var_set' && (
                        <>
                            <select value={block.params.name} onChange={e => onChange(block.id, { ...block.params, name: e.target.value })} style={inputStyle}>
                                {availableVars.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                            <span>=</span>
                            <input placeholder="val/expr" value={block.params.value} onChange={e => onChange(block.id, { ...block.params, value: e.target.value })} style={{ ...inputStyle, width: '80px' }} />
                        </>
                    )}

                    {/* Custom Code Snippet */}
                    {block.type === 'code_snippet' && (
                        <div style={{ width: '100%' }}>
                            <textarea
                                placeholder="// Enter C++ code here..."
                                value={block.params.code}
                                onChange={e => onChange(block.id, { ...block.params, code: e.target.value })}
                                style={{ ...inputStyle, width: '100%', fontFamily: 'monospace', minHeight: '60px', fontSize: '12px' }}
                            />
                        </div>
                    )}

                    {/* If Logic Block */}
                    {block.type === 'if_block' && (() => {
                        const innerBlocks = block.params.innerBlocks || [];
                        const addInnerBlock = (type: string) => {
                            let params: any = {};
                            if (type === 'gpio_set') params = { pin: 25, level: 1 };
                            if (type === 'sleep') params = { ms: 250 };
                            if (type === 'log') params = { text: 'Hello' };
                            if (type === 'var_set') params = { name: availableVars[0] || 'x', value: 0 };
                            const newInner = { id: crypto.randomUUID(), type, params };
                            onChange(block.id, { ...block.params, innerBlocks: [...innerBlocks, newInner] });
                        };
                        const updateInnerBlock = (innerId: string, newParams: any) => {
                            const updated = innerBlocks.map((b: any) => b.id === innerId ? { ...b, params: newParams } : b);
                            onChange(block.id, { ...block.params, innerBlocks: updated });
                        };
                        const removeInnerBlock = (innerId: string) => {
                            onChange(block.id, { ...block.params, innerBlocks: innerBlocks.filter((b: any) => b.id !== innerId) });
                        };
                        return (
                            <div style={{ width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <span style={{ fontWeight: 'bold' }}>IF</span>
                                    <input placeholder="Left" value={block.params.left} onChange={e => onChange(block.id, { ...block.params, left: e.target.value })} style={{ ...inputStyle, width: '60px' }} />
                                    <select value={block.params.operator} onChange={e => onChange(block.id, { ...block.params, operator: e.target.value })} style={inputStyle}>
                                        <option value="==">==</option>
                                        <option value="!=">!=</option>
                                        <option value=">">&gt;</option>
                                        <option value="<">&lt;</option>
                                    </select>
                                    <input placeholder="Right" value={block.params.right} onChange={e => onChange(block.id, { ...block.params, right: e.target.value })} style={{ ...inputStyle, width: '60px' }} />
                                </div>

                                <div style={{ marginLeft: '12px', borderLeft: '2px dashed var(--color-primary)', paddingLeft: '12px' }}>
                                    {innerBlocks.map((inner: any, idx: number) => (
                                        <div key={inner.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px', background: 'rgba(0,0,0,0.1)', borderRadius: '4px', marginBottom: '6px' }}>
                                            <span style={{ marginLeft: 'auto', fontSize: '0.8em', fontWeight: 'bold' }}>{inner.type.toUpperCase()}</span>
                                            {/* Simple controls for inner blocks */}
                                            {inner.type === 'gpio_set' && <input type="number" value={inner.params.pin} onChange={e => updateInnerBlock(inner.id, { ...inner.params, pin: +e.target.value })} style={{ ...inputStyle, width: '40px' }} />}
                                            {inner.type === 'var_set' && <input type="number" value={inner.params.value} onChange={e => updateInnerBlock(inner.id, { ...inner.params, value: +e.target.value })} style={{ ...inputStyle, width: '60px' }} />}
                                            <button onClick={() => removeInnerBlock(inner.id)} style={{ color: 'var(--color-danger)', border: 'none', background: 'none' }}>×</button>
                                        </div>
                                    ))}
                                    <div style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>
                                        <button onClick={() => addInnerBlock('gpio_set')} style={{ fontSize: '0.7em', padding: '2px 6px' }}>+GPIO</button>
                                        <button onClick={() => addInnerBlock('var_set')} style={{ fontSize: '0.7em', padding: '2px 6px' }}>+Var</button>
                                        <button onClick={() => addInnerBlock('log')} style={{ fontSize: '0.7em', padding: '2px 6px' }}>+Log</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Function Call */}
                    {block.type === 'function_call' && (
                        <select
                            value={block.params.ref || ''}
                            onChange={e => onChange(block.id, { ...block.params, ref: e.target.value })}
                            style={block.params.ref ? inputStyle : { ...inputStyle, borderColor: 'var(--color-danger)' }}
                        >
                            {!block.params.ref && <option value="">Select Function...</option>}
                            {(availableFunctions || []).map(fn => <option key={fn} value={fn}>{fn}()</option>)}
                        </select>
                    )}

                    {/* Custom Blocks - Rendered via GenericBlock */}
                    {isCustomBlockType(block.type) && customBlockDefs.has(block.type) && (
                        <GenericBlock
                            definition={customBlockDefs.get(block.type)!}
                            params={block.params}
                            onChange={(newParams) => onChange(block.id, newParams)}
                            embedded={true}
                        />
                    )}
                </div>
            </div >
            <Button variant="ghost" onClick={() => onDelete(block.id)} style={{ color: 'var(--color-danger)' }}>×</Button>
        </div >
    );
};

// Shared Input Style
const inputStyle = { padding: '4px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'inherit', borderRadius: '4px' };

// --- Section Component ---
const BuilderSection = ({
    title,
    items,
    id,
    color,
    available,
    onAdd,
    onChange,
    onDelete,
    availableSpi,
    availableI2c,
    availablePwmPins,
    availableAdcPins,
    availableFunctions,
    availableVars,
    pinUsage,
    customBlockDefs,
    customBlocksForSection
}: {
    title: string;
    items: Block[];
    id: string;
    color: string;
    available: Block['type'][];
    onAdd: (type: Block['type']) => void;
    onChange: (id: string, params: any) => void;
    onDelete: (id: string) => void;
    availableSpi: string[];
    availableI2c: string[];
    availablePwmPins: number[];
    availableAdcPins: number[];
    availableFunctions: string[];
    availableVars?: string[];
    pinUsage: Map<number, string[]>;
    customBlockDefs: Map<string, CustomBlockDefinition>;
    customBlocksForSection: CustomBlockDefinition[];
}) => {
    return (
        <div style={{ marginBottom: '24px', border: `1px solid ${color}`, borderRadius: '8px', padding: '16px', background: 'rgba(0,0,0,0.02)' }}>
            <h3 style={{ margin: '0 0 12px 0', color: color, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {title}
                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{items.length} Blocks</div>
            </h3>

            <SortableContext items={items} strategy={verticalListSortingStrategy}>
                <div style={{ minHeight: '60px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {items.length === 0 && <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed var(--color-border)', borderRadius: '4px', color: 'var(--color-muted)' }}>Empty</div>}
                    {items.map(block => (
                        <SortableBlock key={block.id} block={block} onDelete={onDelete} onChange={onChange} availableSpi={availableSpi} availableI2c={availableI2c} availablePwmPins={availablePwmPins} availableAdcPins={availableAdcPins} availableFunctions={availableFunctions} availableVars={availableVars || []} pinUsage={pinUsage} customBlockDefs={customBlockDefs} />
                    ))}
                </div>
            </SortableContext>

            <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {available.includes('spi_config') && <Button variant="outline" onClick={() => onAdd('spi_config')} style={{ borderColor: color, color }}>+ SPI</Button>}
                {available.includes('i2c_config') && <Button variant="outline" onClick={() => onAdd('i2c_config')} style={{ borderColor: color, color }}>+ I2C</Button>}
                {available.includes('adc_config') && <Button variant="outline" onClick={() => onAdd('adc_config')} style={{ borderColor: color, color }}>+ ADC</Button>}
                {available.includes('pwm_config') && <Button variant="outline" onClick={() => onAdd('pwm_config')} style={{ borderColor: color, color }}>+ PWM</Button>}
                {available.includes('var_int') && <Button variant="outline" onClick={() => onAdd('var_int')} style={{ borderColor: color, color }}>+ Var</Button>}

                {available.includes('gpio_set') && <Button variant="outline" onClick={() => onAdd('gpio_set')} style={{ borderColor: color, color }}>+ GPIO</Button>}
                {available.includes('spi_write') && <Button variant="outline" onClick={() => onAdd('spi_write')} style={{ borderColor: color, color }}>+ SPI Write</Button>}
                {available.includes('spi_read') && <Button variant="outline" onClick={() => onAdd('spi_read')} style={{ borderColor: color, color }}>+ SPI Read</Button>}
                {available.includes('i2c_write') && <Button variant="outline" onClick={() => onAdd('i2c_write')} style={{ borderColor: color, color }}>+ I2C Write</Button>}
                {available.includes('i2c_read') && <Button variant="outline" onClick={() => onAdd('i2c_read')} style={{ borderColor: color, color }}>+ I2C Read</Button>}
                {available.includes('adc_read') && <Button variant="outline" onClick={() => onAdd('adc_read')} style={{ borderColor: color, color }}>+ ADC Read</Button>}
                {available.includes('pwm_set') && <Button variant="outline" onClick={() => onAdd('pwm_set')} style={{ borderColor: color, color }}>+ PWM Set</Button>}
                {available.includes('sleep') && <Button variant="outline" onClick={() => onAdd('sleep')} style={{ borderColor: color, color }}>+ Wait</Button>}
                {available.includes('log') && <Button variant="outline" onClick={() => onAdd('log')} style={{ borderColor: color, color }}>+ Log</Button>}
                {available.includes('function_def') && <Button variant="outline" onClick={() => onAdd('function_def')} style={{ borderColor: color, color, background: 'rgba(255,215,0,0.1)' }}>+ Function</Button>}
                {available.includes('function_call') && <Button variant="outline" onClick={() => onAdd('function_call')} style={{ borderColor: color, color, background: 'rgba(255,215,0,0.1)' }}>+ Call Function</Button>}

                {available.includes('var_set') && <Button variant="outline" onClick={() => onAdd('var_set')} style={{ borderColor: color, color }}>+ Set Var</Button>}
                {available.includes('if_block') && <Button variant="outline" onClick={() => onAdd('if_block')} style={{ borderColor: color, color, background: 'rgba(0,255,127,0.1)' }}>+ IF Logic</Button>}
                {available.includes('code_snippet') && <Button variant="outline" onClick={() => onAdd('code_snippet')} style={{ borderColor: color, color, background: 'rgba(128,128,128,0.1)' }}>+ Custom Code</Button>}

                {/* Custom Blocks - dynamically loaded from registry */}
                {customBlocksForSection.length > 0 && (
                    <>
                        <div style={{ width: '100%', height: '1px', background: 'var(--color-border)', margin: '8px 0' }} />
                        <div style={{ width: '100%', fontSize: '0.7em', color: 'var(--color-muted)', marginBottom: '4px' }}>📦 Custom Blocks:</div>
                        {customBlocksForSection.map(def => (
                            <Button
                                key={def.id}
                                variant="outline"
                                onClick={() => onAdd(def.id as Block['type'])}
                                style={{ borderColor: def.color || color, color: def.color || color, background: `${def.color || color}15` }}
                                title={def.description}
                            >
                                + {def.label}
                            </Button>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

// --- Main Builder Component ---
type BlockBuilderProps = {
    blocks: Block[];
    onChange: (blocks: Block[]) => void;
};

const BlockBuilder: React.FC<BlockBuilderProps> = ({ blocks, onChange }) => {
    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

    // Load custom blocks from registry
    const { customBlocks, setupBlocks: customSetupBlocks, loopBlocks: customLoopBlocks, isLoading: customBlocksLoading, getBlockById } = useCustomBlocks();

    // Build a map for quick lookup
    const customBlockDefs = React.useMemo(() => {
        const map = new Map<string, CustomBlockDefinition>();
        customBlocks.forEach(def => map.set(def.id, def));
        return map;
    }, [customBlocks]);

    // Segregate blocks - custom blocks go to setup if they have 'setup' category, otherwise loop
    const setupBlocks = blocks.filter(b => {
        if (b.type.endsWith('_config')) return true;
        const customDef = customBlockDefs.get(b.type);
        return customDef?.category === 'setup';
    });
    const loopBlocks = blocks.filter(b => {
        if (b.type.endsWith('_config')) return false;
        const customDef = customBlockDefs.get(b.type);
        return !customDef || customDef.category !== 'setup';
    });

    // Dynamic Discovery of Configured Instances from Setup Blocks
    const availableSpi = blocks.filter(b => b.type === 'spi_config').map(b => b.params.inst || 'spi0');
    const availableI2c = blocks.filter(b => b.type === 'i2c_config').map(b => b.params.inst || 'i2c0');
    const availablePwmPins = blocks.filter(b => b.type === 'pwm_config').map(b => b.params.pin as number);
    const availableAdcPins = blocks.filter(b => b.type === 'adc_config').map(b => b.params.pin as number);
    const availableFunctions = blocks.filter(b => b.type === 'function_def' && b.params.name).map(b => b.params.name as string);
    const availableVars = blocks.filter(b => b.type === 'var_int' && b.params.name).map(b => b.params.name as string);

    // Build Pin Usage Map for conflict detection
    const pinUsage = new Map<number, string[]>();
    blocks.forEach(block => {
        const pins = getPinsFromBlock(block);
        pins.forEach(pin => {
            const existing = pinUsage.get(pin) || [];
            existing.push(block.id);
            pinUsage.set(pin, existing);
        });
    });

    // Handlers
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = blocks.findIndex(b => b.id === active.id);
        const newIndex = blocks.findIndex(b => b.id === over.id);

        // Prevent dragging between sections
        const isOldSetup = setupBlocks.some(b => b.id === active.id);
        const isNewSetup = setupBlocks.some(b => b.id === over.id);
        if (isOldSetup !== isNewSetup) return;

        onChange(arrayMove(blocks, oldIndex, newIndex));
    };

    const addBlock = (type: Block['type']) => {
        let params: any = {};

        // Check if it's a custom block first
        const customDef = customBlockDefs.get(type);
        if (customDef) {
            // Initialize params from custom block definition defaults
            customDef.inputs.forEach((input: BlockInput) => {
                if (input.default !== undefined) {
                    params[input.name] = input.default;
                } else if (input.type === 'number') {
                    params[input.name] = 0;
                } else if (input.type === 'select' && input.options && input.options.length > 0) {
                    params[input.name] = input.options[0];
                } else {
                    params[input.name] = '';
                }
            });

            const newBlock: Block = { id: crypto.randomUUID(), type, params };
            const isSetup = customDef.category === 'setup';
            if (isSetup) {
                const lastSetupIndex = setupBlocks.length;
                const newBlocks = [...blocks];
                newBlocks.splice(lastSetupIndex, 0, newBlock);
                onChange(newBlocks);
            } else {
                onChange([...blocks, newBlock]);
            }
            return;
        }

        // Built-in block defaults
        if (type === 'gpio_set') params = { pin: 25, level: 1 };
        if (type === 'sleep') params = { ms: 500 };
        if (type === 'uart_write' || type === 'log') params = { text: 'Hello' };
        // Use first valid pins from SPI0/I2C0 mappings
        if (type === 'spi_config') params = { inst: 'spi0', baud: 1000000, rx: SPI_PINS.spi0.rx[0], tx: SPI_PINS.spi0.tx[0], sck: SPI_PINS.spi0.sck[0], csn: SPI_PINS.spi0.csn[0] };
        if (type === 'i2c_config') params = { inst: 'i2c0', baud: 100000, sda: I2C_PINS.i2c0.sda[0], scl: I2C_PINS.i2c0.scl[0] };

        // Auto-select the first available instance
        if (type === 'spi_write') params = { inst: availableSpi[0] || '', data: 'Hello SPI', csn: SPI_PINS.spi0.csn[0] };
        if (type === 'i2c_write') params = { inst: availableI2c[0] || '', addr: '0x3C', data: 'Hello I2C' };
        if (type === 'spi_read') params = { inst: availableSpi[0] || '', len: 1, csn: SPI_PINS.spi0.csn[0] };
        if (type === 'i2c_read') params = { inst: availableI2c[0] || '', addr: '0x3C', len: 1 };

        if (type === 'adc_config' || type === 'adc_read') params = { pin: 26 };
        if (type === 'pwm_config') params = { pin: 0 };
        if (type === 'pwm_set') params = { pin: availablePwmPins[0] || 0, level: 32768 };

        // Function blocks
        if (type === 'function_def') params = { name: `myFunction${blocks.filter(b => b.type === 'function_def').length + 1}`, innerBlocks: [] };
        if (type === 'function_call') params = { ref: availableFunctions[0] || '' };

        // New Blocks
        if (type === 'var_int') params = { name: 'myVar', value: 0 };
        if (type === 'var_set') params = { name: availableVars[0] || 'myVar', value: 1 };
        if (type === 'if_block') params = { left: 'myVar', operator: '==', right: '1', innerBlocks: [] };
        if (type === 'code_snippet') params = { code: '// custom code' };

        const newBlock: Block = { id: crypto.randomUUID(), type, params };
        const isSetup = type.endsWith('_config');
        if (isSetup) {
            const lastSetupIndex = blocks.filter(b => b.type.endsWith('_config')).length;
            const newBlocks = [...blocks];
            newBlocks.splice(lastSetupIndex, 0, newBlock);
            onChange(newBlocks);
        } else {
            onChange([...blocks, newBlock]);
        }
    };

    const updateBlock = (id: string, params: any) => onChange(blocks.map(b => b.id === id ? { ...b, params } : b));
    const deleteBlock = (id: string) => onChange(blocks.filter(b => b.id !== id));

    return (
        <Card title="Visual Logic Builder" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ color: 'var(--color-muted)', marginBottom: '10px' }}>
                Define your hardware configuration in <b>Setup</b>, then drag actions into the <b>Loop</b>.
                {customBlocksLoading && <span style={{ marginLeft: '8px', opacity: 0.6 }}>Loading custom blocks...</span>}
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <BuilderSection
                    title="1. SETUP (Runs Once)"
                    id="setup"
                    color="var(--color-accent)"
                    items={setupBlocks}
                    available={['spi_config', 'i2c_config', 'adc_config', 'pwm_config', 'function_def', 'var_int']}
                    onAdd={addBlock}
                    onChange={updateBlock}
                    onDelete={deleteBlock}
                    availableSpi={availableSpi}
                    availableI2c={availableI2c}
                    availablePwmPins={availablePwmPins}
                    availableAdcPins={availableAdcPins}
                    availableFunctions={availableFunctions}
                    pinUsage={pinUsage}
                    customBlockDefs={customBlockDefs}
                    customBlocksForSection={customSetupBlocks}
                />

                <div style={{ textAlign: 'center', fontSize: '1.5rem', opacity: 0.3 }}>⬇</div>

                <BuilderSection
                    title="2. LOOP (Repeats Forever)"
                    id="loop"
                    color="var(--color-primary)"
                    items={loopBlocks}
                    available={['gpio_set', 'spi_write', 'spi_read', 'i2c_write', 'i2c_read', 'adc_read', 'pwm_set', 'sleep', 'log', 'function_call', 'var_set', 'if_block', 'code_snippet']}
                    onAdd={addBlock}
                    onChange={updateBlock}
                    onDelete={deleteBlock}
                    availableSpi={availableSpi}
                    availableI2c={availableI2c}
                    availablePwmPins={availablePwmPins}
                    availableAdcPins={availableAdcPins}
                    availableFunctions={availableFunctions}
                    pinUsage={pinUsage}
                    customBlockDefs={customBlockDefs}
                    customBlocksForSection={customLoopBlocks}
                />
            </DndContext>
        </Card>
    );
};

export default BlockBuilder;
