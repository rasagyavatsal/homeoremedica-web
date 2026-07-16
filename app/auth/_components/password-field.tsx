"use client";

import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { motionClassNames } from '@/lib/motion/system';

interface PasswordFieldProps {
  readonly id?: string;
  readonly label?: string;
  readonly rightLabel?: React.ReactNode;
  readonly value: string;
  readonly onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly onFocus?: () => void;
  readonly onBlur?: () => void;
  readonly autoComplete?: React.HTMLInputAutoCompleteAttribute;
}

export function PasswordField({
  id = 'password',
  label = 'Password',
  rightLabel,
  value,
  onChange,
  placeholder = '••••••••',
  required = true,
  onFocus,
  onBlur,
  autoComplete,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Field>
      {rightLabel ? (
        <div className="flex items-center justify-between">
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          {rightLabel}
        </div>
      ) : (
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
      )}
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant/60" />
        <Input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="pl-10 pr-10"
          required={required}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className={`absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-on-surface-variant transition-colors hover:text-foreground ${motionClassNames.press}`}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </Field>
  );
}
