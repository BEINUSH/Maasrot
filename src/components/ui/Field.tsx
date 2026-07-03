import type { ReactNode } from 'react';

interface FieldWrapProps {
  label: string;
  children: ReactNode;
  className?: string;
}

function FieldWrap({ label, children, className = '' }: FieldWrapProps) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-semibold text-ink2 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'tel' | 'date' | 'url' | 'number';
  placeholder?: string;
  dir?: 'rtl' | 'ltr';
  required?: boolean;
  className?: string;
}

export function TextField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  dir,
  required,
  className = '',
}: TextFieldProps) {
  return (
    <FieldWrap label={label} className={className}>
      <input
        className="input-base"
        type={type}
        value={value}
        dir={dir}
        placeholder={placeholder}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldWrap>
  );
}

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export function NumberField({ label, value, onChange, className = '' }: NumberFieldProps) {
  return (
    <FieldWrap label={label} className={className}>
      <input
        className="input-base"
        type="number"
        dir="ltr"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </FieldWrap>
  );
}

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  className?: string;
}

export function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
  className = '',
}: TextAreaFieldProps) {
  return (
    <FieldWrap label={label} className={className}>
      <textarea
        className="input-base resize-y"
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldWrap>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
}

export function SelectField({ label, value, onChange, options, className = '' }: SelectFieldProps) {
  return (
    <FieldWrap label={label} className={className}>
      <select className="input-base" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldWrap>
  );
}

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export function CheckboxField({ label, checked, onChange, className = '' }: CheckboxFieldProps) {
  return (
    <label className={`flex items-center gap-2.5 cursor-pointer select-none ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 rounded-md accent-[var(--accent)]"
      />
      <span className="text-sm font-semibold text-ink2">{label}</span>
    </label>
  );
}
