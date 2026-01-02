import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SortableList, { type SortableListItem } from './SortableList';

const INITIAL_ITEMS: SortableListItem[] = [
    { id: 'gpio', label: 'GPIO', description: 'Pin 2, output, pull-up' },
    { id: 'pwm', label: 'PWM', description: '1 kHz on GP4' },
    { id: 'i2c', label: 'I2C', description: 'Bus 0, 400 kHz' },
    { id: 'uart', label: 'UART', description: '115200 baud, GP0/GP1' },
];

const meta: Meta<typeof SortableList> = {
    title: 'Primitives/SortableList',
    component: SortableList,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SortableList>;

const StatefulList = (args: Story['args']) => {
    const [items, setItems] = useState(INITIAL_ITEMS);
    return (
        <SortableList
            {...args}
            items={items}
            onOrderChange={(orderedIds) => {
                const next = orderedIds.map((id) => items.find((item) => item.id === id)!).filter(Boolean);
                setItems(next);
            }}
        />
    );
};

export const Default: Story = {
    render: (args) => <StatefulList {...args} />,
};

export const Disabled: Story = {
    render: (args) => <StatefulList {...args} />,
    args: {
        disabled: true,
    },
};
