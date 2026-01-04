import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Tooltip from '../Tooltip';

describe('Tooltip', () => {
    it('shows tooltip text on hover and hides on blur', async () => {
        const user = userEvent.setup();
        render(
            <Tooltip label="Helpful message">
                <button type="button">Trigger</button>
            </Tooltip>
        );

        const tooltip = screen.getByRole('tooltip');
        expect(tooltip.className).not.toContain('visible');

        await user.hover(screen.getByRole('button', { name: /trigger/i }));
        expect(tooltip.className).toContain('visible');

        await user.unhover(screen.getByRole('button', { name: /trigger/i }));
        expect(tooltip.className).not.toContain('visible');
    });
});
