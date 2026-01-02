import React from 'react';

type AsyncState<T> = {
    data: T;
    loading: boolean;
    touchedAt: Date;
};

export function useSimulatedData<T>(seed: T, jitterMs = 900): AsyncState<T> {
    const [state, setState] = React.useState<AsyncState<T>>({
        data: seed,
        loading: true,
        touchedAt: new Date(),
    });

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            setState({ data: seed, loading: false, touchedAt: new Date() });
        }, jitterMs);

        return () => clearTimeout(timeout);
    }, [jitterMs, seed]);

    return state;
}
