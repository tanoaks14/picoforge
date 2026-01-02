import React from 'react';
import styles from './Checkbox.module.css';

export type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    hint?: string;
};

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ label, hint, ...rest }, ref) => (
        <div>
            <label className={styles.wrapper}>
                <input ref={ref} type="checkbox" className={styles.input} {...rest} />
                <span className={styles.box} aria-hidden>
                    <span className={styles.check}>✓</span>
                </span>
                <span>{label}</span>
            </label>
            {hint ? <div className={styles.hint}>{hint}</div> : null}
        </div>
    )
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
