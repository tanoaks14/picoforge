import React from 'react';
import { cn } from '../../utils/cn';
import styles from './Select.module.css';

type Option = { label: string; value: string };

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
    label?: string;
    hint?: string;
    options: Option[];
};

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, hint, options, className, ...rest }, ref) => (
        <label className={styles.field}>
            {label ? <span className={styles.label}>{label}</span> : null}
            <select ref={ref} className={cn(styles.select, className)} {...rest}>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {hint ? <span className={styles.hint}>{hint}</span> : null}
        </label>
    )
);

Select.displayName = 'Select';

export default Select;
