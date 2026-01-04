import type { Meta, StoryObj } from '@storybook/react';
import Input from './Input';

const meta: Meta<typeof Input> = {
    title: 'Primitives/Input',
    component: Input,
    tags: ['autodocs'],
    args: {
        label: 'Module name',
        placeholder: 'orchestrator',
    },
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const WithHint: Story = {
    args: {
        hint: 'Lowercase, hyphenated',
    },
};

export const WithError: Story = {
    args: {
        error: 'Module already exists',
    },
};
