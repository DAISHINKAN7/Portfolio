import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Project } from '@/lib/types';
import { Diagram } from './blocks';
import { ArrowLink, Prov } from './ui';

const STATUS: Record<Project['statusTone'], string> = {
  live: 'border-accent/40 bg-accent-soft text-accent',
  benchmark: 'border-rule-2 bg-paper-2 text-ink-2',
  prototype: 'border-caution/30 bg-caution-soft text-caution',
};

/** Homepage editorial feature. Alternates side so the run doesn't read as a grid. */
export function FeaturedProject({ project: p, index, flip }: { project: Project; index: number; flip: boolean }) {
  return (
    <article className="rule-t py-14 lg:py-20">
      <div className={`grid gap-10 lg:grid-cols-2 lg:gap-16 ${flip ? '' : ''}`}>
        <div className={flip ? 'lg:order-2' : ''}>
          <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
            <span className="data text-label text-accent">{String(index + 1).padStart(2, '0')}</span>
            <span className="eyebrow">{p.domainLine}</span>
          </div>
          <h3 className="display-l mt-5">
            <Link href={`/projects/${p.slug}`} className="transition-colors duration-180 hover:text-accent">
              {p.name}
            </Link>
          </h3>
          <p className="mt-3 text-[1.0625rem] leading-relaxed text-ink">{p.hook}</p>
          <p className="mt-4 max-w-measure text-[0.9375rem] leading-relaxed text-ink-2">{p.summary}</p>

          <div className="mt-7 border-t border-rule pt-5">
            <p className="eyebrow mb-3">Strongest result</p>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <span className={`data text-3xl ${p.headline.tone === 'caution' ? 'text-caution' : 'text-ink'}`}>
                {p.headline.value}
              </span>
              {p.headline.prov && <Prov level={p.headline.prov} />}
            </div>
            <p className="mt-2 max-w-md text-micro leading-relaxed text-ink-2">{p.headline.label}</p>
            {p.headline.note && <p className="mt-1 max-w-md text-[0.7rem] text-ink-3">{p.headline.note}</p>}
          </div>

          <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2">
            {p.tech.slice(0, 6).map((t) => (
              <li key={t} className="data text-[0.7rem] uppercase tracking-[0.08em] text-ink-3">
                {t}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
            <ArrowLink href={`/projects/${p.slug}`}>Read the case study</ArrowLink>
            {p.demo && (
              <ArrowLink href={p.demo} external>
                Live demo
              </ArrowLink>
            )}
            <ArrowLink href={p.repo} external>
              Repository
            </ArrowLink>
          </div>
        </div>

        <div className={flip ? 'lg:order-1' : ''}>
          <Link
            href={`/projects/${p.slug}`}
            className="block border border-rule bg-surface p-4 transition-colors duration-180 hover:border-rule-2"
            aria-label={`Open the ${p.name} case study`}
          >
            <Diagram id={p.heroDiagram} />
          </Link>
        </div>
      </div>
    </article>
  );
}

/** Index-page row. Denser than the homepage feature, still not a card grid. */
export function ProjectRow({ project: p, index }: { project: Project; index: number }) {
  return (
    <article className="group border-b border-rule">
      <Link href={`/projects/${p.slug}`} className="block py-9 transition-colors duration-180">
        <div className="grid gap-6 lg:grid-cols-[4rem_1fr_20rem] lg:gap-10">
          <span className="data text-label pt-2 text-accent">{String(index + 1).padStart(2, '0')}</span>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="display-m transition-colors duration-180 group-hover:text-accent">{p.name}</h3>
              <span className={`prov ${STATUS[p.statusTone]}`}>{p.statusTone === 'live' ? 'live demo' : p.statusTone}</span>
            </div>
            <p className="mt-1.5 eyebrow">{p.domainLine}</p>
            <p className="mt-4 max-w-measure text-[0.9375rem] leading-relaxed text-ink-2">{p.summary}</p>
            <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
              {p.tech.slice(0, 7).map((t) => (
                <li key={t} className="data text-[0.7rem] uppercase tracking-[0.08em] text-ink-3">
                  {t}
                </li>
              ))}
            </ul>
            <span className="link-arrow mt-6 inline-flex">
              Read the case study <ArrowUpRight size={14} aria-hidden />
            </span>
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 self-start border-t border-rule pt-4 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            {p.cardMetrics.slice(0, 4).map((m) => (
              <div key={m.label}>
                <dd className={`data text-lg leading-none ${m.tone === 'caution' ? 'text-caution' : 'text-ink'}`}>
                  {m.value}
                </dd>
                <dt className="mt-1.5 text-[0.7rem] leading-snug text-ink-3">{m.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </Link>
    </article>
  );
}

export { STATUS };
