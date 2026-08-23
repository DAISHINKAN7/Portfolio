import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Download } from 'lucide-react';
import { education, experience, profile, publications } from '@/content/site';
import { projects } from '@/content/projects';
import { ArrowLink } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Resume',
  description: `Resume for ${profile.name}, ${profile.role} — experience, education, projects, publications and skills.`,
  alternates: { canonical: '/resume' },
};

export default function ResumePage() {
  return (
    <div className="shell py-14 lg:py-20">
      <header className="rule-b grid gap-8 pb-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <div>
          <p className="eyebrow">Resume</p>
          <h1 className="display-xl mt-6">{profile.name}</h1>
          <p className="mt-4 text-[1.0625rem] text-ink-2">{profile.role}</p>
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          <a href={profile.resumePdf} download className="btn btn-primary">
            <Download size={14} aria-hidden /> Download PDF
          </a>
          <a href={profile.github} target="_blank" rel="noreferrer" className="btn btn-ghost">
            GitHub
          </a>
          <Link href="/contact" className="btn btn-ghost">
            Contact
          </Link>
        </div>
      </header>

      <div className="grid gap-x-16 gap-y-12 pt-12 lg:grid-cols-[1fr_22rem]">
        <div>
          <section>
            <h2 className="eyebrow mb-6">Experience</h2>
            <ol className="border-t border-rule">
              {experience.map((r) => (
                <li key={r.slug} className="grid gap-x-8 gap-y-2 border-b border-rule py-5 md:grid-cols-[1fr_9rem]">
                  <div>
                    <h3 className="display-s">{r.title}</h3>
                    <p className="mt-1 text-micro text-ink-2">{r.org}</p>
                  </div>
                  <p className="data text-micro text-ink-3 md:text-right">{r.period}</p>
                </li>
              ))}
            </ol>
            <div className="mt-4">
              <ArrowLink href="/experience">Full experience detail</ArrowLink>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="eyebrow mb-6">Projects</h2>
            <ol className="border-t border-rule">
              {projects.map((p) => (
                <li key={p.slug} className="grid gap-x-8 gap-y-2 border-b border-rule py-5 md:grid-cols-[1fr_9rem]">
                  <div>
                    <h3 className="display-s">
                      <Link href={`/projects/${p.slug}`} className="transition-colors duration-180 hover:text-accent">
                        {p.name}
                      </Link>
                    </h3>
                    <p className="mt-1 max-w-measure text-micro leading-relaxed text-ink-2">{p.hook}</p>
                  </div>
                  <p className="data text-micro text-ink-3 md:text-right">{p.period}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-12">
            <h2 className="eyebrow mb-6">Education</h2>
            <ol className="border-t border-rule">
              {education.map((e) => (
                <li key={e.degree} className="grid gap-x-8 gap-y-2 border-b border-rule py-5 md:grid-cols-[1fr_9rem]">
                  <div>
                    <h3 className="display-s">{e.degree}</h3>
                    <p className="mt-1 text-micro text-ink-2">
                      {e.org} · {e.detail}
                    </p>
                  </div>
                  <p className="data text-micro text-ink-3 md:text-right">{e.period}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-12">
            <h2 className="eyebrow mb-6">Publications</h2>
            <ol className="border-t border-rule">
              {publications.map((p) => (
                <li key={p.title} className="grid gap-x-8 gap-y-2 border-b border-rule py-5 md:grid-cols-[1fr_9rem]">
                  <h3 className="display-s max-w-xl">{p.title}</h3>
                  <p className="data text-micro text-ink-3 md:text-right">
                    {p.venue} · {p.date}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside>
          <p className="eyebrow mb-4">PDF preview</p>
          <a
            href={profile.resumePdf}
            download
            className="block border border-rule bg-surface p-2 transition-colors duration-180 hover:border-rule-2"
          >
            <Image
              src="/resume-preview.jpg"
              alt={`First page of the resume of ${profile.name}`}
              width={1400}
              height={1980}
              sizes="(max-width: 1024px) 100vw, 22rem"
              className="h-auto w-full"
            />
          </a>
          <p className="mt-3 text-micro text-ink-3">Two pages. Download for the complete document.</p>

          <dl className="mt-9 border-t border-ink">
            {[
              ['Email', profile.email],
              ['Phone', profile.phone],
              ['Location', profile.location],
              ['GitHub', profile.githubHandle],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[5.5rem_1fr] gap-4 border-b border-rule py-3">
                <dt className="eyebrow pt-0.5">{k}</dt>
                <dd className="data text-micro text-ink-2">{v}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </div>
  );
}
