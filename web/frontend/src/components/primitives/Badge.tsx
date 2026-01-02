import React from 'react';
import { cn } from '../../utils/cn';
import styles from './Badge.module.css';

type Tone = 'default' | 'muted' | 'success' | 'warning' | 'danger';

type BadgeProps = {
    tone?: Tone;
    withDot?: boolean;
    children: React.ReactNode;
    className?: string;
};

const Badge: React.FC<BadgeProps> = ({ tone = 'default', withDot = false, children, className }) => (
    <span className={cn(styles.badge, tone !== 'default' && styles[tone], className)}>
        {withDot ? <span className={styles.dot} aria-hidden /> : null}
        {children}
    </span>
);

export default Badge;
