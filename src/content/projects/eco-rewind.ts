import type { Project } from '@/lib/types';

export const ecoRewind: Project = {
  slug: 'eco-rewind',
  name: 'EcoRewind',
  wordmark: 'EcoRewind',
  subtitle: 'Counterfactual Ecosystem Forecasting for Hurricane Impact Attribution',
  hook: 'What would this wetland look like if the hurricane had never happened?',
  summary:
    'Deep spatiotemporal models trained on pre-storm dynamics, rolled forward through a hurricane window without ever seeing the storm. The gap between that counterfactual and the satellite record is the attributed damage. Five architectures benchmarked on Sentinel-1/2 imagery.',
  domainLine: 'Deep learning · Remote sensing · Causal inference · Climate',
  categories: ['Deep Learning', 'Scientific AI', 'Computer Vision', 'Research'],
  period: 'Mar 2026 — Apr 2026',
  role: 'Sole author — independent research prototype',
  status: 'Research prototype · unpublished',
  statusTone: 'prototype',
  repo: 'https://github.com/DAISHINKAN7/EcoRewind',
  scale: '~11,300 lines of Python across 30 modules, 19 commits over ~6 weeks',
  headline: {
    value: '20.5×',
    label: 'spread in carbon-loss attribution across backbones on identical inputs',
    note: 'The headline finding is negative — and it is the most useful thing the project produced',
    prov: 'verified',
    tone: 'caution',
  },
  cardMetrics: [
    { value: '0.901', label: 'best NDVI R²', note: 'optimistic upper bound', prov: 'reported' },
    { value: '5', label: 'architectures benchmarked', prov: 'verified' },
    { value: '347.7M', label: 'pixels evaluated', prov: 'verified' },
    { value: '20×', label: 'attribution spread', prov: 'verified', tone: 'caution' },
  ],
  tech: ['PyTorch', 'Google Earth Engine', 'Sentinel-1/2', 'Mamba SSM', 'rasterio', 'W&B'],
  techGrouped: [
    { group: 'Modelling', items: ['PyTorch', 'ConvLSTM', 'U-Net', 'Mamba selective SSM', 'PatchTST', 'factorized spatiotemporal attention'] },
    { group: 'Remote sensing', items: ['Google Earth Engine', 'Sentinel-2 SR (optical)', 'Sentinel-1 GRD (C-band SAR)', 'GeoTIFF', 'rasterio'] },
    { group: 'Training', items: ['AMP mixed precision', 'gradient accumulation', 'Weights & Biases', 'MC Dropout'] },
    { group: 'Scientific Python', items: ['NumPy', 'SciPy', 'Matplotlib'] },
  ],
  glance: [
    { k: 'The question', v: '"What would this wetland have looked like if the hurricane had never happened?" — a quantity that is unobservable by construction.' },
    { k: 'Why before/after fails', v: 'Wetland NDVI swings with season, drought, salinity and inter-annual climate at magnitudes comparable to storm damage. Comparison conflates everything.' },
    { k: 'Case studies', v: 'Hurricane Irma over the Everglades (Sep 2017) and Hurricane Ida over Barataria Bay, Louisiana (Aug 2021)' },
    { k: 'Data', v: '32 quarterly median composites, 2016 Q1 → 2023 Q4, 7 bands at 10 m — optical + NDVI/NDWI + SAR_VV' },
    { k: 'Best model', v: 'EcoTransformer — NDVI R² 0.901, NDWI R² 0.917 on held-out patches, against 0.177 for the ConvLSTM baseline' },
    { k: 'Headline finding', v: 'Negative. Carbon-loss attribution varies more than 20× across backbones on identical inputs, which is a real result about how much this class of method can be trusted.' },
  ],
  heroDiagram: 'eco-concept',
  accentIndex: 3,
  related: ['radio-optical-classification', 'adaptive-beta'],
  sections: [
    {
      id: 'problem',
      nav: 'Problem',
      title: 'The target quantity cannot be observed',
      blocks: [
        {
          type: 'lede',
          text: 'When Hurricane Irma crossed the Everglades in 2017, satellites recorded a sharp drop in vegetation index. But how much of it was the hurricane?',
        },
        {
          type: 'prose',
          text: [
            'Hurricanes cause ecosystem damage that persists long after the storm passes, and quantifying it matters for carbon accounting, restoration funding and climate-impact attribution. The naive approach — compare NDVI before the storm to NDVI after — fails, because wetland vegetation indices swing substantially with season, drought and rainfall variability, salinity intrusion and inter-annual climate variability.',
            'To isolate the storm\u2019s contribution you need the counterfactual: the trajectory the ecosystem would have followed in a world where the hurricane never happened. That world is not observable. It has to be modelled.',
          ],
        },
        { type: 'diagram', id: 'eco-concept', caption: 'Train on pre-disturbance dynamics, roll forward autoregressively through the hurricane window while withholding every post-storm observation, and treat the divergence from the satellite record as attributed impact.' },
        {
          type: 'quote',
          text: 'This is not a supervised benchmark with a leaderboard. The target quantity is unobservable by construction, so there is no test-set loss to optimise against. That single property drives every design decision in the project.',
        },
        {
          type: 'definitions',
          items: [
            { term: 'No ground truth, ever', body: 'The counterfactual cannot be observed, so validation has to be indirect.' },
            { term: 'Autoregressive drift', body: 'A 10-quarter rollout compounds error — each predicted frame becomes the next input. Early runs sank into a permanent artificial winter dip.' },
            { term: 'Heavily corrupted observations', body: 'Cloud gaps leave NaNs across large fractions of optical quarters, and SAR is valid on only 12.8% of pixels — 44.3M of 347.7M.' },
            { term: 'The signal is small', body: 'Storm ΔNDVI runs roughly 0.05–0.35, against seasonal swings of comparable magnitude. Modelling error is the same size as the effect being measured.' },
          ],
        },
      ],
    },
    {
      id: 'data',
      nav: 'The data',
      title: 'Eight years of quarterly composites over two coastlines',
      blocks: [
        {
          type: 'table',
          caption: 'Data specification',
          prov: 'verified',
          head: ['Property', 'Value'],
          rows: [
            ['Sensors', 'Sentinel-2 SR (optical) + Sentinel-1 GRD (C-band SAR)'],
            ['Source', 'Google Earth Engine export → GeoTIFF'],
            ['Bands (7)', 'Blue, Green, Red, NIR, NDVI, NDWI, SAR_VV'],
            ['Spatial resolution', '10 m'],
            ['Temporal', '32 quarterly median composites, 2016 Q1 → 2023 Q4'],
            ['Tensor shape', '(T=32, C=7, H, W) per site'],
            ['Normalisation', 'minmax (optical) · shift (NDVI/NDWI) · z-score (SAR)'],
            ['Patches / windows', '128×128 at stride 64 · T_in = 4 → T_out = 4 sliding'],
            ['Optical pixels evaluated', '347,677,067'],
            ['SAR pixels evaluated', '44,348,305 (12.8%)'],
          ],
        },
        {
          type: 'table',
          caption: 'Case studies',
          prov: 'verified',
          head: ['Site', 'Ecosystem', 'Disturbance', 'Event quarter', 'Post-event quarters'],
          num: [4],
          rows: [
            ['Everglades, Florida', 'Freshwater marsh / mangrove', 'Hurricane Irma (Sep 2017)', 'Q3 2017 (t=6)', '10'],
            ['Barataria Bay, Louisiana', 'Spartina salt marsh', 'Hurricane Ida (Aug 2021)', 'Q4 2021 (t=23)', '9'],
          ],
        },
        {
          type: 'callout',
          tone: 'insight',
          title: 'A data-quality war story: the v1 site was open water',
          body: 'The Barataria Bay site required a complete v2 re-export. The v1 area-of-interest landed on open water — NDVI ≈ −0.02 to 0.05, i.e. mud flat rather than Spartina marsh. validate_mississippi_v2.py is 530 lines of explicit acceptance criteria written to catch that class of error before spending GPU time on it: expected pre-disturbance NDVI 0.20–0.55, a ≥0.05 drop at the event quarter, SAR_VV between −25 and 0 dB, NaN coverage under 60%.',
        },
        {
          type: 'prose',
          text: [
            'Quarterly median compositing is the key preprocessing decision. It suppresses transient cloud and SAR speckle while retaining the seasonal cycle that the counterfactual depends on. Degraded quarters are flagged per site in the config as poor, fair or interpolated rather than silently used.',
          ],
        },
      ],
    },
    {
      id: 'method',
      nav: 'Method',
      title: 'Five stages, and only four of them can be verified',
      blocks: [
        { type: 'diagram', id: 'eco-pipeline', caption: 'Stages 01–03 are supervised and verifiable. Stage 04 has no ground truth by construction — which is the crux of the project and the origin of most of its limitations.' },
        {
          type: 'steps',
          items: [
            { n: '01', title: 'Ingest', body: 'Google Earth Engine; Sentinel-2 SR + Sentinel-1 GRD; quarterly median composites; cloud-masked at 10 m.' },
            { n: '02', title: 'Preprocess', body: 'Tensor builder producing (T=32, C=7, H, W); per-band normalisation; validity masks and band-aware NaN fill; 128² patch sampling at stride 64.' },
            { n: '03', title: 'Train', body: 'Sliding windows T_in=4 → T_out=4 under a composite EcoRewindLoss; five architectures trained jointly on both sites under identical data, loss and schedule.' },
            { n: '04', title: 'Roll out the counterfactual', body: 'Feed the four quarters immediately preceding the hurricane as context, then predict forward autoregressively across the full post-event horizon, never feeding observed post-storm data. Repeat 50× with dropout active for a mean trajectory and per-pixel spread. Clamp each step to a seasonal climatology floor — μ − 2σ of pre-event statistics for that same calendar quarter — then stitch patches back to full resolution and inverse-normalise to physical units.' },
            { n: '05', title: 'Attribute', body: 'ΔNDVI and ΔNDWI maps, impacted hectares, carbon loss in tCO₂-eq, recovery slope and time-to-convergence.' },
          ],
        },
        {
          type: 'table',
          caption: 'The composite objective — EcoRewindLoss',
          prov: 'verified',
          head: ['Term', 'Weight', 'Purpose'],
          num: [1],
          rows: [
            ['Charbonnier reconstruction', '1.00', 'Robust L1/L2 hybrid, ε=1e-2 — tolerant of outlier pixels from residual cloud'],
            ['Temporal smoothness', '0.20', 'Penalises implausible quarter-to-quarter jumps'],
            ['Ecological constraints', '0.10', 'Hard physical bounds: NDVI/NDWI ∈ [−1,1], reflectance ∈ [0,1]'],
            ['SSIM', '0.10', 'Structural fidelity — spatial pattern, not just per-pixel error'],
          ],
        },
        {
          type: 'callout',
          tone: 'note',
          title: 'Two non-obvious details in the loss',
          body: 'SSIM is linearly warmed up over 20 epochs. Applied from epoch zero it dominates gradients before the model produces coherent structure, and training stalls. Separately, the auxiliary weights were re-scaled in v3 after the reconstruction term was corrected to per-pixel scale — at the previous weights the auxiliary terms contributed negligible gradient. They were nominally present and doing nothing.',
        },
      ],
    },
    {
      id: 'architectures',
      nav: 'Architectures',
      title: 'Five, built from scratch — three of which diverged',
      blocks: [
        { type: 'diagram', id: 'eco-architectures', caption: 'All five implemented in PyTorch and benchmarked under identical data, loss and training schedule.' },
        {
          type: 'definitions',
          items: [
            {
              term: 'EcoTransformer — the proposed model, and the only clear success',
              body: 'SAR input gate → channel importance weighting → patch embedding with 2D sinusoidal positional and learned temporal embeddings → four factorized spatiotemporal blocks (spatial attention, then temporal attention) → cross-attention with T_out query tokens → SSIM-aware decoder → band-wise output clamp. Factorizing attention keeps cost at O(HW·d + T·d) rather than O((T·HW)²), which is what makes full 128×128 attention tractable at all. The learned SAR input gate is a single scalar σ(g) initialised at σ(−3.0) ≈ 0.05 that multiplies the SAR channel — because SAR is 87% zero-fill, this lets the model suppress a mostly-invalid input rather than be corrupted by it, and learn how much to trust it.',
            },
            {
              term: 'ConvLSTM — baseline, and an interesting failure mode',
              body: 'Classic Shi et al. encoder–decoder ConvLSTM. It is the only model with positive SAR R² (0.173), yet collapses on NDVI (0.177). It tracks raw reflectance bands well while failing on the derived index that actually matters for the task.',
            },
            {
              term: 'UNet-Temporal — failed',
              body: 'Spatial U-Net encoder, temporal LSTM at the bottleneck with multi-head attention over the sequence, skip connections into the decoder. Produces NaN across all bands in joint evaluation. Its counterfactuals are numerically finite but wildly overestimate damage — 698k tCO₂ on the Everglades — consistent with an unstable rollout.',
            },
            {
              term: 'UNet-Mamba — diverged',
              body: 'Replaces the LSTM bottleneck with Mamba selective state-space blocks for linear-time sequence modelling. Diverged despite a reduced learning rate: NDVI R² −3.51, blue-band R² −680. The blue-band collapse suggests the SSM latched onto a near-constant output for low-variance channels. Its spatial damage maps still look plausible, which is its own cautionary lesson — visually reasonable output does not imply a converged model.',
            },
            {
              term: 'UNet-PatchTST — diverged',
              body: 'PatchTST-style channel-independent temporal patching at the U-Net bottleneck. NDVI R² −7.40. Likely cause: with only T_in=4 timesteps, patch_len=2 leaves just three temporal tokens — almost certainly too few for the patching inductive bias to pay off.',
            },
          ],
        },
      ],
    },
    {
      id: 'results',
      nav: 'Results',
      title: 'One solid positive result, one honest negative one',
      blocks: [
        {
          type: 'table',
          caption: 'Forecast skill — per-band R², joint evaluation on held-out patches, validity-masked per band',
          prov: 'verified',
          head: ['Model', 'NDVI', 'NDWI', 'NIR', 'Red', 'Blue', 'SAR_VV', 'RMSE'],
          num: [1, 2, 3, 4, 5, 6, 7],
          emphasis: [0],
          rows: [
            ['EcoTransformer', '0.901', '0.917', '0.877', '0.836', '0.559', '−0.097', '0.1586'],
            ['ConvLSTM (baseline)', '0.177', '0.772', '0.865', '0.818', '0.684', '0.173', '0.1568'],
            ['UNet-Temporal', 'NaN', 'NaN', 'NaN', 'NaN', 'NaN', 'NaN', 'NaN'],
            ['UNet-Mamba', '−3.51', '−1.19', '−23.1', '−269', '−680', '−6.34', '0.6650'],
            ['UNet-PatchTST', '−7.40', '−3.75', '−11.2', '−242', '−119', '−9.39', '0.6635'],
          ],
        },
        {
          type: 'callout',
          tone: 'caution',
          title: 'Required caveat whenever R² = 0.901 is quoted',
          body: 'Patches are 128 px at stride 64, so neighbours overlap 50%, and the train/val split is a patch-level random shuffle. Train and validation patches therefore share pixels. 0.901 is an optimistic upper bound, not a clean held-out score.',
        },
        {
          type: 'callout',
          tone: 'insight',
          title: 'Validation loss is not a usable model-selection signal here',
          body: 'UNet-Mamba and UNet-PatchTST reached validation losses of 2.259 and 2.348 — within about 7% of the winning EcoTransformer\u2019s 2.198 — yet produce catastrophically negative R². The composite loss is satisfiable by a degenerate near-constant predictor. Per-band R² is what separates them. That is a genuinely transferable lesson.',
        },
        {
          type: 'table',
          caption: 'Counterfactual agreement and damage extent (EcoTransformer)',
          prov: 'verified',
          head: ['Site', 'CF-vs-actual R²', 'Pixels damaged (ΔNDVI > 0.05)', 'First post-event impacted area'],
          num: [1, 2, 3],
          rows: [
            ['Everglades (Irma)', '0.821', '23.7%', '4,041 ha'],
            ['Barataria Bay (Ida)', '0.858', '36.6%', '9,905 ha (21.6% of scene)'],
          ],
        },
      ],
    },
    {
      id: 'finding',
      nav: 'The finding',
      title: 'Attribution is dominated by architecture, not by the signal',
      kicker: 'The headline result of this project is negative, and it is the most useful thing it produced.',
      blocks: [
        { type: 'chart', id: 'eco-attribution', caption: 'Carbon-loss estimates for the same storm, same inputs, same pipeline — only the backbone differs. Log scale.', prov: 'verified' },
        {
          type: 'table',
          caption: 'Attribution sensitivity across backbones',
          prov: 'verified',
          head: ['Site', 'Model', 'Peak impacted area (ha)', 'Carbon loss (tCO₂-eq)'],
          num: [2, 3],
          rows: [
            ['Everglades', 'EcoTransformer', '6,116', '50,332'],
            ['Everglades', 'UNet-Mamba', '4,089', '34,113'],
            ['Everglades', 'UNet-Temporal', '31,812', '698,259'],
            ['Barataria Bay', 'EcoTransformer', '21,612', '146,458'],
            ['Barataria Bay', 'UNet-Mamba', '23,417', '149,006'],
            ['Barataria Bay', 'UNet-Temporal', '37,836', '1,006,257'],
          ],
        },
        {
          type: 'prose',
          text: [
            'The spread is 20.5× on the Everglades and 6.9× on Barataria Bay. Identical inputs, identical pipeline, only the backbone differs. Learned counterfactual attribution here is dominated by architecture choice rather than by the geophysical signal — so no single damage figure from this class of method, including the best model\u2019s, should be quoted as an estimate of real-world impact.',
            'The nuance worth preserving: the two converged models agree within about 1.5× on Barataria Bay. The diverged model drives the extreme spread. So the finding is that attribution is architecture-sensitive and needs convergence screening — not that the method is worthless.',
          ],
        },
      ],
    },
    {
      id: 'engineering',
      nav: 'Engineering',
      title: 'Three bugs, each found from a physically impossible number',
      blocks: [
        {
          type: 'challenges',
          items: [
            {
              title: 'The validity-mask broadcast bug',
              problem: 'SAR R² came back at −89.8 and NDVI at −2.27, and every band reported the same valid-pixel count of 347,677,067 — including SAR, which should have shown roughly 44M.',
              difficulty: 'Nothing in the loss curve indicated a problem. The models were training normally; only the evaluation numbers were physically impossible, and identical pixel counts across bands with wildly different validity was the only clue.',
              approach: 'The evaluator broadcast the single optical validity channel across all seven bands via validity.expand_as(target). SAR is 87.5% finite zero-fill rather than NaN, so it passed the optical mask. R² then evaluated as 1 − Σ(pred − 0)² / Σ(0 − mean)², where the denominator collapses toward zero — producing R² in the −90s.',
              outcome: 'Switched to per-band validity: optical bands use the optical channel, SAR uses (|target_sar| > 0.05) AND optical_valid, since genuine backscatter is never exactly zero. Also switched to single-pass Welford online mean/variance so no stale batch mean contaminates the total sum of squares across batches. SAR R² moved from −89.8 to −0.097.',
            },
            {
              title: 'The universal NaN-fill bug',
              problem: 'Models were systematically under-predicting vegetation everywhere, across every site and every architecture.',
              difficulty: 'The fill value looked correct. A universal fill of 0.0 applied to invalid pixels in normalised space is a plausible neutral choice, and it is neutral — for the minmax-normalised optical bands.',
              approach: 'NDVI uses shift normalisation, where 0.0 decodes to NDVI = −1: the physical extreme of bare water. Every cloud-gap pixel therefore looked to the model like maximally dead vegetation, injecting a systematic bias proportional to cloud coverage.',
              outcome: 'Band-aware fill values, computed so each band\u2019s fill decodes to its own physical neutral point rather than a shared numerical zero.',
            },
            {
              title: 'Compounding autoregressive drift',
              problem: 'Counterfactual trajectories sank monotonically across the rollout horizon and never recovered.',
              difficulty: 'Seasonality and drift are indistinguishable to an unconstrained rollout. A predicted winter dip becomes the next input, producing a deeper dip, compounding across ten autoregressive quarters — and a genuine seasonal decline looks identical at any single step.',
              approach: 'Constrain the rollout with domain knowledge rather than dampening it globally: clamp each step to a seasonal climatology floor of μ − 2σ of the pre-event statistics for that same calendar quarter.',
              outcome: 'Seasonality is preserved because the floor is quarter-specific; unbounded drift is not, because the floor is anchored to observed pre-event statistics rather than to the model\u2019s own trajectory.',
            },
          ],
        },
        {
          type: 'quote',
          text: 'None of these were visible in the loss curve. All three were found by asking why a reported number was physically impossible.',
        },
      ],
    },
    {
      id: 'limitations',
      nav: 'Limitations',
      title: 'Eleven open items, measured rather than speculative',
      blocks: [
        {
          type: 'limitations',
          items: [
            {
              severity: 'critical',
              title: 'The counterfactual is never validated',
              detail: 'The central scientific gap. No placebo test exists in the repository. The standard remedy — roll the model across a quiet, non-hurricane window and score the "counterfactual" against actually-observed data — has not been run. Until it is, every damage and carbon figure is an unvalidated model output, not a measurement.',
              fix: 'Placebo validation over quiet pre-event windows. The single highest-value experiment; it converts the method from unfalsifiable to validated.',
            },
            {
              severity: 'critical',
              title: 'Attribution estimates are architecture-dominated',
              detail: 'Carbon loss varies more than 20× across backbones on identical inputs.',
              fix: 'Convergence screening as a hard gate before any attribution figure is computed.',
            },
            {
              severity: 'critical',
              title: 'Three of five architectures diverged',
              detail: 'UNet-Temporal produces NaN metrics; Mamba reaches NDVI R² −3.51; PatchTST −7.40. Causes are hypothesised but unconfirmed.',
              fix: 'Learning-rate sweeps, per-term loss logging, gradient-norm traces.',
            },
            {
              severity: 'critical',
              title: 'MC-Dropout intervals are uncalibrated',
              detail: 'The bands span roughly ±2.5 NDVI, exceeding the index\u2019s physical range of [−1, 1] by an order of magnitude — dropout variance is evidently not scaled correctly on inverse-transform. The intervals are not usable as confidence bounds.',
              fix: 'Trace variance through inverse-normalisation and add a coverage check.',
            },
            {
              severity: 'high',
              title: 'Spatial leakage in the validation split',
              detail: '128 px patches at stride 64 give 50% overlap, split by patch-level random shuffle. Train and validation patches share pixels, so all R² values are optimistic upper bounds.',
              fix: 'Disjoint spatial-block splits, then re-report every R² without pixel leakage.',
            },
            {
              severity: 'high',
              title: 'No held-out test set',
              detail: 'The validation split does both early stopping and reporting, so metrics are selection-biased.',
              fix: 'A held-out test set distinct from the early-stopping split.',
            },
            {
              severity: 'high',
              title: 'The ablation harness is broken',
              detail: 'Four of six configurations crash with a channel-count mismatch because the model is not rebuilt when input bands are dropped. Of what ran: dropping SAR costs little, while NDVI-only input degrades reconstruction MSE roughly 4× (0.193 → 0.750). Conclusions about loss-term contributions cannot currently be drawn.',
              fix: 'Rebuild the model per band configuration.',
            },
            {
              severity: 'medium',
              title: 'SAR contributes nothing',
              detail: 'Negative R² for every converged model. At 87.2% zero fill the band is effectively noise.',
              fix: 'Temporal interpolation over the 87% gap, or drop the band with justification.',
            },
            {
              severity: 'medium',
              title: 'Carbon conversion is a coarse linear proxy',
              detail: 'A single factor of 85.0 tCO₂ per unit ΔNDVI per hectare, applied uniformly across marsh, mangrove and open water — classes whose real carbon density varies by an order of magnitude. Treat tCO₂ as a relative index, not an inventory.',
              fix: 'Land-cover-aware carbon factors replacing the global constant.',
            },
            {
              severity: 'medium',
              title: 'Convergence detection is unreliable',
              detail: 'time_to_convergence_quarters reads 0 for every model, because the counterfactual–actual gap oscillates in sign rather than closing monotonically. The metric assumes monotone recovery; the data does not oblige.',
              fix: 'Replace it with a metric tolerating non-monotone recovery.',
            },
            {
              severity: 'low',
              title: 'Reproducibility gaps',
              detail: 'The Google Earth Engine export script is uncommitted, the config retains a hardcoded development path, there is no test suite, checkpoints are gitignored, and one metrics file was overwritten under the wrong model name.',
              fix: 'Commit the export script, de-hardcode paths, add a test suite.',
            },
          ],
        },
      ],
    },
  ],
};
