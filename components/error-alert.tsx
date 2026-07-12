import { AlertCircle } from 'lucide-react';

import { Callout } from '@/components/ui/callout';

interface ErrorAlertProps {
  readonly message: string;
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  if (!message) return null;

  return (
    <Callout
      variant="destructive"
      icon={<AlertCircle className="h-4 w-4" />}
      className="text-sm"
    >
      {message}
    </Callout>
  );
}
