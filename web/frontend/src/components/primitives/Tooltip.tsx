import React from 'react';
import { cn } from '../../utils/cn';
import styles from './Tooltip.module.css';

type TooltipProps = {
    label: string;
    children: React.ReactElement;
};

const Tooltip: React.FC<TooltipProps> = ({ label, children }) => {
    const [open, setOpen] = React.useState(false);
    const show = () => setOpen(true);
    const hide = () => setOpen(false);

    return (
        <span className={styles.trigger} onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
            {children}
            <span role="tooltip" className={cn(styles.bubble, open && styles.visible)}>
                {label}
            </span>
        </span>
    );
};

export default Tooltip;
