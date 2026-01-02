import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SplitPane from '../SplitPane';

describe('SplitPane', () => {
    it('renders left and right content with ratio applied', () => {
        render(
            <SplitPane
                data-testid="pane"
                ratio={0.6}
                left={<div>Left area</div>}
                right={<div>Right area</div>}
            />
        );

        expect(screen.getByText(/left area/i)).toBeInTheDocument();
        expect(screen.getByText(/right area/i)).toBeInTheDocument();

        expect(screen.getByTestId('pane').style.gridTemplateColumns).toBe('0.6fr 0.4fr');
    });
});
