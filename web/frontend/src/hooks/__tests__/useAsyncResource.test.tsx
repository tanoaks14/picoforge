import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useAsyncResource } from '../useAsyncResource';

function Harness({ fetcher }: { fetcher: () => Promise<string> }) {
    const { data, loading, error, refetch } = useAsyncResource(fetcher);

    return (
        <div>
            <div data-testid="loading">{loading ? 'loading' : 'idle'}</div>
            <div data-testid="data">{data}</div>
            <div data-testid="error">{error?.message}</div>
            <button type="button" onClick={() => void refetch()}>
                reload
            </button>
        </div>
    );
}

describe('useAsyncResource', () => {
    it('loads data on mount and exposes refetch', async () => {
        const fetcher = vi.fn().mockResolvedValue('hello');
        render(<Harness fetcher={fetcher} />);

        expect(screen.getByTestId('loading').textContent).toBe('loading');
        await waitFor(() => expect(screen.getByTestId('data').textContent).toBe('hello'));
        expect(fetcher).toHaveBeenCalledTimes(1);

        const user = userEvent.setup();
        fetcher.mockResolvedValueOnce('again');
        await user.click(screen.getByRole('button', { name: /reload/i }));
        await waitFor(() => expect(screen.getByTestId('data').textContent).toBe('again'));
        expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it('captures errors without crashing', async () => {
        const fetcher = vi.fn().mockRejectedValue(new Error('boom'));
        render(<Harness fetcher={fetcher} />);

        await waitFor(() => expect(screen.getByTestId('error').textContent).toBe('boom'));
    });
});
