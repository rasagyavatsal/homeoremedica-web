"use client"

import { Mail } from 'lucide-react';

import Link from 'next/link';

import { LegalDocument } from '@/components/legal-document';

const LAST_UPDATED = 'July 19, 2026';

const sections = [
  {
    id: 'scope',
    title: 'Scope',
    content: (
      <p>
        HomeoRemedica is operated by Rasagya Vatsal in India. This policy applies to the
        HomeoRemedica website, server API, and Android app. It explains how we handle
        information when you use these services or contact us.
      </p>
    ),
  },
  {
    id: 'information',
    title: 'Information We Process',
    content: (
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-foreground">Account information</h3>
          <p>
            If you create an account, we process your email address, optional display name,
            and Firebase user ID. Firebase Authentication handles your password; we do not
            store it in the HomeoRemedica database. If you use Google Sign-In, Google provides
            the account identifier, name, and email address needed to sign you in.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Chat information</h3>
          <p>
            Questions you type in the chat are sent to the HomeoRemedica server and the chat
            service to return an answer grounded in the source books. This information may reveal
            health concerns.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Technical and support information</h3>
          <p>
            Our hosting and authentication services process technical request data such as IP
            address, request time and route, browser or device information, and error details to
            deliver and protect the service. If you contact us, we process your email address and
            the contents of your message.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'use',
    title: 'How We Use Information',
    content: (
      <>
        <p>
          When you submit a chat question, you ask us to process that information for the requested
          feature. We use information to:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Authenticate your account and keep it signed in.</li>
          <li>Process chat questions and return answers grounded in the source books.</li>
          <li>Respond to support and privacy requests.</li>
          <li>Maintain security, prevent abuse, diagnose errors, and keep the service reliable.</li>
          <li>Comply with applicable law and valid legal requests.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'device-storage',
    title: 'Device Storage and Website Analytics',
    content: (
      <>
        <p>
          The website uses browser storage for your theme, authentication state, and chat session.
          The Android app uses device storage to keep your Firebase sign-in state and a local
          account summary.
        </p>
        <p>
          Clearing the website&apos;s browser storage or the Android app&apos;s data removes locally
          stored information. Signing out or uninstalling the app does not delete your account from
          our servers.
        </p>
        <p>
          The website loads Google Analytics only when an analytics ID is configured. When
          enabled, Google Analytics uses cookies such as <code>_ga</code> and processes page and
          session activity, approximate location, and browser or device information. The Android
          app does not use Google Analytics. You can limit website analytics by blocking or
          deleting cookies in your browser.
        </p>
      </>
    ),
  },
  {
    id: 'sharing',
    title: 'How We Disclose Information',
    content: (
      <>
        <p>We do not sell personal information or share it with advertisers.</p>
        <p>We disclose information only as needed to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Google service providers:</strong> Firebase Authentication and Google Sign-In
            provide account access; Cloud Firestore stores account records; and Firebase App
            Hosting runs the website and API. Google Analytics processes website usage only when
            enabled.
          </li>
          <li>
            <strong>Email provider:</strong> Our email provider processes messages you choose to
            send us for support, account deletion, or privacy requests.
          </li>
          <li>
            <strong>Legal authorities:</strong> We may disclose information when required by law,
            court order, or another valid legal process, or when necessary to protect users and
            the service.
          </li>
        </ul>
        <p>
          Google may process information outside your country. In particular, Firebase
          Authentication operates from data centres in the United States, while other Firebase
          services may use Google&apos;s global infrastructure. See Google&apos;s{' '}
          <a
            href="https://firebase.google.com/support/privacy"
            className="text-primary underline-offset-4 hover:underline"
          >
            Firebase privacy information
          </a>{' '}
          and{' '}
          <a
            href="https://policies.google.com/privacy"
            className="text-primary underline-offset-4 hover:underline"
          >
            Google Privacy Policy
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: 'retention',
    title: 'Retention and Deletion',
    content: (
      <>
        <p>
          Account records are kept while your account remains open. Chat questions are processed to
          produce an answer and are not added to your Firestore records, although they may remain
          in limited technical or security logs.
        </p>
        <p>
          To delete your account and its associated data, email us from the address linked to the
          account with the subject &quot;Delete HomeoRemedica account.&quot; After verifying the request,
          we will delete the Firebase Authentication account and the HomeoRemedica account record.
          We generally complete valid requests within 30 days.
        </p>
        <p>
          We retain support messages and limited technical records only as long as reasonably
          needed for support, security, legal compliance, or dispute resolution. Deletion from
          service-provider backups may take additional time.
        </p>
      </>
    ),
  },
  {
    id: 'choices',
    title: 'Your Choices and Rights',
    content: (
      <>
        <p>
          You may use the chat without an account. An account is required only for account-specific
          settings such as changing your password.
        </p>
        <p>
          You may ask to access, correct, or delete personal information we hold about you, or
          withdraw consent where processing relies on consent. Withdrawal may prevent us from
          providing the affected feature. Depending on where you live, you may have additional
          rights under applicable law. We may need to verify your identity before completing a
          request.
        </p>
      </>
    ),
  },
  {
    id: 'other-people',
    title: 'Information About Other People',
    content: (
      <p>
        Avoid entering another person&apos;s full name or other identifying details into chat
        questions. If you submit another person&apos;s information, you are responsible for having
        lawful authority to do so, informing them as required, and entering only what is
        necessary.
      </p>
    ),
  },
  {
    id: 'security',
    title: 'Security',
    content: (
      <p>
        We use production HTTPS connections, Firebase Authentication, and authenticated API
        endpoints to protect information. No system can guarantee absolute security, so please use
        a unique password and avoid placing unnecessary identifying information in chat questions.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to This Policy',
    content: (
      <p>
        We may update this policy when HomeoRemedica&apos;s data practices or legal obligations change.
        We will post the revised policy here and change the last-updated date. We will provide any
        additional notice required by law for material changes.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Privacy and Grievance Contact',
    content: (
      <>
        <p>
          HomeoRemedica operator and Grievance Officer: Rasagya Vatsal, India.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-primary underline-offset-4 hover:underline"
          >
            <Mail className="h-4 w-4" />
            Contact Page
          </Link>
          <a
            href="mailto:rasagyavatsal@outlook.com"
            className="inline-flex items-center gap-2 text-primary underline-offset-4 hover:underline"
          >
            <Mail className="h-4 w-4" />
            rasagyavatsal@outlook.com
          </a>
        </div>
      </>
    ),
  },
];

export function PrivacyClient() {
  return <LegalDocument title="Privacy Policy" lastUpdated={LAST_UPDATED} sections={sections} />;
}
