import React from 'react';
import { cn } from '../../utils/cn';
import styles from './Stack.module.css';

type StackProps = React.HTMLAttributes<HTMLDivElement> & {
    direction?: 'row' | 'column';
    gap?: number;
    align?: React.CSSProperties['alignItems'];
    justify?: React.CSSProperties['justifyContent'];
    wrap?: boolean;
};

const Stack: React.FC<StackProps> = ({
    direction = 'column',
    gap = 12,
    align,
    justify,
    wrap = false,
    children,
    className,
    style,
    ...rest
}) => {
    return (
        <div
            className={cn(styles.stack, className)}
            style={{
                flexDirection: direction,
                gap,
                alignItems: align,
                justifyContent: justify,
                flexWrap: wrap ? 'wrap' : 'nowrap',
                ...style,
            }}
            {...rest}
        >
            {children}
        </div>
    );
};

export default Stack;
