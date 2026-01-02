import { getJson } from './http';

export interface Project {
    name: string;
}

export const ProjectService = {
    list: () => getJson<Project[]>('/api/v1/projects'),
    create: (name: string, config: any = {}) => getJson<Project>('/api/v1/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, ...config }),
    }),
};
