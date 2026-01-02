import React from 'react';
import Badge from '../primitives/Badge';
import Button from '../primitives/Button';
import Card from '../primitives/Card';
import styles from './TemplatePreview.module.css';

type TemplatePreviewProps = {
    name: string;
    description: string;
    owner: string;
    snippet: string;
};

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ name, description, owner, snippet }) => (
    <Card
        title={
            <div className={styles.titleRow}>
                <span>{name}</span>
                <Badge tone="muted">Template</Badge>
            </div>
        }
        action={<Badge withDot tone="success">Verified</Badge>}
    >
        <div className={styles.preview}>
            <div>
                <p>{description}</p>
                <div className={styles.meta}>Maintainer · {owner}</div>
                <div className={styles.actions}>
                    <Button size="sm">Use template</Button>
                    <Button size="sm" variant="outline">
                        Duplicate
                    </Button>
                </div>
            </div>
            <pre className={styles.code}>{snippet}</pre>
        </div>
    </Card>
);

export default TemplatePreview;
