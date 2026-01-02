import React from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';
import styles from './Modal.module.css';

type ModalProps = {
    open: boolean;
    title?: React.ReactNode;
    children: React.ReactNode;
    primaryAction?: { label: string; onClick: () => void; loading?: boolean };
    secondaryAction?: { label: string; onClick: () => void };
    onClose: () => void;
};

const Modal: React.FC<ModalProps> = ({
    open,
    title,
    children,
    primaryAction,
    secondaryAction,
    onClose,
}) => {
    React.useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (open) {
            window.addEventListener('keydown', onKey);
        }
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose, open]);

    if (!open) return null;

    return createPortal(
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined}>
            <div className={styles.content}>
                <div className={styles.header}>
                    {title ? <div className={styles.title}>{title}</div> : <span />}
                    <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close dialog">
                        ×
                    </Button>
                </div>
                <div className={styles.body}>{children}</div>
                {(primaryAction || secondaryAction) && (
                    <div className={styles.footer}>
                        {secondaryAction ? (
                            <Button variant="ghost" onClick={secondaryAction.onClick}>
                                {secondaryAction.label}
                            </Button>
                        ) : null}
                        {primaryAction ? (
                            <Button onClick={primaryAction.onClick} disabled={primaryAction.loading}>
                                {primaryAction.loading ? 'Working…' : primaryAction.label}
                            </Button>
                        ) : null}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default Modal;
