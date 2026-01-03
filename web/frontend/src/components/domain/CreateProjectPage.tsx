import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../primitives/Card';
import Stack from '../layout/Stack';
import Input from '../primitives/Input';
import Button from '../primitives/Button';
import ConfigForm, { type ConfigValues } from './ConfigForm';
import JsonPreview from './JsonPreview';
import MermaidDiagramPreview from './MermaidDiagramPreview';
import { ProjectService } from '../../services/ProjectService';
import { TemplateService, type Template } from '../../services/TemplateService';
import BlockBuilder, { type Block } from '../builder/BlockBuilder';
import SplitPane from '../layout/SplitPane';

const regenerateIds = (blocks: any[]): any[] => {
    return blocks.map(b => ({
        ...b,
        id: crypto.randomUUID(),
        params: {
            ...b.params,
            innerBlocks: b.params.innerBlocks ? regenerateIds(b.params.innerBlocks) : undefined
        }
    }));
};

const CreateProjectPage = () => {
    const navigate = useNavigate();
    const [newProjectName, setNewProjectName] = useState('');
    const [configState, setConfigState] = useState<ConfigValues>({ modules: ['adc'], environment: 'pico_w', timeout: 45, lint: true });
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [isCreating, setIsCreating] = useState(false);

    // ... (keep handleConfigChange, validateName, error state)

    const [error, setError] = useState<string | null>(null);

    const validateName = (name: string): string | null => {
        if (!name) return 'Project name is required';
        if (!/^[a-zA-Z0-9_-]+$/.test(name)) return 'Only alphanumeric characters, dashes, and underscores allowed';
        const reserved = ['all', 'test', 'clean', 'install', 'package', 'build', 'rebuild'];
        if (reserved.includes(name.toLowerCase())) return `Project name '${name}' is reserved`;
        return null;
    };

    const handleCreate = async () => {
        const validationError = validateName(newProjectName);
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsCreating(true);
        setError(null);
        try {
            const backendConfig = {
                modules: configState.modules,
                blocks: blocks.map(b => ({ type: b.type, params: b.params })), // Strip UI IDs
                build_options: {
                    timeout: configState.timeout,
                    lint: configState.lint
                }
            };

            await ProjectService.create(newProjectName, backendConfig);
            navigate('/');
        } catch (err) {
            setError('Failed to create project: ' + (err instanceof Error ? err.message : 'Unknown error'));
        } finally {
            setIsCreating(false);
        }
    };

    const previewConfig = {
        project_name: newProjectName || 'new-project',
        modules: configState.modules,
        blocks: blocks.map(b => ({ type: b.type, params: b.params })),
        build_options: {
            timeout: configState.timeout,
            lint: configState.lint
        }
    };

    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [templates, setTemplates] = useState<Template[]>([]);

    useEffect(() => {
        TemplateService.list().then(setTemplates).catch(err => console.error("Failed to load templates", err));
    }, []);

    const applyTemplate = (tmplId: string) => {
        if (!tmplId) return;
        const found = templates.find(t => t.id === tmplId);
        if (found) {
            // Deep clone and regen IDs to avoid conflicts
            const newBlocks = regenerateIds(found.blocks);
            setBlocks(newBlocks);
        }
        setSelectedTemplate(''); // Reset select
    };

    const handleSaveTemplate = async () => {
        const name = prompt("Enter Name for New Template:");
        if (name) {
            try {
                await TemplateService.create(name, blocks);
                const list = await TemplateService.list();
                setTemplates(list);
                alert("Template Saved!");
            } catch (e) {
                alert("Failed to save template");
            }
        }
    };

    return (
        <Stack gap={16}>
            <Stack direction="row" gap={12} align="center" justify="space-between">
                <Stack direction="row" gap={12} align="center">
                    <Button variant="ghost" onClick={() => navigate('/')}>← Back</Button>
                    <h3>Create New Project</h3>
                </Stack>

                <Stack direction="row" gap={8} align="center">
                    <Button variant="outline" onClick={handleSaveTemplate} style={{ fontSize: '0.8em' }}>Save as Template</Button>
                    <span style={{ fontSize: '0.8em', color: 'var(--color-muted)' }}>Load:</span>
                    <select
                        value={selectedTemplate}
                        onChange={e => applyTemplate(e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: '4px', background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                    >
                        <option value="">-- Select --</option>
                        {templates.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </Stack>
            </Stack>

            <SplitPane
                ratio={0.5}
                left={
                    <Stack gap={16}>
                        <Card title="Project Setup">
                            <Stack gap={16}>
                                <div>
                                    <Input
                                        label="Project Name"
                                        value={newProjectName}
                                        onChange={(e) => {
                                            setNewProjectName(e.target.value);
                                            setError(validateName(e.target.value));
                                        }}
                                        placeholder="my-pico-project"
                                    />
                                    {error && <div style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>{error}</div>}
                                </div>

                                {/* ConfigForm removed */}
                            </Stack>
                        </Card>

                        <BlockBuilder blocks={blocks} onChange={setBlocks} />

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button variant="solid" onClick={handleCreate} disabled={isCreating || !!error || !newProjectName}>
                                {isCreating ? 'Creating...' : 'Create Project'}
                            </Button>
                        </div>
                    </Stack>
                }
                right={
                    // ... right pane same
                    <Stack gap={16}>
                        <Card title="Architecture Preview">
                            <MermaidDiagramPreview config={previewConfig} />
                        </Card>
                        <Card title="Config JSON">
                            <JsonPreview config={previewConfig} />
                        </Card>
                    </Stack>
                }
            />
        </Stack>
    );
};

export default CreateProjectPage;
