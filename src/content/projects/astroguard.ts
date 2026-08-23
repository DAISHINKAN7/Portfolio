import type { Project } from '@/lib/types';

export const astroguard: Project = {
  slug: 'astroguard',
  name: 'AstroGuard',
  wordmark: 'AstroGuard',
  subtitle: 'Multi-Agent RAG for Orbital Debris Risk Assessment',
  hook: 'Four AI experts debate orbital debris risk, and every claim carries a citation.',
  summary:
    'A fully-local multi-agent RAG system where four domain-isolated agents analyse a 150-document ISRO/ESA space-debris corpus, critique each other across two structured debate rounds, and are merged by a weighted supervisor into a citation-grounded risk verdict.',
  domainLine: 'Multi-agent systems · Retrieval-augmented generation · Knowledge graphs',
  categories: ['Agentic AI', 'Retrieval Systems', 'Knowledge Graphs', 'LLM Engineering'],
  period: 'Dec 2025 — Mar 2026',
  role: 'Sole author — architecture, implementation, evaluation',
  status: 'Research prototype · local execution',
  statusTone: 'prototype',
  repo: 'https://github.com/DAISHINKAN7/AstroGaurd',
  scale: '~3,900 lines of Python across 13 modules',
  headline: {
    value: '20.4 pts',
    label: 'stable risk divergence between the technical and media agents',
    note: 'Debris Physicist 36.1 vs Media Sentinel 15.7, across 88 runs',
    prov: 'verified',
  },
  cardMetrics: [
    { value: '18,019', label: 'indexed chunks', prov: 'verified' },
    { value: '1,096', label: 'cited facts', prov: 'verified' },
    { value: '11.9', label: 'GPU-hours swept', prov: 'verified' },
    { value: '₹0', label: 'inference cost', prov: 'verified' },
  ],
  tech: ['Python', 'PyTorch', 'Qwen2.5-7B', 'LanceDB', 'NetworkX', 'bge-m3', 'bitsandbytes'],
  techGrouped: [
    { group: 'Generation', items: ['Qwen2.5-7B-Instruct', 'transformers', 'bitsandbytes 4-bit NF4', 'PyTorch 2.0+'] },
    { group: 'Embeddings', items: ['BAAI/bge-m3', 'intfloat/e5-large (fallback)', 'sentence-transformers'] },
    { group: 'Vector store', items: ['LanceDB', 'IVF-PQ ANN index', 'cosine metric', 'PyArrow'] },
    { group: 'Knowledge graph', items: ['NetworkX DiGraph', 'regex NER', 'depth-2 BFS traversal'] },
    { group: 'Ingestion', items: ['PyMuPDF', 'pdfplumber', 'tiktoken', 'langchain-text-splitters'] },
    { group: 'Orchestration', items: ['ThreadPoolExecutor', 'JSON-Schema-forced tool calls'] },
  ],
  glance: [
    { k: 'Problem', v: 'Orbital-debris risk for Indian missions is smeared across four literatures that contradict each other. A single retriever averages them into confident mush and destroys the citation chain.' },
    { k: 'Approach', v: 'Four epistemically isolated agents with chunk-level access control over the corpus, forced to cite, made to argue across two rounds, merged by a weighted supervisor.' },
    { k: 'Corpus', v: '150 documents · 18,019 chunks · 3.2M tokens · 2012–2025' },
    { k: 'Retrieval', v: 'Dense (bge-m3 → LanceDB IVF-PQ, ACL-filtered) fused with symbolic BFS over a 3,927-node / 12,554-edge knowledge graph' },
    { k: 'Execution', v: '47-query corpus-wide batch, 42 completed, 11.86 GPU-hours, zero API keys' },
    { k: 'Deliberately absent', v: 'No accuracy, F1 or faithfulness score exists. There is no labelled ground truth for this domain — all reported figures describe system behaviour, not correctness.' },
  ],
  heroDiagram: 'astroguard-swarm',
  accentIndex: 0,
  related: ['ssa-intel', 'radio-optical-classification'],
  sections: [
    {
      id: 'problem',
      nav: 'Problem',
      title: 'Four literatures that do not talk to each other',
      blocks: [
        {
          type: 'lede',
          text: 'Low Earth Orbit is filling with debris and India launches into it regularly — but no single document answers "how risky is this, really?"',
        },
        {
          type: 'prose',
          text: [
            'Assessing orbital-debris risk for a mission is a cross-disciplinary retrieval problem. The answer is never in one place. It is spread across four bodies of literature written for different audiences, with different standards of evidence, that frequently contradict one another.',
          ],
        },
        {
          type: 'table',
          caption: 'The four evidence domains and what each one actually knows',
          head: ['Discipline', 'Sources', 'What it knows'],
          rows: [
            [
              'Policy',
              'Indian Space Policy 2023, IADC guidelines, ISO 24113, Lok Sabha questions, PIB releases, ISRO Annual Reports',
              'Compliance obligations, legal liability, government commitments',
            ],
            [
              'Physics',
              'ESA Annual Space Debris Reports, NASA debris assessments, mitigation research, solar storm reports',
              'Fragment populations, collision probability, orbital lifetimes, Kessler dynamics',
            ],
            [
              'History',
              'ISSAR reports, launch mission catalogues, TLE orbital datasets',
              'Precedent, upper-stage breakups, passivation record, conjunction events',
            ],
            [
              'Perception',
              'English-language news coverage of debris events',
              'Narrative framing, reputational risk, public concern signals',
            ],
          ],
        },
        {
          type: 'callout',
          tone: 'note',
          title: 'Why naive RAG collapses here',
          body: 'A single retriever over all four literatures mixes ESA technical annexes with newspaper op-eds inside one context window. The model then averages contradictory framings into confident mush — and the citation chain is destroyed, because you cannot tell whether a claim came from a peer-reviewed debris model or a headline.',
        },
      ],
    },
    {
      id: 'thesis',
      nav: 'Thesis',
      title: 'The design commitment',
      blocks: [
        {
          type: 'quote',
          text: 'Don\u2019t build one retriever. Build four epistemically isolated experts, force them to cite, then make them argue.',
        },
        {
          type: 'steps',
          items: [
            {
              n: '01',
              title: 'Isolation is enforced in the data layer, not the prompt',
              body: 'Each agent has a hard, chunk-level access control list over the corpus. The Debris Physicist physically cannot retrieve a news article; the Media Sentinel physically cannot retrieve an ESA technical annex. The ACL is a column written into every row of the vector database at index time and applied as a filter after nearest-neighbour search. A Physicist prompt-injected with "also consider the media framing" still retrieves exactly zero news chunks.',
            },
            {
              n: '02',
              title: 'Disagreement becomes signal, not noise',
              body: 'Because the agents see different evidence, disagreement means something. The system captures those disagreements as structured records rather than letting them wash out inside an averaged embedding.',
            },
            {
              n: '03',
              title: 'Citation is structural, not requested',
              body: 'Every fact object in the output schema has doc_id as a required field. An uncited fact is not discouraged — it is unrepresentable in the output format.',
            },
          ],
        },
      ],
    },
    {
      id: 'architecture',
      nav: 'Architecture',
      title: 'Six stages, two of which run per query',
      blocks: [
        { type: 'diagram', id: 'astroguard-pipeline', caption: 'Stages 1–4 build the index once. Stages 5–6 run on every query, and stage 6 writes discoveries back into the graph that stage 4 built.' },
        {
          type: 'steps',
          items: [
            {
              n: '1—2',
              title: 'Ingestion & chunking',
              meta: 'pipeline.py',
              body: '150 raw documents in PDF, TXT, TLE and CSV. PyMuPDF as the primary extractor with pdfplumber as fallback. The raw corpus is mixed Hindi/English, so the Unicode block U+0900–U+097F is stripped and four Hindi-only directories are routed to an ignore list. Chunking runs MarkdownHeaderTextSplitter first to respect document structure, then RecursiveCharacterTextSplitter at 1000 tokens with 200-token overlap measured with tiktoken cl100k_base. News articles under 1,200 tokens are kept whole to preserve article-level coherence.',
            },
            {
              n: '3',
              title: 'Embedding & vector index',
              meta: 'embed_and_index.py',
              body: 'bge-m3 embeddings, normalised so dot product equals cosine similarity, written to LanceDB. An IVF-PQ ANN index is built automatically once record count reaches 256, with parameters auto-scaled to corpus size. It degrades gracefully to brute-force scan if index creation fails. The agent_allowed list is serialised onto every row — this is where the ACL physically lives.',
            },
            {
              n: '4',
              title: 'Knowledge graph construction',
              meta: 'graph_builder.py',
              body: 'Curated regex NER across six entity classes builds a NetworkX DiGraph of 3,927 nodes and 12,554 edges over ten typed relations, persisted as .pkl for loading speed and .json for human inspection.',
            },
            {
              n: '5',
              title: 'Multi-agent swarm',
              meta: 'agent_swarm.py',
              body: 'Five sequential steps: decompose the query into four disjoint subtasks; run all four agents in parallel; debate round one (cross-critique); debate round two (refinement); supervisor synthesis. Agent failures are caught individually — a dead agent is logged and dropped, and the swarm proceeds on three of four rather than losing a fifteen-minute run.',
            },
            {
              n: '6',
              title: 'Output & memory',
              meta: 'report_generator.py · memory.py',
              body: 'A structured synthesis.json carrying the full debate transcript and telemetry, plus a human-readable markdown report. SwarmMemory then writes discoveries back into the knowledge graph as query_assessment nodes linked by confidence-weighted ASSESSED_IN edges. The graph grows every time the system is used.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'insight',
          title: 'Two orthogonal retrieval paths, fused',
          body: 'Vector search finds text that sounds like the query. Graph traversal finds facts structurally linked to it. PSLV-C55 —CARRIED_SATELLITE→ TeLEOS-2 —USES_ORBIT→ LEO spans three separate documents that no single embedding would ever co-rank. Both results are formatted into one context block under a 9,000-character budget, with every chunk headed by its doc_id, page, year and similarity score — that header is what the agent cites from.',
        },
        {
          type: 'table',
          caption: 'Knowledge graph — typed relations and edge counts',
          prov: 'verified',
          head: ['Relation', 'Edges'],
          num: [1],
          rows: [
            ['MENTIONS', '10,220'],
            ['CARRIED_SATELLITE', '1,172'],
            ['USES_ORBIT', '377'],
            ['PLACED_IN_ORBIT', '365'],
            ['OPERATES', '208'],
            ['GOVERNED_BY', '104'],
            ['OCCURRED_IN_ORBIT', '43'],
            ['RESPONDED_TO', '39'],
            ['APPLIES_TO', '22'],
            ['ASSOCIATED_WITH_DEBRIS', '4'],
          ],
        },
      ],
    },
    {
      id: 'agents',
      nav: 'The swarm',
      title: 'Four agents, two rounds of argument, one verdict',
      blocks: [
        { type: 'diagram', id: 'astroguard-swarm', caption: 'All four agents are thin subclasses of a shared BaseAgent. The substantive differences are the domain prompt, the corpus slice the ACL grants them, and a retrieval_k tuned to that slice\u2019s density.' },
        {
          type: 'table',
          caption: 'Agent corpus slices, retrieval tuning and observed mean risk',
          prov: 'verified',
          head: ['Agent', 'Corpus slice', 'retrieval_k', 'Mean risk /100'],
          num: [2, 3],
          rows: [
            ['Policy Oracle', '7,789 chunks — ISRO annual reports, ISP-2023, Lok Sabha, PIB', '12', '29.5'],
            ['Debris Physicist', '5,110 chunks — ESA debris reports, mitigation RPs, solar storm', '12', '36.1'],
            ['Mission Historian', '1,307 chunks — launch catalogue, ISSAR, TLE files', '15', '25.1'],
            ['Media Sentinel', '131 chunks — English debris news only', '8', '15.7'],
          ],
        },
        {
          type: 'prose',
          text: [
            'The retrieval_k values are not uniform because the corpus slices are not uniform. The historical corpus is dense per document, so it fetches more; the news corpus is small and repetitive, so fetching more would dilute the context with near-duplicates.',
          ],
        },
        {
          type: 'callout',
          tone: 'insight',
          title: 'The headline finding: a 20.4-point divergence',
          body: 'Debris Physicist (36.1) minus Media Sentinel (15.7) = 20.4 points, stable across 88 runs. This is quantitative evidence that technical debris risk consistently outruns its media salience — exactly the signal a single averaged retriever would have flattened into nothing. It is the clearest demonstration that the architecture bought something real.',
        },
        {
          type: 'table',
          caption: 'The debate is structurally asymmetric — and that asymmetry is the whole point',
          head: ['Round', 'What the agent is shown', 'What the schema forces it to emit'],
          rows: [
            [
              'R1 · Critique',
              'Its own analysis plus all three peers\u2019 analyses',
              'agreements[], disagreements[{claim, your_counter, evidence_reference}], missing_aspects[], severity ∈ {LOW, MEDIUM, HIGH, CRITICAL}',
            ],
            [
              'R2 · Refine',
              'Only the critiques targeting itself, filtered by target_agent',
              'addressed_critiques[] AND maintained_positions[{position, justification}]',
            ],
          ],
        },
        {
          type: 'prose',
          text: [
            'The R2 schema is the clever part. An agent cannot silently capitulate and cannot silently ignore — it must log what it changed, or log what it kept and why. Every position shift across the entire 47-query batch is on the record and auditable. That is the difference between a debate that produces accountability and one that produces theatre.',
          ],
        },
        {
          type: 'code',
          lang: 'python',
          file: 'agents/supervisor.py',
          why: 'The supervisor emits a deterministic weighted sum alongside the model\u2019s own holistic score, so the LLM\u2019s judgement can always be checked against the arithmetic. It never touches the corpus — synthesis sits on top of already-cited analyses, which keeps the citation chain intact without re-inflating the context window.',
          code: `DOMAIN_WEIGHTS = {
    "debris_physicist":  0.35,   # physics most directly gates go / no-go
    "mission_historian": 0.25,   # precedent is strong evidence
    "policy_oracle":     0.25,   # compliance is near-binary but consequential
    "media_sentinel":    0.15,   # real, but least mission-critical
}

# Conflicts are resolved against an explicit enumerated basis:
#   evidence_weight | domain_authority | consensus | insufficient_data`,
        },
      ],
    },
    {
      id: 'corpus',
      nav: 'Corpus',
      title: 'What the system actually reads',
      blocks: [
        {
          type: 'metrics',
          cols: 4,
          items: [
            { value: '150', label: 'source documents', prov: 'verified' },
            { value: '18,019', label: 'chunks', prov: 'verified' },
            { value: '3.20M', label: 'tokens indexed', prov: 'verified' },
            { value: '46%', label: 'chunks containing tables', prov: 'verified' },
          ],
        },
        {
          type: 'prose',
          text: [
            'The table flag matters more than it sounds. ESA and ISRO debris statistics live almost entirely inside tables rather than prose, so 8,328 of 18,019 chunks are flagged as tabular during ingestion and carry that flag through retrieval.',
          ],
        },
        { type: 'chart', id: 'astroguard-corpus', caption: 'Chunks by source collection. Sixteen collections span 2012–2025; the ISRO annual reports and ESA debris reports dominate the index.', prov: 'verified' },
        {
          type: 'table',
          caption: 'ACL partition — which agent can see what',
          prov: 'verified',
          head: ['Agent view', 'Chunks visible'],
          num: [1],
          rows: [
            ['policy_oracle', '7,789'],
            ['debris_physicist', '5,110'],
            ['unrouted (known defect)', '3,682'],
            ['mission_historian', '1,307'],
            ['media_sentinel', '131'],
          ],
        },
        {
          type: 'callout',
          tone: 'caution',
          title: '3,682 chunks are invisible to every agent',
          body: 'Folders missing from FOLDER_AGENT_MAP receive agent_allowed: unknown and are therefore unreachable by any agent — 20% of the index. Chunks can also be visible to more than one agent, so these figures do not sum to 18,019. Both are documented in the limitations below rather than smoothed over.',
        },
      ],
    },
    {
      id: 'results',
      nav: 'Results',
      title: 'A 47-query corpus-wide sweep',
      kicker: 'All figures computed from committed artefacts: 88 synthesis JSONs, 42 markdown reports and one checkpointed batch log.',
      blocks: [
        {
          type: 'metrics',
          cols: 5,
          items: [
            { value: '47 / 42', label: 'queries run / completed', note: '89.4% batch reliability', prov: 'verified' },
            { value: '11.86', label: 'GPU-hours', prov: 'verified' },
            { value: '1,096', label: 'facts, 100% carrying a doc_id', prov: 'verified' },
            { value: '919', label: 'substantive disagreements logged', note: 'across 1,032 critique pairs', prov: 'verified' },
            { value: '0.810', label: 'mean system confidence', note: 'median 0.85, range 0.70–0.85', prov: 'verified' },
          ],
        },
        { type: 'chart', id: 'astroguard-telemetry', caption: 'Mean per-stage wall-clock over 88 runs. Total mean 922.1s, median 895.7s, range 578s–1,666s.', prov: 'verified' },
        {
          type: 'callout',
          tone: 'insight',
          title: 'The debate costs 60% of total compute',
          body: 'R1 + R2 = 553.2s against 275.8s for the initial analysis. Deliberation is 2× more expensive than the reasoning it critiques. That is a concrete, measured argument for treating debate depth as a first-class latency/quality trade-off rather than a free add-on — and it only becomes visible because the pipeline is instrumented per stage.',
        },
        {
          type: 'table',
          caption: 'Highest-risk topics surfaced across the sweep',
          prov: 'verified',
          head: ['Rank', 'Risk', 'Confidence', 'Query', 'Auto-discovered'],
          num: [1, 2],
          rows: [
            ['1', '74', '0.85', 'Historical ISRO launch anomalies, upper-stage failures, debris-generating events', '—'],
            ['2', '50', '0.85', 'Mission Shakti — causes, debris consequences, lessons', 'yes'],
            ['3', '48', '0.80', 'Kessler syndrome — causes, consequences, lessons', 'yes'],
            ['4', '42', '0.80', 'ASAT tests — debris consequences', 'yes'],
            ['5', '40', '0.75', 'Kessler risk in the 500–600 km SSO shell', '—'],
          ],
        },
        {
          type: 'callout',
          tone: 'insight',
          title: 'Three of the top four were auto-discovered',
          body: '19 of the 47 queries were curated by hand; the other 28 were mined automatically from the highest-degree entities in the knowledge graph. The graph independently ranked Mission Shakti, Kessler syndrome and ASAT test as the corpus\u2019s most central debris entities. The agent swarm independently scored them as the highest-risk topics. Two orthogonal signals agreeing is the strongest internal validation this project has.',
        },
        {
          type: 'table',
          caption: 'Debate severity distribution across 1,032 critique pairs',
          prov: 'verified',
          head: ['Severity', 'Count', 'Share'],
          num: [1, 2],
          rows: [
            ['LOW', '888', '86.0%'],
            ['MEDIUM', '119', '11.5%'],
            ['HIGH', '23', '2.2%'],
            ['CRITICAL', '2', '0.2%'],
          ],
        },
      ],
    },
    {
      id: 'output',
      nav: 'Real output',
      title: 'What the system actually produced',
      blocks: [
        {
          type: 'code',
          lang: 'text',
          file: 'reports/mission_shakti_report.md',
          why: 'Reports render an ASCII risk dashboard alongside the structured JSON, so a run can be read in a terminal without tooling.',
          code: `## Risk Score Dashboard

Policy Compliance            [████████░░░░░░░░░░░░░░░░░░░░░░]  25/100  NEGLIGIBLE
Debris Risk                  [██████████████████████░░░░░░░░]  75/100  HIGH
Mission Safety               [███████████████░░░░░░░░░░░░░░░]  50/100  MODERATE
Media / Reputational         [█████████░░░░░░░░░░░░░░░░░░░░░]  30/100  LOW
──────────────────────────────────────────────
OVERALL                      [███████████████░░░░░░░░░░░░░░░]  50/100  MODERATE`,
        },
        {
          type: 'callout',
          tone: 'insight',
          title: 'The debate visibly changing an output',
          body: 'From a real refinement section: "The critique from the debris physicist about the Kessler syndrome risk was addressed by revising the statement to reflect the long-term contribution rather than immediate risk." And from the same report, under data gaps: "Insufficient data in corpus regarding the specific details of the ASAT test and its exact methodology." Those two blocks together are the thesis in miniature — a peer critique measurably altered a downstream claim, and the agent declined to fabricate rather than fill a gap.',
        },
        {
          type: 'callout',
          tone: 'caution',
          title: 'A conflict the system caught — and resolved wrong',
          body: 'The system detected a genuine factual conflict on the year of Mission Shakti: mission_historian said 2026, policy_oracle said 2019. The supervisor resolved to 2026 on evidence_weight. Mission Shakti took place in March 2019 — the Policy Oracle was right and the supervisor picked the wrong one. This is worth showing: the conflict-detection machinery works, and successfully surfaced a real disagreement that a single-retriever system would have silently averaged away. The failure is in resolution quality, which is a function of a 4-bit 7B model\u2019s reasoning, not of the architecture.',
        },
      ],
    },
    {
      id: 'engineering',
      nav: 'Engineering',
      title: 'Six things that make it run',
      blocks: [
        {
          type: 'definitions',
          items: [
            {
              term: 'Schema-forced structured output',
              body: 'No fragile prose parsing anywhere. Every LLM call is bound to a JSON Schema — DECOMPOSE, ANALYZE, CRITIQUE, REFINE, SYNTHESIS — with typed fields, enum constraints and min/max bounds on every numeric score. Extraction falls back through json.loads → ast.literal_eval → regex repair, with retries on malformed output.',
            },
            {
              term: 'Zero-cost local inference',
              body: 'Runs entirely on local HuggingFace weights. bitsandbytes 4-bit NF4 double-quantization drops Qwen2.5-7B to roughly 5 GB VRAM. Three-tier graceful degradation: CUDA + bitsandbytes → 4-bit NF4, CUDA only → float16, CPU only → float32. The full 11.9-hour sweep cost nothing.',
            },
            {
              term: 'Checkpointed, resumable batch execution',
              body: 'batch_progress.json is written after every query. --resume skips completed work; --dry-run previews the entire query plan at zero GPU cost. A twelve-hour run survives Ctrl-C, an OOM, or a reboot.',
            },
            {
              term: 'Citation enforcement by construction',
              body: 'System-prompt rule one is "cite or don\u2019t claim", but the enforcement is in the schema: doc_id is a required field on every fact object. Rule two mandates emitting "insufficient data in corpus" rather than speculating — and reports do emit explicit gaps.',
            },
            {
              term: 'Long-term memory with graph write-back',
              body: 'SwarmMemory appends a JSONL audit log of every query, verdict and consensus set, then writes discoveries back into the knowledge graph as query_assessment nodes with confidence-weighted ASSESSED_IN edges. Prior assessments feed the next supervisor synthesis as context.',
            },
            {
              term: 'Singleton-cached retrieval infrastructure',
              body: 'The embedding model, the LanceDB table handle and the NetworkX graph are each loaded exactly once per process and shared across all four parallel agent threads. Without this, four threads would each pay the bge-m3 load cost on every call.',
            },
          ],
        },
      ],
    },
    {
      id: 'limitations',
      nav: 'Limitations',
      title: 'What this project does not demonstrate',
      kicker: 'Presented rather than buried. These are the questions a technical reviewer would ask, answered before they ask them.',
      blocks: [
        {
          type: 'quote',
          text: 'What this project demonstrates is that a schema-constrained, ACL-isolated, multi-agent debate architecture can be built and run end-to-end at real corpus scale on commodity hardware, with complete auditability. What it does not demonstrate is that its risk scores are correct. Those are two different claims, and only the first is supported.',
        },
        {
          type: 'limitations',
          items: [
            {
              severity: 'critical',
              title: 'Citations are enforced, not verified',
              detail: '100% of facts carry a doc_id because the schema requires one — but nothing checks that the id exists or that the cited page supports the claim. Manual inspection found fabricated identifiers with no corpus counterpart.',
              fix: 'A post-hoc validator asserting every doc_id is a member of the corpus index, then re-embedding the claim and cosine-checking it against its cited chunk, rejecting or flagging below threshold.',
            },
            {
              severity: 'critical',
              title: 'No gold-standard evaluation set',
              detail: 'There is no labelled ground truth for "correct debris risk", so there is no Recall@k, MRR, faithfulness or accuracy figure anywhere in the project. Every reported number is a descriptive statistic of system behaviour.',
              fix: 'Hand-label 50 query→passage pairs for Recall@k; RAGAS/ARES for faithfulness; blind expert scoring of 20 assessments.',
            },
            {
              severity: 'high',
              title: 'Risk scores are uncalibrated',
              detail: 'The 0–100 scale is defined only by prompt anchors. A mean overall of 29.7 is internally consistent but has never been validated against real conjunction data or expert judgement.',
              fix: 'Anchor against ISSAR conjunction counts and published collision-probability values; verify monotonicity on synthetic queries of known relative severity.',
            },
            {
              severity: 'high',
              title: 'The debate under-critiques',
              detail: '86% of 1,032 critique pairs land at LOW severity. Mandating a critique every round manufactures a floor of low-stakes nitpicks, and the model rarely escalates.',
              fix: 'Permit an explicit "no substantive disagreement" null critique; add a red-team agent whose sole objective is finding HIGH+ flaws.',
            },
            {
              severity: 'medium',
              title: '~15 minutes per query',
              detail: 'A mean of 922 seconds makes this batch/offline analysis infrastructure, not an interactive tool. The debate alone is 60% of it.',
              fix: 'vLLM or TGI batched serving; a single debate round for low-stakes queries; a smaller model for the supervisor.',
            },
            {
              severity: 'medium',
              title: 'Reasoning ceiling of a 4-bit 7B model',
              detail: 'Quantized Qwen2.5-7B is the source of most fabricated citations and shallow critiques, including the Mission Shakti year error. The architecture is model-agnostic — the bottleneck is the weights, not the design.',
              fix: 'Run the same pipeline on a 32B/70B or frontier API model. It is a one-line config change.',
            },
            {
              severity: 'medium',
              title: '89.4% batch reliability',
              detail: '5 of 47 queries failed: four TypeErrors from a non-integer page field escaping schema coercion, one total agent failure.',
              fix: 'Strict type coercion at the schema-parse boundary; per-agent retry with exponential backoff.',
            },
            {
              severity: 'low',
              title: 'The Hindi corpus is discarded',
              detail: 'Four Hindi-only directories are skipped entirely, forfeiting the domestic-language policy and media signal.',
              fix: 'Multilingual embeddings — bge-m3 already supports this — plus a Hindi-capable generator.',
            },
          ],
        },
        {
          type: 'list',
          title: 'Next, in priority order',
          ordered: true,
          items: [
            'Retrieval evaluation harness — labelled query→passage set scoring Recall@k, MRR and nDCG',
            'Citation verifier rejecting any doc_id absent from the corpus index',
            'Hybrid BM25 + dense retrieval with reciprocal-rank fusion — exact TLE and mission IDs are the current dense-retrieval blind spot',
            'Cross-encoder reranker over the over-fetched k × 5 candidate pool',
            'A red-team fifth agent optimising purely for adversarial critique',
            'LLM-based entity extraction to replace curated regex, for a richer graph',
            'vLLM serving, targeting under three minutes per query',
          ],
        },
      ],
    },
  ],
};
