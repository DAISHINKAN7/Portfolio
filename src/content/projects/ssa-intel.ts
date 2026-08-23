import type { Project } from '@/lib/types';

export const ssaIntel: Project = {
  slug: 'ssa-intel',
  name: 'SSA-Intel',
  wordmark: 'SSA-Intel',
  subtitle: 'Named Entity Recognition for Space Situational Awareness Documents',
  hook: 'There was no dataset, no label schema, and no way to query this corpus. I built all three.',
  summary:
    'An end-to-end NLP system turning 145 ISRO and ESA space documents into a queryable knowledge graph of 46,372 entity mentions, 189,552 relations and 8,299 events — built on a bespoke 8-class ontology and 156 hand annotations scaled to 3,180 training samples via weak supervision.',
  domainLine: 'Applied NLP · Information extraction · Knowledge graphs',
  categories: ['NLP', 'Knowledge Graphs', 'Deep Learning', 'Research'],
  period: 'Jan 2026 — Present',
  role: 'Sole author — ontology design, annotation, training, serving',
  status: 'Working end to end · documented open defects',
  statusTone: 'benchmark',
  repo: 'https://github.com/DAISHINKAN7/Situational_Space_Awareness',
  scale: '11,574 lines of Python across 10 modules',
  headline: {
    value: '0.9055 F1',
    label: 'entity-level seqeval, fine-tuned RoBERTa-base',
    note: 'On a weakly-supervised held-out split — see limitations for the exact claim boundary',
    prov: 'reported',
  },
  cardMetrics: [
    { value: '0.9055', label: 'test F1, RoBERTa-base', prov: 'reported' },
    { value: '156 → 3,180', label: 'gold annotations scaled', prov: 'verified' },
    { value: '46,372', label: 'entity mentions extracted', prov: 'verified' },
    { value: '2,746', label: 'knowledge-graph nodes', prov: 'verified' },
  ],
  tech: ['PyTorch', 'Transformers', 'RoBERTa', 'SciBERT', 'spaCy', 'Neo4j', 'SQLite', 'Streamlit'],
  techGrouped: [
    { group: 'Modelling', items: ['PyTorch 2.3.0', 'Transformers 4.40.2', 'Datasets', 'seqeval', 'spaCy 3.7.4', 'scikit-learn'] },
    { group: 'Document I/O', items: ['PyMuPDF', 'pdfplumber', 'python-docx', 'BeautifulSoup4', 'langdetect'] },
    { group: 'Knowledge', items: ['SQLite', 'SQLAlchemy 2.0', 'Neo4j 5.20', 'RapidFuzz'] },
    { group: 'Serving', items: ['Streamlit 1.35', 'pyvis', 'streamlit-agraph', 'Plotly 5.22'] },
    { group: 'Ops', items: ['PyYAML', 'loguru', 'tqdm', 'Weights & Biases'] },
  ],
  glance: [
    { k: 'Problem', v: 'India\u2019s space programme publishes thousands of pages a year as prose locked inside PDFs. No structured record exists that can answer "which launch vehicles placed satellites into Sun-Synchronous Orbit, and from which pad?"' },
    { k: 'Why off-the-shelf NLP fails', v: 'PSLV-C54, LVM3-M4, SSPO, passivation, post-mission disposal — none of these exist in CoNLL-2003, OntoNotes or WikiANN. spaCy tags PSLV-C54 as ORG or misses it, and has no concept of an orbital parameter.' },
    { k: 'The core problem solved', v: '156 gold annotations is nowhere near enough to fine-tune a 125M-parameter encoder. Five compounding techniques scaled it to 3,180 training samples.' },
    { k: 'Corpus', v: '352 raw files → 150 cleaned (100% success) → 5,324 pages → 145 documents reaching NER inference' },
    { k: 'Output', v: 'A 96 MB SQLite knowledge base shipped in the repo — clone and launch the dashboard without retraining' },
    { k: 'Unmeasured', v: 'Relation extraction is rule-based with heuristic confidence and no annotated test set. 189,552 is extraction volume, not verified facts.' },
  ],
  heroDiagram: 'ssa-ner',
  accentIndex: 4,
  related: ['astroguard', 'eco-rewind'],
  sections: [
    {
      id: 'problem',
      nav: 'Problem',
      title: 'The entities that matter do not exist in any pretrained label space',
      blocks: [
        {
          type: 'lede',
          text: 'ISRO annual reports, ISSAR situational-awareness documents, mission brochures, Lok Sabha transcripts, ESA debris reports — thousands of pages of natural-language prose, all of it locked inside PDFs.',
        },
        {
          type: 'list',
          title: 'Questions no structured record can currently answer',
          items: [
            'Which launch vehicles placed satellites into Sun-Synchronous Orbit, and from which launch pad?',
            'Every debris-mitigation action ISRO documented since 2010, and the policy that mandated it.',
            'Which organizations co-occur with fragmentation events across the ESA and ISSAR corpora?',
          ],
        },
        {
          type: 'prose',
          text: [
            'Off-the-shelf NER cannot answer them. PSLV-C54, LVM3-M4, SSPO, IS4OM, passivation, post-mission disposal, conjunction assessment, controlled re-entry — none of these appear in CoNLL-2003, OntoNotes or WikiANN. spaCy\u2019s en_core_web_sm will tag PSLV-C54 as ORG or miss it entirely, and has no concept whatsoever of an orbital parameter or a debris-mitigation action.',
            'The domain therefore required its own ontology, its own annotation effort and its own trained model. That is the core of the project.',
          ],
        },
      ],
    },
    {
      id: 'ontology',
      nav: 'Ontology',
      title: 'Eight entity classes, seventeen BIO labels',
      kicker: 'Original schema design work, and the part with no shortcut available.',
      blocks: [
        { type: 'diagram', id: 'ssa-ner', caption: 'The eight-class ontology applied to a real sentence from the corpus, with the model\u2019s actual confidences from the evaluation transcript.' },
        {
          type: 'table',
          caption: 'The ontology, with corpus yield and per-label test F1',
          prov: 'verified',
          head: ['Entity', 'Examples from the corpus', 'Mentions', 'Canonical', 'Test F1'],
          num: [2, 3, 4],
          rows: [
            ['LAUNCH_VEHICLE', 'PSLV-C54, GSLV-F15, LVM3-M4, Ariane-5', '5,846', '357', '0.9371'],
            ['SATELLITE', 'EOS-06, NavIC, INSAT-3D, Cartosat-3', '5,166', '343', '0.8718'],
            ['MISSION', 'Chandrayaan-3, Mars Orbiter Mission, Gaganyaan', '2,372', '496', '0.7733'],
            ['ORGANIZATION', 'ISRO, DOS, ESA, NASA, VSSC, NSIL, Antrix', '8,310', '198', '0.9010'],
            ['LOCATION', 'SDSC SHAR, First/Second Launch Pad, Kourou', '3,235', '70', '0.8254'],
            ['DATE', '14 July 2023, 2019, FY 2022-23', '13,361', '826', '0.9534'],
            ['ORBITAL_PARAM', 'Sun-Synchronous Orbit, GTO, LEO, 509 km, apogee', '5,323', '272', '0.9342'],
            ['DEBRIS_ACTION', 'passivation, de-orbiting, controlled re-entry, IADC, PMD', '2,759', '184', '0.8704'],
          ],
        },
        {
          type: 'callout',
          tone: 'note',
          title: 'Why MISSION is the floor at 0.7733',
          body: 'MISSION is the only label with genuine semantic ambiguity against another label. Chandrayaan-3 is a mission in a policy document and a spacecraft in a launch brochure. A fixed priority ladder — LAUNCH_VEHICLE → SATELLITE → MISSION → ORGANIZATION → LOCATION → DATE → ORBITAL_PARAM → DEBRIS_ACTION — forces a single label, so the ceiling on this class is structural, not a training failure.',
        },
        {
          type: 'table',
          caption: 'Seven typed relations, extracted rule-based over sentence and adjacent-sentence windows',
          prov: 'unmeasured',
          head: ['Relation', 'Signature', 'Count', 'Share'],
          num: [2, 3],
          rows: [
            ['launches', 'LAUNCH_VEHICLE → SATELLITE / MISSION', '50,578', '26.7%'],
            ['mentioned_in', 'any entity → DOCUMENT', '46,372', '24.5%'],
            ['launched_from', 'SATELLITE / MISSION → LOCATION', '43,152', '22.8%'],
            ['operated_by', 'SATELLITE / MISSION → ORGANIZATION', '23,656', '12.5%'],
            ['placed_in_orbit', 'SATELLITE / MISSION → ORBITAL_PARAM', '12,157', '6.4%'],
            ['related_to_debris', 'DEBRIS_ACTION → SATELLITE / ORG / LOCATION', '9,744', '5.1%'],
            ['belongs_to_mission', 'SATELLITE → MISSION', '3,893', '2.1%'],
          ],
        },
        {
          type: 'callout',
          tone: 'caution',
          title: '189,552 is extraction volume, not verified facts',
          body: 'Relations come from co-occurrence rules with heuristic confidence — mean 0.8373, σ 0.1285, with 65% falling in the 0.7–0.9 band. There is no annotated relation test set, so precision is genuinely unknown and no precision figure is claimed anywhere on this page.',
        },
      ],
    },
    {
      id: 'methodology',
      nav: 'Methodology',
      title: 'Solving the 156-annotation problem',
      kicker: 'The intellectual centre of the project. Hand-annotating space documents is expensive and slow, and 156 gold sentences cannot fine-tune a 125M-parameter encoder without catastrophic overfitting.',
      blocks: [
        { type: 'diagram', id: 'ssa-funnel', caption: 'Five techniques that compound: weak supervision multiplies gold 22×, augmentation targets rare labels, and a second fine-tuning stage strips gazetteer bias back out.' },
        {
          type: 'definitions',
          items: [
            {
              term: '1 · Weak supervision — 617 LOC',
              body: 'Domain gazetteers (PSLV/GSLV/LVM3 variants, ISRO centres, orbit names, debris terminology) plus regex patterns applied across the cleaned corpus, producing 3,502 silver-labelled sentences. A 22× multiplier over gold.',
            },
            {
              term: '2 · Entity-swap augmentation',
              body: 'Replaces entity spans with other entities of the same type. Replacement runs right-to-left so that earlier character offsets stay valid — a small detail that is the difference between working augmentation and silently corrupted labels. Rare labels (MISSION, SATELLITE, ORBITAL_PARAM, DEBRIS_ACTION) are boosted to fight class imbalance.',
            },
            {
              term: '3 · Two-stage fine-tuning',
              body: 'Stage one trains on the full silver + gold + augmented pool to learn domain vocabulary. Stage two reloads the best checkpoint and re-fits on gold-only records, with silver and augmented records excluded — stripping gazetteer bias out of the decision boundary rather than baking it in.',
            },
            {
              term: '4 · Class-weighted cross-entropy',
              body: 'In BIO tagging the O label dominates roughly 90:1. Inverse-frequency class weights prevent the model collapsing to predicting all-O, which is the default failure mode on small NER sets.',
            },
            {
              term: '5 · Priority conflict ladder',
              body: 'Chandrayaan-3 is legitimately both a MISSION and a SATELLITE. A fixed priority order enforces single-label BIO deterministically, resolving all 22 overlap cases found during annotation.',
            },
          ],
        },
        {
          type: 'code',
          lang: 'yaml',
          file: 'config.yaml',
          why: 'Tuned for small data rather than copied from GLUE defaults. Cosine annealing beats linear on small NER sets, and label smoothing was reduced from 0.1 — aggressive smoothing hurts when samples are few.',
          code: `max_seq_length:          512
batch_size:              8
learning_rate:           2e-5      # 3e-5 for DeBERTa
num_epochs:              20
warmup_ratio:            0.1
weight_decay:            0.01
lr_scheduler_type:       cosine
label_smoothing:         0.05
early_stopping_patience: 8         # 12 for DeBERTa
mixed_precision:         true      # fp16
split:                   0.60 / 0.20 / 0.20   # train 3,180 · val 341 · test 274`,
        },
        {
          type: 'table',
          caption: 'Annotation quality — the conflicts were counted, not glossed',
          prov: 'verified',
          head: ['Metric', 'Value'],
          num: [1],
          rows: [
            ['Manual gold annotations (sentences)', '156'],
            ['Duplicate spans found', '4'],
            ['Overlap cases (one span, two valid labels)', '22'],
            ['Conflict rate', '16.7%'],
            ['Resolution strategy', 'single_primary_label_priority_based'],
          ],
        },
      ],
    },
    {
      id: 'architecture',
      nav: 'Architecture',
      title: 'Fourteen phases across six layers',
      blocks: [
        { type: 'diagram', id: 'ssa-layers', caption: 'Everything is driven by a single config.yaml carrying paths, ontology, hyperparameters, gazetteers, alias maps, relevance keywords and dashboard configuration.' },
        {
          type: 'table',
          caption: 'Corpus pipeline — verified stage figures',
          prov: 'verified',
          head: ['Stage', 'Figure'],
          num: [1],
          rows: [
            ['Raw source files in the repository', '352'],
            ['Files processed by the cleaning stage', '150 (100% success, 0 failures)'],
            ['Pages extracted and cleaned', '5,324'],
            ['Characters before → after cleaning', '8,821,121 → 8,540,974 (−3.2%)'],
            ['Broken hyphens repaired', '1,668'],
            ['Repeated header/footer lines removed', '6,922'],
            ['Total processed JSONL pages', '10,826'],
            ['Documents reaching NER inference', '145'],
          ],
        },
        {
          type: 'callout',
          tone: 'insight',
          title: 'The populated knowledge base ships in the repository',
          body: 'ssa_intel.db is 96 MB and tracked in git — documents 145, entities 46,372, relations 189,552, events 8,299, norm_map 82, 2,630 distinct canonical entities, verified by live SQL query. Anyone cloning the repo can launch the eight-page Streamlit dashboard immediately without retraining or re-running inference. The project is inspectable in one command.',
        },
        {
          type: 'table',
          caption: 'Module sizes, verified line counts',
          prov: 'verified',
          head: ['Module', 'LOC', 'Notes'],
          num: [1],
          rows: [
            ['src/ner/', '3,680', 'The core. 10 files.'],
            ['evaluate_all.py', '2,291', 'Standalone 11-section evaluation suite'],
            ['src/ingestion/', '1,317', 'Manifest-driven, resumable'],
            ['app/streamlit_app.py', '944', '8-page dashboard'],
            ['src/preprocessing/', '796', '3-tier keyword relevance filter + cleaner'],
            ['src/database/', '483', '5-table schema with 9 indexes'],
            ['src/graph/builder.py', '444', 'SQLite → Neo4j, 11 node types / 9 edge types'],
            ['Total Python', '11,574', ''],
          ],
        },
      ],
    },
    {
      id: 'results',
      nav: 'Results',
      title: 'Three models, one of which scored zero',
      blocks: [
        {
          type: 'table',
          caption: 'Model leaderboard',
          prov: 'reported',
          head: ['Model', 'Params', 'Val F1', 'Test P', 'Test R', 'Test F1', 'Throughput'],
          num: [1, 2, 3, 4, 5, 6],
          emphasis: [0],
          rows: [
            ['roberta-base', '125M', '0.8749', '0.9022', '0.9088', '0.9055', '122 samp/s'],
            ['allenai/scibert_scivocab_uncased', '110M', '0.8537', '0.8755', '0.8850', '0.8802', '173 samp/s'],
            ['microsoft/deberta-v3-base', '184M', '0.0000', '—', '—', '0.0000', '76 samp/s'],
          ],
        },
        {
          type: 'callout',
          tone: 'caution',
          title: 'The DeBERTa-v3 zero is a published negative result',
          body: 'Its SentencePiece tokenizer produced misaligned offset_mapping against the character-span annotations, collapsing every prediction to O. It stays in the leaderboard rather than being deleted — knowing which architecture breaks on your data is a finding.',
        },
        { type: 'chart', id: 'ssa-f1', caption: 'Per-label F1 on the test set, RoBERTa-base. Sorted by score.', prov: 'reported' },
        {
          type: 'table',
          caption: 'Statistical rigour',
          prov: 'verified',
          head: ['Test', 'Result'],
          rows: [
            ['Bootstrap 95% CI (1,000 resamples)', 'roberta-base mean 0.8833, CI [0.8389, 0.9217]; scibert mean 0.8439, CI [0.7744, 0.9018]'],
            ['Interpretation', 'The confidence intervals overlap. RoBERTa leads, but its edge over SciBERT is not statistically separated.'],
            ["McNemar's test", 'RoBERTa / SciBERT vs DeBERTa: χ² = 6.125, p < 0.05. RoBERTa vs SciBERT: not significant.'],
            ['Held-out probe accuracy', '14/17 = 82.4% on hand-written unseen sentences'],
            ['Span boundary test', '3/3 exact — PSLV-C54 correctly bounded in leading, medial and possessive contexts'],
          ],
        },
        {
          type: 'code',
          lang: 'text',
          file: 'evaluation section K — live probe inference',
          why: 'The third probe is the interesting one: the model tags Chandrayaan-3 as SATELLITE where the schema calls it MISSION. That is the priority ladder\u2019s structural ceiling showing up in practice, not a random error.',
          code: `"PSLV-C54 was launched by ISRO from Sriharikota carrying EOS-06 into Sun Synchronous Orbit"
  [LAUNCH_VEHICLE] PSLV-C54              conf 0.966  ok
  [ORGANIZATION]   ISRO                  conf 0.914  ok
  [LOCATION]       Sriharikota           conf 0.916  ok
  [ORBITAL_PARAM]  Sun Synchronous Orbit conf 0.969  ok
  -> 4/4 (100%)

"Chandrayaan-3 was launched on 14 July 2023 aboard LVM3-M4 from SDSC SHAR"
  [DATE]           14 July 2023  conf 0.968  ok
  [LOCATION]       SDSC SHAR     conf 0.962  ok
  MISSED: [MISSION] Chandrayaan-3 -> predicted as SATELLITE (schema ambiguity)
  -> 3/4 (75%)`,
        },
      ],
    },
    {
      id: 'graph',
      nav: 'Knowledge graph',
      title: 'A scale-free graph over 2,746 canonical entities',
      blocks: [
        {
          type: 'metrics',
          cols: 4,
          items: [
            { value: '2,746', label: 'canonical nodes', prov: 'verified' },
            { value: '18,483', label: 'unique entity pairs', prov: 'verified' },
            { value: '0.9299', label: 'degree Gini coefficient', note: 'scale-free topology', prov: 'verified' },
            { value: '0', label: 'isolated nodes', note: '100% of entities appear in ≥1 relation', prov: 'verified' },
          ],
        },
        {
          type: 'table',
          caption: 'Hub entities',
          prov: 'verified',
          head: ['Entity', 'Label', 'Degree', 'Documents', 'Mentions'],
          num: [2, 3, 4],
          rows: [
            ['Indian Space Research Organisation', 'ORGANIZATION', '23,844', '121', '3,858'],
            ['Satish Dhawan Space Centre SHAR', 'LOCATION', '22,957', '76', '1,621'],
            ['Department of Space, India', 'ORGANIZATION', '—', '50', '1,308'],
            ['IADC', 'DEBRIS_ACTION', '3,999', '—', '718'],
            ['Sun-Synchronous Orbit', 'ORBITAL_PARAM', '—', '46', '280'],
          ],
        },
        {
          type: 'prose',
          text: [
            'Canonicalization is two-stage: exact alias lookup from config.yaml, then RapidFuzz token_sort_ratio with a score cutoff of 85 for near-miss variants. ISRO resolves to Indian Space Research Organisation; Sriharikota, SHAR, SDSC and SDSC SHAR all collapse to Satish Dhawan Space Centre SHAR; GSLV Mk III, GSLV MkIII, LVM-3 and LVM 3 all collapse to LVM3.',
          ],
        },
        {
          type: 'table',
          caption: 'Three event templates and where the honest weakness lives',
          prov: 'verified',
          head: ['Event', 'Required args', 'Extracted', 'Complete'],
          num: [2, 3],
          rows: [
            ['LAUNCH_EVENT', 'vehicle, satellite', '2,286', '35.5%'],
            ['DEBRIS_EVENT', 'cause', '3,723', '100%'],
            ['POLICY_EVENT', 'policy_name', '2,290', '6.4%'],
          ],
        },
        {
          type: 'callout',
          tone: 'note',
          title: 'The POLICY_EVENT figure is explained, not excused',
          body: 'Required args fill only 6.4% of the time because policy names are long noun phrases with no dedicated entity label in the v1 ontology. A POLICY_DOC entity type is already staged in config.yaml under optional_v2 — this is a known gap with a scoped fix, not a bug.',
        },
      ],
    },
    {
      id: 'limitations',
      nav: 'Limitations',
      title: 'The exact claim boundary',
      kicker: 'The correct phrasing for the headline number is "0.91 F1 on a weakly-supervised held-out split." Here is why that qualifier matters.',
      blocks: [
        {
          type: 'limitations',
          items: [
            {
              severity: 'critical',
              title: 'Subword span fragmentation',
              detail: 'The dominant open defect. Corpus-wide inference emits BPE subword pieces as standalone entities — PS appears 1,236 times, GS 841, IR 416, and Chandrayaan-3 splits into two spans. The BIO→span decoder does not merge continuation tokens back into whole words. This inflates mention counts and pollutes the graph\u2019s hub statistics. It does not affect the 0.9055 figure, which is seqeval on aligned tokens.',
              fix: 'Word-level aggregation in predict.py using word_ids() instead of raw token offsets, then repopulate the knowledge base. Roughly one hour of work and the highest-ROI change available.',
            },
            {
              severity: 'high',
              title: 'The test split is not fully gold',
              detail: 'The 274-sample test set is drawn from the silver-augmented pool, so the reported F1 partly measures agreement with the gazetteer rather than purely with human judgement.',
              fix: 'Hand-annotate a held-out, fully gold test set of roughly 500 sentences.',
            },
            {
              severity: 'high',
              title: 'The headline F1 is a cached metric',
              detail: '0.9055 is read from stage6_training_report.json. The evaluation suite can re-run live inference, but the trained checkpoints are gitignored, so live re-evaluation is skipped in this snapshot and the partial-match figure is an estimate rather than a measurement.',
              fix: 'Ship checkpoints or a download script so the suite measures instead of reading.',
            },
            {
              severity: 'medium',
              title: 'Relation extraction is unmeasured',
              detail: '189,552 relations come from co-occurrence rules with heuristic confidence. There is no annotated relation test set, so precision is unknown.',
              fix: 'Annotate a relation test set; replace the rules with a fine-tuned classifier.',
            },
            {
              severity: 'medium',
              title: 'DeBERTa-v3 never converged',
              detail: 'Tokenizer offset_mapping misalignment against char-span annotations collapsed every prediction to O.',
              fix: 'Fix the offset mapping and complete the three-way architecture comparison.',
            },
            {
              severity: 'low',
              title: 'The Hindi corpus is excluded',
              detail: 'Hindi annual reports, PIB Hindi and Hindi debris news are extracted but never enter the NLP stack. The ontology and models are English-only by design.',
              fix: 'Multilingual expansion via IndicBERT or MuRIL — scoped, not built.',
            },
          ],
        },
        {
          type: 'list',
          title: 'Roadmap',
          ordered: true,
          items: [
            'Word-level span aggregation — eliminate subword fragmentation, repopulate the KB, re-measure the graph',
            'A fully-gold test set of ~500 hand-annotated sentences for an unimpeachable F1',
            'Neural relation extraction replacing the rules, with an annotated relation set',
            'Fix DeBERTa-v3 offset mapping and complete the three-way comparison',
            'v2 ontology: POLICY_DOC, PAYLOAD, DEBRIS_OBJECT',
            'Multilingual Hindi ingest via IndicBERT / MuRIL',
            'TLE fusion — join the text-derived knowledge base against orbital element data',
          ],
        },
      ],
    },
  ],
};
