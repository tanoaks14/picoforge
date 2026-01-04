import type { Meta, StoryObj } from '@storybook/react';
import Checkbox from './Checkbox';

const meta: Meta<typeof Checkbox> = {
    title: 'Primitives/Checkbox',
    component: Checkbox,
    tags: ['autodocs'],
    args: {
        label: 'Run lint before build',
        hint: 'Recommended for stable modules',
        defaultChecked: true,
    },
};

export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {};

export const Disabled: Story = {
    args: {
        disabled: true,
    },
};
