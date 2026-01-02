import React from 'react';
import styles from './Switch.module.css';

export type SwitchProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
};

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(({ label, ...rest }, ref) => (
    <label className={styles.wrapper}>
        <input ref={ref} type="checkbox" className={styles.input} {...rest} />
        <span className={styles.track}>
            <span className={styles.thumb} />
        </span>
        {label ? <span className={styles.label}>{label}</span> : null}
    </label>
));

Switch.displayName = 'Switch';

export default Switch;
