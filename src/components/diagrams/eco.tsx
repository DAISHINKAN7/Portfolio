import { Frame, Defs, Box, T, Label, Path, C } from './primitives';

/** The counterfactual concept — the single most important visual in the project. */
export function EcoConcept() {
  // Illustrative curve geometry; the shaded gap is what the project measures.
  const actual = 'M120 150 L200 132 L280 168 L360 140 L440 246 L520 232 L600 214 L680 200 L760 190 L840 182 L900 178';
  const counter = 'M440 140 L520 124 L600 150 L680 128 L760 146 L840 132 L900 138';
  return (
    <Frame viewBox="0 0 1000 330" minWidth={720} title="Counterfactual reconstruction concept">
      <Defs />
      <Label x={24} y={26}>NDVI over quarterly composites — the model never sees any observation after the event line</Label>

      {/* axes */}
      <line x1={110} y1={280} x2={940} y2={280} stroke={C.rule2} />
      <line x1={110} y1={70} x2={110} y2={280} stroke={C.rule2} />
      <T x={96} y={78} size={9.5} mono anchor="end" fill={C.ink3}>high</T>
      <T x={96} y={278} size={9.5} mono anchor="end" fill={C.ink3}>low</T>
      <T x={40} y={180} size={9} mono upper tracking={1.2} fill={C.ink3}>NDVI</T>

      {/* training window */}
      <rect x={110} y={70} width={330} height={210} fill={C.panel} />
      <T x={128} y={92} size={9} mono upper tracking={1.2} fill={C.ink3}>Training · pre-disturbance dynamics</T>

      {/* gap shading */}
      <path
        d={`${counter} L900 178 L840 182 L760 190 L680 200 L600 214 L520 232 L440 246 Z`}
        fill={C.cautionSoft}
        stroke="none"
      />

      {/* event line */}
      <line x1={440} y1={60} x2={440} y2={288} stroke={C.caution} strokeDasharray="4 3" />
      <T x={448} y={72} size={10} mono fill={C.caution}>hurricane · t_event</T>

      <path d={actual} fill="none" stroke={C.ink} strokeWidth={2} />
      <path d={counter} fill="none" stroke={C.accent} strokeWidth={2} strokeDasharray="6 4" />

      <T x={912} y={182} size={10.5} mono fill={C.ink}>observed</T>
      <T x={912} y={140} size={10.5} mono fill={C.accent}>counterfactual</T>

      {/* gap bracket */}
      <line x1={640} y1={152} x2={640} y2={212} stroke={C.caution} />
      <T x={654} y={186} size={11} fill={C.caution} weight={600}>attributed impact</T>

      <line x1={24} y1={302} x2={976} y2={302} stroke={C.rule} />
      <T x={24} y={324} size={11} fill={C.ink2}>
        The counterfactual is unobservable by construction, so there is no test-set loss for it. Every design decision — and every limitation — follows from that.
      </T>
    </Frame>
  );
}

export function EcoPipeline() {
  const s = [
    { n: '01', t: 'Ingest', d: ['Google Earth Engine', 'Sentinel-2 SR + Sentinel-1 GRD', 'quarterly medians @ 10 m'], ok: true },
    { n: '02', t: 'Preprocess', d: ['(T=32, C=7, H, W)', 'band-aware NaN fill', '128² patches, stride 64'], ok: true },
    { n: '03', t: 'Train', d: ['T_in=4 → T_out=4', 'composite EcoRewindLoss', '5 architectures, joint'], ok: true },
    { n: '04', t: 'Roll out', d: ['autoregressive past t_event', 'MC Dropout × 50', 'climatology floor μ−2σ'], ok: false },
    { n: '05', t: 'Attribute', d: ['ΔNDVI / ΔNDWI maps', 'impacted hectares', 'tCO₂-eq, recovery slope'], ok: false },
  ];
  return (
    <Frame viewBox="0 0 1000 290" minWidth={780} title="EcoRewind five-stage pipeline">
      <Defs />
      {s.map((x, i) => {
        const px = 24 + i * 192;
        return (
          <g key={x.n}>
            <Box x={px} y={44} w={170} h={158} fill={x.ok ? C.white : C.cautionSoft} stroke={x.ok ? C.rule2 : C.caution} />
            <rect x={px} y={44} width={170} height={3} fill={x.ok ? C.accent : C.caution} />
            <T x={px + 14} y={70} size={9} mono upper tracking={1.2} fill={C.ink3}>{x.n}</T>
            <T x={px + 14} y={94} size={14} weight={600}>{x.t}</T>
            {x.d.map((l, li) => (
              <T key={li} x={px + 14} y={120 + li * 18} size={10.5} fill={C.ink2}>{l}</T>
            ))}
            <T x={px + 14} y={190} size={9} mono upper tracking={1.1} fill={x.ok ? C.accent : C.caution}>
              {x.ok ? 'verifiable' : 'no ground truth'}
            </T>
            {i < 4 ? <Path d={`M${px + 174} 122 H${px + 188}`} marker="a" /> : null}
          </g>
        );
      })}
      <Box x={24} y={228} w={952} h={46} fill={C.panel} stroke={C.rule} />
      <T x={40} y={256} size={11.5} fill={C.ink2}>
        Stages 01–03 are supervised and checkable. Stage 04 has no ground truth by construction — which is the crux of the project and the origin of most of its limitations.
      </T>
    </Frame>
  );
}

export function EcoArchitectures() {
  const m = [
    { t: 'EcoTransformer', d: 'factorized spatiotemporal attention · learned SAR gate · SSIM-aware decoder', ndvi: '0.901', s: 'converged', ok: 2 },
    { t: 'ConvLSTM', d: 'Shi et al. encoder–decoder baseline · only model with positive SAR R²', ndvi: '0.177', s: 'partial', ok: 1 },
    { t: 'UNet-Temporal', d: 'U-Net encoder, temporal LSTM + attention at the bottleneck', ndvi: 'NaN', s: 'failed', ok: 0 },
    { t: 'UNet-Mamba', d: 'Mamba selective state-space blocks for linear-time sequence modelling', ndvi: '−3.51', s: 'diverged', ok: 0 },
    { t: 'UNet-PatchTST', d: 'channel-independent temporal patching · only 3 tokens at T_in=4', ndvi: '−7.40', s: 'diverged', ok: 0 },
  ];
  const col = (o: number) => (o === 2 ? C.accent : o === 1 ? C.rule2 : C.caution);
  return (
    <Frame viewBox="0 0 1000 320" minWidth={720} title="Five architectures and their convergence status">
      <Defs />
      <Label x={24} y={26}>All five implemented from scratch and trained under identical data, loss and schedule</Label>
      {m.map((x, i) => {
        const y = 44 + i * 52;
        return (
          <g key={x.t}>
            <Box x={24} y={y} w={952} h={44} fill={x.ok === 2 ? C.soft : C.white} stroke={C.rule} />
            <rect x={24} y={y} width={3} height={44} fill={col(x.ok)} />
            <T x={44} y={y + 20} size={13.5} weight={600}>{x.t}</T>
            <T x={44} y={y + 36} size={10.5} fill={C.ink2}>{x.d}</T>
            <T x={790} y={y + 28} size={15} mono anchor="end" fill={x.ok === 2 ? C.accent : x.ok === 1 ? C.ink2 : C.caution}>
              {x.ndvi}
            </T>
            <T x={806} y={y + 28} size={9} mono fill={C.ink3}>NDVI R²</T>
            <rect x={880} y={y + 14} width={82} height={17} fill={x.ok === 2 ? C.accent : x.ok === 1 ? C.panel2 : C.cautionSoft} />
            <T x={921} y={y + 26} size={9} mono upper tracking={1} anchor="middle" fill={x.ok === 2 ? C.white : x.ok === 1 ? C.ink2 : C.caution}>
              {x.s}
            </T>
          </g>
        );
      })}
      <T x={24} y={318} size={11} fill={C.ink2}>
        Mamba and PatchTST reached validation losses within ~7% of the winner yet produce catastrophically negative R² — the composite loss is satisfiable by a degenerate near-constant predictor.
      </T>
    </Frame>
  );
}
