import React from 'react';
import { cn } from '../../utils/cn';
import styles from './Grid.module.css';

type GridProps = React.HTMLAttributes<HTMLDivElement> & {
    columns?: number;
    minColumnWidth?: number;
    gap?: number;
};

const Grid: React.FC<GridProps> = ({ columns, minColumnWidth = 240, gap = 12, style, className, children, ...rest }) => (
    <div
        className={cn(styles.grid, className)}
        style={{
            gap,
            gridTemplateColumns: columns
                ? `repeat(${columns}, 1fr)`
                : `repeat(auto-fit, minmax(${minColumnWidth}px, 1fr))`,
            ...style,
        }}
        {...rest}
    >
        {children}
    </div>
);

export default Grid;
