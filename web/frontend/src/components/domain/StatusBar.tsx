import React from 'react';
import Button from '../primitives/Button';
import styles from './StatusBar.module.css';

type StatusBarProps = {
    message: string;
    detail?: string;
    onRefresh?: () => void;
};

const StatusBar: React.FC<StatusBarProps> = ({ message, detail, onRefresh }) => (
    <div className={styles.bar}>
        <div>
            <div>{message}</div>
            {detail ? <div className={styles.meta}>{detail}</div> : null}
        </div>
        <div className={styles.actions}>
            <Button size="sm" variant="ghost" onClick={onRefresh}>
                Refresh
            </Button>
        </div>
    </div>
);

export default StatusBar;
