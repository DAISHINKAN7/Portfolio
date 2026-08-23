import * as React from 'react';
import type { Block } from '@/lib/types';
import { Chart } from './chart';
import { Callout, DataTable, Figure, MetricStrip, Prov } from './ui';

import { AstroguardPipeline, AstroguardSwarm } from './diagrams/astroguard';
import { RadioArchitectures, RadioPipeline, RadioPreprocessing } from './diagrams/radio';
import { BetaDecision, BetaLayers } from './diagrams/beta';
import { EcoArchitectures, EcoConcept, EcoPipeline } from './diagrams/eco';
import { SsaFunnel, SsaLayers, SsaNer } from './diagrams/ssa';

/* Diagrams are pure SVG and render on the server. */
const DIAGRAMS: Record<string, React.ComponentType> = {
  'astroguard-pipeline': AstroguardPipeline,
  'astroguard-swarm': AstroguardSwarm,
  'radio-pipeline': RadioPipeline,
  'radio-preprocessing': RadioPreprocessing,
  'radio-architectures': RadioArchitectures,
  'beta-layers': BetaLayers,
  'beta-decision': BetaDecision,
  'eco-concept': EcoConcept,
  'eco-pipeline': EcoPipeline,
  'eco-architectures': EcoArchitectures,
  'ssa-ner': SsaNer,
  'ssa-funnel': SsaFunnel,
  'ssa-layers': SsaLayers,
};

export function Diagram({ id }: { id: string }) {
  const D = DIAGRAMS[id];
  return D ? <D /> : null;
}

const SEVERITY: Record<string, { label: string; cls: string }> = {
  critical: { label: 'critical', cls: 'text-caution border-caution/40 bg-caution-soft' },
  high: { label: 'high', cls: 'text-caution border-caution/25 bg-caution-soft/50' },
  medium: { label: 'medium', cls: 'text-ink-2 border-rule-2 bg-paper-2' },
  low: { label: 'low', cls: 'text-ink-3 border-rule bg-transparent' },
};

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => (
        <BlockView key={i} block={b} />
      ))}
    </>
  );
}

function BlockView({ block: b }: { block: Block }) {
  switch (b.type) {
    case 'lede':
      return <p className="lede my-6 text-ink">{b.text}</p>;

    case 'prose':
      return (
        <div className="my-6">
          {b.text.map((t, i) => (
            <p key={i} className="body">
              {t}
            </p>
          ))}
        </div>
      );

    case 'quote':
      return (
        <blockquote className="my-10 border-l-2 border-accent pl-6 sm:pl-8">
          <p className="display-m max-w-3xl text-ink">{b.text}</p>
          {b.source && <cite className="eyebrow mt-4 block not-italic">{b.source}</cite>}
        </blockquote>
      );

    case 'callout':
      return (
        <Callout tone={b.tone} title={b.title}>
          {b.body}
        </Callout>
      );

    case 'metrics':
      return (
        <div className="my-9">
          <MetricStrip items={b.items} cols={b.cols ?? 4} />
        </div>
      );

    case 'table':
      return (
        <DataTable
          head={b.head}
          rows={b.rows}
          caption={b.caption}
          num={b.num}
          emphasis={b.emphasis}
          prov={b.prov}
        />
      );

    case 'list':
      return (
        <div className="my-7">
          {b.title && <p className="eyebrow mb-4">{b.title}</p>}
          <ol className="max-w-measure space-y-3">
            {b.items.map((it, i) => (
              <li key={i} className="flex gap-4 text-[0.9375rem] leading-relaxed text-ink-2">
                <span className="data mt-0.5 shrink-0 text-micro text-accent">
                  {b.ordered ? String(i + 1).padStart(2, '0') : '—'}
                </span>
                <span>{it}</span>
              </li>
            ))}
          </ol>
        </div>
      );

    case 'steps':
      return (
        <ol className="my-9 border-t border-rule">
          {b.items.map((s) => (
            <li key={s.n} className="grid gap-x-8 gap-y-2 border-b border-rule py-6 md:grid-cols-[5rem_1fr]">
              <span className="data text-label pt-1 text-accent">{s.n}</span>
              <div>
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h4 className="display-s">{s.title}</h4>
                  {s.meta && <span className="data text-[0.7rem] text-ink-3">{s.meta}</span>}
                </div>
                <p className="mt-2.5 max-w-measure text-[0.9375rem] leading-relaxed text-ink-2">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      );

    case 'definitions':
      return (
        <dl className="my-9 border-t border-rule">
          {b.items.map((d) => (
            <div key={d.term} className="grid gap-x-8 gap-y-2 border-b border-rule py-6 md:grid-cols-[16rem_1fr]">
              <dt className="display-s pt-0.5">{d.term}</dt>
              <dd className="max-w-measure text-[0.9375rem] leading-relaxed text-ink-2">{d.body}</dd>
            </div>
          ))}
        </dl>
      );

    case 'challenges':
      return (
        <div className="my-9 space-y-10">
          {b.items.map((c, i) => (
            <article key={c.title} className="border-t border-ink pt-6">
              <div className="flex items-baseline gap-4">
                <span className="data text-label text-accent">{String(i + 1).padStart(2, '0')}</span>
                <h4 className="display-m">{c.title}</h4>
              </div>
              <dl className="mt-6 grid gap-x-10 gap-y-6 md:grid-cols-2">
                {[
                  ['Problem', c.problem],
                  ['Why it was difficult', c.difficulty],
                  ['Approach', c.approach],
                  ['Outcome', c.outcome],
                ].map(([k, v]) => (
                  <div key={k} className="border-t border-rule pt-4">
                    <dt className="eyebrow mb-2.5">{k}</dt>
                    <dd className="text-[0.9375rem] leading-relaxed text-ink-2">{v}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      );

    case 'limitations':
      return (
        <ul className="my-9 border-t border-rule">
          {b.items.map((l) => {
            const s = SEVERITY[l.severity];
            return (
              <li key={l.title} className="grid gap-x-8 gap-y-3 border-b border-rule py-6 md:grid-cols-[7rem_1fr]">
                <div>
                  <span className={`prov ${s.cls}`}>{s.label}</span>
                </div>
                <div>
                  <h4 className="display-s">{l.title}</h4>
                  <p className="mt-2.5 max-w-measure text-[0.9375rem] leading-relaxed text-ink-2">{l.detail}</p>
                  <p className="mt-3 max-w-measure text-[0.875rem] leading-relaxed text-ink-3">
                    <span className="data text-[0.7rem] uppercase tracking-[0.1em] text-accent">Fix — </span>
                    {l.fix}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      );

    case 'code':
      return (
        <figure className="my-9">
          <div className="flex flex-wrap items-center justify-between gap-2 border border-b-0 border-rule bg-paper-2 px-4 py-2.5">
            <span className="data text-[0.7rem] text-ink-2">{b.file}</span>
            <span className="data text-[0.65rem] uppercase tracking-[0.12em] text-ink-3">{b.lang}</span>
          </div>
          <pre className="scroll-x border border-rule bg-surface px-4 py-4 text-[0.8125rem] leading-relaxed">
            <code className="data text-ink">{b.code}</code>
          </pre>
          <figcaption className="mt-3 max-w-measure text-micro leading-relaxed text-ink-2">
            <span className="data text-[0.65rem] uppercase tracking-[0.12em] text-accent">Why this matters — </span>
            {b.why}
          </figcaption>
        </figure>
      );

    case 'diagram':
      return (
        <Figure caption={b.caption} prov={b.prov}>
          <Diagram id={b.id} />
        </Figure>
      );

    case 'chart':
      return (
        <Figure caption={b.caption} prov={b.prov}>
          <Chart id={b.id} />
        </Figure>
      );

    default:
      return null;
  }
}

export { Prov };
