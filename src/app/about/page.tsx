import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { profile, volunteering } from '@/content/site';
import { ArrowLink } from '@/components/ui';

export const metadata: Metadata = {
  title: 'About',
  description:
    'How I pick problems, how I evaluate systems, and why every figure on this site carries a provenance tag.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div className="shell py-14 lg:py-20">
      <header className="mb-14 max-w-3xl">
        <p className="eyebrow">About</p>
        <h1 className="display-xl mt-6">How I work</h1>
      </header>

      <div className="grid gap-x-16 gap-y-12 lg:grid-cols-[1fr_20rem]">
        <div>
          <section className="border-t border-ink pt-7">
            <h2 className="display-m">The problems I go looking for</h2>
            <p className="body mt-5">
              The five projects on this site have one thing in common: none of them had a dataset waiting. AstroGuard
              needed a 150-document corpus partitioned into four disjoint expert views. The galaxy classifier needed
              6,010 paired radio and optical cutouts that did not exist in any package, so they were pulled from survey
              APIs and validated one at a time. SSA-Intel needed an entity ontology that no pretrained model had ever
              seen. EcoRewind needed a target quantity that is unobservable by construction.
            </p>
            <p className="body">
              That is the kind of problem I find interesting — where the modelling is not the hard part, and the real
              work is deciding what the data should be, what a correct answer would even look like, and how you would
              know if you got one.
            </p>
          </section>

          <section className="mt-14 border-t border-ink pt-7">
            <h2 className="display-m">Architecture over model scale</h2>
            <p className="body mt-5">
              AstroGuard runs on a 4-bit quantized 7B model and costs nothing to operate. Its interesting property is
              not the model — it is that agent isolation is enforced as a column in the vector index rather than as a
              line in a prompt, so an agent prompt-injected into looking at the wrong evidence still physically cannot
              retrieve it. That distinction is the whole project.
            </p>
            <p className="body">
              The same instinct shows up elsewhere. In AdaptiveBeta, a hard VIX rule sits in front of the model
              precisely because you do not want a statistical model deciding your exposure during a panic. In EcoRewind,
              the fix for compounding autoregressive drift was a seasonal climatology floor drawn from domain knowledge,
              not a bigger network. I reach for structure before I reach for capacity.
            </p>
          </section>

          <section className="mt-14 border-t border-ink pt-7">
            <h2 className="display-m">Evaluation is the part I take most seriously</h2>
            <p className="body mt-5">
              Most of what I have learned came from numbers that were wrong in an interesting way. EcoRewind reported a
              SAR R² of −89.8, which is physically impossible; chasing that produced a validity-mask broadcast bug that
              had been silently poisoning every band. None of the three bugs documented in that project were visible in
              a loss curve. All three were found by asking why a reported number could not possibly be true.
            </p>
            <p className="body">
              So the evaluation protocol gets designed before the result matters. Ten seeded runs with confidence
              intervals from Student&apos;s t rather than a normal approximation. Bootstrap resampling and McNemar&apos;s
              test, reported even when they show my preferred model&apos;s lead is not statistically separated.
              Walk-forward validation with transaction costs charged and the decision threshold frozen on training data.
            </p>
          </section>

          <section className="mt-14 border-t border-ink pt-7">
            <h2 className="display-m">Why everything here is tagged</h2>
            <p className="body mt-5">
              Every figure on this site carries a provenance tag: verified, reported, or unmeasured. That is not
              decoration. My best classifier result is 97.60%, and it is tagged <em>reported</em> because the evaluation
              re-seeds its own split and the number is therefore optimistic — I would rather say that than have a
              reviewer find it. EcoRewind&apos;s headline finding is negative: attribution swings 20× on backbone choice,
              which means no damage figure from that method should be quoted as real. SSA-Intel extracted 189,552
              relations and I claim no precision for any of them, because there is no annotated test set.
            </p>
            <p className="body">
              A portfolio that only shows wins is less informative than one that marks its own boundaries. It is also
              much easier to defend in an interview.
            </p>
          </section>

          <section className="mt-14 border-t border-ink pt-7">
            <h2 className="display-m">Where I am headed</h2>
            <p className="body mt-5">
              I want to keep building systems where retrieval, reasoning and evaluation are one design problem rather
              than three — agentic architectures over real corpora, multimodal models on scientific data, and the
              measurement infrastructure that makes either one trustworthy. Right now that means knowledge graphs and
              LLM query agents over enterprise PLM data at Dassault Systèmes, alongside an M.Tech in AI and ML.
            </p>
          </section>
        </div>

        <aside>
          <div className="relative aspect-[4/5] w-full border border-rule">
            <Image
              src={profile.photo}
              alt={`${profile.name}, ${profile.role}`}
              fill
              sizes="(max-width: 1024px) 70vw, 20rem"
              className="object-cover"
            />
          </div>

          <dl className="mt-8 border-t border-ink">
            {[
              ['Role', profile.role],
              ['Based in', profile.location],
              ['Currently', 'AI/ML Intern, Dassault Systèmes Solutions Lab'],
              ['Studying', 'M.Tech AI & ML, Symbiosis Institute of Technology'],
              ['Outside work', `${volunteering.role}, ${volunteering.org} (${volunteering.period})`],
            ].map(([k, v]) => (
              <div key={k} className="border-b border-rule py-4">
                <dt className="eyebrow">{k}</dt>
                <dd className="mt-1.5 text-micro leading-relaxed text-ink-2">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-col gap-3">
            <Link href="/projects" className="btn btn-primary justify-center">
              See the work
            </Link>
            <Link href="/contact" className="btn btn-ghost justify-center">
              Get in touch
            </Link>
          </div>
        </aside>
      </div>

      <div className="rule-t mt-16 flex flex-wrap gap-x-10 gap-y-3 pt-8">
        <ArrowLink href="/research">Research and claim boundaries</ArrowLink>
        <ArrowLink href="/experience">Professional experience</ArrowLink>
        <ArrowLink href="/resume">Resume</ArrowLink>
      </div>
    </div>
  );
}
