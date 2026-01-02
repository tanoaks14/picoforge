import { getJson } from './http';

export const BuildService = {
    trigger: (projectName: string) => fetch(`/api/v1/builds/${projectName}`, {
        method: 'POST',
    }),

    // Artifact download is a direct link, usually handled by window.open or anchor tag
    getArtifactUrl: (projectName: string) => `/api/v1/builds/${projectName}/artifact`,
};
