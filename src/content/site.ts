export const profile = {
  name: 'Kunal Ajgaonkar',
  role: 'AI / Machine Learning Engineer',
  location: 'Pune, Maharashtra, India',
  email: 'kunalajgaonkar31682@gmail.com',
  phone: '+91 97638 72209',
  github: 'https://github.com/DAISHINKAN7',
  githubHandle: 'DAISHINKAN7',
  // TODO(kunal): paste your LinkedIn profile URL here to switch the link on
  // site-wide (header, footer, contact, resume). Leave it null and no dead
  // link is ever rendered.
  linkedin: "https://www.linkedin.com/in/kunalajgaonkar/",
  resumePdf: '/Kunal_Ajgaonkar_Resume.pdf',
  photo: '/kunal.jpg',
  siteUrl: 'https://kunal-ajgaonkar-portfolio.vercel.app',
  positioning:
    'I build AI systems where the architecture is the contribution — multi-agent retrieval, multimodal deep learning, spatiotemporal forecasting and domain NLP — and I measure them honestly enough to say where they fail.',
  heroLines: [
    'Multi-agent retrieval systems, multimodal deep learning,',
    'spatiotemporal forecasting and domain NLP —',
    'built end to end, and evaluated on their own terms.',
  ],
};

export const education = [
  {
    degree: 'M.Tech, Artificial Intelligence and Machine Learning',
    org: 'Symbiosis Institute of Technology',
    place: 'Pune, India',
    period: "Aug '25 — Present",
    detail: 'GPA 8.30',
  },
  {
    degree: 'B.Tech, Computer Science (Artificial Intelligence and Data Science)',
    org: "SVKM's NMIMS STME",
    place: 'Navi Mumbai, India',
    period: "Aug '21 — May '25",
    detail: 'GPA 3.45 / 4.00',
  },
];

export type Role = {
  slug: string;
  org: string;
  title: string;
  period: string;
  place: string;
  domain: string;
  summary: string;
  contributions: string[];
  capabilities: string[];
  tech: string[];
  current?: boolean;
};

export const experience: Role[] = [
  {
    slug: 'dassault-systemes',
    org: 'Dassault Systèmes Solutions Lab',
    title: 'AI/ML Intern',
    period: "Jun '26 — Present",
    place: 'Pune, Maharashtra, India',
    domain: 'Knowledge graphs · Enterprise PLM · LLM agents',
    current: true,
    summary:
      'Working on RDF-based knowledge graphs for Product Lifecycle Management, and on a natural-language query agent that sits on top of them. The work spans graph modelling, synthetic data generation at scale, and LLM-driven query generation with validation.',
    contributions: [
      'Develop and enrich RDF-based PLM knowledge graphs, integrating product structures, supplier data, engineering issues and change-management workflows to enable end-to-end traceability and graph-based analytics.',
      'Design Python data generation, simulation and graph-enrichment pipelines covering engineering issues, change requests, change actions, part revisions and lifecycle histories — producing realistic datasets for AI/ML and knowledge-graph applications.',
      'Develop a knowledge-graph AI agent for natural-language querying over enterprise PLM data, incorporating LLM-driven query generation, SPARQL validation and graph reasoning.',
      'Migrated and integrated that solution within an enterprise AI platform.',
    ],
    capabilities: [
      'Semantic modelling over RDF at enterprise scale',
      'LLM query generation with a hard validation layer between model output and execution',
      'Synthetic data pipelines that produce distributions realistic enough to train against',
    ],
    tech: ['Python', 'RDF', 'SPARQL', 'Knowledge Graphs', 'LLMs', 'Agentic AI'],
  },
  {
    slug: 'carico-systems',
    org: 'Carico Systems',
    title: 'Data Science Intern',
    period: "Jan '25 — Jun '25",
    place: 'India (Remote)',
    domain: 'Retrieval over structured data · Applied ML platforms',
    summary:
      'Six months building LLM-backed analytics over company data, and leading development on an ML-driven logistics platform.',
    contributions: [
      'Developed an employee data analytics system using Streamlit, ChromaDB and LLM-based natural-language querying.',
      'Designed a scalable ChromaDB–SQLite synchronisation architecture so the vector layer and the relational layer stayed consistent across large datasets.',
      'Led development of LogixSense, an AI-driven logistics platform integrating machine-learning capabilities with a modern web stack.',
    ],
    capabilities: [
      'Hybrid vector + relational architectures where each store does what it is good at',
      'Turning natural-language questions into queries an analyst would trust',
      'Leading a feature from architecture through to a shipped internal tool',
    ],
    tech: ['Python', 'ChromaDB', 'SQLite', 'Streamlit', 'LLMs', 'RAG'],
  },
  {
    slug: 'suvidha-foundation',
    org: 'Suvidha Foundation',
    title: 'AI/ML Intern',
    period: "Aug '24 — Sep '24",
    place: 'India (Remote)',
    domain: 'Applied machine learning · Analytics',
    summary:
      'A short engagement applying machine-learning and data-analysis techniques to operational datasets in support of organisational decision-making.',
    contributions: [
      'Applied machine-learning and data-analysis techniques to operational datasets.',
      'Generated actionable insights supporting data-driven decisions across organisational initiatives.',
    ],
    capabilities: ['Framing a vague operational question as something a model can answer'],
    tech: ['Python', 'scikit-learn', 'pandas'],
  },
];

export type Publication = {
  title: string;
  venue: string;
  date: string;
  note: string;
};

export const publications: Publication[] = [
  {
    title: 'Enhancing Cryptocurrency Fraud Detection with Hybrid Graph-Temporal Neural Networks',
    venue: 'IEEE',
    date: "Dec '24",
    note: 'Graph representation learning combined with temporal modelling for transaction-level fraud detection.',
  },
  {
    title:
      'Hazardous waste management: A review on household hazardous waste and a strategy to gain control',
    venue: 'STM Journals',
    date: "Apr '24",
    note: 'Review paper surveying household hazardous waste streams and control strategies.',
  },
];

export type SkillGroup = {
  name: string;
  blurb: string;
  items: { name: string; evidence: string[] }[];
};

export const skillGroups: SkillGroup[] = [
  {
    name: 'Agentic AI & retrieval systems',
    blurb: 'Multi-agent orchestration, RAG architecture, and retrieval that fuses dense and symbolic paths.',
    items: [
      { name: 'Multi-agent orchestration', evidence: ['astroguard'] },
      { name: 'Retrieval-augmented generation', evidence: ['astroguard'] },
      { name: 'Knowledge graphs', evidence: ['astroguard', 'ssa-intel'] },
      { name: 'LanceDB / vector indexing', evidence: ['astroguard'] },
      { name: 'NetworkX / graph traversal', evidence: ['astroguard'] },
      { name: 'Neo4j', evidence: ['ssa-intel'] },
      { name: 'Local LLM inference & quantization', evidence: ['astroguard'] },
      { name: 'Schema-forced structured output', evidence: ['astroguard'] },
    ],
  },
  {
    name: 'Deep learning',
    blurb: 'Architectures implemented from scratch, re-stemmed for non-standard inputs, and benchmarked against each other.',
    items: [
      { name: 'PyTorch', evidence: ['radio-optical-classification', 'eco-rewind', 'adaptive-beta', 'ssa-intel'] },
      { name: 'ConvNeXt / EfficientNet / ResNet', evidence: ['radio-optical-classification'] },
      { name: 'Vision Transformers', evidence: ['radio-optical-classification'] },
      { name: 'Spatiotemporal models (ConvLSTM, Mamba SSM, PatchTST)', evidence: ['eco-rewind'] },
      { name: 'GANs (Pix2Pix, PatchGAN)', evidence: ['radio-optical-classification'] },
      { name: 'LSTM sequence models', evidence: ['adaptive-beta'] },
      { name: 'Mixed-precision training', evidence: ['radio-optical-classification', 'eco-rewind'] },
      { name: 'Custom composite loss design', evidence: ['eco-rewind'] },
    ],
  },
  {
    name: 'Natural language processing',
    blurb: 'Domain ontology design, weak supervision, transformer fine-tuning and information extraction.',
    items: [
      { name: 'Named entity recognition', evidence: ['ssa-intel'] },
      { name: 'Transformers / HuggingFace', evidence: ['ssa-intel', 'astroguard'] },
      { name: 'RoBERTa / SciBERT fine-tuning', evidence: ['ssa-intel'] },
      { name: 'Weak supervision & augmentation', evidence: ['ssa-intel'] },
      { name: 'Ontology & schema design', evidence: ['ssa-intel'] },
      { name: 'Embedding models (bge-m3)', evidence: ['astroguard'] },
      { name: 'spaCy', evidence: ['ssa-intel'] },
    ],
  },
  {
    name: 'Computer vision & multimodal',
    blurb: 'Pairing modalities that do not share a normalisation, and preserving physics through the pipeline.',
    items: [
      { name: 'Multimodal fusion', evidence: ['radio-optical-classification'] },
      { name: 'Physics-informed preprocessing', evidence: ['radio-optical-classification', 'eco-rewind'] },
      { name: 'Remote sensing (Sentinel-1/2, GEE)', evidence: ['eco-rewind'] },
      { name: 'FITS / Astropy / Astroquery', evidence: ['radio-optical-classification'] },
      { name: 'OpenCV', evidence: ['radio-optical-classification'] },
    ],
  },
  {
    name: 'Classical ML & quantitative modelling',
    blurb: 'Feature engineering, gradient boosting, state-space models and convex optimisation.',
    items: [
      { name: 'XGBoost', evidence: ['adaptive-beta'] },
      { name: 'scikit-learn', evidence: ['adaptive-beta', 'radio-optical-classification'] },
      { name: 'Hidden Markov models', evidence: ['adaptive-beta'] },
      { name: 'Kalman filtering', evidence: ['adaptive-beta'] },
      { name: 'CVXPY / convex optimisation', evidence: ['adaptive-beta'] },
      { name: 'SHAP / model explanation', evidence: ['adaptive-beta'] },
      { name: 'Walk-forward validation', evidence: ['adaptive-beta'] },
    ],
  },
  {
    name: 'Evaluation & experimental design',
    blurb: 'The part that decides whether a number means anything.',
    items: [
      { name: 'Confidence intervals & significance testing', evidence: ['radio-optical-classification', 'ssa-intel'] },
      { name: 'Multi-seed evaluation protocols', evidence: ['radio-optical-classification'] },
      { name: 'Bootstrap resampling', evidence: ['ssa-intel'] },
      { name: 'Ablation design', evidence: ['eco-rewind'] },
      { name: 'Leakage detection & disclosure', evidence: ['radio-optical-classification', 'eco-rewind', 'adaptive-beta'] },
      { name: 'Per-stage telemetry', evidence: ['astroguard'] },
    ],
  },
  {
    name: 'Data & MLOps',
    blurb: 'Getting data that does not exist yet, and making runs survive twelve hours of failure.',
    items: [
      { name: 'Dataset construction from APIs', evidence: ['radio-optical-classification', 'ssa-intel'] },
      { name: 'Checkpointed / resumable pipelines', evidence: ['astroguard'] },
      { name: 'MLflow & DVC', evidence: ['adaptive-beta'] },
      { name: 'AWS (CodeBuild, CodeDeploy)', evidence: ['adaptive-beta'] },
      { name: 'Weights & Biases', evidence: ['eco-rewind', 'ssa-intel'] },
      { name: 'Concurrency (ThreadPoolExecutor)', evidence: ['radio-optical-classification', 'astroguard'] },
      { name: 'Document ingestion (PyMuPDF, pdfplumber)', evidence: ['astroguard', 'ssa-intel'] },
    ],
  },
  {
    name: 'Languages & interfaces',
    blurb: 'What the systems are written in, and how people see into them.',
    items: [
      { name: 'Python', evidence: ['astroguard', 'radio-optical-classification', 'adaptive-beta', 'eco-rewind', 'ssa-intel'] },
      { name: 'TypeScript / React / Next.js', evidence: ['adaptive-beta', 'radio-optical-classification'] },
      { name: 'SQL / SQLite', evidence: ['ssa-intel'] },
      { name: 'Streamlit', evidence: ['ssa-intel'] },
      { name: 'Plotly Dash', evidence: ['adaptive-beta'] },
      { name: 'Java, C++', evidence: [] },
    ],
  },
];

export type Credential = {
  slug: string;
  title: string;
  issuer: string;
  date: string;
  group: 'AI & Machine Learning' | 'MLOps & Cloud' | 'Data Engineering' | 'Professional Experience';
  skills: string[];
  note?: string;
  asset?: string;
  verify?: string;
};

export const credentials: Credential[] = [
  {
    slug: 'mlops-aws-infosys',
    title: 'MLOps with AWS Bootcamp — Zero to Hero Series',
    issuer: 'Manifold AI Learning · Infosys Springboard',
    date: "Mar '26",
    group: 'MLOps & Cloud',
    skills: ['MLOps', 'AWS', 'CI/CD', 'Model deployment'],
    note: '38 hours. The deployment patterns here fed directly into AdaptiveBeta\u2019s CodeBuild/CodeDeploy pipeline.',
    asset: '/credentials/mlops-aws-infosys',
  },
  {
    slug: 'genai-ibm-coursera',
    title: 'Develop Generative AI Applications: Get Started',
    issuer: 'IBM · Coursera',
    date: "Feb '26",
    group: 'AI & Machine Learning',
    skills: ['Generative AI', 'LLM applications'],
    asset: '/credentials/genai-ibm-coursera',
    verify: 'https://coursera.org/verify/GA2VN3WO4W3W',
  },
  {
    slug: 'nasscom-ai-code-sarathi',
    title: 'AI-assisted Coding Workshop — Nasscom AI Code Sarathi',
    issuer: 'Nasscom AI',
    date: "Apr '26",
    group: 'AI & Machine Learning',
    skills: ['AI-assisted development'],
    note: 'Completed with mandatory coursework.',
    asset: '/credentials/nasscom-certificate',
  },
  {
    slug: 'nlp-classification-coursera',
    title: 'Natural Language Processing with Classification and Vector Spaces',
    issuer: 'DeepLearning.AI · Coursera',
    date: "Jun '24",
    group: 'AI & Machine Learning',
    skills: ['NLP', 'Text classification', 'Vector spaces'],
    asset: '/credentials/nlp-classification-coursera',
    verify: 'https://coursera.org/verify/NE9QTUS9JDLG',
  },
  {
    slug: 'machine-learning-2023',
    title: 'Machine Learning',
    issuer: 'SkillUp by Simplilearn',
    date: "Mar '23",
    group: 'AI & Machine Learning',
    skills: ['Machine learning fundamentals'],
    asset: '/credentials/machine-learning-2023',
  },
  {
    slug: 'databricks-aws-azure',
    title: 'Data Engineering using Databricks on AWS and Azure',
    issuer: 'Infosys Springboard',
    date: "Sep '25",
    group: 'Data Engineering',
    skills: ['Databricks', 'AWS', 'Azure', 'Spark'],
    asset: '/credentials/databricks-aws-azure',
  },
  {
    slug: 'hadoop-spark',
    title: 'A Big Data Hadoop and Spark Project for Absolute Beginners',
    issuer: 'Infosys Springboard',
    date: "Sep '25",
    group: 'Data Engineering',
    skills: ['Hadoop', 'Spark', 'Distributed processing'],
    asset: '/credentials/hadoop-spark',
  },
  {
    slug: 'apache-kafka-streams',
    title: 'Apache Kafka Series — Kafka Streams for Data Processing',
    issuer: 'Infosys Springboard',
    date: "Sep '25",
    group: 'Data Engineering',
    skills: ['Kafka', 'Stream processing'],
    asset: '/credentials/apache-kafka-streams',
  },
  {
    slug: 'data-lake-mastery',
    title: 'Data Lake Mastery: The Key to Big Data & Data Engineering',
    issuer: 'Infosys Springboard',
    date: "Aug '25",
    group: 'Data Engineering',
    skills: ['Data lakes', 'Big data architecture'],
    asset: '/credentials/data-lake-mastery',
  },
  {
    slug: 'data-lake-udemy',
    title: 'Data Engineering course set',
    issuer: 'Udemy',
    date: "Aug '25 — Sep '25",
    group: 'Data Engineering',
    skills: ['Data lakes', 'Big data', 'Data engineering'],
    note: 'Four course completions issued as a single credential bundle.',
    asset: '/credentials/data-lake-udemy',
  },
  {
    slug: 'accenture-data-analytics',
    title: 'Data Analytics and Visualization Virtual Experience',
    issuer: 'Accenture North America · Forage',
    date: "Aug '23",
    group: 'Professional Experience',
    skills: ['Data cleaning', 'Data modelling', 'Visualisation', 'Client communication'],
    asset: '/credentials/accenture-data-analytics',
  },
  {
    slug: 'internship-carico',
    title: 'Data Science Internship — completion certificate',
    issuer: 'Carico Systems Pvt Ltd',
    date: "Jun '25",
    group: 'Professional Experience',
    skills: ['Data science', 'Applied ML'],
    note: 'Six-month engagement.',
    asset: '/credentials/internship-carico',
  },
  {
    slug: 'internship-suvidha',
    title: 'Artificial Intelligence Internship — completion certificate',
    issuer: 'Suvidha Foundation',
    date: "Sep '24",
    group: 'Professional Experience',
    skills: ['Applied AI'],
    note: '70 hours, 24 July — 24 August 2024.',
    asset: '/credentials/internship-suvidha',
  },
];

/** Listed for completeness; no certificate file is held for these. */
export const additionalCredentials = [{ title: 'Fundamentals of MCP', issuer: 'Hugging Face', date: "Feb '26" }];

export const volunteering = {
  role: 'Animal Feeder and Care Taker',
  org: 'Paws Hunger, Mumbai',
  period: "May '22 — Present",
};

/** Domain → project edges for the engineering landscape map. */
export const landscape: { id: string; label: string; projects: string[] }[] = [
  { id: 'agentic', label: 'Agentic AI', projects: ['astroguard'] },
  { id: 'retrieval', label: 'Retrieval & RAG', projects: ['astroguard'] },
  { id: 'graphs', label: 'Knowledge Graphs', projects: ['astroguard', 'ssa-intel'] },
  { id: 'nlp', label: 'NLP', projects: ['ssa-intel', 'astroguard'] },
  { id: 'dl', label: 'Deep Learning', projects: ['radio-optical-classification', 'eco-rewind', 'ssa-intel'] },
  { id: 'cv', label: 'Computer Vision', projects: ['radio-optical-classification', 'eco-rewind'] },
  { id: 'multimodal', label: 'Multimodal', projects: ['radio-optical-classification', 'eco-rewind'] },
  { id: 'quant', label: 'Quantitative ML', projects: ['adaptive-beta'] },
  { id: 'sciai', label: 'Scientific AI', projects: ['eco-rewind', 'radio-optical-classification', 'astroguard'] },
  { id: 'eval', label: 'Evaluation Design', projects: ['radio-optical-classification', 'eco-rewind', 'adaptive-beta', 'ssa-intel'] },
];
