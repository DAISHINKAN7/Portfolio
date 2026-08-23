import { Frame, Defs, Box, T, Label, Path, C } from './primitives';

export function RadioPipeline() {
  const stages = [
    {
      n: '01',
      t: 'Catalogue query',
      lines: ['SDSS DR17 via SkyServer SQL', 'VizieR / CDS for LoTSS DR2', 'morphology + spectral flags'],
      out: '~27,900 candidate rows queried',
    },
    {
      n: '02',
      t: 'Coverage filter',
      lines: ['RA/Dec cross-match', 'LoTSS ∩ SDSS overlap only', 'flux ratio ≥ 0.01, size ≥ 5,000 px²'],
      out: 'objects inside both footprints',
    },
    {
      n: '03',
      t: 'Parallel download',
      lines: ['ThreadPoolExecutor, 16 workers', 'radio: 600×600 FITS @ 144 MHz', 'optical: 512×512, Legacy fallback'],
      out: 'paired cutouts, retry per service',
    },
    {
      n: '04',
      t: 'Validation',
      lines: ['radio S/N check', 'optical brightness + contrast', 'pair completeness + corruption scan'],
      out: '6,010 pairs · 18.84 GB · 0 corrupt',
    },
  ];
  return (
    <Frame viewBox="0 0 1000 300" minWidth={760} title="Dataset acquisition pipeline">
      <Defs />
      <Label x={24} y={26}>There is no ready-made paired radio + optical morphology dataset — so one was constructed</Label>
      {stages.map((s, i) => {
        const x = 24 + i * 245;
        const last = i === 3;
        return (
          <g key={s.n}>
            <Box x={x} y={44} w={222} h={168} fill={last ? C.soft : C.white} stroke={last ? C.accent : C.rule2} />
            <rect x={x} y={44} width={3} height={168} fill={last ? C.accent : C.rule2} />
            <T x={x + 16} y={68} size={9} mono upper tracking={1.2} fill={last ? C.accent : C.ink3}>
              stage {s.n}
            </T>
            <T x={x + 16} y={92} size={15} weight={600}>{s.t}</T>
            {s.lines.map((l, li) => (
              <T key={li} x={x + 16} y={116 + li * 17} size={10.5} fill={C.ink2}>{l}</T>
            ))}
            <line x1={x + 16} y1={178} x2={x + 206} y2={178} stroke={last ? C.accent : C.rule} />
            <T x={x + 16} y={198} size={10.5} mono fill={last ? C.accent : C.ink3}>{s.out}</T>
            {!last ? <Path d={`M${x + 226} 128 H${x + 240}`} marker="a" /> : null}
          </g>
        );
      })}
      <Box x={24} y={240} w={952} h={44} fill={C.cautionSoft} stroke={C.caution} />
      <T x={40} y={268} size={11.5} fill={C.ink}>
        Iterative, not one-shot: boost_elliptical.py was written after the fact to relax selection criteria and grow the elliptical class from 72 to 1,008 samples.
      </T>
    </Frame>
  );
}

export function RadioPreprocessing() {
  const optical = ['nan_to_num (NaN→0, ±inf clamped)', 'clip to [0, 255]', 'min–max normalise to [0, 1]', 'standardise μ=0, σ=1'];
  const radio = ['nan_to_num', 'clip to [0, 255]', 'min–max normalise to [0, 1]', 'log1p — dynamic-range compression', 'standardise μ=0, σ=1'];
  return (
    <Frame viewBox="0 0 1000 380" minWidth={720} title="Two-lane preprocessing into a two-channel tensor">
      <Defs />
      <Label x={24} y={26}>Both modalities load as greyscale L and resize to 600×600 — then the paths separate</Label>

      {/* optical lane */}
      <Box x={24} y={44} w={330} h={172} />
      <rect x={24} y={44} width={3} height={172} fill={C.rule2} />
      <T x={42} y={70} size={9} mono upper tracking={1.2} fill={C.ink3}>Channel 0 · optical (SDSS / Legacy)</T>
      {optical.map((l, i) => (
        <g key={l}>
          <circle cx={48} cy={94 + i * 28} r={2.5} fill={C.rule2} />
          <T x={62} y={98 + i * 28} size={11.5} fill={C.ink2}>{l}</T>
        </g>
      ))}

      {/* radio lane */}
      <Box x={24} y={232} w={330} h={200} fill={C.white} />
      <rect x={24} y={232} width={3} height={128} fill={C.accent} />
      <T x={42} y={258} size={9} mono upper tracking={1.2} fill={C.accent}>Channel 1 · radio (LOFAR 144 MHz)</T>
      {radio.map((l, i) => {
        const hot = i === 3;
        return (
          <g key={l}>
            <circle cx={48} cy={282 + i * 26} r={2.5} fill={hot ? C.accent : C.rule2} />
            <T x={62} y={286 + i * 26} size={11.5} fill={hot ? C.accent : C.ink2} weight={hot ? 600 : 400}>
              {l}
            </T>
          </g>
        );
      })}

      <Path d="M358 130 Q420 130 420 176" marker="a" />
      <Path d="M358 300 Q420 300 420 216" marker="a" />
      <Path d="M420 196 H468" marker="ac" stroke={C.accent} />

      {/* tensor */}
      <Box x={476} y={128} w={230} h={140} fill={C.soft} stroke={C.accent} />
      <T x={492} y={154} size={9} mono upper tracking={1.2} fill={C.accent}>Stacked input</T>
      <T x={492} y={192} size={22} mono fill={C.ink}>(2, 600, 600)</T>
      <T x={492} y={216} size={11.5} fill={C.ink2}>float32 · ch0 optical, ch1 log-radio</T>
      <T x={492} y={240} size={11.5} fill={C.ink2}>each normalised independently</T>

      {/* why */}
      <Box x={730} y={44} w={246} h={288} fill={C.panel} stroke={C.rule} />
      <T x={748} y={72} size={9} mono upper tracking={1.2} fill={C.ink3}>Why the paths differ</T>
      {[
        'Synchrotron flux inside one cutout spans',
        'several orders of magnitude. Under linear',
        'normalisation a bright hotspot saturates',
        'the range and every faint lobe collapses',
        'to zero — the network would never see the',
        'structure that defines an FR-II.',
      ].map((l, i) => (
        <T key={i} x={748} y={100 + i * 18} size={11.5} fill={C.ink2}>{l}</T>
      ))}
      <line x1={748} y1={224} x2={958} y2={224} stroke={C.rule} />
      {[
        'Geometric augmentations are locked across',
        'both channels to preserve registration.',
        'Photometric ones are per-modality.',
        'Colour jitter is never used — in astronomy,',
        'colour is the physical measurement.',
      ].map((l, i) => (
        <T key={i} x={748} y={250 + i * 18} size={11.5} fill={C.ink2}>{l}</T>
      ))}
    </Frame>
  );
}

export function RadioArchitectures() {
  const models = [
    { t: 'ConvNeXt-Tiny', fam: 'modern CNN', stem: 'slice [:, :2]', p: '≈28M', acc: 96.59, feat: '768' },
    { t: 'EfficientNet-B0', fam: 'scaled CNN', stem: 'slice [:, :2]', p: '≈4.7M', acc: 95.35, feat: '1280' },
    { t: 'ResNet-34', fam: 'classical CNN', stem: 'channel-average', p: '≈21M', acc: 92.09, feat: '512' },
    { t: 'ViT (scratch)', fam: 'transformer', stem: 'patch 30×30', p: '≈11M', acc: 85.39, feat: '384' },
  ];
  return (
    <Frame viewBox="0 0 1000 420" minWidth={760} title="Architecture zoo and weighted ensemble">
      <Defs />
      <Box x={24} y={44} w={168} h={72} fill={C.soft} stroke={C.accent} />
      <T x={40} y={68} size={9} mono upper tracking={1.2} fill={C.accent}>Input</T>
      <T x={40} y={94} size={16} mono fill={C.ink}>(B, 2, 600, 600)</T>
      <T x={40} y={110} size={10} fill={C.ink2}>→ 6 logits</T>

      {models.map((m, i) => {
        const x = 220 + i * 194;
        const top2 = i < 2;
        return (
          <g key={m.t}>
            <Path d={`M192 80 Q${x - 14} 80 ${x - 14} 62 V${88}`} marker="a" />
            <Box x={x} y={44} w={172} h={196} stroke={top2 ? C.accent : C.rule2} />
            <rect x={x} y={44} width={172} height={3} fill={top2 ? C.accent : C.rule2} />
            <T x={x + 14} y={72} size={13.5} weight={600}>{m.t}</T>
            <T x={x + 14} y={90} size={9} mono upper tracking={1.2} fill={C.ink3}>{m.fam}</T>
            <line x1={x + 14} y1={104} x2={x + 158} y2={104} stroke={C.rule} />
            <T x={x + 14} y={124} size={10.5} fill={C.ink3}>stem transfer</T>
            <T x={x + 158} y={124} size={10.5} mono anchor="end" fill={C.ink2}>{m.stem}</T>
            <T x={x + 14} y={144} size={10.5} fill={C.ink3}>feature dim</T>
            <T x={x + 158} y={144} size={10.5} mono anchor="end" fill={C.ink2}>{m.feat}</T>
            <T x={x + 14} y={164} size={10.5} fill={C.ink3}>params</T>
            <T x={x + 158} y={164} size={10.5} mono anchor="end" fill={C.ink2}>{m.p}</T>
            <rect x={x + 14} y={182} width={144} height={8} fill={C.panel2} />
            <rect
              x={x + 14}
              y={182}
              width={((m.acc - 80) / 20) * 144}
              height={8}
              fill={top2 ? C.accent : C.rule2}
            />
            <T x={x + 14} y={212} size={15} mono fill={top2 ? C.accent : C.ink2}>{m.acc}%</T>
            <T x={x + 158} y={212} size={9} mono anchor="end" fill={C.ink3}>10-run mean</T>
          </g>
        );
      })}

      <Path d="M306 244 V284 H520" marker="ac" stroke={C.accent} />
      <Path d="M500 244 V284" stroke={C.accent} />

      <Box x={528} y={264} w={448} h={116} fill={C.soft} stroke={C.accent} />
      <T x={548} y={292} size={9} mono upper tracking={1.2} fill={C.accent}>Weighted soft-voting ensemble</T>
      <T x={548} y={322} size={13} mono fill={C.ink}>p_final = w₁·p_efficientnet + w₂·p_convnext</T>
      <T x={548} y={344} size={11.5} fill={C.ink2}>wᵢ = accᵢ / Σaccⱼ — read from each checkpoint at load time, never hand-tuned</T>
      <T x={548} y={366} size={13} mono fill={C.accent}>97.60% ± 0.31%</T>
      <T x={664} y={366} size={11} fill={C.ink2}>— +1.01 pp, non-overlapping CIs</T>

      <T x={24} y={300} size={11} fill={C.ink2}>The two ensembled</T>
      <T x={24} y={318} size={11} fill={C.ink2}>backbones are chosen</T>
      <T x={24} y={336} size={11} fill={C.ink2}>for architectural</T>
      <T x={24} y={354} size={11} fill={C.ink2}>dissimilarity — their</T>
      <T x={24} y={372} size={11} fill={C.ink2}>errors decorrelate.</T>
    </Frame>
  );
}
