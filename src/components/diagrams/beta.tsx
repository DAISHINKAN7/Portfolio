import { Frame, Defs, Box, T, Label, Path, C } from './primitives';

export function BetaLayers() {
  const layers = [
    { t: 'Data', d: ['49 NIFTY-50 names', '12 feeds · 2,744 days', 'index · VIX · macro · flows'] },
    { t: 'Features', d: ['42 features, 8 groups', '118,719 × 44 panel', 'target: betavol 20d ahead'] },
    { t: 'Models', d: ['XGBoost · LSTM', 'Kalman · Gaussian HMM', 'one identical task'] },
    { t: 'Decision', d: ['VIX override → 22.0', 'betavol threshold 0.1794', 'else HOLD'] },
    { t: 'Optimiser', d: ['max-Sharpe / min-var', 'risk parity', 'CVXPY + Ledoit-Wolf'] },
    { t: 'Validation', d: ['3y train → 1y test', 'annual roll, chronological', '8 bps costs charged'] },
  ];
  return (
    <Frame viewBox="0 0 1000 300" minWidth={800} title="AdaptiveBeta six-layer architecture">
      <Defs />
      <Label x={24} y={26}>Six layers, strictly ordered — nothing downstream ever sees data from its own test window</Label>
      {layers.map((l, i) => {
        const x = 24 + i * 160;
        const hot = i === 3;
        return (
          <g key={l.t}>
            <Box x={x} y={44} w={140} h={168} fill={hot ? C.soft : C.white} stroke={hot ? C.accent : C.rule2} />
            <rect x={x} y={44} width={140} height={3} fill={hot ? C.accent : C.rule2} />
            <T x={x + 14} y={70} size={9} mono upper tracking={1.2} fill={C.ink3}>{`0${i + 1}`}</T>
            <T x={x + 14} y={94} size={14} weight={600}>{l.t}</T>
            {l.d.map((s, si) => (
              <T key={si} x={x + 14} y={122 + si * 18} size={10.5} fill={C.ink2}>{s}</T>
            ))}
            {i < 5 ? <Path d={`M${x + 144} 128 H${x + 156}`} marker="a" /> : null}
          </g>
        );
      })}
      <Box x={24} y={240} w={952} h={44} fill={C.panel} stroke={C.rule} />
      <T x={40} y={268} size={11.5} fill={C.ink2}>
        The decision layer is the innovation: ML owns the ambiguous ~87% of days, hard rules own the tail. 59.6% of days require no trade and pay no cost.
      </T>
    </Frame>
  );
}

export function BetaDecision() {
  return (
    <Frame viewBox="0 0 1000 340" minWidth={720} title="Daily signal decision cascade">
      <Defs />
      <Label x={24} y={26}>Evaluated daily, in strict priority order</Label>

      <Box x={24} y={44} w={210} h={62} />
      <T x={40} y={70} size={9} mono upper tracking={1.2} fill={C.ink3}>Daily tick</T>
      <T x={40} y={92} size={13} fill={C.ink}>market close data</T>

      <Path d="M238 76 H286" marker="a" />

      {/* gate 1 */}
      <Box x={290} y={44} w={240} h={62} fill={C.cautionSoft} stroke={C.caution} />
      <T x={306} y={70} size={9} mono upper tracking={1.2} fill={C.caution}>Gate 1 · model bypassed</T>
      <T x={306} y={92} size={13} mono fill={C.ink}>India VIX &gt; 22.0 ?</T>
      <Path d="M530 76 H636" marker="aw" stroke={C.caution} />
      <T x={548} y={68} size={10} mono fill={C.caution}>yes</T>

      <Box x={644} y={44} w={332} h={62} fill={C.white} stroke={C.caution} />
      <T x={664} y={70} size={9} mono upper tracking={1.2} fill={C.caution}>MIN_VARIANCE · defensive override</T>
      <T x={664} y={92} size={13} fill={C.ink2}>231 days · 13.4%</T>

      <Path d="M410 110 V150" marker="a" />
      <T x={420} y={134} size={10} mono fill={C.ink3}>no</T>

      {/* gate 2 */}
      <Box x={290} y={154} w={240} h={62} fill={C.soft} stroke={C.accent} />
      <T x={306} y={180} size={9} mono upper tracking={1.2} fill={C.accent}>Gate 2 · XGBoost signal</T>
      <T x={306} y={202} size={13} mono fill={C.ink}>betavol &gt; 0.1794 ?</T>
      <Path d="M530 186 H636" marker="ac" stroke={C.accent} />
      <T x={548} y={178} size={10} mono fill={C.accent}>yes</T>

      <Box x={644} y={154} w={332} h={62} fill={C.white} stroke={C.accent} />
      <T x={664} y={180} size={9} mono upper tracking={1.2} fill={C.accent}>REBALANCE · regime-routed optimisation</T>
      <T x={664} y={202} size={13} fill={C.ink2}>463 days · 26.9% — HMM picks the optimiser</T>

      <Path d="M410 220 V258" marker="a" />
      <T x={420} y={244} size={10} mono fill={C.ink3}>no</T>

      <Box x={290} y={262} w={686} h={58} fill={C.panel} stroke={C.rule2} />
      <T x={306} y={288} size={9} mono upper tracking={1.2} fill={C.ink3}>HOLD · no trade, no cost</T>
      <T x={306} y={310} size={13} fill={C.ink2}>1,025 days · 59.6%</T>

      <T x={24} y={186} size={10.5} fill={C.ink2}>The threshold is</T>
      <T x={24} y={204} size={10.5} fill={C.ink2}>the Q70 of training</T>
      <T x={24} y={222} size={10.5} fill={C.ink2}>predictions only,</T>
      <T x={24} y={240} size={10.5} fill={C.ink2}>then frozen.</T>
    </Frame>
  );
}
