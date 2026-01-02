import React from 'react';
import { cn } from '../../utils/cn';
import styles from './Card.module.css';

type CardProps = {
    title?: React.ReactNode;
    action?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
};

const Card: React.FC<CardProps> = ({ title, action, children, className, style }) => (
    <div className={cn(styles.card, className)} style={style}>
        {title || action ? (
            <div className={styles.header}>
                {title ? <div className={styles.title}>{title}</div> : <span />}
                {action}
            </div>
        ) : null}
        <div className={styles.body}>{children}</div>
    </div>
);

export default Card;
