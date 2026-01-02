import React from 'react';
import { cn } from '../../utils/cn';
import styles from './Button.module.css';

type ButtonVariant = 'solid' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'solid',
            size = 'md',
            leftIcon,
            rightIcon,
            children,
            className,
            ...rest
        },
        ref
    ) => {
        const iconOnly = !children && Boolean(leftIcon || rightIcon);

        return (
            <button
                ref={ref}
                className={cn(styles.button, styles[variant], styles[size], iconOnly && styles.iconOnly, className)}
                {...rest}
            >
                {leftIcon ? <span className={styles.leftIcon}>{leftIcon}</span> : null}
                {children}
                {rightIcon ? <span className={styles.rightIcon}>{rightIcon}</span> : null}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
