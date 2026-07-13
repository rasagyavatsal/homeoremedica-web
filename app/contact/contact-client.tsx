"use client"

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

import { Callout } from '@/components/ui/callout';
import { Button } from '@/components/ui/button';
import { MotionSafeShell, MotionSection } from '@/components/ui/motion';
import { motionClassNames } from '@/lib/motion/system';

export function ContactClient() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('rasagyavatsal@outlook.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="flex-1 min-h-screen">
      <div className="page-shell py-16 lg:py-24">
        <MotionSafeShell className="reading-shell space-y-10 text-center md:space-y-12">
          <MotionSection className="space-y-4">
            <p className="index-label">Support and feedback</p>
            <h1 className="display-md text-foreground">Contact</h1>
          </MotionSection>

          <MotionSection className={`quiet-panel space-y-6 p-6 md:p-10 ${motionClassNames.surface}`}>
            <a
              href="mailto:rasagyavatsal@outlook.com"
              className={`block break-all font-display text-2xl font-medium tracking-display text-foreground underline decoration-primary underline-offset-8 transition-colors hover:text-primary md:text-4xl ${motionClassNames.press}`}
            >
              rasagyavatsal@outlook.com
            </a>

            <div className="flex flex-col items-center gap-3">
              <Button onClick={handleCopyEmail} variant="outline" size="sm" className="gap-2">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy email'}
              </Button>
              <Callout variant="default" className="w-full text-left text-sm">
                Typically responds within 24-48 hours.
              </Callout>
            </div>
          </MotionSection>
        </MotionSafeShell>
      </div>
    </main>
  );
}
