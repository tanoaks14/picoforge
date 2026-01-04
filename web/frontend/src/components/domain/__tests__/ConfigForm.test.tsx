import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfigForm from '../ConfigForm';

describe('ConfigForm', () => {
    it('submits selected values', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn();
        render(
            <ConfigForm
                modules={['one', 'two']}
                environments={['staging', 'prod']}
                defaultValues={{ timeout: 30, lint: false }}
                onSubmit={onSubmit}
            />
        );

        await user.selectOptions(screen.getByLabelText(/module/i), 'two');
        await user.type(screen.getByLabelText(/timeout/i), '{backspace}{backspace}45');
        await user.click(screen.getByText(/run lint/i));
        await user.click(screen.getByRole('button', { name: /save config/i }));

        expect(onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({ module: 'two', timeout: 45, lint: true })
        );
    });
});
