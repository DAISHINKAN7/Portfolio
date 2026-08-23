import Link from 'next/link';
import Image from 'next/image';
import { profile, experience, publications, skillGroups, credentials } from '@/content/site';
import { projects } from '@/content/projects';
import { FeaturedProject } from '@/components/project-cards';
import { LandscapeMap } from '@/components/landscape-map';
import { ArrowLink, ProvKey, SectionHead } from '@/components/ui';

export default function HomePage() {
  return (
    <>
      {/* 01 · Hero ---------------------------------------------------- */}
      <section className="shell pb-16 pt-14 lg:pb-24 lg:pt-24">
        <div className="grid gap-12 lg:grid-cols-[1.55fr_1fr] lg:gap-20">
          <div>
            <p className="eyebrow">{profile.role}</p>
            <h1 className="display-xl mt-6">{profile.name}</h1>
            <div className="mt-8 max-w-2xl border-t border-ink pt-6">
              {profile.heroLines.map((l) => (
                <p key={l} className="text-[1.0625rem] leading-relaxed text-ink sm:text-[1.1875rem]">
                  {l}
                </p>
              ))}
            </div>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/projects" className="btn btn-primary">
                Explore the work
              </Link>
              <Link href="/resume" className="btn btn-ghost">
                Resume
              </Link>
              <a href={profile.github} target="_blank" rel="noreferrer" className="btn btn-ghost">
                GitHub
              </a>
              <Link href="/contact" className="btn btn-ghost">
                Contact
              </Link>
            </div>

            <dl className="mt-14 grid max-w-2xl gap-x-8 gap-y-6 border-t border-rule pt-6 sm:grid-cols-3">
              {[
                ['5', 'systems built end to end'],
                ['2', 'peer-reviewed publications'],
                ['3', 'published negative results'],
              ].map(([v, k]) => (
                <div key={k}>
                  <dd className="data text-2xl leading-none text-ink">{v}</dd>
                  <dt className="mt-2.5 text-micro leading-snug text-ink-2">{k}</dt>
                </div>
              ))}
            </dl>
            <p className="mt-6 max-w-md text-micro leading-relaxed text-ink-3">
              Every figure on this site is tagged with how strongly it is evidenced — verified, reported, or unmeasured.
            </p>
          </div>

          <aside className="lg:pt-3">
            <div className="relative aspect-[4/5] w-full max-w-[17rem] border border-rule">
              <Image
                src={profile.photo}
                alt={`${profile.name}, ${profile.role}`}
                fill
                priority
                sizes="(max-width: 1024px) 60vw, 17rem"
                className="object-cover"
              />
            </div>
            <dl className="mt-7 max-w-[17rem] border-t border-rule">
              {[
                ['Currently', 'AI/ML Intern, Dassault Systèmes'],
                ['Studying', 'M.Tech AI & ML, Symbiosis Institute of Technology'],
                ['Based in', profile.location],
              ].map(([k, v]) => (
                <div key={k} className="border-b border-rule py-3.5">
                  <dt className="eyebrow">{k}</dt>
                  <dd className="mt-1.5 text-micro leading-snug text-ink-2">{v}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </section>

      {/* 02 · Selected work ------------------------------------------- */}
      <section className="shell" id="work">
        <SectionHead
          index="01"
          eyebrow="Selected work"
          title="Five systems, each built end to end and evaluated on its own terms"
          intro="Every project below started from a problem with no ready-made dataset, no benchmark, or no established method — and each is reported with the caveats a reviewer would otherwise have to find."
          right={<ArrowLink href="/projects">All projects</ArrowLink>}
        />
        {projects.map((p, i) => (
          <FeaturedProject key={p.slug} project={p} index={i} flip={i % 2 === 1} />
        ))}
      </section>

      {/* 03 · Engineering landscape ----------------------------------- */}
      <section className="shell pt-20" id="landscape">
        <SectionHead
          index="02"
          eyebrow="Engineering landscape"
          title="How the work connects"
          intro="Domains on the left, the projects that actually evidence them on the right. Hover either side to trace the connections."
        />
        <LandscapeMap />
      </section>

      {/* 04 · Experience ---------------------------------------------- */}
      <section className="shell pt-24" id="experience">
        <SectionHead
          index="03"
          eyebrow="Experience"
          title="Production engineering environments"
          right={<ArrowLink href="/experience">Full history</ArrowLink>}
        />
        <ol className="border-t border-rule">
          {experience.map((r) => (
            <li key={r.slug} className="grid gap-x-10 gap-y-3 border-b border-rule py-7 md:grid-cols-[12rem_1fr]">
              <div>
                <p className="data text-micro text-ink-2">{r.period}</p>
                {r.current && <span className="prov prov-verified mt-2 inline-flex">current</span>}
              </div>
              <div>
                <h3 className="display-s">
                  {r.title} · <span className="text-ink-2">{r.org}</span>
                </h3>
                <p className="mt-1.5 eyebrow">{r.domain}</p>
                <p className="mt-3 max-w-measure text-[0.9375rem] leading-relaxed text-ink-2">{r.summary}</p>
                <div className="mt-4">
                  <ArrowLink href={`/experience#${r.slug}`}>What I worked on</ArrowLink>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 05 · Research ------------------------------------------------ */}
      <section className="shell pt-24" id="research">
        <SectionHead
          index="04"
          eyebrow="Research"
          title="Published work and research-grade projects"
          intro="Two peer-reviewed publications, plus three projects built to research standards — statistical evaluation protocols, honest negative results, and stated claim boundaries."
          right={<ArrowLink href="/research">Research page</ArrowLink>}
        />
        <ol className="border-t border-rule">
          {publications.map((p) => (
            <li key={p.title} className="grid gap-x-10 gap-y-2 border-b border-rule py-7 md:grid-cols-[12rem_1fr]">
              <div>
                <p className="data text-micro text-ink-2">{p.date}</p>
                <p className="mt-1.5 eyebrow">{p.venue}</p>
              </div>
              <div>
                <h3 className="display-s max-w-2xl">{p.title}</h3>
                <p className="mt-2 max-w-measure text-[0.9375rem] leading-relaxed text-ink-2">{p.note}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 06 · Capabilities -------------------------------------------- */}
      <section className="shell pt-24" id="skills">
        <SectionHead
          index="05"
          eyebrow="Technical capabilities"
          title="Every skill here points at the project that proves it"
          right={<ArrowLink href="/skills">Skills with evidence</ArrowLink>}
        />
        <div className="grid gap-x-10 gap-y-8 border-t border-rule pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {skillGroups.slice(0, 8).map((g) => (
            <div key={g.name}>
              <h3 className="display-s">{g.name}</h3>
              <p className="mt-2 text-micro leading-relaxed text-ink-3">{g.blurb}</p>
              <ul className="mt-4 space-y-1.5">
                {g.items.slice(0, 5).map((it) => (
                  <li key={it.name} className="text-micro text-ink-2">
                    {it.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 07 · Credentials & provenance -------------------------------- */}
      <section className="shell pt-24" id="credentials">
        <SectionHead
          index="06"
          eyebrow="Credentials"
          title="Supporting validation"
          intro={`${credentials.length} certificates across AI/ML, MLOps and data engineering, plus internship completion records. They support the projects; they do not stand in for them.`}
          right={<ArrowLink href="/credentials">View credentials</ArrowLink>}
        />
        <div className="mb-14">
          <ProvKey />
        </div>
      </section>

      {/* 08 · Contact -------------------------------------------------- */}
      <section className="shell pt-8">
        <div className="rule-t grid gap-8 py-14 lg:grid-cols-[1.4fr_1fr] lg:py-20">
          <div>
            <p className="eyebrow">Contact</p>
            <h2 className="display-l mt-5 max-w-2xl">
              If any of this is close to what your team is building, I&apos;d like to hear about it.
            </h2>
          </div>
          <div className="flex flex-col justify-end gap-3">
            <a href={`mailto:${profile.email}`} className="btn btn-primary justify-center">
              {profile.email}
            </a>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className="btn btn-ghost">
                All contact details
              </Link>
              <Link href="/resume" className="btn btn-ghost">
                Resume
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
