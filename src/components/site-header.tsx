'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { profile } from '@/content/site';

const NAV = [
  { href: '/projects', label: 'Work' },
  { href: '/experience', label: 'Experience' },
  { href: '/research', label: 'Research' },
  { href: '/skills', label: 'Skills' },
  { href: '/about', label: 'About' },
  { href: '/resume', label: 'Resume' },
];

export function SiteHeader() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [path]);

  const active = (href: string) => path === href || path.startsWith(href + '/');

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/92 backdrop-blur-sm">
      <div className="shell flex h-16 items-center justify-between gap-6">
        <Link
          href="/"
          className="font-display text-[0.95rem] font-semibold tracking-tight text-ink transition-colors duration-180 hover:text-accent"
        >
          {profile.name}
          <span className="ml-2.5 hidden font-mono text-[0.65rem] font-normal uppercase tracking-[0.14em] text-ink-3 sm:inline">
            AI / ML Engineer
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={active(n.href) ? 'page' : undefined}
              className={`font-mono text-[0.7rem] uppercase tracking-[0.12em] transition-colors duration-180 ${
                active(n.href) ? 'text-accent' : 'text-ink-2 hover:text-ink'
              }`}
            >
              {n.label}
            </Link>
          ))}
          <Link href="/contact" className="btn btn-ghost !px-3 !py-1.5 !text-[0.7rem]">
            Contact
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="-mr-2 p-2 text-ink md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" className="border-t border-rule bg-paper md:hidden" aria-label="Primary mobile">
          <div className="shell py-2">
            {[...NAV, { href: '/credentials', label: 'Credentials' }, { href: '/contact', label: 'Contact' }].map((n) => (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active(n.href) ? 'page' : undefined}
                className={`block border-b border-rule py-3.5 font-mono text-[0.75rem] uppercase tracking-[0.12em] last:border-b-0 ${
                  active(n.href) ? 'text-accent' : 'text-ink'
                }`}
              >
                {n.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
