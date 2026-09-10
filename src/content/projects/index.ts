import type { Project } from '@/lib/types';
import { astroguard } from './astroguard';
import { radioOptical } from './radio-optical';
import { adaptiveBeta } from './adaptive-beta';
import { ecoRewind } from './eco-rewind';
import { ssaIntel } from './ssa-intel';
import { revenueos } from './revenueos';

/**
 * Order is editorial, not chronological. It ranks by the depth of the
 * engineering story each project can carry in an interview.
 */
export const projects: Project[] = [astroguard, radioOptical, adaptiveBeta, ecoRewind, ssaIntel, revenueos];

export const projectSlugs = projects.map((p) => p.slug);

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export const allCategories = Array.from(new Set(projects.flatMap((p) => p.categories))).sort();
