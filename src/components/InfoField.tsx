import { useId } from 'react';

type Props = {
  label: string;
  value: string;
  required?: boolean;
  readOnly?: boolean;
  onChange?: (value: string) => void;
};

export function InfoField({ label, value, required, readOnly, onChange }: Props) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1 border-b border-border py-3">
      <span className="text-xs text-muted">
        <label htmlFor={id}>{label}</label>
        {required && <span className="text-strong" aria-hidden="true"> *</span>}
      </span>
      {readOnly ? (
        <span className="text-sm text-strong">{value}</span>
      ) : (
        <input
          id={id}
          className="bg-transparent text-sm text-strong outline-none"
          value={value}
          readOnly={!onChange}
          onChange={(e) => onChange?.(e.target.value)}
        />
      )}
    </div>
  );
}
