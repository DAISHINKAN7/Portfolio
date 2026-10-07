'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { projects } from '@/content/projects';
import { profile } from '@/content/site';

/**
 * Small discoveries for people who poke at things.
 *
 *   ⌘K / Ctrl+K / "/"   command palette — every page and case study by keyboard
 *   G                   overlay the 12-column grid the layout is set on
 *   ↑↑↓↓←→←→BA          the hero network re-forms into initials
 *   console             a note for whoever opened devtools
 */
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

type Cmd = { id: string; label: string; hint: string; run: () => void };

const typing = (e: KeyboardEvent) => {
  const t = e.target as HTMLElement | null;
  return !!t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
};

export function EasterEggs({ motion }: { motion: boolean }) {
  const router = useRouter();
  const [palette, setPalette] = useState(false);
  const [grid, setGrid] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const say = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  // Console signature, once per page load.
  useEffect(() => {
    const w = window as Window & { __signed?: boolean };
    if (w.__signed) return;
    w.__signed = true;
    const ink = 'font-family: "IBM Plex Mono", monospace; color: #15181A; font-size: 11px;';
    const acc = 'font-family: "IBM Plex Mono", monospace; color: #0E5A63; font-size: 11px;';
    // eslint-disable-next-line no-console
    console.log(
      `%c${profile.name}\n%cAI / ML engineer · ${profile.githubHandle} on GitHub\n\n%cEverything that moves here runs on one rAF clock, one ~200-line WebGL\nrenderer and zero animation libraries. The hero is a forward pass:\nsignals enter nearest your cursor. Press and hold inside it.\n\n%c⌘K  palette   ·   G  grid   ·   and the code you already know.\n\n%c${profile.email}`,
      'font-family: "IBM Plex Sans Condensed", sans-serif; font-weight: 600; font-size: 18px; color: #15181A;',
      acc,
      ink,
      'font-family: "IBM Plex Mono", monospace; color: #7C858B; font-size: 11px;',
      acc
    );
  }, []);

  const commands = useMemo<Cmd[]>(
    () => [
      { id: 'home', label: 'Home', hint: 'page', run: () => router.push('/') },
      { id: 'work', label: 'All projects', hint: 'page', run: () => router.push('/projects') },
      ...projects.map((p) => ({ id: p.slug, label: p.name, hint: 'case study', run: () => router.push(`/projects/${p.slug}`) })),
      { id: 'experience', label: 'Experience', hint: 'page', run: () => router.push('/experience') },
      { id: 'research', label: 'Research', hint: 'page', run: () => router.push('/research') },
      { id: 'skills', label: 'Skills with evidence', hint: 'page', run: () => router.push('/skills') },
      { id: 'credentials', label: 'Credentials', hint: 'page', run: () => router.push('/credentials') },
      { id: 'about', label: 'About', hint: 'page', run: () => router.push('/about') },
      { id: 'resume', label: 'Resume', hint: 'page', run: () => router.push('/resume') },
      { id: 'contact', label: 'Contact', hint: 'page', run: () => router.push('/contact') },
      {
        id: 'copy',
        label: 'Copy email address',
        hint: 'action',
        run: () => {
          navigator.clipboard?.writeText(profile.email).then(
            () => say(`copied · ${profile.email}`),
            () => say(profile.email)
          );
        },
      },
      { id: 'github', label: 'Open GitHub', hint: 'external', run: () => window.open(profile.github, '_blank', 'noopener') },
      { id: 'grid', label: 'Toggle layout grid', hint: 'G', run: () => setGrid((g) => !g) },
    ],
    [router, say]
  );

  // Global keys.
  useEffect(() => {
    let seq: string[] = [];
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPalette((p) => !p);
        return;
      }
      if (typing(e) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === '/' && !palette) {
        e.preventDefault();
        setPalette(true);
        return;
      }
      if (e.key.toLowerCase() === 'g' && !palette) {
        say(grid ? 'grid off' : '12 columns · 84rem shell · fluid gutter — G to hide');
        setGrid(!grid);
      }
      seq = [...seq, e.key.length === 1 ? e.key.toLowerCase() : e.key].slice(-KONAMI.length);
      if (seq.join() === KONAMI.join()) {
        seq = [];
        const hero = document.querySelector('.hero-field');
        if (hero && motion) {
          window.dispatchEvent(new Event('kunal:konami'));
          say('weights re-initialised · converging…');
        } else if (!hero) {
          say('right code, wrong page — try it on the home page');
        } else say('reduced motion is on — the network stays put');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [palette, grid, motion, say]);

  return (
    <>
      {grid && <GridOverlay />}
      {palette && <Palette commands={commands} onClose={() => setPalette(false)} />}
      <div className="egg-toast" role="status" aria-live="polite" data-show={toast ? 'true' : 'false'}>
        {toast}
      </div>
    </>
  );
}

function GridOverlay() {
  return (
    <div className="grid-overlay" aria-hidden>
      <div className="shell grid h-full grid-cols-12 gap-x-6">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} />
        ))}
      </div>
    </div>
  );
}

function Palette({ commands, onClose }: { commands: Cmd[]; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [i, setI] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const restore = useRef<Element | null>(null);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return commands;
    // Subsequence match, ranked by how early and tightly it lands.
    const score = (label: string) => {
      const l = label.toLowerCase();
      let pos = -1, first = -1, gaps = 0;
      for (const ch of s) {
        const n = l.indexOf(ch, pos + 1);
        if (n < 0) return -1;
        if (first < 0) first = n;
        gaps += n - pos - 1;
        pos = n;
      }
      return 1000 - first * 10 - gaps;
    };
    return commands
      .map((c) => [c, score(c.label)] as const)
      .filter(([, sc]) => sc >= 0)
      .sort((a, b) => b[1] - a[1])
      .map(([c]) => c);
  }, [q, commands]);

  useEffect(() => {
    restore.current = document.activeElement;
    input.current?.focus();
    return () => (restore.current as HTMLElement | null)?.focus?.();
  }, []);
  useEffect(() => setI(0), [q]);

  const run = (c?: Cmd) => {
    if (!c) return;
    onClose();
    c.run();
  };

  return (
    <div className="palette-backdrop" onMouseDown={onClose}>
      <div
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose();
          else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setI((v) => Math.min(list.length - 1, v + 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setI((v) => Math.max(0, v - 1));
          } else if (e.key === 'Enter') {
            e.preventDefault();
            run(list[i]);
          } else if (e.key === 'Tab') e.preventDefault();
        }}
      >
        <div className="flex items-center gap-3 border-b border-rule px-4">
          <span className="data text-[0.7rem] text-accent" aria-hidden>
            ›
          </span>
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Jump to a page or case study…"
            className="w-full bg-transparent py-3.5 font-mono text-[0.8125rem] text-ink outline-none placeholder:text-ink-3"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={list[i] ? `cmd-${list[i].id}` : undefined}
          />
          <kbd className="data shrink-0 text-[0.625rem] text-ink-3">esc</kbd>
        </div>
        <ul id="palette-list" role="listbox" className="max-h-[52vh] overflow-y-auto py-1.5">
          {list.map((c, k) => (
            <li
              key={c.id}
              id={`cmd-${c.id}`}
              role="option"
              aria-selected={k === i}
              onMouseMove={() => setI(k)}
              onClick={() => run(c)}
              className={`flex cursor-pointer items-baseline justify-between gap-4 px-4 py-2 text-[0.875rem] ${
                k === i ? 'bg-accent-soft/60 text-accent' : 'text-ink-2'
              }`}
            >
              <span>{c.label}</span>
              <span className="data text-[0.625rem] uppercase tracking-[0.1em] text-ink-3">{c.hint}</span>
            </li>
          ))}
          {!list.length && <li className="px-4 py-3 text-micro text-ink-3">No matches.</li>}
        </ul>
        <div className="flex gap-5 border-t border-rule px-4 py-2 font-mono text-[0.625rem] uppercase tracking-[0.1em] text-ink-3">
          <span>↑↓ move</span>
          <span>↵ open</span>
          <span>G grid</span>
        </div>
      </div>
    </div>
  );
}
