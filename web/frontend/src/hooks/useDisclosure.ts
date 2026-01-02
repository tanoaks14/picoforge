import React from 'react';

export type DisclosureControls = {
    open: boolean;
    openModal: () => void;
    closeModal: () => void;
    toggle: () => void;
};

export function useDisclosure(initial = false): DisclosureControls {
    const [open, setOpen] = React.useState(initial);

    const openModal = React.useCallback(() => setOpen(true), []);
    const closeModal = React.useCallback(() => setOpen(false), []);
    const toggle = React.useCallback(() => setOpen((prev) => !prev), []);

    return { open, openModal, closeModal, toggle };
}
