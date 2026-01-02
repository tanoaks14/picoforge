import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Alert from '../Alert';

describe('Alert', () => {
    it('renders title and body', () => {
        render(
            <Alert tone="warning" title="Heads up">
                Something happened
            </Alert>
        );

        const alert = screen.getByRole('status');
        expect(screen.getByText(/heads up/i)).toBeInTheDocument();
        expect(screen.getByText(/something happened/i)).toBeInTheDocument();
        expect(alert.className).toContain('tone-warning');
    });
});
