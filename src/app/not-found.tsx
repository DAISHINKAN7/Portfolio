import Link from 'next/link';
import { projects } from '@/content/projects';

export default function NotFound() {
  return (
    <div className="shell py-24 lg:py-32">
      <p className="eyebrow">404</p>
      <h1 className="display-xl mt-6">This page doesn&apos;t exist</h1>
      <p className="lede mt-6">
        The link may be out of date. Everything on this site is reachable from the work index below.
      </p>
      <div className="mt-9 flex flex-wrap gap-3">
        <Link href="/" className="btn btn-primary">Home</Link>
        <Link href="/projects" className="btn btn-ghost">All projects</Link>
        <Link href="/contact" className="btn btn-ghost">Contact</Link>
      </div>
      <div className="rule-t mt-16 pt-8">
        <p className="eyebrow mb-5">Case studies</p>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <li key={p.slug}>
              <Link href={`/projects/${p.slug}`} className="block border-t border-rule pt-3">
                <span className="display-s block transition-colors duration-180 hover:text-accent">{p.name}</span>
                <span className="mt-1 block text-micro text-ink-3">{p.subtitle}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
