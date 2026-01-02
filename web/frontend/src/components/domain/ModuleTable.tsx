import React from 'react';
import Badge from '../primitives/Badge';
import Button from '../primitives/Button';
import styles from './ModuleTable.module.css';

export type Status = 'ready' | 'building' | 'error';

export type ModuleRow = {
    name: string;
    version: string;
    status: Status;
    updatedAt: string;
    owner: string;
};

type ModuleTableProps = {
    rows: ModuleRow[];
    onSelect?: (name: string) => void;
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

const ModuleTable: React.FC<ModuleTableProps> = ({ rows, onSelect }) => (
    <table className={styles.table}>
        <thead>
            <tr>
                <th>Name</th>
                <th>Version</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Owner</th>
                <th aria-label="actions" />
            </tr>
        </thead>
        <tbody>
            {rows.map((row) => (
                <tr key={row.name}>
                    <td>
                        <div className={styles.name}>{row.name}</div>
                        <div className={styles.meta}>Stable</div>
                    </td>
                    <td>{row.version}</td>
                    <td>
                        <Badge tone={toneByStatus[row.status]} withDot>
                            {labelByStatus[row.status]}
                        </Badge>
                    </td>
                    <td>{row.updatedAt}</td>
                    <td>{row.owner}</td>
                    <td>
                        <Button variant="ghost" size="sm" onClick={() => onSelect?.(row.name)}>
                            Inspect
                        </Button>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
);

export default ModuleTable;
