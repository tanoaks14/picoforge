import React from 'react';
import { cn } from '../../utils/cn';
import styles from './Alert.module.css';

type Tone = 'default' | 'info' | 'warning' | 'danger' | 'success';

type AlertProps = {
    tone?: Tone;
    title?: string;
    children: React.ReactNode;
};

const Alert: React.FC<AlertProps> = ({ tone = 'default', title, children }) => (
    <div className={cn(styles.alert, styles[`tone-${tone}`])} role="status">
        <div>
            {title ? <div className={styles.title}>{title}</div> : null}
            <div className={styles.body}>{children}</div>
        </div>
    </div>
);

export default Alert;
