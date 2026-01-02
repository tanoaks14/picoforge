import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import Button from './Button';
import Modal from './Modal';

const meta: Meta<typeof Modal> = {
    title: 'Primitives/Modal',
    component: Modal,
    tags: ['autodocs'],
    args: {
        title: 'Create template',
        children: 'Describe what this template should generate for PicoForge modules.',
    },
};

export default meta;

type Story = StoryObj<typeof Modal>;

export const Controlled: Story = {
    render: (args) => {
        const [open, setOpen] = React.useState(true);
        return (
            <>
                <Button onClick={() => setOpen(true)}>Open modal</Button>
                <Modal
                    {...args}
                    open={open}
                    onClose={() => setOpen(false)}
                    primaryAction={{ label: 'Create', onClick: () => setOpen(false) }}
                    secondaryAction={{ label: 'Cancel', onClick: () => setOpen(false) }}
                />
            </>
        );
    },
};
