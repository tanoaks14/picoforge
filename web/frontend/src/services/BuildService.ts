import { getJson } from './http';

export const BuildService = {
    trigger: (projectName: string) => fetch(`/api/v1/builds/${projectName}`, {
        method: 'POST',
    }),

    
    getArtifactUrl: (projectName: string) => `/api/v1/builds/${projectName}/artifact`,
};
