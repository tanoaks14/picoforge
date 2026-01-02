import React from 'react';
import Card from '../primitives/Card';

type JsonPreviewProps = {
    config: any;
};

const JsonPreview: React.FC<JsonPreviewProps> = ({ config }) => (
    <Card title="Configuration JSON" style={{ display: 'flex', flexDirection: 'column' }}>
        <pre style={{
            background: '#1e1e1e', // Dark background
            color: '#ce9178',      // VS Code JSON string color
            padding: '16px',
            borderRadius: '6px',
            overflow: 'auto',
            fontSize: '13px',
            fontFamily: 'Consolas, Monaco, monospace',
            lineHeight: '1.5',
            border: '1px solid #333',
            margin: 0
        }}>
            {JSON.stringify(config, null, 2)}
        </pre>
    </Card>
);

export default JsonPreview;
