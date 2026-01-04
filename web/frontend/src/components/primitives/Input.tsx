import React from 'react';
import { cn } from '../../utils/cn';
import styles from './Input.module.css';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    hint?: string;
    error?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, hint, error, className, ...rest }, ref) => {
        return (
            <label className={styles.field}>
                {label ? <span className={styles.label}>{label}</span> : null}
                <input
                    ref={ref}
                    className={cn(styles.input, className)}
                    aria-invalid={Boolean(error)}
                    {...rest}
                />
                {hint ? <span className={styles.hint}>{hint}</span> : null}
                {error ? (
                    <span className={cn(styles.hint, styles.error)} role="alert">
                        {error}
                    </span>
                ) : null}
            </label>
        );
    }
);

Input.displayName = 'Input';

export default Input;
