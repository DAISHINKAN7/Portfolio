'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export function ProjectToc({ sections }: { sections: { id: string; nav: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id);
  const [open, setOpen] = useState(false);
  const list = useRef<HTMLOListElement>(null);
  const marker = useRef<HTMLSpanElement>(null);

  // One accent hairline that glides to the active entry.
  useLayoutEffect(() => {
    const a = list.current?.querySelector<HTMLElement>(`a[href="#${active}"]`);
    const m = marker.current;
    if (!a || !m) return;
    m.style.transform = `translate3d(0, ${a.offsetTop}px, 0)`;
    m.style.height = `${a.offsetHeight}px`;
    m.style.opacity = '1';
  }, [active]);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-96px 0px -65% 0px', threshold: 0 }
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [sections]);

  const label = sections.find((s) => s.id === active)?.nav ?? 'Contents';

  return (
    <>
      {/* Desktop rail */}
      <nav className="sticky top-24 hidden lg:block" aria-label="Sections">
        <p className="eyebrow mb-4">Contents</p>
        <ol ref={list} className="relative space-y-0.5 border-l border-rule">
          <span ref={marker} className="toc-marker" aria-hidden />
          {sections.map((s, i) => {
            const on = active === s.id;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  aria-current={on ? 'true' : undefined}
                  className={`-ml-px flex items-baseline gap-3 border-l border-transparent py-1.5 pl-4 text-micro transition-[color,padding] duration-320 ${
                    on ? 'pl-5 text-accent' : 'text-ink-2 hover:pl-5 hover:text-ink'
                  }`}
                >
                  <span className="data text-[0.65rem] text-ink-3">{String(i + 1).padStart(2, '0')}</span>
                  {s.nav}
                </a>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Mobile: a compact disclosure rather than a shrunken rail */}
      <div className="sticky top-16 z-30 -mx-[var(--shell-pad)] border-b border-rule bg-paper/95 px-[var(--shell-pad)] backdrop-blur-sm lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-4 py-3"
        >
          <span className="data text-[0.7rem] uppercase tracking-[0.12em] text-ink-3">Section</span>
          <span className="data ml-4 truncate text-[0.75rem] uppercase tracking-[0.1em] text-accent">{label}</span>
        </button>
        {open && (
          <ol className="grid grid-cols-2 gap-x-4 pb-4">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={() => setOpen(false)}
                  className={`block py-1.5 text-micro ${active === s.id ? 'text-accent' : 'text-ink-2'}`}
                >
                  {s.nav}
                </a>
              </li>
            ))}
          </ol>
        )}
      </div>
    </>
  );
}
