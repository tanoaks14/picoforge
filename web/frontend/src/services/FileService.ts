import { getJson } from './http';

export const FileService = {
    
    
    
    

    
    
    
    
    

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
