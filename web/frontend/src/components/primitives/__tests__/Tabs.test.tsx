import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Tabs from '../Tabs';

describe('Tabs', () => {
    const tabs = [
        { id: 'overview', label: 'Overview', content: <p>Overview content</p> },
        { id: 'deploys', label: 'Deploys', content: <p>Deploys content</p> },
    ];

    it('shows the first tab content by default', () => {
        render(<Tabs tabs={tabs} />);

        expect(screen.getByRole('tabpanel')).toHaveTextContent(/overview content/i);
        expect(screen.getByRole('tab', { name: /overview/i })).toHaveAttribute('aria-selected', 'true');
    });

    it('changes content when another tab is selected', async () => {
        const user = userEvent.setup();
        render(<Tabs tabs={tabs} />);

        await user.click(screen.getByRole('tab', { name: /deploys/i }));

        expect(screen.getByRole('tabpanel')).toHaveTextContent(/deploys content/i);
        expect(screen.getByRole('tab', { name: /deploys/i })).toHaveAttribute('aria-selected', 'true');
    });
});
