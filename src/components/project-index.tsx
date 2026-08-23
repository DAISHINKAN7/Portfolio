'use client';

import { useMemo, useState } from 'react';
import { projects } from '@/content/projects';
import { ProjectRow } from '@/components/project-cards';

export function ProjectIndex() {
  const [filter, setFilter] = useState<string>('All');

  const filtered = useMemo(
    () => (filter === 'All' ? projects : projects.filter((p) => p.categories.includes(filter))),
    [filter]
  );

  // Curated rather than derived: showing all sixteen tags produced a wall of
  // near-empty filters. These are the domains a reviewer would actually filter by.
  const options = [
    'All',
    'Agentic AI',
    'Deep Learning',
    'Computer Vision',
    'NLP',
    'Multimodal AI',
    'Quantitative ML',
    'Knowledge Graphs',
    'Research',
  ];

  return (
    <>
      <div className="rule-t rule-b flex flex-wrap items-center gap-x-1 gap-y-2 py-3" role="group" aria-label="Filter projects by domain">
        {options.map((c) => {
          const on = filter === c;
          const count = c === 'All' ? projects.length : projects.filter((p) => p.categories.includes(c)).length;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              aria-pressed={on}
              className={`px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] transition-colors duration-180 ${
                on ? 'bg-ink text-paper' : 'text-ink-2 hover:text-accent'
              }`}
            >
              {c}
              <span className={`ml-2 ${on ? 'text-paper/60' : 'text-ink-3'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        {filtered.length} projects shown
      </p>

      <div>
        {filtered.map((p, i) => (
          <ProjectRow key={p.slug} project={p} index={projects.indexOf(p)} />
        ))}
      </div>
    </>
  );
}
