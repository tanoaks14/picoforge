import React from 'react';
import { cn } from '../../utils/cn';
import styles from './Tabs.module.css';

type Tab = {
    id: string;
    label: string;
    content: React.ReactNode;
};

type TabsProps = {
    tabs: Tab[];
    defaultTab?: string;
    onChange?: (tabId: string) => void;
};

const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab, onChange }) => {
    const [current, setCurrent] = React.useState(defaultTab ?? tabs[0]?.id);

    const select = (id: string) => {
        setCurrent(id);
        onChange?.(id);
    };

    const active = tabs.find((t) => t.id === current) ?? tabs[0];

    return (
        <div className={styles.tabs}>
            <div className={styles.list} role="tablist">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        role="tab"
                        aria-selected={tab.id === active?.id}
                        className={cn(styles.tab, tab.id === active?.id && styles.active)}
                        onClick={() => select(tab.id)}
                        type="button"
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            {active ? (
                <div className={styles.panel} role="tabpanel">
                    {active.content}
                </div>
            ) : null}
        </div>
    );
};

export default Tabs;
