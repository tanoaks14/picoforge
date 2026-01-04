import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';

const meta: Meta<typeof Button> = {
    title: 'Primitives/Button',
    component: Button,
    tags: ['autodocs'],
    args: {
        children: 'Click me',
        variant: 'solid',
        size: 'md',
    },
    argTypes: {
        variant: {
            control: 'select',
            options: ['solid', 'outline', 'ghost'],
        },
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg'],
        },
    },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Solid: Story = {};

export const Outline: Story = {
    args: { variant: 'outline' },
};

export const Ghost: Story = {
    args: { variant: 'ghost' },
};

export const IconOnly: Story = {
    args: {
        children: undefined,
        leftIcon: <span aria-hidden>↻</span>,
        'aria-label': 'Refresh',
    },
};
