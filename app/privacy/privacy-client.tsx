"use client"

import { Calendar, Mail } from 'lucide-react';

import Link from 'next/link';

import { Callout } from '@/components/ui/callout';
import { MotionSafeShell, MotionReveal, MotionSection } from '@/components/ui/motion';
import { PillLink } from '@/components/ui/interactive';
import { motionClassNames } from '@/lib/motion/system';

const LAST_UPDATED = 'January 21, 2025';

const sections = [
  { 
    id: 'collection', 
    title: 'Information We Collect',
    content: (
      <>
        <p>
          We collect information you provide directly to us, such as when you create an account,
          use our services, or contact us for support.
        </p>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-foreground">Account Information</h4>
            <p>Email address, name (optional), and authentication credentials.</p>
          </div>
          <div className="border-l-2 border-primary pl-4">
            <h4 className="font-semibold text-foreground">Health-Related Data</h4>
            <p>
              To provide our services, we collect health-related symptoms and concerns that you voluntarily enter. 
              This includes the specific symptoms you select for remedy matching and any notes you save within your cases.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Usage Data</h4>
            <p>Search queries, book preferences, saved cases, and application interactions.</p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Technical Data</h4>
            <p>IP address, device type, operating system, and browser information.</p>
          </div>
        </div>
      </>
    )
  },
  { 
    id: 'usage', 
    title: 'How We Use Your Information',
    content: (
      <>
        <p>We use the information we collect to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Provide Remedy Recommendations:</strong> We use the symptoms you enter to match against homeopathic materia medica and provide potential remedy suggestions.</li>
          <li><strong>Case Management:</strong> We store your saved cases (including symptoms and results) to allow you to review them across devices.</li>
          <li>Maintain and improve our homeopathic remedy finder service</li>
          <li>Send technical notices and support messages</li>
          <li>Respond to your comments and questions</li>
          <li>Monitor and analyze usage patterns to improve our service</li>
        </ul>
      </>
    )
  },
  { 
    id: 'retention', 
    title: 'Data Retention',
    content: (
      <>
        <p>
          We retain your personal information and health-related data (saved cases and symptoms) for as long as your account is active or as needed to provide you with our services.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Account Data:</strong> Retained until you request account deletion.</li>
          <li><strong>Saved Cases:</strong> Retained until you manually delete them within the application or until your account is closed.</li>
          <li><strong>Temporary Search Data:</strong> Symptoms entered for temporary searches that are not saved as cases are only stored in volatile memory during your session and are not persisted in our database.</li>
        </ul>
        <p className="text-sm italic mt-4">
          Note: We may retain certain information as required by law or for legitimate business purposes, such as resolving disputes or enforcing our agreements.
        </p>
      </>
    )
  },
  { 
    id: 'sharing', 
    title: 'Information Sharing',
    content: (
      <p>
        We do not sell, trade, or otherwise transfer your health data or personal information to third parties.
        We may share your information only with your explicit consent, to comply with legal obligations, 
        to protect our rights, or with service providers who assist in our operations under strict confidentiality agreements.
      </p>
    )
  },
  { 
    id: 'security', 
    title: 'Data Security',
    content: (
      <>
        <p>
          We implement appropriate security measures to protect your personal information against
          unauthorized access, alteration, disclosure, or destruction. This includes:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Encryption of data in transit and at rest</li>
          <li>Regular security assessments and updates</li>
          <li>Access controls and authentication measures</li>
          <li>Secure hosting infrastructure</li>
        </ul>
      </>
    )
  },
  { 
    id: 'rights', 
    title: 'Your Rights',
    content: (
      <>
        <p>You have the right to access, update, or delete your account information and associated data. You can also export your saved cases and opt out of non-essential communications.</p>
        <p className="mt-4">
          To exercise any of these rights, please contact us at <a href="mailto:rasagyavatsal@outlook.com" className="text-tertiary underline-offset-4 hover:underline">rasagyavatsal@outlook.com</a>.
        </p>
      </>
    )
  },
  { 
    id: 'disclaimer', 
    title: 'Medical Disclaimer',
    content: (
      <Callout variant="info">
        <p className="text-sm leading-relaxed text-on-surface-variant">
          <strong>Important:</strong> HomeoRemedica is an educational tool for homeopathic practitioners
          and students. The information provided is not intended as medical advice, diagnosis, or treatment.
          Always consult with qualified healthcare professionals for medical concerns.
        </p>
      </Callout>
    )
  },
  { 
    id: 'contact', 
    title: 'Contact Us',
    content: (
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/contact" className="text-tertiary underline-offset-4 hover:underline inline-flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Contact Page
        </Link>
        <a href="mailto:rasagyavatsal@outlook.com" className="text-tertiary underline-offset-4 hover:underline inline-flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Email Us
        </a>
      </div>
    )
  },
];

export function PrivacyClient() {
  return (
    <main className="flex-1 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <MotionSafeShell className="mx-auto max-w-3xl space-y-10 md:space-y-14">
          <MotionSection className="space-y-4">
            <h1 className="display-md text-foreground">Privacy Policy</h1>
            <div aria-hidden="true" className="rule-double w-16" />
            <div className="flex items-center gap-2 font-code text-xs tracking-[0.08em] text-on-surface-variant">
              <Calendar className="h-4 w-4" />
              <span>Last updated: {LAST_UPDATED}</span>
            </div>
          </MotionSection>

          <nav className="flex flex-wrap gap-2" aria-label="Privacy sections">
            {sections.map((section) => (
              <PillLink
                key={section.id}
                href={`#${section.id}`}
                className="whitespace-nowrap"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {section.title}
              </PillLink>
            ))}
          </nav>

          <div className="space-y-8 md:space-y-10">
            {sections.map((section) => (
              <MotionReveal
                key={section.id}
                id={section.id}
                className={`scroll-mt-28 space-y-4 ${motionClassNames.surface}`}
              >
                <h2 className="rule-heavy pt-3 font-display text-xl font-medium tracking-display text-foreground md:text-2xl">
                  {section.title}
                </h2>
                <div className="space-y-4 text-sm leading-relaxed text-on-surface-variant md:text-base">
                  {section.content}
                </div>
              </MotionReveal>
            ))}
          </div>
        </MotionSafeShell>
      </div>
    </main>
  );
}
