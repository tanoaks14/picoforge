import type { Meta, StoryObj } from '@storybook/react';
import StatusBar from './StatusBar';

const meta: Meta<typeof StatusBar> = {
    title: 'Domain/StatusBar',
    component: StatusBar,
    tags: ['autodocs'],
    args: {
        message: '3 modules monitored · auto-refresh enabled',
        detail: 'Last sync 08:22:10',
    },
};

export default meta;

type Story = StoryObj<typeof StatusBar>;

export const Default: Story = {};

export const WithRefresh: Story = {
    args: {
        onRefresh: () => alert('Refetch triggered'),
    },
};
