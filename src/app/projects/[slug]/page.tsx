import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getProject, projects } from '@/content/projects';
import { profile } from '@/content/site';
import { Blocks, Diagram } from '@/components/blocks';
import { ProjectToc } from '@/components/project-toc';
import { ArrowLink, MetricStrip, Prov, ProvKey } from '@/components/ui';
import { STATUS } from '@/components/project-cards';
import { ProjectTrace } from '@/components/viz/project-trace';
import { CountUp } from '@/components/motion/count-up';

/**
 * Next 15+ passes `params` as a Promise. Awaiting it also works under Next 14,
 * where params is a plain object, so this form is correct on both.
 */
type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  const title = `${p.name} — ${p.subtitle}`;
  const description = p.summary;
  return {
    title,
    description,
    alternates: { canonical: `/projects/${p.slug}` },
    openGraph: {
      title: `${title} · ${profile.name}`,
      description,
      url: `${profile.siteUrl}/projects/${p.slug}`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();

  const related = p.related.map((s) => getProject(s)).filter(Boolean);

  return (
    <article>
      {/* Hero ---------------------------------------------------------- */}
      <header className="shell pb-12 pt-10 lg:pt-14">
        <Link href="/projects" className="link-arrow mb-9 inline-flex">
          <ArrowLeft size={14} aria-hidden /> All projects
        </Link>

        <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="eyebrow">{p.domainLine}</span>
              <span className={`prov ${STATUS[p.statusTone]}`}>
                {p.statusTone === 'live' ? 'live demo' : p.statusTone}
              </span>
            </div>
            <h1 className="display-xl mt-5" style={{ viewTransitionName: 'vt-title' }}>
              {p.wordmark}
            </h1>
            <p className="display-m mt-4 max-w-2xl font-normal text-ink-2">{p.subtitle}</p>
            <p className="lede mt-6 text-ink">{p.hook}</p>

            <div className="mt-9 flex flex-wrap gap-3">
              {p.demo && (
                <a href={p.demo} target="_blank" rel="noreferrer" className="btn btn-primary">
                  Launch live demo
                </a>
              )}
              <a
                href={p.repo}
                target="_blank"
                rel="noreferrer"
                className={p.demo ? 'btn btn-ghost' : 'btn btn-primary'}
              >
                Explore repository
              </a>
              <a href="#overview" className="btn btn-ghost">
                Read the case study
              </a>
            </div>
          </div>

          <aside>
            <div className="border-t border-ink pt-5">
              <p className="eyebrow mb-3">Strongest result</p>
              <p className={`data text-4xl leading-none ${p.headline.tone === 'caution' ? 'text-caution' : 'text-ink'}`}>
                <CountUp value={p.headline.value} />
              </p>
              <p className="mt-3 max-w-sm text-micro leading-relaxed text-ink-2">{p.headline.label}</p>
              {p.headline.note && (
                <p className="mt-2 max-w-sm text-[0.7rem] leading-relaxed text-ink-3">{p.headline.note}</p>
              )}
              {p.headline.prov && (
                <div className="mt-3">
                  <Prov level={p.headline.prov} />
                </div>
              )}
            </div>

            <dl className="mt-8 border-t border-rule">
              {[
                ['Period', p.period],
                ['Role', p.role],
                ['Status', p.status],
                ['Scale', p.scale],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[6.5rem_1fr] gap-4 border-b border-rule py-3">
                  <dt className="eyebrow pt-0.5">{k}</dt>
                  <dd className="text-micro leading-snug text-ink-2">{v}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>

        <div
          className="mt-12 border border-rule bg-surface p-4 sm:p-6"
          style={{ viewTransitionName: 'vt-fig' }}
          data-tilt="2"
        >
          <div data-depth>
            <Diagram id={p.heroDiagram} />
          </div>
        </div>

        <div className="mt-8">
          <ProjectTrace slug={p.slug} />
        </div>

        <div className="mt-10">
          <MetricStrip items={p.cardMetrics} cols={4} />
        </div>
      </header>

      {/* Body ---------------------------------------------------------- */}
      <div className="shell grid gap-x-14 lg:grid-cols-[13rem_1fr]">
        <div className="lg:pt-6">
          <ProjectToc sections={[{ id: 'overview', nav: 'At a glance' }, ...p.sections.map((s) => ({ id: s.id, nav: s.nav }))]} />
        </div>

        <div className="min-w-0">
          {/* At a glance */}
          <section id="overview" className="scroll-mt-28 border-t border-ink pt-6">
            <div className="flex items-baseline gap-4">
              <span className="data text-label text-accent">01</span>
              <h2 className="eyebrow">At a glance</h2>
            </div>
            <dl className="mt-7 border-t border-rule">
              {p.glance.map((g) => (
                <div key={g.k} className="grid gap-x-10 gap-y-1.5 border-b border-rule py-5 md:grid-cols-[11rem_1fr]">
                  <dt className="display-s">{g.k}</dt>
                  <dd className="max-w-measure text-[0.9375rem] leading-relaxed text-ink-2">{g.v}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Sections */}
          {p.sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-28 pt-16">
              <div className="border-t border-ink pt-6">
                <div className="flex items-baseline gap-4">
                  <span className="data text-label text-accent">{String(i + 2).padStart(2, '0')}</span>
                  <h2 className="eyebrow">{s.nav}</h2>
                </div>
                <h3 className="display-l mt-5 max-w-3xl">{s.title}</h3>
                {s.kicker && <p className="mt-4 max-w-measure text-[0.9375rem] leading-relaxed text-ink-3">{s.kicker}</p>}
              </div>
              <Blocks blocks={s.blocks} />
            </section>
          ))}

          {/* Technologies */}
          <section id="stack" className="scroll-mt-28 pt-16">
            <div className="border-t border-ink pt-6">
              <div className="flex items-baseline gap-4">
                <span className="data text-label text-accent">{String(p.sections.length + 2).padStart(2, '0')}</span>
                <h2 className="eyebrow">Technologies</h2>
              </div>
              <h3 className="display-l mt-5">What it is built on</h3>
            </div>
            <dl className="mt-8 border-t border-rule">
              {p.techGrouped.map((g) => (
                <div key={g.group} className="grid gap-x-10 gap-y-2 border-b border-rule py-5 md:grid-cols-[11rem_1fr]">
                  <dt className="display-s">{g.group}</dt>
                  <dd className="flex flex-wrap gap-x-5 gap-y-1.5">
                    {g.items.map((it) => (
                      <span key={it} className="data text-micro text-ink-2">
                        {it}
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-6">
              <ProvKey />
            </div>
          </section>
        </div>
      </div>

      {/* Onward -------------------------------------------------------- */}
      <section className="shell pt-20">
        <div className="rule-t grid gap-8 py-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="eyebrow">Go deeper</p>
            <h2 className="display-m mt-4 max-w-xl">
              The repository carries the source; this page carries the reasoning.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={p.repo} target="_blank" rel="noreferrer" className="btn btn-primary">
              Explore repository
            </a>
            {p.demo && (
              <a href={p.demo} target="_blank" rel="noreferrer" className="btn btn-ghost">
                Live demo
              </a>
            )}
            <Link href="/contact" className="btn btn-ghost">
              Get in touch
            </Link>
          </div>
        </div>

        <div className="rule-t pt-8">
          <p className="eyebrow mb-6">Related work</p>
          <div className="grid gap-8 md:grid-cols-2">
            {related.map((r) => (
              <Link
                key={r!.slug}
                href={`/projects/${r!.slug}`}
                className="group block border-t border-ink pt-5"
              >
                <p className="eyebrow">{r!.domainLine}</p>
                <h3 className="display-m mt-3 transition-colors duration-180 group-hover:text-accent">{r!.name}</h3>
                <p className="mt-2.5 max-w-measure text-[0.9375rem] leading-relaxed text-ink-2">{r!.hook}</p>
                <span className="link-arrow mt-4 inline-flex">Read the case study</span>
              </Link>
            ))}
          </div>
          <div className="mt-10">
            <ArrowLink href="/projects">All projects</ArrowLink>
          </div>
        </div>
      </section>
    </article>
  );
}
