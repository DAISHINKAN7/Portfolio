import type { MetadataRoute } from 'next';
import { projects } from '@/content/projects';
import { credentials, profile } from '@/content/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = profile.siteUrl;
  const now = new Date();

  const stat = ['', '/projects', '/experience', '/research', '/skills', '/credentials', '/resume', '/about', '/contact'].map(
    (p) => ({
      url: `${base}${p}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: p === '' ? 1 : p === '/projects' ? 0.9 : 0.7,
    })
  );

  const proj = projects.map((p) => ({
    url: `${base}/projects/${p.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  const creds = credentials.map((c) => ({
    url: `${base}/credentials/${c.slug}`,
    lastModified: now,
    changeFrequency: 'yearly' as const,
    priority: 0.3,
  }));

  return [...stat, ...proj, ...creds];
}
