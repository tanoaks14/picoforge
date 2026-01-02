import type { Meta, StoryObj } from '@storybook/react';
import Editor from './Editor';

const SAMPLE_CPP = `#include <stdio.h>

int main() {
    // [USER_CODE] Start
    for (int i = 0; i < 3; i++) {
        printf("Hello from PicoForge %d\n", i);
    }
    // [USER_CODE] End
    return 0;
}
`;

const meta: Meta<typeof Editor> = {
    title: 'Primitives/Editor',
    component: Editor,
    tags: ['autodocs'],
    args: {
        value: SAMPLE_CPP,
        language: 'cpp',
        height: 360,
    },
    parameters: {
        layout: 'fullscreen',
    },
};

export default meta;

type Story = StoryObj<typeof Editor>;

export const Default: Story = {};

export const ReadOnly: Story = {
    args: {
        readOnly: true,
    },
};

export const LightTheme: Story = {
    args: {
        theme: 'vs-light',
    },
};
