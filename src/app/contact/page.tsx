import type { Metadata } from 'next';
import Link from 'next/link';
import { profile } from '@/content/site';
import { EmailButton } from '@/components/email-button';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Get in touch with ${profile.name} — email, GitHub and resume.`,
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  const channels = [
    { label: 'Email', value: profile.email, href: `mailto:${profile.email}`, note: 'The fastest way to reach me.' },
    { label: 'Phone', value: profile.phone, href: `tel:${profile.phone.replace(/\s/g, '')}`, note: 'India, IST.' },
    { label: 'GitHub', value: profile.githubHandle, href: profile.github, note: 'Source for all five projects.', external: true },
    ...(profile.linkedin
      ? [{ label: 'LinkedIn', value: 'Profile', href: profile.linkedin, note: 'Professional history.', external: true }]
      : []),
  ];

  return (
    <div className="shell py-14 lg:py-24">
      <header className="mb-14 max-w-3xl">
        <p className="eyebrow">Contact</p>
        <h1 className="display-xl mt-6">Get in touch</h1>
        <p className="lede mt-7">
          I&apos;m open to AI/ML engineering roles and to conversations about retrieval systems, multimodal models and
          evaluation design. If you&apos;ve read one of the case studies and want to dig into a decision I made, that&apos;s
          a good email to send.
        </p>
      </header>

      <dl className="border-t border-ink">
        {channels.map((c) => (
          <div key={c.label} className="grid gap-x-10 gap-y-2 border-b border-rule py-6 md:grid-cols-[9rem_1fr_auto]">
            <dt className="eyebrow pt-2">{c.label}</dt>
            <dd>
              <a
                href={c.href}
                {...(c.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                className="display-s text-ink transition-colors duration-180 hover:text-accent"
              >
                {c.value}
              </a>
              <p className="mt-1.5 text-micro text-ink-3">{c.note}</p>
            </dd>
          </div>
        ))}
        <div className="grid gap-x-10 gap-y-2 border-b border-rule py-6 md:grid-cols-[9rem_1fr_auto]">
          <dt className="eyebrow pt-2">Resume</dt>
          <dd>
            <Link href="/resume" className="display-s text-ink transition-colors duration-180 hover:text-accent">
              View or download
            </Link>
            <p className="mt-1.5 text-micro text-ink-3">Two pages, PDF.</p>
          </dd>
        </div>
        <div className="grid gap-x-10 gap-y-2 border-b border-rule py-6 md:grid-cols-[9rem_1fr_auto]">
          <dt className="eyebrow pt-2">Located in</dt>
          <dd>
            <p className="display-s">{profile.location}</p>
            <p className="mt-1.5 text-micro text-ink-3">Open to relocation and remote.</p>
          </dd>
        </div>
      </dl>

      <div className="mt-12">
        <EmailButton email={profile.email} />
        <div className="mt-4">
          <Link href="/projects" className="btn btn-ghost">
            Browse the work
          </Link>
        </div>
      </div>
    </div>
  );
}
