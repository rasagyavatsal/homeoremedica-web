"use client"

import { Mail } from 'lucide-react';
import Link from 'next/link';

import { LegalDocument } from '@/components/legal-document';

const LAST_UPDATED = 'July 19, 2026';

const sections = [
  {
    id: 'agreement',
    title: 'Agreement and Scope',
    content: (
      <>
        <p>
          These Terms and Conditions form an agreement between you and Rasagya Vatsal, the
          operator of HomeoRemedica in India. They apply to the HomeoRemedica website, server API,
          and Android app.
        </p>
        <p>
          By accessing or using HomeoRemedica, you agree to these terms. If you do not agree, do
          not use the service. If you use HomeoRemedica for an organisation, you confirm that you
          have authority to accept these terms for it.
        </p>
      </>
    ),
  },
  {
    id: 'eligibility',
    title: 'Eligibility and Accounts',
    content: (
      <>
        <p>
          You must be legally capable of agreeing to these terms. If you are not, a parent or legal
          guardian must review and accept them and supervise your use of HomeoRemedica.
        </p>
        <p>
          Remedy search does not require an account. If you create one, provide accurate
          information, keep your sign-in credentials secure, and do not share the account. You are
          responsible for activity performed through your account. Contact us promptly if you
          believe it has been accessed without permission.
        </p>
      </>
    ),
  },
  {
    id: 'medical',
    title: 'Reference Purpose and Medical Disclaimer',
    content: (
      <>
        <p>
          HomeoRemedica is an educational and reference tool. It is not a medical device and does
          not diagnose, treat, cure, or prevent any medical condition. It does not provide medical
          advice, a prescription, or emergency assistance.
        </p>
        <p>
          Results are automated text matches between the symptoms and classical materia medica
          source you select. They are not an individual assessment. A remedy&apos;s inclusion does not
          establish that it is safe, effective, appropriate, or scientifically validated for any
          person or condition.
        </p>
        <p>
          Consult a qualified healthcare professional for medical advice, diagnosis, or treatment.
          Do not disregard or delay professional care because of HomeoRemedica. In an emergency,
          contact your local emergency service immediately.
        </p>
      </>
    ),
  },
  {
    id: 'professional-use',
    title: 'Professional Use and Saved Cases',
    content: (
      <>
        <p>
          Practitioners remain responsible for their qualifications, independent professional
          judgment, patient consent, records, and compliance with applicable law. HomeoRemedica
          does not create a practitioner-patient relationship between us and any user or patient.
        </p>
        <p>
          You retain any rights you have in case names, notes, symptoms, and other information you
          submit. You give us a limited permission to host, process, transmit, and display that
          information only as needed to operate the service for you.
        </p>
        <p>
          Submit another person&apos;s information only when you have lawful authority to do so. Avoid
          unnecessary identifying details. Do not use HomeoRemedica as the sole repository for any
          record you are legally or professionally required to retain.
        </p>
      </>
    ),
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable Use',
    content: (
      <>
        <p>You may use HomeoRemedica only lawfully and in accordance with these terms. You must not:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Access another person&apos;s account or data without permission.</li>
          <li>Introduce malicious code or interfere with the service or its security.</li>
          <li>Use automated requests, scraping, or similar methods to bulk-extract the database.</li>
          <li>Bypass access controls, rate limits, or other technical restrictions.</li>
          <li>Reverse engineer the service except where applicable law expressly permits it.</li>
          <li>Use HomeoRemedica to mislead, harm, or unlawfully discriminate against another person.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual Property',
    content: (
      <>
        <p>
          The HomeoRemedica name, branding, interface, software, and compilation of its database
          are owned by us or used with permission and are protected to the extent provided by law.
          We give you a limited, revocable, non-exclusive, non-transferable right to use the
          service for lawful personal, educational, or professional reference.
        </p>
        <p>
          Classical source texts and third-party names remain subject to their own rights and legal
          status. These terms do not transfer ownership of HomeoRemedica or its content to you.
        </p>
      </>
    ),
  },
  {
    id: 'third-parties',
    title: 'Third-Party Services',
    content: (
      <p>
        HomeoRemedica relies on services such as Firebase, Google Sign-In, hosting providers, and
        the app store. Your use of those services may also be governed by their terms. We are not
        responsible for third-party services that we do not control, subject to rights that cannot
        be excluded under applicable law.
      </p>
    ),
  },
  {
    id: 'availability',
    title: 'Availability and Termination',
    content: (
      <>
        <p>
          We may maintain, update, add, remove, suspend, or discontinue features. We do not
          guarantee that the service or any particular source, search result, or saved-case feature
          will always be available or free from errors.
        </p>
        <p>
          We may restrict or suspend access when reasonably necessary to address a breach of these
          terms, security risk, abuse, or legal requirement. You may stop using HomeoRemedica at any
          time and may request account deletion as described in the Privacy Policy.
        </p>
      </>
    ),
  },
  {
    id: 'liability',
    title: 'Disclaimers and Liability',
    content: (
      <>
        <p>
          To the extent permitted by law, HomeoRemedica is provided &quot;as is&quot; and &quot;as available.&quot;
          We do not warrant that its content or results are accurate, complete, current, suitable
          for a particular purpose, or continuously available.
        </p>
        <p>
          To the extent permitted by law, we are not liable for indirect, incidental, special, or
          consequential loss, loss of data or opportunity, or harm resulting from reliance on
          HomeoRemedica&apos;s reference results. Nothing in these terms excludes liability or consumer
          rights that cannot lawfully be excluded or limited.
        </p>
      </>
    ),
  },
  {
    id: 'law',
    title: 'Governing Law and Disputes',
    content: (
      <p>
        These terms are governed by the laws of India, without limiting mandatory rights you may
        have under the law where you live. Please contact us first so we can try to resolve a
        dispute. Any unresolved dispute is subject to the jurisdiction of a court of competent
        jurisdiction in India.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to These Terms',
    content: (
      <p>
        We may update these terms when the service or applicable requirements change. We will post
        the revised terms here, change the last-updated date, and provide any additional notice
        required by law. Your continued use after revised terms take effect means you accept them
        where permitted by law.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Privacy and Contact',
    content: (
      <>
        <p>
          Our{' '}
          <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">
            Privacy Policy
          </Link>{' '}
          explains how we handle personal information and how to request account deletion.
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

export function TermsClient() {
  return <LegalDocument title="Terms and Conditions" lastUpdated={LAST_UPDATED} sections={sections} />;
}
