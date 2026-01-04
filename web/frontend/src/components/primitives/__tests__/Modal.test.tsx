import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '../Modal';

const noop = () => { };

describe('Modal', () => {
    it('does not render when closed', () => {
        render(
            <Modal open={false} onClose={noop} title="Dialog">
                Hidden content
            </Modal>
        );

        expect(screen.queryByText(/hidden content/i)).toBeNull();
    });

    it('renders content and primary action when open', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        render(
            <Modal
                open
                onClose={onClose}
                title="Dialog"
                primaryAction={{ label: 'Save', onClick: onClose }}
                secondaryAction={{ label: 'Cancel', onClick: onClose }}
            >
                Visible content
            </Modal>
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: /save/i }));
        expect(onClose).toHaveBeenCalled();
    });
});
