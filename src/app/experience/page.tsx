import type { Metadata } from 'next';
import Link from 'next/link';
import { education, experience, profile } from '@/content/site';
import { ArrowLink } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Experience',
  description:
    'AI/ML engineering roles at Dassault Systèmes, Carico Systems and Suvidha Foundation — knowledge graphs, LLM query agents, and retrieval over structured company data.',
  alternates: { canonical: '/experience' },
};

export default function ExperiencePage() {
  return (
    <div className="shell py-14 lg:py-20">
      <header className="mb-14 max-w-3xl">
        <p className="eyebrow">Experience</p>
        <h1 className="display-xl mt-6">Where the work has been applied</h1>
        <p className="lede mt-7">
          Three engineering roles, described at the level of the capability rather than the client. Employer-confidential
          material — proprietary source, internal systems, customer data and business metrics — is deliberately not
          reproduced here.
        </p>
      </header>

      <ol>
        {experience.map((r, i) => (
          <li key={r.slug} id={r.slug} className="scroll-mt-28 border-t border-ink py-12">
            <div className="grid gap-x-14 gap-y-8 lg:grid-cols-[16rem_1fr]">
              <div>
                <div className="flex items-baseline gap-4">
                  <span className="data text-label text-accent">{String(i + 1).padStart(2, '0')}</span>
                  {r.current && <span className="prov prov-verified">current</span>}
                </div>
                <h2 className="display-m mt-4">{r.org}</h2>
                <p className="mt-2 text-[0.9375rem] text-ink-2">{r.title}</p>
                <p className="data mt-3 text-micro text-ink-3">{r.period}</p>
                <p className="data text-micro text-ink-3">{r.place}</p>
                <p className="eyebrow mt-5">{r.domain}</p>
              </div>

              <div>
                <p className="body">{r.summary}</p>

                <div className="mt-9">
                  <p className="eyebrow mb-4">Selected contributions</p>
                  <ul className="max-w-measure space-y-3.5">
                    {r.contributions.map((c, ci) => (
                      <li key={ci} className="flex gap-4 text-[0.9375rem] leading-relaxed text-ink-2">
                        <span className="mt-2 h-px w-4 shrink-0 bg-rule-2" aria-hidden />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {r.capabilities.length > 0 && (
                  <div className="mt-9 border-t border-rule pt-6">
                    <p className="eyebrow mb-4">Transferable engineering capability</p>
                    <ul className="max-w-measure space-y-2.5">
                      {r.capabilities.map((c) => (
                        <li key={c} className="text-[0.9375rem] leading-relaxed text-ink-2">
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
                  {r.tech.map((t) => (
                    <li key={t} className="data text-[0.7rem] uppercase tracking-[0.08em] text-ink-3">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <section className="border-t border-ink py-12">
        <div className="grid gap-x-14 gap-y-8 lg:grid-cols-[16rem_1fr]">
          <h2 className="display-m">Education</h2>
          <dl className="border-t border-rule">
            {education.map((e) => (
              <div key={e.degree} className="grid gap-x-10 gap-y-2 border-b border-rule py-6 md:grid-cols-[1fr_11rem]">
                <div>
                  <dt className="display-s">{e.degree}</dt>
                  <dd className="mt-1.5 text-[0.9375rem] text-ink-2">{e.org}</dd>
                  <dd className="data mt-2 text-micro text-ink-3">{e.detail}</dd>
                </div>
                <dd className="data text-micro text-ink-3 md:text-right">
                  {e.period}
                  <span className="block">{e.place}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="rule-t flex flex-wrap gap-x-10 gap-y-3 pt-8">
        <ArrowLink href="/projects">See the projects behind these skills</ArrowLink>
        <ArrowLink href="/resume">Resume</ArrowLink>
        <ArrowLink href={profile.github} external>
          GitHub
        </ArrowLink>
      </div>
    </div>
  );
}
