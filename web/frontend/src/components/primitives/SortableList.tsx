import { useMemo } from 'react';
import {
    DndContext,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from './SortableList.module.css';

export type SortableListItem = {
    id: string;
    label: string;
    description?: string;
};

export type SortableListProps = {
    items: SortableListItem[];
    onOrderChange: (orderedIds: string[]) => void;
    disabled?: boolean;
};

const SortableRow = ({ item, disabled }: { item: SortableListItem; disabled?: boolean }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: item.id,
        disabled,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    } as const;

    return (
        <div
            ref={setNodeRef}
            className={`${styles.row} ${isDragging ? styles.rowDragging : ''}`}
            style={style}
            {...attributes}
        >
            <span className={styles.handle} aria-hidden="true" {...listeners}>
                ⋮⋮
            </span>
            <div className={styles.content}>
                <span className={styles.label}>{item.label}</span>
                {item.description ? <span className={styles.description}>{item.description}</span> : null}
            </div>
        </div>
    );
};

const SortableList = ({ items, onOrderChange, disabled = false }: SortableListProps) => {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 6 },
        }),
    );

    const ids = useMemo(() => items.map((item) => item.id), [items]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = ids.indexOf(String(active.id));
        const newIndex = ids.indexOf(String(over.id));
        if (oldIndex === -1 || newIndex === -1) return;

        const newOrder = arrayMove(items, oldIndex, newIndex).map((item) => item.id);
        onOrderChange(newOrder);
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={ids} strategy={verticalListSortingStrategy} disabled={disabled}>
                <div className={styles.list}>
                    {items.map((item) => (
                        <SortableRow key={item.id} item={item} disabled={disabled} />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
};

export default SortableList;
