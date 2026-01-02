import type { Meta, StoryObj } from '@storybook/react';
import ConfigForm from './ConfigForm';

const meta: Meta<typeof ConfigForm> = {
    title: 'Domain/ConfigForm',
    component: ConfigForm,
    tags: ['autodocs'],
    args: {
        modules: ['orchestrator', 'sandbox', 'edge-adapter'],
        environments: ['staging', 'production', 'sandbox'],
        defaultValues: { timeout: 45, lint: true },
    },
};

export default meta;

type Story = StoryObj<typeof ConfigForm>;

export const Default: Story = {};

export const WithCustomDefaults: Story = {
    args: {
        defaultValues: { modules: ['sandbox'], environment: 'sandbox', timeout: 120, lint: false },
    },
};
