import React from 'react';
import styles from './Spinner.module.css';

type SpinnerProps = {
    size?: number;
};

const Spinner: React.FC<SpinnerProps> = ({ size = 18 }) => (
    <span className={styles.spinner} style={{ width: size, height: size }} aria-label="Loading" />
);

export default Spinner;
