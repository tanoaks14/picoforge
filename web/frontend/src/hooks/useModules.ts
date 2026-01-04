import { useAsyncResource } from './useAsyncResource';
import type { Status } from '../components/domain/ModuleTable';
import { getJson } from '../services/http';

export type ModuleSummary = {
    name: string;
    version: string;
    status: Status;
    updatedAt: string;
    owner: string;
};

async function fetchModules(signal?: AbortSignal): Promise<ModuleSummary[]> {
    return getJson<ModuleSummary[]>('/modules', { signal });
}

export function useModules(initial?: ModuleSummary[]) {
    return useAsyncResource<ModuleSummary[]>(
        () => {
            const controller = new AbortController();
            const promise = fetchModules(controller.signal);
            promise.finally(() => controller.abort());
            return promise;
        },
        { initialData: initial, immediate: true }
    );
}
