import type { Project } from '@/lib/types';

export const radioOptical: Project = {
  slug: 'radio-optical-classification',
  name: 'Radio × Optical Galaxy Classification',
  wordmark: 'Radio × Optical',
  subtitle: 'Multimodal Galaxy Morphology Classification',
  hook: 'Six classes of galaxy, read from paired radio and optical telescope imagery at once.',
  summary:
    'A multimodal deep-learning benchmark on a 6,010-pair radio + optical dataset built from scratch out of astronomical survey APIs. Four architectures plus a weighted ensemble, evaluated over 10 seeded runs with 95% confidence intervals and pairwise significance testing.',
  domainLine: 'Computer vision · Multimodal deep learning · Astroinformatics',
  categories: ['Deep Learning', 'Computer Vision', 'Multimodal AI', 'Research'],
  period: 'Sep 2025 — Mar 2026',
  role: 'Sole author — dataset construction, modelling, evaluation, deployment',
  status: 'Complete benchmark · live demo available',
  statusTone: 'live',
  repo: 'https://github.com/DAISHINKAN7/Radio-Optical-Classification',
  demo: 'https://radio-optical-frontend.vercel.app/',
  scale: '~6,000 lines of Python across 25+ modules',
  headline: {
    value: '97.60% ± 0.31',
    label: 'weighted ensemble accuracy over 10 seeded runs',
    note: 'Author-reported. Carries a split-leakage caveat — see limitations.',
    prov: 'reported',
  },
  cardMetrics: [
    { value: '6,010', label: 'paired cutouts built', prov: 'verified' },
    { value: '18.84 GB', label: 'dataset, zero corrupt files', prov: 'verified' },
    { value: '5', label: 'architectures benchmarked', prov: 'verified' },
    { value: '97.60%', label: 'top reported accuracy', prov: 'reported' },
  ],
  tech: ['PyTorch', 'ConvNeXt', 'EfficientNet', 'ViT', 'Astropy', 'CUDA AMP', 'scikit-learn'],
  techGrouped: [
    { group: 'Deep learning', items: ['PyTorch 2.0+', 'torchvision 0.15+', 'CUDA', 'AMP FP16', 'RTX A4000 16 GB'] },
    { group: 'Architectures', items: ['ConvNeXt-Tiny', 'EfficientNet-B0', 'ResNet-34', 'ViT (from scratch)', 'Pix2Pix U-Net + PatchGAN'] },
    { group: 'Astronomy', items: ['Astropy 5.0+', 'Astroquery 0.4.6+', 'FITS handling', 'LOFAR LoTSS DR2', 'SDSS DR17', 'DESI Legacy Surveys'] },
    { group: 'Scientific Python', items: ['NumPy', 'SciPy', 'scikit-learn', 'scikit-image', 'pandas', 'OpenCV'] },
    { group: 'Statistics', items: ["Student's t confidence intervals", 'independent t-tests', 'one-way ANOVA'] },
    { group: 'Concurrency', items: ['ThreadPoolExecutor (16 workers)', 'retry + service fallback'] },
  ],
  glance: [
    { k: 'Research question', v: 'Can six astrophysical morphology classes be separated from paired radio and optical imagery, and what does an inductive bias buy you at this data scale?' },
    { k: 'The hard part', v: 'No dataset existed. There is no torchvision.datasets.LoTSS — a balanced, paired, labelled radio+optical morphology set had to be constructed from raw survey APIs before any modelling could start.' },
    { k: 'Dataset', v: '6,010 validated pairs · 18.84 GB · six classes balanced to within 0.13 pp · zero corrupted files' },
    { k: 'Input', v: 'A 2-channel (2, 600, 600) float32 tensor — optical L and log-compressed radio L, each normalised independently' },
    { k: 'Evaluation', v: '10 seeded runs per model, 95% CI from Student\u2019s t at df = 9, pairwise t-tests and one-way ANOVA' },
    { k: 'Key result', v: 'Weighted ensemble 97.60% ± 0.31% — reported by the author, with a disclosed split-leakage caveat' },
  ],
  heroDiagram: 'radio-architectures',
  accentIndex: 1,
  related: ['eco-rewind', 'astroguard'],
  sections: [
    {
      id: 'problem',
      nav: 'Problem',
      title: 'Radio astronomy is drowning in sources',
      blocks: [
        {
          type: 'lede',
          text: 'LOFAR\u2019s LoTSS DR2 survey catalogued roughly 4.4 million radio sources. Human classification does not scale to that, and the SKA era projects 10\u2078 or more.',
        },
        {
          type: 'prose',
          text: [
            'Every galaxy looks different depending on which instrument you point at it. In optical light you see stars, dust and spiral arms. At 144 MHz you see synchrotron radiation from relativistic electrons — jets, lobes and hotspots that may extend far beyond the visible galaxy entirely. Classifying morphology properly means reading both at once.',
            'That is harder than it sounds, for six concrete reasons — each of which shaped a design decision downstream.',
          ],
        },
        {
          type: 'table',
          caption: 'Why naive computer vision fails on this data',
          head: ['#', 'Challenge', 'Why it breaks a standard pipeline'],
          rows: [
            ['1', 'Extreme sparsity', 'A radio map is ~99% empty sky, and flux inside a single cutout spans 4+ orders of magnitude. A bright hotspot can be 10,000× the diffuse lobe around it — linear normalisation crushes every faint structure to zero.'],
            ['2', 'Cross-modal misalignment', 'Radio lobes routinely extend far beyond the optical host galaxy. The object physically occupies two different regions in the two images.'],
            ['3', 'Class ambiguity', 'A radio-loud AGN is typically hosted by an elliptical galaxy. The class boundary is physical and causal, not purely visual, so some confusion is ontological rather than a model failure.'],
            ['4', 'Resolution mismatch', 'LOFAR\u2019s synthesised beam is ~6 arcseconds; optical seeing is ~1 arcsecond. The two modalities are simply not equally sharp.'],
            ['5', 'Dirty real data', 'Interferometric FITS files carry NaN-blanked pixels, negative sidelobe artefacts, and noise floors that vary field to field.'],
            ['6', 'No dataset exists', 'There is no ready-made paired radio+optical morphology dataset. It has to be constructed.'],
          ],
        },
      ],
    },
    {
      id: 'dataset',
      nav: 'The dataset',
      title: 'Built, not downloaded',
      kicker: 'The single strongest differentiator of this project. Most computer-vision work starts from a Kaggle zip; this starts from survey APIs.',
      blocks: [
        { type: 'diagram', id: 'radio-pipeline', caption: 'Four-stage acquisition: catalogue query, coverage filtering, concurrent cutout download with service fallback, then automated validation.' },
        {
          type: 'steps',
          items: [
            {
              n: '01',
              title: 'Catalogue query',
              body: 'SDSS DR17 through SkyServer SQL via astroquery.sdss.query_sql, and VizieR/CDS for LoTSS DR2 catalogue tables. Per-class selection uses morphology flags, spectroscopic classification, magnitude and redshift constraints.',
            },
            {
              n: '02',
              title: 'Coverage filtering',
              body: 'RA/Dec cross-match keeping only objects inside the LoTSS ∩ SDSS overlap, plus physical cuts on minimum flux ratio (0.01) and minimum optical size (5,000 px²).',
            },
            {
              n: '03',
              title: 'Parallel cutout download',
              body: 'ThreadPoolExecutor with 16 workers. Radio: the LOFAR DR2 cutout service, a 15-arcmin field at 1.5″/pixel giving 600×600 FITS at 144 MHz. Optical: SDSS ImgCutout getjpeg, with automatic fallback to the DESI Legacy Imaging Surveys cutout service at 512×512 RGB. Retry logic and per-service error handling throughout.',
            },
            {
              n: '04',
              title: 'Validation',
              body: 'Radio signal-to-noise check, optical brightness and contrast verification, pair completeness scan across both modalities for the same object id, and a corruption scan over every file.',
            },
          ],
        },
        {
          type: 'metrics',
          cols: 4,
          items: [
            { value: '6,010', label: 'validated pairs', prov: 'verified' },
            { value: '18.84 GB', label: 'on disk', prov: 'verified' },
            { value: '0', label: 'corrupted or unpaired files', prov: 'verified' },
            { value: '0.13 pp', label: 'class-balance spread', prov: 'verified' },
          ],
        },
        {
          type: 'table',
          caption: 'Six balanced astrophysical classes, and what each one physically is',
          prov: 'verified',
          head: ['Class', 'Pairs', 'Share', 'What it is'],
          num: [1, 2],
          rows: [
            ['Elliptical Galaxies', '1,008', '16.77%', 'Smooth, featureless de Vaucouleurs light profile'],
            ['Spiral Galaxies', '1,002', '16.67%', 'Disc morphology with arms and extended star formation'],
            ['Compact Sources', '1,000', '16.64%', 'Unresolved single radio component, no extended structure'],
            ['FR-II Radio Galaxies', '1,000', '16.64%', 'Fanaroff–Riley II: edge-brightened twin lobes with bright hotspots'],
            ['Radio-Loud AGN', '1,000', '16.64%', 'Core-dominated AGN with high radio-to-optical luminosity ratio'],
            ['Starburst Galaxies', '1,000', '16.64%', 'Compact, clumpy, high star-formation-rate systems with blue optical excess'],
          ],
        },
        {
          type: 'callout',
          tone: 'insight',
          title: 'Iterative dataset engineering, not a one-shot download',
          body: 'boost_elliptical.py is a targeted top-up script written after the fact, because the elliptical class came back under-populated. It relaxed the selection criteria and grew that class from 72 to 1,008 samples. That kind of second pass is what makes a balanced dataset possible at all.',
        },
      ],
    },
    {
      id: 'preprocessing',
      nav: 'Preprocessing',
      title: 'Two modalities never share a normalisation',
      blocks: [
        { type: 'diagram', id: 'radio-preprocessing', caption: 'Both modalities load as greyscale and resize to 600×600, then run separate normalisation paths before stacking into a 2-channel tensor.' },
        {
          type: 'quote',
          text: 'Radio and optical are different physical measurements. Packing them into RGB channels would force them to share a normalisation, which destroys the radio channel\u2019s faint structure.',
        },
        {
          type: 'callout',
          tone: 'insight',
          title: 'Why log1p is the load-bearing step',
          body: 'Synchrotron flux inside a single cutout spans several orders of magnitude. Under linear normalisation a bright hotspot saturates the range and every faint lobe collapses to zero — the network would literally never see the structure that defines an FR-II. Logarithmic compression is standard practice in radio astronomy, and it is what makes those features learnable at all.',
        },
        {
          type: 'table',
          caption: 'Augmentation — geometric transforms are locked across channels, photometric ones are per-modality',
          prov: 'verified',
          head: ['Transform', 'Applied to', 'Parameters', 'Justification'],
          rows: [
            ['Rotation 0/90/180/270°', 'both, locked', "p = 0.7, mode='reflect'", 'Galaxies have no canonical orientation'],
            ['Horizontal flip', 'both, locked', 'p = 0.5', 'Parity is not physically meaningful on the sky'],
            ['Vertical flip', 'both, locked', 'p = 0.5', 'As above'],
            ['Brightness / contrast', 'optical only', '×0.8–1.2', 'Seeing and calibration variation'],
            ['Brightness', 'radio only', '×0.9–1.1 (conservative)', 'Flux carries the class signal'],
            ['Gaussian blur', 'radio only', 'σ 0.3–0.7, p = 0.3', 'Simulates varying synthesised-beam size'],
            ['Gaussian noise', 'both', 'σ 0.05 optical / 0.03 radio', 'Detector and thermal noise floor'],
            ['Colour jitter', 'never used', '—', 'In astronomy, colour is the physical measurement'],
          ],
        },
      ],
    },
    {
      id: 'architecture',
      nav: 'Architectures',
      title: 'Four backbones, surgically re-stemmed',
      blocks: [
        { type: 'diagram', id: 'radio-architectures', caption: 'A single 2-channel tensor fans into four architecture families; the two strongest merge into a confidence-weighted ensemble.' },
        {
          type: 'prose',
          text: [
            'Every backbone has its input stem rebuilt for 2-channel input, and the ImageNet-pretrained stem weights are transferred rather than discarded. This is the difference between real transfer-learning engineering and simply replacing the final linear layer.',
          ],
        },
        {
          type: 'code',
          lang: 'python',
          file: 'models/convnext_model.py · models/resnet_model.py',
          why: 'Two different weight-transfer strategies, chosen per architecture. ConvNeXt\u2019s patchify stem slices the first two of three RGB channels; ResNet\u2019s 7×7 stem averages the RGB kernels and broadcasts, which preserves the learned edge and texture filters instead of throwing them away.',
          code: `# ConvNeXt-Tiny — pretrained RGB stem weights SLICED to the first 2 channels
self.stem = nn.Sequential(
    nn.Conv2d(2, 96, kernel_size=4, stride=4),
    nn.LayerNorm([96, 150, 150])              # 600 / 4 = 150
)
self.stem[0].weight.data = pretrained_weight[:, :2, :, :].clone()

# ResNet-34 — RGB kernels CHANNEL-AVERAGED then broadcast to 2 channels
self.conv1.weight.data = pretrained_weight.mean(dim=1, keepdim=True).repeat(1, 2, 1, 1)`,
        },
        {
          type: 'table',
          caption: 'The architecture zoo — all take (B, 2, 600, 600) and output 6 logits',
          prov: 'verified',
          head: ['Model', 'Family', 'Stem strategy', 'Feature dim', 'Params'],
          num: [4],
          rows: [
            ['ConvNeXt-Tiny', 'Modern CNN', 'Slice pretrained 4×4 patchify conv, 2→96 + LayerNorm', '768', '≈28M'],
            ['EfficientNet-B0', 'Scaled CNN', 'Slice pretrained 3×3 stride-2 conv, 2→32', '1280', '≈4.7M'],
            ['ResNet-34', 'Classical CNN', 'Channel-average pretrained 7×7 conv, 2→64', '512', '≈21M'],
            ['ViT', 'Transformer', 'Conv2d(2, 384, k=30, s=30) → 400 tokens, no pretraining', '384', '≈11M'],
          ],
        },
        {
          type: 'callout',
          tone: 'note',
          title: 'The ViT is hand-written, not imported',
          body: 'PatchEmbedding, fused-QKV MultiHeadAttention with head_dim^-0.5 scaling, pre-norm TransformerBlocks, learnable cls_token and pos_embed at trunc_normal_(std=0.02) — all implemented individually. Image size 600, patch size 30, embed dim 384, depth 6, heads 6, MLP ratio 4.0. It is trained entirely from scratch on roughly 4,800 images, and that is deliberate.',
        },
        {
          type: 'code',
          lang: 'python',
          file: 'models/ensemble_model.py',
          why: 'The ensemble weights are never hand-tuned. They are read from each checkpoint\u2019s stored validation accuracy at load time, so the ensemble self-calibrates to whatever checkpoints it is handed.',
          code: `eff_acc  = efficientnet_checkpoint.get('val_acc', 0.8809)
conv_acc = convnext_checkpoint.get('val_acc',   0.8993)
total    = eff_acc + conv_acc
self.weights = torch.tensor([eff_acc / total, conv_acc / total], device=device)

# p_final = w1 * p_efficientnet + w2 * p_convnext,  sum(w) = 1
# combined probabilities go back to log-space, log(p + 1e-8),
# so the result drops straight into a standard cross-entropy loss`,
        },
      ],
    },
    {
      id: 'evaluation',
      nav: 'Protocol',
      title: 'Nobody should trust a single number',
      blocks: [
        {
          type: 'prose',
          text: [
            'Results are not single numbers. Each model is evaluated over 10 seeded runs (seeds 42 → 51), each re-seeding torch and numpy and re-instantiating the evaluation dataset. Per run, the harness captures accuracy, per-class precision/recall/F1/support, macro and weighted averages, and one-vs-rest ROC-AUC for each of the six classes.',
            'Aggregation computes mean, standard deviation, min and max across the ten runs, then a 95% confidence interval from Student\u2019s t-distribution with df = 9 — the statistically correct choice at n = 10, rather than a normal approximation. Models are then compared with pairwise independent t-tests annotated with significance stars, plus a one-way ANOVA across all models.',
          ],
        },
        {
          type: 'list',
          title: 'Artefacts the protocol emits',
          items: [
            'confidence_intervals.png — error-bar plot across all metrics',
            'run_variations.png — per-run stability traces',
            'Aggregated confusion matrix, mean with per-cell standard deviation',
            'accuracy_boxplot.png — cross-model distribution comparison',
            'Publication-ready tables in CSV, JSON and TXT, including the seed list and degrees of freedom used',
          ],
        },
        {
          type: 'code',
          lang: 'bash',
          file: 'run_all_testing_commands.txt',
          why: 'Every evaluation command is checked into the repository, so the numbers below can be regenerated rather than taken on trust.',
          code: `python testing/test_model_multirun.py --model convnext \\
  --checkpoint outputs/convnext/best_model.pth \\
  --output_dir outputs/convnext_multirun --num_runs 10 --device cuda

python testing/test_ensemble_multirun.py \\
  --efficientnet_path outputs/efficientnet/best_model.pth \\
  --convnext_path outputs/convnext/best_model.pth \\
  --output_dir outputs/ensemble_multirun --method weighted --num_runs 10 --device cuda

python testing/compare_models_multirun.py     # t-tests + ANOVA + boxplots`,
        },
      ],
    },
    {
      id: 'results',
      nav: 'Results',
      title: 'The benchmark',
      kicker: 'Author-reported. The outputs/ directory is gitignored, so raw run artefacts are not in the repository and could not be independently re-derived.',
      blocks: [
        { type: 'chart', id: 'radio-results', caption: 'Mean accuracy over 10 seeded runs with 95% confidence intervals. The ensemble\u2019s interval does not overlap the best single model\u2019s.', prov: 'reported' },
        {
          type: 'table',
          caption: 'Full benchmark',
          prov: 'reported',
          head: ['Model', 'Type', 'Params', 'Accuracy (mean ± 95% CI)', 'F1', 'AUC'],
          num: [2, 3, 4, 5],
          emphasis: [0],
          rows: [
            ['Ensemble (ConvNeXt ⊕ EfficientNet)', 'weighted soft-voting', '≈33M', '97.60% ± 0.31%', '0.976', '0.999'],
            ['ConvNeXt-Tiny', 'modern CNN', '≈28M', '96.59% ± 0.22%', '0.966', '0.998'],
            ['EfficientNet-B0', 'scaled CNN', '≈4.7M', '95.35% ± 0.42%', '0.953', '0.997'],
            ['ResNet-34', 'classical CNN', '≈21M', '92.09% ± 0.60%', '0.921', '0.992'],
            ['ViT (from scratch)', 'transformer', '≈11M', '85.39% ± 0.53%', '0.852', '0.978'],
          ],
        },
        {
          type: 'definitions',
          items: [
            {
              term: 'Modern CNN inductive biases win at this data scale',
              body: 'ConvNeXt-Tiny outperforms a from-scratch ViT of comparable order by 11.2 percentage points.',
            },
            {
              term: 'Parameter efficiency is real',
              body: 'EfficientNet-B0 reaches 95.35% with roughly 6× fewer parameters than ConvNeXt — the best accuracy-per-parameter in the benchmark.',
            },
            {
              term: 'The ensemble gain is not noise',
              body: '+1.01 pp over the best single model with non-overlapping confidence intervals. The two backbones make decorrelated errors — ConvNeXt\u2019s global patchify stem and EfficientNet\u2019s local MBConv hierarchy learn genuinely different representations, and soft-voting harvests exactly that.',
            },
            {
              term: 'Every model is stable',
              body: 'The widest confidence interval in the table is ±0.60 pp, indicating a well-conditioned problem once preprocessing is correct.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'insight',
          title: 'The most interesting result is the one that loses',
          body: 'The Vision Transformer is not a failed model — it is a data-starved one, deliberately. CNNs have locality and translation equivariance hard-wired into their convolutions; transformers must learn those priors from data. With roughly 4,800 training images there is not enough signal to learn them. The 11-point gap is therefore a clean empirical measurement of what a good inductive bias is worth at small data scale, which is a far more interesting result to discuss than a leaderboard win.',
        },
      ],
    },
    {
      id: 'gan',
      nav: 'Second track',
      title: 'Can optical appearance be synthesised from radio emission?',
      blocks: [
        {
          type: 'prose',
          text: [
            'A parallel exploratory direction implements Pix2Pix: a UNetGenerator with an 8-level encoder and 7-level decoder with skip connections at every scale, resolution laddering 600 → 300 → 150 → 75 → 37 → 18 → 9 → 4 and back, including a bilinear-interpolation guard against odd-size skip mismatches. Discrimination is a PatchGAN Markovian discriminator judging N×N patches rather than the whole image, and the objective adds a VGG perceptual term.',
          ],
        },
        {
          type: 'table',
          caption: 'GAN training configuration',
          prov: 'verified',
          head: ['Setting', 'Value'],
          rows: [
            ['Objective', 'L = L_GAN + 100 · L_L1 + 10 · L_VGG'],
            ['Generator / discriminator filters', 'ngf 64 / ndf 64'],
            ['Learning rates', 'g_lr 2e-4, d_lr 2e-4'],
            ['Batch size', '2, with gradient accumulation ×2'],
            ['Epochs / precision', '200 / AMP FP16'],
            ['Modes', 'radio2optical (default) and the reverse'],
          ],
        },
        {
          type: 'callout',
          tone: 'caution',
          title: 'No GAN results are reported',
          body: 'No quantitative generative results were measured, and none are claimed. This is an exploratory second track, presented as such.',
        },
      ],
    },
    {
      id: 'training',
      nav: 'Training',
      title: 'Training recipe and the constraint that shaped it',
      blocks: [
        {
          type: 'table',
          caption: 'Shared trainer',
          prov: 'verified',
          head: ['Component', 'Implementation'],
          rows: [
            ['Optimiser', 'AdamW with decoupled weight decay'],
            ['Scheduler', 'CosineAnnealingWarmRestarts, T_mult = 2, eta_min = 1e-6'],
            ['Loss', 'CrossEntropyLoss (class weights supported but unused — classes are balanced)'],
            ['Mixed precision', 'torch.amp.autocast + GradScaler, auto-enabled on CUDA'],
            ['Gradient clipping', 'clip_grad_norm_(max_norm=1.0), applied after scaler.unscale_()'],
            ['Early stopping', 'patience 15 epochs on validation accuracy'],
            ['Checkpointing', 'model + optimiser + scheduler + AMP scaler state, plus epoch / val_loss / val_acc'],
          ],
        },
        {
          type: 'table',
          caption: 'Per-model hyperparameters',
          prov: 'verified',
          head: ['Hyper-parameter', 'ConvNeXt', 'EfficientNet', 'ResNet-34', 'ViT'],
          num: [1, 2, 3, 4],
          rows: [
            ['Batch size', '12', '12', '16', '8'],
            ['Epochs', '100', '100', '100', '150'],
            ['Learning rate', '1e-4', '1e-4', '1e-4', '5e-5'],
            ['Weight decay', '0.05', '0.01', '0.01', '0.05'],
            ['Dropout', '0.3', '0.5', '0.5', '0.2'],
            ['Cosine T_0', '10', '10', '10', '15'],
            ['Seed', '42', '42', '42', '42'],
          ],
        },
        {
          type: 'callout',
          tone: 'note',
          title: 'Mixed precision is mandatory, not optional',
          body: 'Training at full 600×600 resolution with 2 channels at batch size 12 on a 16 GB RTX A4000 is only feasible under AMP. FP32 exhausts VRAM. The native LOFAR cutout is 600×600 at 1.5″/pixel, and downsampling to the usual 224 would discard exactly the extended low-surface-brightness lobe structure that separates FR-II from compact sources — so the resolution is not negotiable, and the memory budget had to bend around it.',
        },
      ],
    },
    {
      id: 'limitations',
      nav: 'Limitations',
      title: 'Where these numbers are soft',
      kicker: 'The evaluation protocol has a leakage risk. It is disclosed here rather than discovered by a reviewer.',
      blocks: [
        {
          type: 'limitations',
          items: [
            {
              severity: 'critical',
              title: 'Evaluation-split leakage',
              detail: 'dataset.py::_stratified_split derives the train/val partition from the seed passed in, and the multi-run evaluator passes a different seed each run (42→51). The checkpoint being evaluated was trained on the seed-42 split, so in runs 2–10 part of the "validation" set consists of images the model saw during training. This inflates the reported accuracies, and means the confidence intervals measure split variance rather than pure generalisation.',
              fix: 'Freeze one held-out test split, exclude it from all training, and vary only the inference seed across runs. Roughly a 20-line change and the top roadmap item.',
            },
            {
              severity: 'high',
              title: 'Results are author-reported, not independently verifiable',
              detail: 'The outputs/ directory is gitignored, so raw run artefacts, trained checkpoints, confusion matrices and ROC curves are not in the repository.',
              fix: 'Ship checkpoints or a download script, and commit the aggregated evaluation tables.',
            },
            {
              severity: 'medium',
              title: 'Earlier checkpoints likely sat lower',
              detail: 'ensemble_model.py hardcodes fallback validation accuracies of 0.8809 (EfficientNet) and 0.8993 (ConvNeXt), suggesting an earlier training run landed in the 88–90% range. These are only defaults used when a checkpoint lacks a val_acc key, but they are worth knowing about.',
              fix: 'Record and publish the full training history alongside the final checkpoints.',
            },
            {
              severity: 'medium',
              title: 'The class taxonomy is treated as single-label',
              detail: 'A radio-loud AGN genuinely is also an elliptical galaxy. Forcing a single label puts a structural ceiling on some class boundaries.',
              fix: 'Re-frame as multi-label, and validate a sample of catalogue-derived labels against expert-labelled sources.',
            },
            {
              severity: 'low',
              title: 'The ViT is not pretrained',
              detail: 'It is trained from scratch, which is why it trails. That is the intended experiment, but it does mean the transformer family is under-represented in the benchmark.',
              fix: 'Add a pretrained ViT or Swin baseline to separate "transformer" from "trained from scratch".',
            },
          ],
        },
      ],
    },
  ],
};
