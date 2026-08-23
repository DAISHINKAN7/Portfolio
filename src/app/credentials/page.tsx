import type { Metadata } from 'next';
import Link from 'next/link';
import { additionalCredentials, credentials } from '@/content/site';
import { ArrowLink } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Credentials',
  description:
    'Certificates across AI/ML, MLOps and cloud, data engineering, and professional internship records — supporting validation for the project work.',
  alternates: { canonical: '/credentials' },
};

const GROUPS = ['AI & Machine Learning', 'MLOps & Cloud', 'Data Engineering', 'Professional Experience'] as const;

export default function CredentialsPage() {
  return (
    <div className="shell py-14 lg:py-20">
      <header className="mb-14 max-w-3xl">
        <p className="eyebrow">Credentials</p>
        <h1 className="display-xl mt-6">Supporting validation</h1>
        <p className="lede mt-7">
          Certificates are evidence that a syllabus was completed. The projects are evidence that something was built.
          These are listed second for that reason — but each one is here, verifiable, and openable.
        </p>
      </header>

      {GROUPS.map((g, gi) => {
        const items = credentials.filter((c) => c.group === g);
        if (!items.length) return null;
        return (
          <section key={g} className="border-t border-ink py-10">
            <div className="grid gap-x-14 gap-y-6 lg:grid-cols-[16rem_1fr]">
              <div>
                <span className="data text-label text-accent">{String(gi + 1).padStart(2, '0')}</span>
                <h2 className="display-m mt-3">{g}</h2>
                <p className="data mt-3 text-micro text-ink-3">{items.length} credentials</p>
              </div>

              <ul className="border-t border-rule">
                {items.map((c) => (
                  <li key={c.slug} className="border-b border-rule">
                    <Link href={`/credentials/${c.slug}`} className="group grid gap-x-8 gap-y-2 py-5 md:grid-cols-[1fr_7rem]">
                      <div>
                        <h3 className="display-s transition-colors duration-180 group-hover:text-accent">{c.title}</h3>
                        <p className="mt-1.5 text-micro text-ink-2">{c.issuer}</p>
                        {c.note && <p className="mt-2 max-w-measure text-[0.8125rem] leading-relaxed text-ink-3">{c.note}</p>}
                        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                          {c.skills.map((s) => (
                            <li key={s} className="data text-[0.7rem] uppercase tracking-[0.06em] text-ink-3">
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <p className="data text-micro text-ink-3 md:text-right">{c.date}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        );
      })}

      <section className="border-t border-rule py-8">
        <p className="eyebrow mb-4">Also completed</p>
        <ul className="space-y-2">
          {additionalCredentials.map((c) => (
            <li key={c.title} className="text-micro text-ink-2">
              {c.title} — {c.issuer}, {c.date}
              <span className="data ml-3 text-[0.7rem] uppercase tracking-[0.08em] text-ink-3">no certificate file held</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="rule-t pt-8">
        <ArrowLink href="/projects">The projects are the actual evidence</ArrowLink>
      </div>
    </div>
  );
}
