import React, { useEffect, useState } from 'react';
import Card from '../primitives/Card';
import Stack from '../layout/Stack';
import Button from '../primitives/Button';
import Spinner from '../primitives/Spinner';
import Alert from '../primitives/Alert';
import { ProjectService, type Project } from '../../services/ProjectService';
import { Link } from 'react-router-dom';

const ProjectList = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadProjects = async () => {
        setLoading(true);
        try {
            const data = await ProjectService.list();
            setProjects(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProjects();
    }, []);

    return (
        <Card title="Projects" action={
            <Link to="/new" style={{ textDecoration: 'none' }}>
                <Button>New Project</Button>
            </Link>
        }>
            <Stack gap={12}>
                {loading ? (
                    <Spinner />
                ) : error ? (
                    <Alert tone="danger" title="Error">{error}</Alert>
                ) : projects.length === 0 ? (
                    <p>No projects found. Create one to get started.</p>
                ) : (
                    <Stack gap={8}>
                        {projects.map((p) => (
                            <Link key={p.name} to={`/projects/${p.name}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div style={{
                                    padding: '16px',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    background: 'var(--color-surface)',
                                    color: 'var(--color-text)',
                                    transition: 'transform 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <strong style={{ fontSize: '1.1rem' }}>{p.name}</strong>
                                    <span style={{ fontSize: '0.9rem', opacity: 0.6 }}>OPEN &rarr;</span>
                                </div>
                            </Link>
                        ))}
                    </Stack>
                )}
            </Stack>
        </Card>
    );
};

export default ProjectList;
