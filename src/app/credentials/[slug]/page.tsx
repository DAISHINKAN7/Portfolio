import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { credentials } from '@/content/site';
import { ArrowLink } from '@/components/ui';

/** Next 15+ passes `params` as a Promise; awaiting is also valid under Next 14. */
type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return credentials.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const c = credentials.find((x) => x.slug === slug);
  if (!c) return {};
  return {
    title: c.title,
    description: `${c.title} — issued by ${c.issuer}, ${c.date}.`,
    alternates: { canonical: `/credentials/${c.slug}` },
  };
}

export default async function CredentialPage({ params }: Params) {
  const { slug } = await params;
  const c = credentials.find((x) => x.slug === slug);
  if (!c) notFound();

  return (
    <div className="shell py-14 lg:py-20">
      <Link href="/credentials" className="link-arrow mb-9 inline-flex">
        <ArrowLeft size={14} aria-hidden /> All credentials
      </Link>

      <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
        <div>
          <p className="eyebrow">{c.group}</p>
          <h1 className="display-l mt-5">{c.title}</h1>

          <dl className="mt-9 border-t border-ink">
            {[
              ['Issuer', c.issuer],
              ['Date', c.date],
              ['Skills', c.skills.join(' · ')],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[6rem_1fr] gap-6 border-b border-rule py-4">
                <dt className="eyebrow pt-0.5">{k}</dt>
                <dd className="text-micro leading-relaxed text-ink-2">{v}</dd>
              </div>
            ))}
          </dl>

          {c.note && <p className="mt-7 max-w-measure text-[0.9375rem] leading-relaxed text-ink-2">{c.note}</p>}

          <div className="mt-9 flex flex-wrap gap-3">
            {c.asset && (
              <a href={`${c.asset}.pdf`} target="_blank" rel="noreferrer" className="btn btn-primary">
                Open certificate
              </a>
            )}
            {c.verify && (
              <a href={c.verify} target="_blank" rel="noreferrer" className="btn btn-ghost">
                Verify with issuer
              </a>
            )}
          </div>
        </div>

        {c.asset && (
          <figure>
            <a
              href={`${c.asset}.pdf`}
              target="_blank"
              rel="noreferrer"
              className="block border border-rule bg-surface p-3 transition-colors duration-180 hover:border-rule-2"
            >
              <Image
                src={`${c.asset}.jpg`}
                alt={`Certificate: ${c.title}, issued by ${c.issuer}`}
                width={1400}
                height={990}
                sizes="(max-width: 1024px) 100vw, 45rem"
                className="h-auto w-full"
              />
            </a>
            <figcaption className="mt-3 text-micro text-ink-3">Open the full certificate to view or download.</figcaption>
          </figure>
        )}
      </div>

      <div className="rule-t mt-16 pt-8">
        <ArrowLink href="/credentials">All credentials</ArrowLink>
      </div>
    </div>
  );
}
