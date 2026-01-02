import React from 'react';
import { cn } from '../../utils/cn';
import styles from './PageShell.module.css';

type PageShellProps = {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
};

const PageShell: React.FC<PageShellProps> = ({ title, subtitle, actions, children, className }) => (
    <div className={cn(styles.shell, className)}>
        <header className={styles.header}>
            <div>
                <div className={styles.title}>{title}</div>
                {subtitle ? <div className={styles.subtitle}>{subtitle}</div> : null}
            </div>
            {actions ? <div className={styles.actions}>{actions}</div> : null}
        </header>
        <main>{children}</main>
    </div>
);

export default PageShell;
