import type { Meta, StoryObj } from '@storybook/react';
import GenerationLog from './GenerationLog';

const meta: Meta<typeof GenerationLog> = {
    title: 'Domain/GenerationLog',
    component: GenerationLog,
    tags: ['autodocs'],
    args: {
        entries: [
            { level: 'info', message: 'Module orchestrator promoted to stable.', timestamp: '08:21' },
            { level: 'warn', message: 'Sandbox build exceeded warm budget.', timestamp: '08:09' },
            { level: 'error', message: 'edge-adapter failed lint gate.', timestamp: '07:58' },
        ],
    },
};

export default meta;

type Story = StoryObj<typeof GenerationLog>;

export const Default: Story = {};

export const Empty: Story = {
    args: { entries: [] },
};
