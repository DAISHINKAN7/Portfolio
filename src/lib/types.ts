export type Provenance = 'verified' | 'reported' | 'unmeasured';

export type Metric = {
  value: string;
  label: string;
  note?: string;
  prov?: Provenance;
  tone?: 'default' | 'caution';
};

export type Block =
  | { type: 'prose'; text: string[] }
  | { type: 'lede'; text: string }
  | { type: 'quote'; text: string; source?: string }
  | { type: 'callout'; tone: 'insight' | 'caution' | 'note'; title: string; body: string }
  | { type: 'metrics'; cols?: 3 | 4 | 5; items: Metric[] }
  | {
      type: 'table';
      caption?: string;
      prov?: Provenance;
      head: string[];
      rows: string[][];
      num?: number[];
      emphasis?: number[];
    }
  | { type: 'list'; ordered?: boolean; title?: string; items: string[] }
  | { type: 'steps'; items: { n: string; title: string; body: string; meta?: string }[] }
  | {
      type: 'challenges';
      items: {
        title: string;
        problem: string;
        difficulty: string;
        approach: string;
        outcome: string;
      }[];
    }
  | {
      type: 'limitations';
      items: { severity: 'critical' | 'high' | 'medium' | 'low'; title: string; detail: string; fix: string }[];
    }
  | { type: 'code'; lang: string; file: string; why: string; code: string }
  | { type: 'diagram'; id: string; caption: string; prov?: Provenance }
  | { type: 'chart'; id: string; caption: string; prov?: Provenance }
  | {
      type: 'image';
      src: string;
      alt: string;
      caption: string;
      prov?: Provenance;
      theme?: 'dark' | 'light';
    }
  | { type: 'definitions'; items: { term: string; body: string }[] };

export type Section = {
  id: string;
  nav: string;
  title: string;
  kicker?: string;
  blocks: Block[];
};

export type Project = {
  slug: string;
  name: string;
  wordmark: string;
  subtitle: string;
  hook: string;
  summary: string;
  domainLine: string;
  categories: string[];
  period: string;
  role: string;
  status: string;
  statusTone: 'prototype' | 'benchmark' | 'live';
  repo: string;
  demo?: string;
  scale: string;
  headline: Metric;
  cardMetrics: Metric[];
  tech: string[];
  techGrouped: { group: string; items: string[] }[];
  glance: { k: string; v: string }[];
  heroDiagram: string;
  accentIndex: number;
  sections: Section[];
  related: string[];
};
