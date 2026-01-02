import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import PageShell from './components/layout/PageShell';
import Stack from './components/layout/Stack';
import Button from './components/primitives/Button';
import Tooltip from './components/primitives/Tooltip';
import ProjectList from './components/domain/ProjectList';
import CreateProjectPage from './components/domain/CreateProjectPage';
import ProjectEditor from './components/domain/ProjectEditor';


function App() {
    return (
        <BrowserRouter>
            <PageShell
                title="PicoForge"
                subtitle="Embedded development environment"
                actions={
                    <Stack direction="row" gap={8}>
                        <Tooltip label="Toggle light/dark coming soon">
                            <Button variant="ghost">Theme</Button>
                        </Tooltip>
                    </Stack>
                }
            >
                <Routes>
                    <Route path="/" element={<ProjectList />} />
                    <Route path="/new" element={<CreateProjectPage />} />
                    <Route path="/projects/:projectName" element={<ProjectEditor />} />
                </Routes>
            </PageShell>
        </BrowserRouter>
    );
}

export default App;
