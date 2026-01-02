import { getJson } from './http';

export const FileService = {
    // Re-uses ProjectService list implicitly? No, files API is /api/v1/files
    // But wait, the backend /api/v1/files GET returns content for a specific file.
    // It does not list files. ProjectService.listProjects returns projects, but not files in them?
    // Let's check ProjectService.js backend.

    // Backend ProjectService.listProjects returns { name: 'project1' }.
    // It doesn't return file structure.
    // We might need a way to list files in a project. 
    // The current backend implementation of ProjectService.listProjects only reads the workspace directory.
    // WE HAVE A GAP: No API to list files within a project.

    list: (projectName: string) =>
        getJson<{ files: string[] }>(`/api/v1/files?projectName=${projectName}`),

    read: (projectName: string, filePath: string) =>
        getJson<{ content: string }>(`/api/v1/files?projectName=${projectName}&filePath=${filePath}`),

    write: (projectName: string, filePath: string, content: string) =>
        getJson('/api/v1/files', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectName, filePath, content }),
        }),
};
