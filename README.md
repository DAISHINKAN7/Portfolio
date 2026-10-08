# Kunal Ajgaonkar — AI/ML Engineering Portfolio

A production Next.js portfolio built as an interactive technical record of five AI/ML
engineering projects, rather than a résumé rendered as HTML.

---

## Run it

**Requirements:** Node.js 20 or newer (Next.js 16).

```bash
npm install       # install dependencies
npm run dev       # development server → http://localhost:3000
```

Other commands:

```bash
npm run build     # production build (also validates every page compiles)
npm start         # serve the production build → http://localhost:3000
npm run lint      # Next.js lint
```

Fonts are self-hosted via `@fontsource`, so the build works offline and the site makes
no third-party font requests at runtime.

---

> **Tip:** run `git init` inside this folder before `npm run dev`. Without it, Next.js
> warns that it cannot locate the project root and ignores `package-lock.json`.

---

## Before you publish — three edits

### 1. LinkedIn URL

`src/content/site.ts` → `profile.linkedin` is `null`. Paste your profile URL there and the
link appears in the header, footer, contact page and résumé page. While it is `null`,
nothing renders — so there is never a dead link.

```ts
linkedin: 'https://www.linkedin.com/in/your-handle',
```

### 2. Site URL

`src/content/site.ts` → `profile.siteUrl`. This is the public address the site will live
at. It is the base for every canonical URL, every Open Graph tag, `sitemap.xml` and
`robots.txt` — so search engines and link previews resolve to real pages instead of the
placeholder domain.

```ts
siteUrl: 'https://kunalajgaonkar.com',        // your own domain, or
siteUrl: 'https://kunal-portfolio.vercel.app', // the URL Vercel gives you
```

Deploy once, copy the URL Vercel prints, paste it here, redeploy. No trailing slash.
Until you change it, sharing a project link still works — the page just advertises the
wrong canonical address, which weakens SEO and can make previews look broken.

### 3. Social preview image — already done ✅

`src/app/opengraph-image.png` is in place (1200×630). Next.js picks it up automatically
and injects `og:image` into every page. You can confirm after deploying by pasting your
URL into <https://www.opengraph.xyz>.

To replace it later, overwrite that file. For a different image on one project, drop an
`opengraph-image.png` inside that route's folder (e.g. `src/app/projects/astroguard/`).

<details>
<summary>Original instructions, kept for reference</summary>

When you paste a project URL into LinkedIn, Slack or an email, the platform looks for an
Open Graph image. Right now there isn't one, so the preview shows title and description
text only.

To add one: create a **1200 × 630 px** PNG and save it as `src/app/opengraph-image.png`.
Next.js detects that filename automatically and wires it into every page's metadata — no
code changes needed. Keep the composition simple, since it renders small: your name, the
role line, and plenty of margin. The site's own palette works well (background `#F1F2EF`,
text `#15181A`, accent `#0E5A63`).

For a different image on a single project, drop an `opengraph-image.png` inside that
route's folder and it overrides the global one for that page.

</details>

---

## Folder structure

```
src/
├── app/                          routes (Next.js App Router)
│   ├── layout.tsx                shell, fonts, global metadata
│   ├── page.tsx                  homepage
│   ├── globals.css               design tokens + component classes
│   ├── not-found.tsx             404
│   ├── sitemap.ts, robots.ts     generated from the content layer
│   ├── projects/
│   │   ├── page.tsx              project index
│   │   └── [slug]/page.tsx       case study template (all five)
│   ├── credentials/
│   │   ├── page.tsx              grouped credential index
│   │   └── [slug]/page.tsx       credential detail + certificate viewer
│   ├── experience/ research/ skills/ resume/ about/ contact/
│
├── content/                      ← ALL COPY AND DATA LIVES HERE
│   ├── site.ts                   profile, experience, education, publications,
│   │                             skills, credentials, landscape map
│   └── projects/
│       ├── index.ts              ordering + lookup helpers
│       ├── astroguard.ts         one file per case study
│       ├── radio-optical.ts
│       ├── adaptive-beta.ts
│       ├── eco-rewind.ts
│       └── ssa-intel.ts
│
├── components/
│   ├── ui.tsx                    provenance tags, section heads, tables,
│   │                             metric strips, callouts, figures, links
│   ├── blocks.tsx                block renderer + diagram/chart registries
│   ├── project-cards.tsx         homepage feature + index row
│   ├── project-index.tsx         client-side filtering
│   ├── project-toc.tsx           sticky TOC with scroll spy
│   ├── landscape-map.tsx         interactive domain ↔ project map
│   ├── site-header.tsx / site-footer.tsx
│   ├── diagrams/                 hand-built SVG architecture diagrams
│   │   ├── primitives.tsx        Frame, Box, T, Arrow, colour tokens
│   │   └── astroguard|radio|beta|eco|ssa.tsx
│   └── charts/index.tsx          Recharts visualisations (client, code-split)
│
└── lib/types.ts                  the content schema

public/
├── kunal.jpg                     profile photo
├── Kunal_Ajgaonkar_Resume.pdf    downloadable résumé
├── resume-preview.jpg            résumé page-one preview
└── credentials/<slug>.{jpg,pdf}  certificate image + openable PDF
```

---

## Design system

Deliberately *not* the dark-background-and-neon-gradient look. The reference points are
research publications, engineering documentation and instrument output.

**Colour** — defined as Tailwind tokens in `tailwind.config.ts`:

| Token | Hex | Role |
|---|---|---|
| `paper` | `#F1F2EF` | cool plotter-paper surface |
| `paper-2` | `#E8EAE6` | recessed surface |
| `surface` | `#FFFFFF` | figure and diagram panels |
| `ink` / `ink-2` / `ink-3` | `#15181A` / `#4E565C` / `#7C858B` | text hierarchy |
| `rule` / `rule-2` | `#D2D6D1` / `#B6BCB6` | hairline structure |
| `accent` | `#0E5A63` | instrument teal — links, active state, primary data |
| `caution` | `#8F4F10` | **reserved semantically** for caveats, limitations and negative results |

The ochre is never decorative. If something is ochre, it is a caveat.

**Type** — the IBM Plex superfamily, one family in three roles:

- `font-display` — IBM Plex Sans Condensed, headings only
- `font-sans` — IBM Plex Sans, body
- `font-mono` — IBM Plex Mono, all numbers, labels, metadata and code

Type roles are CSS classes in `globals.css`: `.display-xl`, `.display-l`, `.display-m`,
`.display-s`, `.lede`, `.body`, `.eyebrow`, `.data`.

**Layout** — structure over decoration: 1px rules, an asymmetric grid, generous
whitespace, and almost no rounded rectangles. Cards appear only where the information
is genuinely card-shaped.

**The signature device — provenance.** Every claim-bearing figure carries a tag:

- `verified` — computed directly from committed repository artefacts
- `reported` — author-reported result whose raw artefacts are not committed
- `unmeasured` — extraction volume or descriptive statistic; no accuracy is claimed

This is the visual grammar of the whole site. It comes from the source dossiers, all of
which carry integrity ledgers, and it is why the portfolio can state a 97.60% accuracy
and its leakage caveat in the same breath.

---

## Motion system

Everything that moves is layered *on top of* the static design — with JavaScript off or
`prefers-reduced-motion` on, every page renders exactly as described above. There are no
animation libraries: one shared `requestAnimationFrame` clock, a ~200-line WebGL renderer
and CSS custom properties. The whole layer adds roughly 33 KB gzipped, of which ~12 KB is
on the critical path; the WebGL scenes and project traces load lazily near the viewport.

**Two families of movement**, deliberately contrasted (`src/lib/motion.ts`):

- *computational* — eased, exact, deterministic: rules drawing across, reveals, counters,
  data flowing through a figure
- *physical* — spring-integrated: magnetic buttons, tilting panels, the cursor's crop
  marks, nodes bending toward the pointer

**Where things live**

| Path | What it does |
|---|---|
| `src/lib/motion.ts` | easing curves, durations, `Spring`, perf-tier and reduced-motion detection |
| `src/lib/runtime.ts` | the single rAF clock (pauses when idle or hidden), shared pointer and scroll state |
| `src/lib/gl/` | minimal WebGL renderer (points + hairlines, custom shaders) and matrix helpers |
| `src/components/motion/enhancers.ts` | delegated listeners that animate server-rendered markup via data attributes |
| `src/components/motion/cursor.tsx` | dot + spring-driven crop marks; fine pointers only |
| `src/components/motion/page-transitions.tsx` | View Transitions with shared-element morphs into case studies |
| `src/components/motion/boot.tsx` | one-second boot log, home page, first visit per session, skippable |
| `src/components/hero/` | the hero network: tokens → embeddings → model → outputs |
| `src/components/viz/traces/` | one small live figure per project, built from the case study's own values |
| `src/components/viz/stack-graph*.tsx` | 3D force-directed skill ↔ project graph from `skillGroups` evidence |
| `src/components/motion/marquee.tsx` | full-bleed kinetic type band; speed and lean follow scroll velocity |
| `src/components/motion/scrub-text.tsx` | text that is read in word by word as it scrolls up the viewport |
| `src/components/hero/portrait-lens.tsx` | hover lens over the portrait running a real 3×3 Sobel filter |
| `src/components/motion/footer-wordmark.tsx` | oversized footer name; letters lift toward the cursor on springs |

**Data attributes** — server components opt in without becoming client components:

| Attribute | Effect |
|---|---|
| `data-reveal` / `data-reveal="group"` + `data-r` | one-shot entrance; children stagger via `--rd` |
| `data-r="title"` | heading emerges from a slot instead of fading |
| `data-scroll` | receives `--sp` / `--se` / `--sx` scroll progress (0–1) |
| `data-sheet` | lifts like a sheet of paper as it scrolls in (needs `data-scroll`) |
| `data-tilt="4"` + `data-depth` | spring tilt with moving light; `data-depth` children float forward |
| `data-magnetic="0.3"` | magnetic pull (every `.btn` has it by default) |
| `data-cursor="open" \| "scene"` + `data-cursor-label` | contextual cursor state |
| `data-vt-scope` + `data-vt` | elements that morph across a page transition |

**Honesty rule for the traces** — every trace is tagged `schematic`. Names, thresholds and
figures in them come from the case-study content; motion and intermediate states are
illustrative. Do not put a number in a trace that is not already on the case-study page.

**Things to find** — `⌘K` / `/` opens a command palette, `G` overlays the layout grid, the
console has a note, and the Konami code does something to the hero. Press and hold inside
the hero, too.

---

## Content model

A project is a `Project` object (`src/lib/types.ts`) with hero metadata plus an array of
`Section`s. Each section holds an array of typed `Block`s, rendered by
`components/blocks.tsx`:

| Block | Use |
|---|---|
| `lede` / `prose` | narrative text |
| `quote` | a thesis or claim boundary given full weight |
| `callout` | `insight` / `caution` / `note` |
| `metrics` | a metric strip, 3–5 columns |
| `table` | data table with numeric alignment, row emphasis and a provenance tag |
| `list` | ordered or unordered, with an optional heading |
| `steps` | numbered pipeline stages with an optional source-file label |
| `definitions` | term-and-explanation pairs |
| `challenges` | problem / difficulty / approach / outcome, four-up |
| `limitations` | severity-tagged defect with its planned fix |
| `code` | excerpt with a mandatory "why this matters" caption |
| `diagram` | keyed into the SVG diagram registry |
| `chart` | keyed into the Recharts registry, code-split |

---

## Adding a new project

1. Create `src/content/projects/my-project.ts` exporting a `Project`. Copy an existing
   file as the template — `ssa-intel.ts` is the most representative.
2. Register it in `src/content/projects/index.ts`. **Array order is the editorial
   ranking** used by the homepage, index and footer.
3. If it needs a bespoke diagram, add a component under `src/components/diagrams/` using
   the `Frame` / `Box` / `T` primitives, then register its id in the `DIAGRAMS` map in
   `components/blocks.tsx`. Set `heroDiagram` to that id.
4. If it needs a chart, add it to `src/components/charts/index.tsx` and register the id
   in the `CHARTS` map in `components/blocks.tsx`.
5. Add its slug to relevant `landscape` domains and `skillGroups` evidence arrays in
   `src/content/site.ts` so it appears in the map and on the skills page.

The route, metadata, sitemap entry, TOC, related-work links and filters all follow
automatically. Nothing else needs touching.

## Updating an existing project

Edit only its file in `src/content/projects/`. Copy and data are fully separated from
layout — you should never need to open a component to change a number.

## Adding a credential

Drop `public/credentials/<slug>.jpg` and `public/credentials/<slug>.pdf`, then add an
entry to `credentials` in `src/content/site.ts`. The detail route generates itself.

---

## Deploying

**Vercel (recommended):**

```bash
npm i -g vercel
vercel            # preview
vercel --prod     # production
```

Or push to GitHub and import the repository at vercel.com — no configuration required.

**Anywhere Node runs:**

```bash
npm run build
npm start         # binds PORT, default 3000
```

**Static export** is possible (`output: 'export'` in `next.config.mjs`) since every route
is already statically generated — you would need to disable image optimisation.

---

## Chart data keys and Recharts

Recharts' `LabelList` spreads every field of a data row onto the SVG `<text>` it renders.
A row field that shares a name with an SVG attribute (`d`, `r`, `fill`, `transform`…)
therefore leaks into the DOM — a boolean `d` produced the old
`Received false for a non-boolean attribute d` dev warning. Give chart rows descriptive
keys (`debate`, `ours`, `value`) rather than single letters. Recharts is pinned to
`2.15.4`; 3.x changes its TypeScript formatter signatures and needs a small migration in
`src/components/charts/index.tsx`.

---

## Accessibility and performance notes

- Semantic landmarks, a skip link, logical heading order and visible focus rings.
- The landscape map carries a full text equivalent below the SVG for keyboard and screen
  reader users; no information is hover-only.
- Diagrams pan horizontally on narrow screens rather than shrinking labels below
  legibility, and the project TOC becomes a disclosure on mobile instead of a squeezed rail.
- `prefers-reduced-motion` is respected globally: entrance animations, the cursor, page
  transitions and the boot screen are disabled, and the WebGL scenes and project traces
  render a single, settled still frame instead of animating.
- Every animation loop pauses when its element is off screen or the tab is hidden, and
  particle density steps down on low-core, low-memory, small-screen or Save-Data devices.
- Touch devices get no custom cursor; the traces respond to press-and-drag and the hero
  network to taps instead.
- Charts are client components loaded per-route; diagrams are server-rendered SVG.
- All 32 routes are statically generated at build time.
