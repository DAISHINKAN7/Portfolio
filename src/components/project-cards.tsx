import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Project } from '@/lib/types';
import { Diagram } from './blocks';
import { ArrowLink, Prov } from './ui';
import { CountUp } from './motion/count-up';
import { ScrubText } from './motion/scrub-text';
import { ProjectTrace } from './viz/project-trace';

const STATUS: Record<Project['statusTone'], string> = {
  live: 'border-accent/40 bg-accent-soft text-accent',
  benchmark: 'border-rule-2 bg-paper-2 text-ink-2',
  prototype: 'border-caution/30 bg-caution-soft text-caution',
};

/** Homepage editorial feature. Alternates side so the run doesn't read as a grid. */
export function FeaturedProject({ project: p, index, flip }: { project: Project; index: number; flip: boolean }) {
  return (
    <article className="relative isolate py-14 lg:py-20" data-vt-scope={p.slug} data-reveal="group" data-scroll>
      <span className="reveal-rule" aria-hidden />
      <span className={`feature-index ${flip ? 'feature-index-flip' : ''}`} aria-hidden>
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className={`min-w-0 ${flip ? 'lg:order-2' : ''}`}>
          <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2" data-r>
            <span className="data text-label text-accent">{String(index + 1).padStart(2, '0')}</span>
            <span className="eyebrow">{p.domainLine}</span>
          </div>
          <h3 className="display-l mt-5" data-r="title" style={{ ['--rd' as string]: 1 }}>
            <Link href={`/projects/${p.slug}`} className="transition-colors duration-180 hover:text-accent" data-vt="vt-title">
              {p.name}
            </Link>
          </h3>
          <ScrubText className="mt-3 text-[1.0625rem] leading-relaxed text-ink" text={p.hook} />
          <p className="mt-4 max-w-measure text-[0.9375rem] leading-relaxed text-ink-2" data-r style={{ ['--rd' as string]: 3 }}>
            {p.summary}
          </p>

          <div className="mt-7 border-t border-rule pt-5" data-r style={{ ['--rd' as string]: 4 }}>
            <p className="eyebrow mb-3">Strongest result</p>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <span className={`data text-3xl ${p.headline.tone === 'caution' ? 'text-caution' : 'text-ink'}`}>
                <CountUp value={p.headline.value} />
              </span>
              {p.headline.prov && <Prov level={p.headline.prov} />}
            </div>
            <p className="mt-2 max-w-md text-micro leading-relaxed text-ink-2">{p.headline.label}</p>
            {p.headline.note && <p className="mt-1 max-w-md text-[0.7rem] text-ink-3">{p.headline.note}</p>}
          </div>

          <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2" data-r style={{ ['--rd' as string]: 5 }}>
            {p.tech.slice(0, 6).map((t) => (
              <li key={t} className="data text-[0.7rem] uppercase tracking-[0.08em] text-ink-3">
                {t}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3" data-r style={{ ['--rd' as string]: 6 }}>
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

        <div className={`flex min-w-0 flex-col gap-6 ${flip ? 'lg:order-1' : ''}`}>
          <div data-scroll data-sheet>
            <Link
              href={`/projects/${p.slug}`}
              className="block border border-rule bg-surface p-4 transition-colors duration-180 hover:border-rule-2"
              aria-label={`Open the ${p.name} case study`}
              data-tilt="3.5"
              data-cursor="open"
              data-cursor-label="case study"
              data-vt="vt-fig"
            >
              <div data-depth>
                <Diagram id={p.heroDiagram} />
              </div>
            </Link>
          </div>
          <ProjectTrace slug={p.slug} />
        </div>
      </div>
    </article>
  );
}

/** Index-page row. Denser than the homepage feature, still not a card grid. */
export function ProjectRow({ project: p, index }: { project: Project; index: number }) {
  return (
    <article className="group row-hover border-b border-rule" data-vt-scope={p.slug} data-reveal style={{ ['--rd' as string]: index % 3 }}>
      <Link href={`/projects/${p.slug}`} className="block py-9 transition-colors duration-180" data-cursor="open" data-cursor-label="case study">
        <div className="grid gap-6 lg:grid-cols-[4rem_1fr_20rem] lg:gap-10">
          <span className="data text-label pt-2 text-accent">{String(index + 1).padStart(2, '0')}</span>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="display-m transition-colors duration-180 group-hover:text-accent" data-vt="vt-title">
                {p.name}
              </h3>
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
