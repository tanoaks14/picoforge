import { getJson } from './http';
import { Block } from '../components/builder/BlockBuilder';

const API_URL = '/api/v1/templates';

export type Template = {
    id: string;
    name: string;
    blocks: Block[];
};

export const TemplateService = {
    list: () => getJson<Template[]>(API_URL),
    create: (name: string, blocks: Block[]) => getJson<Template>(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, blocks })
    })
};
