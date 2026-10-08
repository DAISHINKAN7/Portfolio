import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import type { Metric, Provenance } from '@/lib/types';
import { CountUp } from './motion/count-up';
import { ScrubText } from './motion/scrub-text';

/* ------------------------------------------------------------------ */
/* Provenance — the site's signature device.                           */
/* Every claim-bearing figure declares how strongly it is evidenced.   */
/* ------------------------------------------------------------------ */

const PROV_COPY: Record<Provenance, { short: string; title: string }> = {
  verified: {
    short: 'verified',
    title: 'Computed directly from committed artefacts in the repository.',
  },
  reported: {
    short: 'reported',
    title: 'Author-reported experimental result. Raw run artefacts are not committed, so it could not be independently re-derived.',
  },
  unmeasured: {
    short: 'unmeasured',
    title: 'Extraction volume or descriptive statistic. No accuracy or precision is claimed for this figure.',
  },
};

export function Prov({ level, className = '' }: { level: Provenance; className?: string }) {
  const c = PROV_COPY[level];
  return (
    <span className={`prov prov-${level} ${className}`} title={c.title}>
      {c.short}
    </span>
  );
}

export function ProvKey() {
  return (
    <div className="rule-t pt-5">
      <p className="eyebrow mb-3">How to read the figures on this site</p>
      <dl className="grid gap-3 sm:grid-cols-3">
        {(Object.keys(PROV_COPY) as Provenance[]).map((k) => (
          <div key={k} className="flex flex-col gap-1.5">
            <dt>
              <Prov level={k} />
            </dt>
            <dd className="text-micro text-ink-2 leading-relaxed">{PROV_COPY[k].title}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Structure                                                           */
/* ------------------------------------------------------------------ */

export function SectionHead({
  index,
  eyebrow,
  title,
  intro,
  right,
}: {
  index?: string;
  eyebrow?: string;
  title: string;
  intro?: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="relative mb-10 pt-6" data-reveal="group">
      <span className="reveal-rule" aria-hidden />
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
        <div className="flex items-baseline gap-4">
          {index && (
            <span className="data text-label text-accent" data-r style={{ ['--rd' as string]: 0 }}>
              {index}
            </span>
          )}
          {eyebrow && (
            <span className="eyebrow" data-r style={{ ['--rd' as string]: 1 }}>
              {eyebrow}
            </span>
          )}
        </div>
        {right && (
          <div data-r style={{ ['--rd' as string]: 3 }}>
            {right}
          </div>
        )}
      </div>
      <h2 className="display-l mt-5 max-w-3xl" data-r="title" style={{ ['--rd' as string]: 2 }}>
        {title}
      </h2>
      {intro && <ScrubText className="lede mt-4" text={intro} />}
    </header>
  );
}

export function Rule({ className = '' }: { className?: string }) {
  return <hr className={`border-0 border-t border-rule ${className}`} />;
}

/* ------------------------------------------------------------------ */
/* Data display                                                        */
/* ------------------------------------------------------------------ */

export function MetricStrip({ items, cols = 4 }: { items: Metric[]; cols?: number }) {
  const grid =
    cols === 5
      ? 'sm:grid-cols-2 lg:grid-cols-5'
      : cols === 3
        ? 'sm:grid-cols-3'
        : 'sm:grid-cols-2 lg:grid-cols-4';
  return (
    <dl className={`grid ${grid} border-t border-rule`} data-reveal="group">
      {items.map((m, i) => (
        <div
          key={m.label}
          data-r
          style={{ ['--rd' as string]: i }}
          className="border-b border-rule px-0 py-5 sm:border-r sm:px-5 sm:first:pl-0 last:sm:border-r-0"
        >
          <dd
            className={`data text-2xl leading-none tracking-tight lg:text-[1.75rem] ${
              m.tone === 'caution' ? 'text-caution' : 'text-ink'
            }`}
          >
            <CountUp value={m.value} />
          </dd>
          <dt className="mt-2.5 text-micro leading-snug text-ink-2">{m.label}</dt>
          {m.note && <p className="mt-1.5 text-[0.7rem] leading-snug text-ink-3">{m.note}</p>}
          {m.prov && (
            <div className="mt-2.5">
              <Prov level={m.prov} />
            </div>
          )}
        </div>
      ))}
    </dl>
  );
}

export function DataTable({
  head,
  rows,
  caption,
  num = [],
  emphasis = [],
  prov,
}: {
  head: string[];
  rows: string[][];
  caption?: string;
  num?: number[];
  emphasis?: number[];
  prov?: Provenance;
}) {
  return (
    <figure className="my-8">
      {(caption || prov) && (
        <figcaption className="mb-3 flex flex-wrap items-center justify-between gap-3">
          {caption && <span className="text-micro text-ink-2">{caption}</span>}
          {prov && <Prov level={prov} />}
        </figcaption>
      )}
      <div className="scroll-x">
        <table className="tbl min-w-[36rem]">
          <thead>
            <tr>
              {head.map((h, i) => (
                <th key={i} className={num.includes(i) ? 'num' : ''} scope="col">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri} className={emphasis.includes(ri) ? 'bg-accent-soft/40' : ''}>
                {r.map((c, ci) => (
                  <td
                    key={ci}
                    className={`${num.includes(ci) ? 'num' : ''} ${
                      ci === 0 && emphasis.includes(ri) ? 'text-ink font-medium' : ''
                    }`}
                  >
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

export function Callout({
  tone,
  title,
  children,
}: {
  tone: 'insight' | 'caution' | 'note';
  title: string;
  children: React.ReactNode;
}) {
  const styles = {
    insight: 'border-l-accent bg-accent-soft/45',
    caution: 'border-l-caution bg-caution-soft/50',
    note: 'border-l-rule-2 bg-paper-2/70',
  }[tone];
  const label = { insight: 'Finding', caution: 'Caveat', note: 'Note' }[tone];
  const labelColor = { insight: 'text-accent', caution: 'text-caution', note: 'text-ink-3' }[tone];
  return (
    <aside className={`my-8 border-y border-r border-rule border-l-2 ${styles} px-5 py-5 sm:px-6`}>
      <p className={`eyebrow ${labelColor} mb-2.5`}>{label}</p>
      <p className="display-s mb-2.5 max-w-2xl">{title}</p>
      <div className="text-[0.9375rem] leading-relaxed text-ink-2 max-w-measure">{children}</div>
    </aside>
  );
}

export function Figure({
  caption,
  prov,
  children,
  bleed = false,
}: {
  caption: string;
  prov?: Provenance;
  children: React.ReactNode;
  bleed?: boolean;
}) {
  return (
    <figure className={`my-10 ${bleed ? '' : ''}`}>
      <div className="border border-rule bg-surface p-3 sm:p-5">{children}</div>
      <figcaption className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <span className="text-micro leading-relaxed text-ink-2 max-w-measure">{caption}</span>
        {prov && <Prov level={prov} />}
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Links                                                               */
/* ------------------------------------------------------------------ */

export function ArrowLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const Icon = external ? ArrowUpRight : ArrowRight;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className="link-arrow">
        {children}
        <Icon size={14} strokeWidth={2} aria-hidden />
      </a>
    );
  }
  return (
    <Link href={href} className="link-arrow">
      {children}
      <Icon size={14} strokeWidth={2} aria-hidden />
    </Link>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="data border border-rule px-2 py-1 text-[0.6875rem] uppercase tracking-[0.08em] text-ink-2">
      {children}
    </span>
  );
}
