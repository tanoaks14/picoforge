import React from 'react';
import { cn } from '../../utils/cn';
import styles from './SplitPane.module.css';

type SplitPaneProps = React.HTMLAttributes<HTMLDivElement> & {
    left: React.ReactNode;
    right: React.ReactNode;
    ratio?: number; // 0-1 left column width ratio
};

const SplitPane: React.FC<SplitPaneProps> = ({ left, right, ratio = 0.5, style, className, ...rest }) => {
    const clamped = Math.min(0.85, Math.max(0.15, ratio));
    return (
        <div
            className={cn(styles.pane, className)}
            style={{
                gridTemplateColumns: `${clamped}fr ${1 - clamped}fr`,
                ...style,
            }}
            {...rest}
        >
            <div className={styles.left}>{left}</div>
            <div className={styles.right}>{right}</div>
        </div>
    );
};

export default SplitPane;
