import type { LucideIcon } from 'lucide-react';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

interface TextFieldProps {
  readonly id: string;
  readonly label: string;
  readonly type?: string;
  readonly value: string;
  readonly onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly icon: LucideIcon;
}

export function TextField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = true,
  icon: Icon,
}: TextFieldProps) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant/60" />
        <Input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="pl-10"
          required={required}
        />
      </div>
    </Field>
  );
}
