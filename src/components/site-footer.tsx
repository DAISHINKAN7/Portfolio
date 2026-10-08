import Link from 'next/link';
import { profile } from '@/content/site';
import { projects } from '@/content/projects';
import { FooterWordmark } from './motion/footer-wordmark';

export function SiteFooter() {
  const cols = [
    {
      title: 'Work',
      links: projects.map((p) => ({ href: `/projects/${p.slug}`, label: p.name })),
    },
    {
      title: 'Site',
      links: [
        { href: '/projects', label: 'All projects' },
        { href: '/experience', label: 'Experience' },
        { href: '/research', label: 'Research' },
        { href: '/skills', label: 'Skills' },
        { href: '/credentials', label: 'Credentials' },
        { href: '/about', label: 'About' },
      ],
    },
  ];

  return (
    <footer className="mt-28 border-t border-rule">
      <div className="shell grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="display-s">{profile.name}</p>
          <p className="mt-1.5 text-micro text-ink-2">{profile.role} · {profile.location}</p>
          <p className="mt-5 max-w-xs text-micro leading-relaxed text-ink-3">
            Every figure on this site is tagged with how strongly it is evidenced. Nothing is rounded up.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
            <a href={`mailto:${profile.email}`} className="link text-micro">
              Email
            </a>
            <a href={profile.github} target="_blank" rel="noreferrer" className="link text-micro">
              GitHub
            </a>
            {profile.linkedin && (
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className="link text-micro">
                LinkedIn
              </a>
            )}
            <Link href="/resume" className="link text-micro">
              Resume
            </Link>
          </div>
        </div>

        {cols.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <p className="eyebrow mb-4">{c.title}</p>
            <ul className="space-y-2.5">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-micro text-ink-2 transition-colors duration-180 hover:text-accent">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="shell">
        <FooterWordmark text={profile.name} />
      </div>

      <div className="border-t border-rule">
        <div className="shell flex flex-wrap items-center justify-between gap-3 py-5">
          <p className="data text-[0.7rem] text-ink-3">
            © {new Date().getFullYear()} {profile.name}
          </p>
          <p className="data text-[0.7rem] text-ink-3">Built with Next.js · Typeset in IBM Plex</p>
        </div>
      </div>
    </footer>
  );
}
