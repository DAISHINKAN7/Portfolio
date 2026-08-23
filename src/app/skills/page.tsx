import type { Metadata } from 'next';
import Link from 'next/link';
import { skillGroups } from '@/content/site';
import { getProject } from '@/content/projects';

export const metadata: Metadata = {
  title: 'Skills',
  description:
    'Technical capabilities across agentic AI, deep learning, NLP, computer vision, quantitative ML, evaluation design and MLOps — each linked to the project that evidences it.',
  alternates: { canonical: '/skills' },
};

export default function SkillsPage() {
  return (
    <div className="shell py-14 lg:py-20">
      <header className="mb-14 max-w-3xl">
        <p className="eyebrow">Skills</p>
        <h1 className="display-xl mt-6">Not a list of tools</h1>
        <p className="lede mt-7">
          A technology on a portfolio should not say &ldquo;I know this.&rdquo; It should say &ldquo;here is where I
          used it.&rdquo; Every entry below links to the case study that demonstrates it. Where nothing links, nothing
          is claimed.
        </p>
      </header>

      <div className="border-t border-ink">
        {skillGroups.map((g, i) => (
          <section key={g.name} className="grid gap-x-14 gap-y-6 border-b border-rule py-10 lg:grid-cols-[18rem_1fr]">
            <div>
              <div className="flex items-baseline gap-4">
                <span className="data text-label text-accent">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h2 className="display-m mt-3">{g.name}</h2>
              <p className="mt-3 max-w-xs text-micro leading-relaxed text-ink-3">{g.blurb}</p>
            </div>

            <ul className="grid gap-x-10 gap-y-0 sm:grid-cols-2">
              {g.items.map((it) => (
                <li key={it.name} className="border-b border-rule py-3.5 last:border-b-0 sm:last:border-b">
                  <p className="text-[0.9375rem] leading-snug text-ink">{it.name}</p>
                  {it.evidence.length > 0 ? (
                    <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                      {it.evidence.map((s) => {
                        const p = getProject(s);
                        if (!p) return null;
                        return (
                          <Link
                            key={s}
                            href={`/projects/${s}`}
                            className="data text-[0.7rem] uppercase tracking-[0.06em] text-accent underline decoration-accent/30 underline-offset-4 transition-colors duration-180 hover:decoration-accent"
                          >
                            {p.name}
                          </Link>
                        );
                      })}
                    </p>
                  ) : (
                    <p className="mt-1.5 data text-[0.7rem] uppercase tracking-[0.06em] text-ink-3">
                      coursework · no project evidence
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
