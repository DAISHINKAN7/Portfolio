import type { Metadata } from 'next';
import Link from 'next/link';
import { publications } from '@/content/site';
import { getProject } from '@/content/projects';
import { ArrowLink, Prov } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Research',
  description:
    'Two peer-reviewed publications and three research-grade projects with statistical evaluation protocols, published negative results and stated claim boundaries.',
  alternates: { canonical: '/research' },
};

const RESEARCH_PROJECTS = [
  {
    slug: 'radio-optical-classification',
    question: 'Can six astrophysical morphology classes be separated from paired radio and optical imagery — and what is an inductive bias worth at small data scale?',
    method:
      'A 6,010-pair dataset constructed from SDSS, VizieR, LOFAR and Legacy Survey APIs; four backbones re-stemmed for 2-channel input with pretrained weight transfer; a confidence-weighted soft-voting ensemble.',
    protocol:
      '10 seeded runs per model, 95% confidence intervals from Student\u2019s t at df = 9, pairwise independent t-tests with significance annotation, and one-way ANOVA across all models.',
    finding:
      'ConvNeXt-Tiny beats a from-scratch ViT by 11.2 percentage points — a clean empirical measurement of what locality and translation equivariance are worth when only ~4,800 training images exist.',
    boundary:
      'The multi-run evaluator re-seeds the train/val split each run, so runs 2–10 evaluate partly on data the checkpoint trained on. The figures are optimistic and the confidence intervals measure split variance, not pure generalisation.',
    prov: 'reported' as const,
  },
  {
    slug: 'eco-rewind',
    question: 'What would a coastal wetland have looked like if the hurricane had never happened — and can a learned counterfactual be trusted to answer that?',
    method:
      'Five spatiotemporal architectures built from scratch and trained on 32 quarterly Sentinel-1/2 composites under a composite domain-constrained loss, then rolled forward autoregressively past the event with MC Dropout and a seasonal climatology floor.',
    protocol:
      'Per-band R² on held-out patches with per-band validity masking and single-pass Welford accumulation; attribution recomputed independently under each backbone.',
    finding:
      'The headline result is negative. Carbon-loss attribution varies 20.5× across backbones on identical inputs, so no single damage figure from this class of method should be quoted as a real-world estimate. Separately, validation loss proved unusable as a model-selection signal — two diverged models sat within 7% of the winner\u2019s loss.',
    boundary:
      'The counterfactual is never validated. No placebo test exists, the validation split has spatial leakage, and MC-Dropout intervals are uncalibrated. Every damage figure is an unvalidated model output.',
    prov: 'verified' as const,
  },
  {
    slug: 'ssa-intel',
    question: 'Can a domain NER system be trained for space situational awareness when no annotated corpus, label schema or gazetteer exists?',
    method:
      'An original 8-class ontology with 17 BIO labels, 156 hand annotations scaled via weak supervision and offset-safe entity-swap augmentation, then two-stage fine-tuning that strips gazetteer bias back out on gold-only records.',
    protocol:
      'seqeval entity-level scoring, bootstrap 95% confidence intervals over 1,000 resamples, McNemar\u2019s test between model pairs, plus a held-out hand-written probe set and span-boundary tests.',
    finding:
      'RoBERTa-base reaches 0.9055 F1 and leads SciBERT — but the bootstrap intervals overlap, so the lead is not statistically separated. DeBERTa-v3 scored exactly zero due to SentencePiece offset misalignment, and is published rather than deleted.',
    boundary:
      'The test split is drawn from the silver-augmented pool, so the F1 partly measures gazetteer agreement rather than human judgement. Relation extraction is rule-based and entirely unmeasured — 189,552 is extraction volume, not verified facts.',
    prov: 'reported' as const,
  },
];

export default function ResearchPage() {
  return (
    <div className="shell py-14 lg:py-20">
      <header className="mb-14 max-w-3xl">
        <p className="eyebrow">Research</p>
        <h1 className="display-xl mt-6">Questions, protocols, claim boundaries</h1>
        <p className="lede mt-7">
          Three of the five projects were built to research standards rather than product standards: a stated question,
          a pre-committed evaluation protocol, and an explicit boundary on what the result does and does not support.
          Two of them produced negative findings, which are reported here at the same weight as the positive ones.
        </p>
      </header>

      <section className="border-t border-ink pt-8">
        <h2 className="eyebrow mb-8">Peer-reviewed publications</h2>
        <ol className="border-t border-rule">
          {publications.map((p, i) => (
            <li key={p.title} className="grid gap-x-10 gap-y-3 border-b border-rule py-7 md:grid-cols-[9rem_1fr]">
              <div>
                <span className="data text-label text-accent">{String(i + 1).padStart(2, '0')}</span>
                <p className="data mt-3 text-micro text-ink-2">{p.date}</p>
                <p className="eyebrow mt-1.5">{p.venue}</p>
              </div>
              <div>
                <h3 className="display-s max-w-2xl">{p.title}</h3>
                <p className="mt-2.5 max-w-measure text-[0.9375rem] leading-relaxed text-ink-2">{p.note}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-5 max-w-measure text-micro leading-relaxed text-ink-3">
          Publisher links are not reproduced here. The venues and dates above are as listed on the resume.
        </p>
      </section>

      <section className="mt-20">
        <h2 className="eyebrow mb-10">Research-grade projects</h2>
        {RESEARCH_PROJECTS.map((r, i) => {
          const p = getProject(r.slug)!;
          return (
            <article key={r.slug} className="border-t border-ink py-12">
              <div className="grid gap-x-14 gap-y-8 lg:grid-cols-[16rem_1fr]">
                <div>
                  <span className="data text-label text-accent">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="display-m mt-4">
                    <Link href={`/projects/${p.slug}`} className="transition-colors duration-180 hover:text-accent">
                      {p.name}
                    </Link>
                  </h3>
                  <p className="mt-2 eyebrow">{p.domainLine}</p>
                  <p className="data mt-4 text-micro text-ink-3">{p.period}</p>
                  <div className="mt-5">
                    <Prov level={r.prov} />
                  </div>
                </div>

                <dl className="border-t border-rule">
                  {[
                    ['Question', r.question],
                    ['Method', r.method],
                    ['Evaluation protocol', r.protocol],
                    ['Finding', r.finding],
                  ].map(([k, v]) => (
                    <div key={k} className="grid gap-x-10 gap-y-1.5 border-b border-rule py-5 md:grid-cols-[10rem_1fr]">
                      <dt className="eyebrow pt-1">{k}</dt>
                      <dd className="max-w-measure text-[0.9375rem] leading-relaxed text-ink-2">{v}</dd>
                    </div>
                  ))}
                  <div className="grid gap-x-10 gap-y-1.5 border-b border-caution/30 bg-caution-soft/40 py-5 md:grid-cols-[10rem_1fr]">
                    <dt className="eyebrow pt-1 text-caution">Claim boundary</dt>
                    <dd className="max-w-measure text-[0.9375rem] leading-relaxed text-ink-2">{r.boundary}</dd>
                  </div>
                </dl>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
                <ArrowLink href={`/projects/${p.slug}`}>Full case study</ArrowLink>
                <ArrowLink href={p.repo} external>
                  Repository
                </ArrowLink>
                {p.demo && (
                  <ArrowLink href={p.demo} external>
                    Live demo
                  </ArrowLink>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
