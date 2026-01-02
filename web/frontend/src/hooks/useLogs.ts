import { useAsyncResource } from './useAsyncResource';
import { getJson } from '../services/http';
import type { Log } from '../components/domain/GenerationLog';

async function fetchLogs(signal?: AbortSignal): Promise<Log[]> {
    return getJson<Log[]>('/logs', { signal });
}

export function useLogs(initial?: Log[]) {
    return useAsyncResource<Log[]>(
        () => {
            const controller = new AbortController();
            const promise = fetchLogs(controller.signal);
            promise.finally(() => controller.abort());
            return promise;
        },
        { initialData: initial, immediate: true }
    );
}
