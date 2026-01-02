import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import Card from '../primitives/Card';

mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
});

type MermaidDiagramPreviewProps = {
    config: any;
};

const MermaidDiagramPreview: React.FC<MermaidDiagramPreviewProps> = ({ config }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const modules = config.modules || [];
        const blocks = config.blocks || [];

        // Categorize blocks
        const setupBlocks = blocks.filter((b: any) => b.type.endsWith('_config'));
        const functionDefs = blocks.filter((b: any) => b.type === 'function_def');
        const loopBlocks = blocks.filter((b: any) => !b.type.endsWith('_config') && b.type !== 'function_def');

        // Generate mermaid graph definition from config
        let graphDefinition = 'graph TD\n';
        graphDefinition += `    subgraph Project["${config.project_name || 'Pico Project'}"]\n`;

        // Setup Section
        if (setupBlocks.length > 0 || functionDefs.length > 0) {
            graphDefinition += `        subgraph Setup["1️⃣ SETUP"]\n`;
            setupBlocks.forEach((b: any, i: number) => {
                const label = b.type.replace('_config', '').toUpperCase();
                const detail = b.params.inst || b.params.pin !== undefined ? `(${b.params.inst || 'GP' + b.params.pin})` : '';
                graphDefinition += `            S${i}["${label} ${detail}"]\n`;
            });
            functionDefs.forEach((b: any, i: number) => {
                const innerCount = (b.params.innerBlocks || []).length;
                graphDefinition += `            F${i}["fn ${b.params.name || 'unnamed'}() - ${innerCount} steps"]\n`;
            });
            graphDefinition += `        end\n`;
        }

        // Loop Section
        if (loopBlocks.length > 0) {
            graphDefinition += `        subgraph Loop["2️⃣ LOOP ♻️"]\n`;
            loopBlocks.forEach((b: any, i: number) => {
                let label = b.type.replace('_', ' ').toUpperCase();
                if (b.type === 'gpio_set') label = `GPIO ${b.params.pin} = ${b.params.level}`;
                if (b.type === 'sleep') label = `WAIT ${b.params.ms}ms`;
                if (b.type === 'log') label = `LOG "${(b.params.text || '').substring(0, 10)}"`;
                if (b.type === 'function_call') label = `CALL ${b.params.ref}()`;
                if (b.type === 'spi_write') label = `SPI WRITE`;
                if (b.type === 'i2c_write') label = `I2C WRITE`;
                graphDefinition += `            L${i}["${label}"]\n`;
            });
            // Connect loop blocks sequentially
            for (let i = 0; i < loopBlocks.length - 1; i++) {
                graphDefinition += `            L${i} --> L${i + 1}\n`;
            }
            if (loopBlocks.length > 1) {
                graphDefinition += `            L${loopBlocks.length - 1} -.-> L0\n`;
            }
            graphDefinition += `        end\n`;
        }

        // Modules (legacy)
        modules.forEach((mod: any, index: number) => {
            const modName = typeof mod === 'string' ? mod : mod.module;
            graphDefinition += `        Mod${index}["📦 ${modName}"]\n`;
        });

        graphDefinition += `    end\n`;

        // Connect Setup to Loop
        if (setupBlocks.length > 0 && loopBlocks.length > 0) {
            graphDefinition += `    Setup --> Loop\n`;
        }

        const renderGraph = async () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
                try {
                    const { svg } = await mermaid.render(`mermaid-${Date.now()}`, graphDefinition);
                    if (containerRef.current) {
                        containerRef.current.innerHTML = svg;
                    }
                } catch (e) {
                    console.error('Mermaid render error:', e);
                    if (containerRef.current) containerRef.current.innerText = 'Invalid diagram';
                }
            }
        };

        renderGraph();
    }, [config]);

    return (
        <Card title="Architecture Preview">
            <div ref={containerRef} style={{ padding: '10px', textAlign: 'center', minHeight: '150px' }} />
        </Card>
    );
};

export default MermaidDiagramPreview;
