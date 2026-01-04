import type { Meta, StoryObj } from '@storybook/react';
import Tabs from './Tabs';

const meta: Meta<typeof Tabs> = {
    title: 'Primitives/Tabs',
    component: Tabs,
    tags: ['autodocs'],
    args: {
        tabs: [
            { id: 'overview', label: 'Overview', content: 'Overview content' },
            { id: 'deploys', label: 'Deploys', content: 'Deploy info' },
        ],
    },
};

export default meta;

type Story = StoryObj<typeof Tabs>;

export const Default: Story = {};

export const WithThree: Story = {
    args: {
        tabs: [
            { id: 'overview', label: 'Overview', content: 'Overview content' },
            { id: 'deploys', label: 'Deploys', content: 'Deploy info' },
            { id: 'metrics', label: 'Metrics', content: 'Latency P95: 98ms' },
        ],
        defaultTab: 'metrics',
    },
};
