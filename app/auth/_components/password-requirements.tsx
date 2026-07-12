import { PASSWORD_RULES, type validatePassword } from '@homeoremedica/shared';

interface PasswordRequirementsProps {
  readonly passwordResult: ReturnType<typeof validatePassword> | null;
}

export function PasswordRequirements({ passwordResult }: PasswordRequirementsProps) {
  if (!passwordResult) return null;

  return (
    <div className="mt-2 space-y-1 text-xs" data-testid="password-requirements">
      {[
        { key: 'length', label: PASSWORD_RULES.LENGTH },
        { key: 'uppercase', label: PASSWORD_RULES.UPPERCASE },
        { key: 'lowercase', label: PASSWORD_RULES.LOWERCASE },
        { key: 'number', label: PASSWORD_RULES.NUMBER },
        { key: 'symbol', label: PASSWORD_RULES.SYMBOL },
      ].map((rule) => {
        const isPassed = passwordResult.rules[rule.key as keyof typeof passwordResult.rules]?.passed;
        return (
          <div
            key={rule.key}
            className={`flex items-center gap-1.5 ${
              isPassed ? 'text-success' : 'text-on-surface-variant/70'
            }`}
          >
            <span aria-hidden="true" className="font-bold">
              {isPassed ? '✓' : '✗'}
            </span>
            <span>{rule.label}</span>
          </div>
        );
      })}
    </div>
  );
}
