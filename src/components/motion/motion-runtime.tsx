'use client';

import { useEffect, useState } from 'react';
import { hasFinePointer, prefersReducedMotion } from '@/lib/motion';
import { bindInputs } from '@/lib/runtime';
import { initEnhancers } from './enhancers';
import { Cursor } from './cursor';
import { PageTransitions } from './page-transitions';
import { EasterEggs } from './easter-eggs';
import { runBoot } from './boot';

/** Mounted once in the root layout. Owns every global motion concern. */
export function MotionRuntime() {
  const [env, setEnv] = useState<{ fine: boolean; motion: boolean } | null>(null);

  useEffect(() => {
    const read = () => ({ fine: hasFinePointer(), motion: !prefersReducedMotion() });
    const html = document.documentElement;
    (window as Window & { __motion?: boolean }).__motion = true;
    bindInputs();
    const endBoot = runBoot();

    const apply = () => {
      const e = read();
      html.classList.toggle('motion', e.motion);
      html.dataset.pointer = e.fine ? 'fine' : 'coarse';
      setEnv(e);
    };
    apply();

    // Respond live if the visitor flips the OS setting or docks a mouse.
    const mq = [window.matchMedia('(prefers-reduced-motion: reduce)'), window.matchMedia('(hover: hover) and (pointer: fine)')];
    mq.forEach((m) => m.addEventListener('change', apply));
    return () => {
      endBoot();
      mq.forEach((m) => m.removeEventListener('change', apply));
    };
  }, []);

  useEffect(() => {
    if (!env) return;
    return initEnhancers(env);
  }, [env]);

  if (!env) return null;
  return (
    <>
      {env.fine && env.motion && <Cursor />}
      {env.motion && <PageTransitions />}
      <EasterEggs motion={env.motion} />
    </>
  );
}

/**
 * Runs before first paint. Adds `motion` only for visitors who have not asked
 * for reduced motion, and removes it again if the app fails to boot, so a
 * script error can never leave content hidden behind an entrance animation.
 */
export const motionBootScript = `(function(){try{var d=document.documentElement;if(!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('motion');try{if(location.pathname==='/'&&!sessionStorage.getItem('kb'))d.classList.add('booting')}catch(e){}setTimeout(function(){if(!window.__motion){d.classList.remove('motion');d.classList.remove('booting')}},3500)}}catch(e){}})();`;
