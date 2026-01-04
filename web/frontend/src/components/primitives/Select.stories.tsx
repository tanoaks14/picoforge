import type { Meta, StoryObj } from '@storybook/react';
import Select from './Select';

const meta: Meta<typeof Select> = {
    title: 'Primitives/Select',
    component: Select,
    tags: ['autodocs'],
    args: {
        label: 'Environment',
        options: [
            { label: 'Staging', value: 'staging' },
            { label: 'Production', value: 'production' },
            { label: 'Sandbox', value: 'sandbox' },
        ],
        value: 'staging',
    },
};

export default meta;

type Story = StoryObj<typeof Select>;

export const Default: Story = {};
