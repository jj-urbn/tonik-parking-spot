import { useId } from 'react';

type Props = {
  label: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  onChange?: (value: string) => void;
};

export function InfoField({ label, value, placeholder, required, readOnly, onChange }: Props) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <span className="flex items-center gap-0.5 text-2xs text-muted">
        <label htmlFor={id}>{label}</label>
        {required && <span className="text-error" aria-hidden="true">*</span>}
      </span>
      {readOnly ? (
        <span className="py-2 text-base text-strong">{value}</span>
      ) : (
        <div className="flex items-center py-2 shadow-[0_1px_0_0_var(--color-border)] focus-within:shadow-[0_1px_0_0_var(--color-border-accent)]">
          <input
            id={id}
            className="w-full bg-transparent text-base text-strong outline-none placeholder:text-muted"
            placeholder={placeholder}
            value={value}
            readOnly={!onChange}
            onChange={(e) => onChange?.(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
