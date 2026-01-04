import type { Meta, StoryObj } from '@storybook/react';
import Alert from './Alert';

const meta: Meta<typeof Alert> = {
    title: 'Primitives/Alert',
    component: Alert,
    tags: ['autodocs'],
    args: {
        title: 'Heads up',
        children: 'Something happened.',
    },
};

export default meta;

type Story = StoryObj<typeof Alert>;

export const Info: Story = {
    args: { tone: 'info' },
};

export const Warning: Story = {
    args: { tone: 'warning' },
};

export const Danger: Story = {
    args: { tone: 'danger' },
};

export const Success: Story = {
    args: { tone: 'success' },
};
