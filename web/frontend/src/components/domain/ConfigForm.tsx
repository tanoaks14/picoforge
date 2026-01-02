import React from 'react';
import Button from '../primitives/Button';
import Input from '../primitives/Input';
import Select from '../primitives/Select';
import Switch from '../primitives/Switch';
import styles from './ConfigForm.module.css';

export type ConfigValues = {
    modules: string[];
    environment: string;
    timeout: number;
    lint: boolean;
};

type ConfigFormProps = {
    modules: string[];
    environments: string[];
    defaultValues?: Partial<ConfigValues>;
    onSubmit?: (values: ConfigValues) => void;
    onChange?: (values: ConfigValues) => void;
};

const ConfigForm: React.FC<ConfigFormProps> = ({
    modules,
    environments,
    defaultValues,
    onSubmit,
    onChange,
}) => {
    const initial = React.useMemo<ConfigValues>(
        () => ({
            modules: defaultValues?.modules ?? [],
            environment: defaultValues?.environment ?? environments[0],
            timeout: defaultValues?.timeout ?? 45,
            lint: defaultValues?.lint ?? true,
        }),
        [defaultValues, environments]
    );

    const [values, setValues] = React.useState<ConfigValues>(initial);

    // Sync external defaultValues changes
    React.useEffect(() => {
        if (defaultValues) {
            setValues(prev => ({
                ...prev,
                ...defaultValues,
                modules: defaultValues.modules ?? prev.modules
            }));
        }
    }, [defaultValues]);


    const update = <K extends keyof ConfigValues>(key: K, value: ConfigValues[K]) => {
        setValues((prev) => {
            const next = { ...prev, [key]: value };
            onChange?.(next);
            return next;
        });
    };

    const toggleModule = (module: string) => {
        setValues((prev) => {
            const current = prev.modules;
            const nextModules = current.includes(module)
                ? current.filter(m => m !== module)
                : [...current, module];

            const next = { ...prev, modules: nextModules };
            onChange?.(next);
            return next;
        });
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        onSubmit?.(values);
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.row} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                <label style={{ fontWeight: 600, fontSize: '14px' }}>Modules</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {modules.map((m) => (
                        <div key={m} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input
                                type="checkbox"
                                id={`module-${m}`}
                                checked={values.modules.includes(m)}
                                onChange={() => toggleModule(m)}
                                style={{ accentColor: 'var(--color-primary)' }}
                            />
                            <label htmlFor={`module-${m}`} style={{ fontSize: '14px', cursor: 'pointer' }}>{m}</label>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.row}>
                <Select
                    label="Environment"
                    options={environments.map((env) => ({ label: env, value: env }))}
                    value={values.environment}
                    onChange={(e) => update('environment', e.target.value)}
                />
            </div>

            <div className={styles.row}>
                <Input
                    label="Timeout (seconds)"
                    type="number"
                    min={10}
                    max={300}
                    value={values.timeout}
                    onChange={(e) => update('timeout', Number(e.target.value))}
                    hint="How long to wait for a build before considering it stalled"
                />
                <div>
                    <Switch
                        label="Run lint before build"
                        checked={values.lint}
                        onChange={(e) => update('lint', e.target.checked)}
                    />
                    <div style={{ marginTop: 6, color: 'var(--color-muted)', fontSize: 13 }}>
                        Keeps modules healthy by catching violations early.
                    </div>
                </div>
            </div>

            <div style={{ display: 'none' }}>
                {/* Hidden submit button to allow form submission logic if needed */}
                <button type="submit" />
            </div>
        </form>
    );
};

export default ConfigForm;
