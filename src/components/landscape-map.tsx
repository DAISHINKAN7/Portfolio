'use client';

import Link from 'next/link';
import { useState } from 'react';
import { landscape } from '@/content/site';
import { projects } from '@/content/projects';

/**
 * A bipartite map: technical domains on the left, projects on the right.
 * Hovering or focusing either side highlights the edges that connect them,
 * so the coherence across the body of work is legible rather than asserted.
 * Everything remains readable with no interaction at all.
 */
export function LandscapeMap() {
  const [hot, setHot] = useState<{ kind: 'domain' | 'project'; id: string } | null>(null);

  const W = 1000;
  const rowD = 44;
  const rowP = 74;
  const topD = 40;
  const topP = 56;
  const xD = 300;
  const xP = 660;

  const dY = (i: number) => topD + i * rowD;
  const pY = (i: number) => topP + i * rowP;
  const pIndex = (slug: string) => projects.findIndex((p) => p.slug === slug);

  const isEdgeHot = (dId: string, slug: string) =>
    hot?.kind === 'domain' ? hot.id === dId : hot?.kind === 'project' ? hot.id === slug : false;

  const domainDim = (dId: string) =>
    hot?.kind === 'project' && !landscape.find((d) => d.id === dId)?.projects.includes(hot.id);
  const projDim = (slug: string) =>
    hot?.kind === 'domain' && !landscape.find((d) => d.id === hot.id)?.projects.includes(slug);

  const height = Math.max(dY(landscape.length), pY(projects.length)) + 24;

  return (
    <div className="scroll-x">
      <svg
        viewBox={`0 0 ${W} ${height}`}
        style={{ minWidth: 720, width: '100%', height: 'auto', display: 'block' }}
        role="img"
        aria-label="Map connecting technical domains to the projects that evidence them"
        onMouseLeave={() => setHot(null)}
      >
        <text x={24} y={22} fontSize={9} fill="#7C858B" letterSpacing={1.2} style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
          Technical domain
        </text>
        <text x={xP} y={22} fontSize={9} fill="#7C858B" letterSpacing={1.2} style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
          Evidenced by
        </text>

        {/* edges first, so nodes sit above them */}
        {landscape.map((d, di) =>
          d.projects.map((slug) => {
            const pi = pIndex(slug);
            if (pi < 0) return null;
            const y1 = dY(di) + 12;
            const y2 = pY(pi) + 22;
            const on = isEdgeHot(d.id, slug);
            const dim = hot && !on;
            return (
              <path
                key={`${d.id}-${slug}`}
                d={`M${xD + 14} ${y1} C ${xD + 130} ${y1}, ${xP - 140} ${y2}, ${xP - 14} ${y2}`}
                fill="none"
                stroke={on ? '#0E5A63' : '#D2D6D1'}
                strokeWidth={on ? 1.6 : 1}
                opacity={dim ? 0.25 : 1}
                style={{ transition: 'stroke 180ms, opacity 180ms' }}
              />
            );
          })
        )}

        {/* domains */}
        {landscape.map((d, i) => {
          const y = dY(i);
          const dim = domainDim(d.id);
          const on = hot?.kind === 'domain' && hot.id === d.id;
          return (
            <g
              key={d.id}
              onMouseEnter={() => setHot({ kind: 'domain', id: d.id })}
              style={{ cursor: 'default', opacity: dim ? 0.35 : 1, transition: 'opacity 180ms' }}
            >
              <text
                x={xD}
                y={y + 16}
                textAnchor="end"
                fontSize={15}
                fill={on ? '#0E5A63' : '#15181A'}
                fontWeight={on ? 600 : 400}
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {d.label}
              </text>
              <circle cx={xD + 12} cy={y + 12} r={on ? 4 : 3} fill={on ? '#0E5A63' : '#B6BCB6'} />
              <rect x={xD - 200} y={y - 4} width={218} height={30} fill="transparent" />
            </g>
          );
        })}

        {/* projects */}
        {projects.map((p, i) => {
          const y = pY(i);
          const dim = projDim(p.slug);
          const on = hot?.kind === 'project' && hot.id === p.slug;
          return (
            <g
              key={p.slug}
              onMouseEnter={() => setHot({ kind: 'project', id: p.slug })}
              style={{ opacity: dim ? 0.35 : 1, transition: 'opacity 180ms' }}
            >
              <circle cx={xP - 12} cy={y + 22} r={on ? 4 : 3} fill={on ? '#0E5A63' : '#B6BCB6'} />
              <line x1={xP} y1={y} x2={W - 24} y2={y} stroke="#D2D6D1" />
              <a href={`/projects/${p.slug}`}>
                <rect x={xP} y={y} width={W - 24 - xP} height={58} fill="transparent" />
                <text
                  x={xP + 2}
                  y={y + 26}
                  fontSize={16}
                  fontWeight={600}
                  fill={on ? '#0E5A63' : '#15181A'}
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {p.name}
                </text>
                <text x={xP + 2} y={y + 46} fontSize={11.5} fill="#4E565C" style={{ fontFamily: 'var(--font-body)' }}>
                  {p.subtitle.length > 46 ? p.subtitle.slice(0, 44) + '…' : p.subtitle}
                </text>
              </a>
            </g>
          );
        })}
      </svg>

      {/* Keyboard- and screen-reader-accessible equivalent of the same relations. */}
      <div className="mt-8 grid gap-x-10 gap-y-4 border-t border-rule pt-6 sm:grid-cols-2 lg:grid-cols-3">
        {landscape.map((d) => (
          <div key={d.id}>
            <p className="eyebrow mb-2">{d.label}</p>
            <ul className="flex flex-wrap gap-x-3 gap-y-1">
              {d.projects.map((slug) => {
                const p = projects.find((x) => x.slug === slug)!;
                return (
                  <li key={slug}>
                    <Link href={`/projects/${slug}`} className="link text-micro">
                      {p.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
