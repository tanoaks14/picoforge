import React from 'react';

export type AsyncResourceState<T> = {
    data: T | null;
    loading: boolean;
    loaded: boolean;
    error: Error | null;
    touchedAt: Date | null;
};

export type UseAsyncResourceResult<T> = AsyncResourceState<T> & {
    refetch: () => Promise<void>;
    setData: (next: T) => void;
};

export function useAsyncResource<T>(
    fetcher: () => Promise<T>,
    options: { immediate?: boolean; initialData?: T } = {}
): UseAsyncResourceResult<T> {
    const { immediate = true, initialData = null as T | null } = options;
    const mounted = React.useRef(true);

    const [state, setState] = React.useState<AsyncResourceState<T>>({
        data: initialData,
        loading: immediate,
        loaded: false,
        error: null,
        touchedAt: null,
    });

    const setData = React.useCallback((next: T) => {
        setState((prev) => ({ ...prev, data: next, touchedAt: new Date() }));
    }, []);

    const refetch = React.useCallback(async () => {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const result = await fetcher();
            if (!mounted.current) return;
            setState({ data: result, loading: false, loaded: true, error: null, touchedAt: new Date() });
        } catch (error) {
            if (!mounted.current) return;
            setState((prev) => ({
                ...prev,
                loading: false,
                loaded: prev.loaded,
                error: error as Error,
                touchedAt: prev.touchedAt ?? new Date(),
            }));
        }
    }, [fetcher]);

    React.useEffect(() => {
        mounted.current = true;
        if (immediate) {
            void refetch();
        }
        return () => {
            mounted.current = false;
        };
    }, [immediate, refetch]);

    return { ...state, refetch, setData };
}
