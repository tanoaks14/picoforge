import React from 'react';
import Badge from '../primitives/Badge';
import Card from '../primitives/Card';
import styles from './GenerationLog.module.css';

export type LogLevel = 'info' | 'warn' | 'error';

export type Log = {
    level: LogLevel;
    message: string;
    timestamp: string;
};

type GenerationLogProps = {
    entries: Log[];
};

const toneByLevel: Record<LogLevel, 'muted' | 'warning' | 'danger'> = {
    info: 'muted',
    warn: 'warning',
    error: 'danger',
};

const labelByLevel: Record<LogLevel, string> = {
    info: 'Info',
    warn: 'Warning',
    error: 'Error',
};

const GenerationLog: React.FC<GenerationLogProps> = ({ entries }) => (
    <Card title="Generation log">
        <div className={styles.list}>
            {entries.map((entry, index) => (
                <div key={`${entry.timestamp}-${index}`} className={styles.row}>
                    <div className={styles.message}>
                        <Badge tone={toneByLevel[entry.level]} withDot>
                            {labelByLevel[entry.level]}
                        </Badge>
                        <span>{entry.message}</span>
                    </div>
                    <span className={styles.timestamp}>{entry.timestamp}</span>
                </div>
            ))}
        </div>
    </Card>
);

export default GenerationLog;
