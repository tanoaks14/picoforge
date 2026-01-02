import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import PageShell from '../layout/PageShell';
import Stack from '../layout/Stack';
import Button from '../primitives/Button';
import Card from '../primitives/Card';
import Alert from '../primitives/Alert';
import Spinner from '../primitives/Spinner';
import { FileService } from '../../services/FileService';
import { BuildService } from '../../services/BuildService';
import SplitPane from '../layout/SplitPane';

const ProjectEditor = () => {
    const { projectName } = useParams<{ projectName: string }>();
    const [currentFile, setCurrentFile] = useState<string>('main.cpp');
    const [files, setFiles] = useState<string[]>(['main.cpp', 'CMakeLists.txt']);
    const [code, setCode] = useState<string>('// Loading...');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [building, setBuilding] = useState(false);
    const [buildLogs, setBuildLogs] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!projectName) return;
        FileService.list(projectName)
            .then(data => {
                if (data.files && data.files.length > 0) {
                    setFiles(data.files);
                    // Ensure currentFile is in the list, or pick the first one
                    if (!data.files.includes(currentFile)) {
                        setCurrentFile(data.files[0]);
                    }
                }
            })
            .catch(() => console.error('Failed to list files'));
    }, [projectName]); // Only list on mount/project change

    const loadFile = async (file: string) => {
        if (!projectName) return;
        setLoading(true);
        try {
            // catch 404 for new files
            const data = await FileService.read(projectName, file).catch((e) => {
                console.error('File load failed', e);
                return { content: null };
            });

            if (data.content === null || data.content === undefined) {
                setCode(`// Error loading ${file}. Check console for details.`);
            } else {
                setCode(data.content);
            }
            setError(null);
        } catch (err) {
            setError('Failed to load file');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFile(currentFile);
    }, [projectName, currentFile]);

    const handleSave = async () => {
        if (!projectName) return;
        setSaving(true);
        try {
            await FileService.write(projectName, currentFile, code);
            setBuildLogs(prev => prev + `\n[System] Saved ${currentFile}`);
        } catch (err) {
            setError('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleBuild = async () => {
        if (!projectName) return;
        setBuilding(true);
        setBuildLogs('Starting build...\n');
        try {
            // Trigger build
            const response = await BuildService.trigger(projectName);

            // Read stream
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    setBuildLogs(prev => prev + decoder.decode(value));
                }
            }
            setBuildLogs(prev => prev + '\n[System] Build finished.');

        } catch (err) {
            setBuildLogs(prev => prev + '\n[System] Build failed to start.');
        } finally {
            setBuilding(false);
        }
    };

    const handleDownload = () => {
        if (!projectName) return;
        window.open(BuildService.getArtifactUrl(projectName), '_blank');
    };

    return (
        <Stack gap={16} style={{ height: 'calc(100vh - 100px)' }}>
            <Stack direction="row" gap={12} align="center" justify="space-between">
                <Stack direction="row" gap={12} align="center">
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <Button variant="ghost">← Back</Button>
                    </Link>
                    <h3>{projectName}</h3>
                </Stack>

                <Stack direction="row" gap={8}>
                    <Button onClick={handleSave} disabled={saving || loading}>
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button onClick={handleBuild} disabled={building} variant="solid">
                        {building ? 'Building...' : 'Build'}
                    </Button>
                    <Button onClick={handleDownload} variant="ghost" disabled={building}>
                        Download UF2
                    </Button>
                </Stack>
            </Stack>

            {error && <Alert tone="danger" title="Error">{error}</Alert>}

            <SplitPane
                ratio={0.7}
                style={{ flex: 1, minHeight: 0 }} // Ensure it takes available space
                left={
                    <Card title={`Editor - ${currentFile}`} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ marginBottom: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {files.map(f => (
                                <button
                                    key={f}
                                    onClick={() => setCurrentFile(f)}
                                    style={{
                                        fontWeight: currentFile === f ? 'bold' : 'normal',
                                        padding: '6px 12px',
                                        cursor: 'pointer',
                                        background: currentFile === f ? 'var(--color-primary)' : 'transparent',
                                        color: currentFile === f ? '#000' : 'var(--color-text)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '4px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <Editor
                                height="100%"
                                theme="vs-dark" // High contrast dark theme
                                defaultLanguage="cpp"
                                language={currentFile.endsWith('.txt') || currentFile.endsWith('.json') ? 'json' : 'cpp'} // Basic logic
                                value={code}
                                onChange={(val) => setCode(val || '')}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14, // Larger font
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true
                                }}
                            />
                        </div>
                    </Card>
                }
                right={
                    <Card title="Build Output" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <pre style={{
                            flex: 1,
                            overflow: 'auto',
                            background: '#1e1e1e', // Dark background
                            color: '#f0f0f0',      // High contrast text
                            padding: '12px',
                            margin: 0,
                            borderRadius: '4px',
                            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                            fontSize: '13px',
                            lineHeight: '1.5'
                        }}>
                            {buildLogs || 'Ready to build...'}
                        </pre>
                    </Card>
                }
            />
        </Stack>
    );
};

export default ProjectEditor;
