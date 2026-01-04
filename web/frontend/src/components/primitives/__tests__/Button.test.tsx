import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../Button';

describe('Button', () => {
    it('renders label and handles click', async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();
        render(<Button onClick={onClick}>Run</Button>);

        await user.click(screen.getByRole('button', { name: /run/i }));

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('supports icon-only mode with aria-label', () => {
        render(<Button aria-label="refresh" leftIcon={<span>*</span>} />);
        expect(screen.getByLabelText(/refresh/i)).toBeInTheDocument();
    });
});
