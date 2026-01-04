import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModuleTable, { type ModuleRow } from '../ModuleTable';

describe('ModuleTable', () => {
    const rows: ModuleRow[] = [
        { name: 'alpha', version: '1.0.0', status: 'ready', updatedAt: 'now', owner: 'team-a' },
        { name: 'beta', version: '0.9.1', status: 'building', updatedAt: 'yesterday', owner: 'team-b' },
    ];

    it('renders rows and calls onSelect', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        render(<ModuleTable rows={rows} onSelect={onSelect} />);

        expect(screen.getByText(/alpha/i)).toBeInTheDocument();
        expect(screen.getByText(/beta/i)).toBeInTheDocument();

        await user.click(screen.getAllByRole('button', { name: /inspect/i })[0]);
        expect(onSelect).toHaveBeenCalledWith('alpha');
    });
});
