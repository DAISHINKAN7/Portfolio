'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
  const [hover, setHover] = useState<number | null>(null);
  const links = useRef<(HTMLAnchorElement | null)[]>([]);
  const marker = useRef<HTMLSpanElement>(null);
  const progress = useRef<HTMLSpanElement>(null);

  useEffect(() => setOpen(false), [path]);

  const active = (href: string) => path === href || path.startsWith(href + '/');
  const activeIndex = NAV.findIndex((n) => active(n.href));

  // One hairline that travels to whatever you point at, and rests on the
  // current section. Positioned by measurement, animated by CSS.
  useLayoutEffect(() => {
    const i = hover ?? activeIndex;
    const m = marker.current;
    const el = i >= 0 ? links.current[i] : null;
    if (!m) return;
    if (!el) {
      m.style.opacity = '0';
      return;
    }
    m.style.opacity = '1';
    m.style.width = `${el.offsetWidth}px`;
    m.style.transform = `translate3d(${el.offsetLeft}px, 0, 0)`;
    m.dataset.hover = hover !== null && hover !== activeIndex ? 'true' : 'false';
  }, [hover, activeIndex, path]);

  // Reading progress along the bottom rule.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = progress.current;
      if (!el) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > window.innerHeight * 0.6 ? Math.min(1, window.scrollY / max) : 0;
      el.style.transform = `scaleX(${p.toFixed(4)})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [path]);

  return (
    <header className="site-header sticky top-0 z-40 border-b border-rule bg-paper/92 backdrop-blur-sm">
      <div className="shell flex h-16 items-center justify-between gap-6">
        <Link
          href="/"
          className="font-display text-[0.95rem] font-semibold tracking-tight text-ink transition-colors duration-180 hover:text-accent"
        >
          {profile.name}
          <span className="ml-2.5 hidden whitespace-nowrap font-mono text-[0.65rem] font-normal uppercase tracking-[0.14em] text-ink-3 lg:inline">
            AI / ML Engineer
          </span>
        </Link>

        <nav className="relative hidden items-center gap-7 md:flex" aria-label="Primary" onMouseLeave={() => setHover(null)}>
          {NAV.map((n, i) => (
            <Link
              key={n.href}
              href={n.href}
              ref={(el) => void (links.current[i] = el)}
              aria-current={active(n.href) ? 'page' : undefined}
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              className={`nav-link font-mono text-[0.7rem] uppercase tracking-[0.12em] transition-colors duration-180 ${
                active(n.href) ? 'text-accent' : 'text-ink-2 hover:text-ink'
              }`}
            >
              {n.label}
            </Link>
          ))}
          <span ref={marker} className="nav-marker" aria-hidden />
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
          <span className="menu-icon" data-open={open}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </span>
        </button>
      </div>

      <span ref={progress} className="read-progress" aria-hidden />
      <span className="nav-progress" aria-hidden />

      {open && (
        <nav id="mobile-nav" className="mobile-nav border-t border-rule bg-paper md:hidden" aria-label="Primary mobile">
          <div className="shell py-2">
            {[...NAV, { href: '/credentials', label: 'Credentials' }, { href: '/contact', label: 'Contact' }].map((n, i) => (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active(n.href) ? 'page' : undefined}
                style={{ ['--i' as string]: i }}
                className={`flex items-baseline gap-4 border-b border-rule py-3.5 font-mono text-[0.75rem] uppercase tracking-[0.12em] last:border-b-0 ${
                  active(n.href) ? 'text-accent' : 'text-ink'
                }`}
              >
                <span className="text-[0.625rem] text-ink-3">{String(i + 1).padStart(2, '0')}</span>
                {n.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
