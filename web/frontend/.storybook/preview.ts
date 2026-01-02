import type { Preview } from '@storybook/react';
import '../src/styles/global.css';

const preview: Preview = {
    parameters: {
        actions: { argTypesRegex: '^on[A-Z].*' },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/,
            },
        },
        backgrounds: {
            default: 'Night',
            values: [
                { name: 'Night', value: '#0c1021' },
                { name: 'Paper', value: '#f5f7fb' },
            ],
        },
    },
};

export default preview;
