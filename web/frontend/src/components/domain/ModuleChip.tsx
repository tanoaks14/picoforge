import React from 'react';
import Badge from '../primitives/Badge';
import styles from './ModuleChip.module.css';

type Status = 'ready' | 'building' | 'error';

type ModuleChipProps = {
    name: string;
    version: string;
    status: Status;
    description?: string;
};

const toneByStatus: Record<Status, 'success' | 'warning' | 'danger'> = {
    ready: 'success',
    building: 'warning',
    error: 'danger',
};

const labelByStatus: Record<Status, string> = {
    ready: 'Ready',
    building: 'Building',
    error: 'Error',
};

const ModuleChip: React.FC<ModuleChipProps> = ({ name, version, status, description }) => (
    <div className={styles.chip}>
        <div>
            <div className={styles.name}>{name}</div>
            <div className={styles.meta}>
                v{version} · {description ?? 'No description'}
            </div>
        </div>
        <Badge tone={toneByStatus[status]} withDot>
            {labelByStatus[status]}
        </Badge>
    </div>
);

export default ModuleChip;
