import type { editor } from 'monaco-editor';
import MonacoEditor, { type OnChange } from '@monaco-editor/react';

export type EditorProps = {
    value?: string;
    language?: string;
    onChange?: (value: string) => void;
    height?: number | string;
    readOnly?: boolean;
    theme?: 'vs-dark' | 'vs-light';
    options?: editor.IStandaloneEditorConstructionOptions;
};

const Editor = ({
    value = '',
    language = 'cpp',
    onChange,
    height = 360,
    readOnly = false,
    theme = 'vs-dark',
    options,
}: EditorProps) => {
    const handleChange: OnChange = (nextValue) => {
        onChange?.(nextValue ?? '');
    };

    return (
        <MonacoEditor
            height={height}
            language={language}
            value={value}
            onChange={handleChange}
            options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                readOnly,
                automaticLayout: true,
                fontSize: 14,
                ...options,
            }}
            theme={theme}
        />
    );
};

export default Editor;
