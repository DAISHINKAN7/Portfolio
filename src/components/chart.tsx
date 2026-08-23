'use client';

import dynamic from 'next/dynamic';

/**
 * Charts are Recharts-based and browser-only, so they are dynamically imported
 * with `ssr: false`. That option is only legal inside a Client Component, which
 * is why this registry lives in its own 'use client' module rather than in
 * blocks.tsx (a Server Component). Each entry is code-split, so a page only
 * downloads the charts it actually renders.
 */

const skeleton = () => <div className="h-[300px] w-full animate-pulse bg-paper-2" />;

const load = (name: string) =>
  dynamic(() => import('./charts').then((m) => ({ default: (m as any)[name] })), {
    ssr: false,
    loading: skeleton,
  });

const CHARTS: Record<string, React.ComponentType> = {
  'astroguard-corpus': load('AstroguardCorpus'),
  'astroguard-telemetry': load('AstroguardTelemetry'),
  'radio-results': load('RadioResults'),
  'beta-range': load('BetaRange'),
  'beta-models': load('BetaModels'),
  'beta-shap': load('BetaShap'),
  'beta-riskreturn': load('BetaRiskReturn'),
  'beta-stress': load('BetaStress'),
  'eco-attribution': load('EcoAttribution'),
  'ssa-f1': load('SsaF1'),
};

export function Chart({ id }: { id: string }) {
  const C = CHARTS[id];
  return C ? <C /> : null;
}
