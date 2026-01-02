import type { Meta, StoryObj } from '@storybook/react';
import ModuleTable, { type ModuleRow } from './ModuleTable';

const sample: ModuleRow[] = [
    { name: 'orchestrator', version: '1.4.2', status: 'ready', updatedAt: '2h ago', owner: 'Amir' },
    { name: 'sandbox', version: '0.9.8', status: 'building', updatedAt: '5m ago', owner: 'Priya' },
    { name: 'edge-adapter', version: '0.4.1', status: 'error', updatedAt: '15m ago', owner: 'Kai' },
];

const meta: Meta<typeof ModuleTable> = {
    title: 'Domain/ModuleTable',
    component: ModuleTable,
    tags: ['autodocs'],
    args: {
        rows: sample,
    },
};

export default meta;

type Story = StoryObj<typeof ModuleTable>;

export const Default: Story = {};

export const Empty: Story = {
    args: { rows: [] },
};
