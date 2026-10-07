'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type VTDocument = Document & {
  startViewTransition?: (cb: () => Promise<void>) => { finished: Promise<void>; updateCallbackDone: Promise<void> };
};

/**
 * Route changes run inside the View Transitions API where supported.
 *
 * The outgoing page lifts away, the incoming page rises into place — and when
 * the click came from a project, that project's title and figure are tagged so
 * they morph directly into the case-study header instead of cross-fading.
 * Browsers without the API navigate exactly as before.
 */
/** Land at the top, or at the anchor the link pointed to. */
function land(hash: string) {
  const target = hash && document.getElementById(hash.slice(1));
  if (target) target.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
  else window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
}

export function PageTransitions() {
  const router = useRouter();
  const path = usePathname();
  const settle = useRef<(() => void) | null>(null);
  const hash = useRef('');

  useEffect(() => {
    if (settle.current) land(hash.current);
    settle.current?.();
    settle.current = null;
    delete document.documentElement.dataset.nav;
  }, [path]);

  useEffect(() => {
    const doc = document as VTDocument;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a');
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      if (/\.[a-z0-9]{2,4}$/i.test(url.pathname)) return; // files: pdf, images, xml

      document.documentElement.dataset.nav = 'loading';
      if (!doc.startViewTransition) return; // Next's Link handles it; header still shows progress.

      e.preventDefault();
      const href = url.pathname + url.search + url.hash;
      hash.current = url.hash;

      // Shared-element morph: only the clicked project's parts get names,
      // so nothing else on the outgoing page flies across the screen.
      const scope = a.closest<HTMLElement>('[data-vt-scope]');
      const tagged: HTMLElement[] = [];
      if (scope && scope.dataset.vtScope === url.pathname.split('/').pop()) {
        scope.querySelectorAll<HTMLElement>('[data-vt]').forEach((el) => {
          el.style.setProperty('view-transition-name', el.dataset.vt!);
          tagged.push(el);
        });
      }

      const vt = doc.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            settle.current = resolve;
            router.push(href);
            setTimeout(resolve, 2500);
          })
      );
      // Chrome can drop a scroll made while rendering is suspended for the
      // transition, so assert the landing position again once it resumes.
      vt.updateCallbackDone.then(() => requestAnimationFrame(() => land(url.hash)));
      vt.finished.finally(() => tagged.forEach((el) => el.style.removeProperty('view-transition-name')));
    };
    // Capture phase so this runs before Next's Link handler, which respects
    // defaultPrevented and steps aside.
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [router]);

  return null;
}
