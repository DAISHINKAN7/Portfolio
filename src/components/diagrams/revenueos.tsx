import { Frame, Defs, Box, T, Label, Path, C } from './primitives';

/** The authority chain — six components, each unable to do the next one's job. */
export function RevenueosAuthority() {
  const chain = [
    { verb: 'predicts', comp: 'RecoveryPredictor', emits: 'P(recovery │ action)', cannot: 'rank · price · decide' },
    { verb: 'ranks', comp: 'FinancialEngine', emits: 'EV, ΔEV', cannot: 'see a model · see text' },
    { verb: 'authorizes', comp: 'PolicyEngine', emits: 'PASS / REJECT / APPROVAL', cannot: 'accept a text argument' },
    { verb: 'executes', comp: 'PaymentProvider', emits: 'order / simulated event', cannot: 'choose action or amount' },
    { verb: 'verifies', comp: 'WebhookReconciler', emits: 'verified state change', cannot: 'trust a browser callback' },
    { verb: 'records', comp: 'AuditRepository', emits: 'sequenced events', cannot: 'be mutated or deleted' },
  ];

  return (
    <Frame viewBox="0 0 1000 400" minWidth={760} title="RevenueOS authority chain">
      <Defs />
      <Label x={24} y={26}>No component assumes another&apos;s authority</Label>

      {chain.map((c, i) => {
        const y = 44 + i * 52;
        const gate = i === 2;
        return (
          <g key={c.comp}>
            <Box x={24} y={y} w={952} h={44} fill={gate ? C.soft : C.white} stroke={gate ? C.accent : C.rule} />
            <rect x={24} y={y} width={3} height={44} fill={gate ? C.accent : C.rule2} />
            <T x={44} y={y + 27} size={11} mono upper tracking={1.1} fill={gate ? C.accent : C.ink3}>
              {c.verb}
            </T>
            <T x={168} y={y + 27} size={13} mono fill={C.ink}>{c.comp}</T>
            <T x={400} y={y + 27} size={11.5} fill={C.ink2}>{c.emits}</T>
            <T x={700} y={y + 20} size={9} mono upper tracking={1.1} fill={C.ink3}>cannot</T>
            <T x={700} y={y + 34} size={11} fill={C.caution}>{c.cannot}</T>
            {i < 5 ? <Path d={`M48 ${y + 44} V${y + 52}`} stroke={C.rule2} /> : null}
          </g>
        );
      })}

      <Box x={24} y={360} w={952} h={34} fill={C.cautionSoft} stroke={C.caution} />
      <T x={44} y={382} size={11.5} fill={C.ink}>
        The LLM sits outside this chain entirely. It proposes which tool runs next and writes the explanation. It never touches money.
      </T>
    </Frame>
  );
}

/** Three independent defences between the planner and the money. */
export function RevenueosBoundary() {
  const blocks = [
    { t: 'Schema', d: 'next_tool is a Literal.', d2: 'Unknown names fail parsing;', d3: 'extra fields forbidden.' },
    { t: 'State gating', d: 'A tool valid in one state', d2: 'is refused in another.', d3: 'request_execution: 1 state.' },
    { t: 'Argument screening', d: 'Any argument resembling an', d2: 'amount, probability, EV or', d3: 'policy override is rejected.' },
  ];

  return (
    <Frame viewBox="0 0 1000 420" minWidth={720} title="Agent authority boundary">
      <Defs />

      <Box x={24} y={40} w={220} h={62} fill={C.panel} stroke={C.rule2} dash="3 3" />
      <T x={44} y={64} size={9} mono upper tracking={1.2} fill={C.ink3}>LLM planner</T>
      <T x={44} y={86} size={13} fill={C.ink}>proposes next tool</T>
      <Path d="M248 71 H292" marker="a" />

      {blocks.map((b, i) => {
        const x = 300 + i * 232;
        return (
          <g key={b.t}>
            <Box x={x} y={40} w={212} h={124} stroke={C.accent} />
            <rect x={x} y={40} width={212} height={3} fill={C.accent} />
            <T x={x + 16} y={66} size={9} mono upper tracking={1.2} fill={C.accent}>{`defence ${i + 1}`}</T>
            <T x={x + 16} y={90} size={14} weight={600}>{b.t}</T>
            {[b.d, b.d2, b.d3].map((l, li) => (
              <T key={li} x={x + 16} y={114 + li * 16} size={10.5} fill={C.ink2}>{l}</T>
            ))}
            {i < 2 ? <Path d={`M${x + 216} 102 H${x + 228}`} marker="ac" stroke={C.accent} /> : null}
          </g>
        );
      })}

      <Path d="M406 168 V206" marker="aw" stroke={C.caution} />
      <Path d="M638 168 V206" marker="aw" stroke={C.caution} />
      <Path d="M870 168 V206" marker="aw" stroke={C.caution} />
      <Box x={300} y={210} w={676} h={40} fill={C.cautionSoft} stroke={C.caution} />
      <T x={320} y={235} size={11.5} fill={C.caution}>
        BLOCKED — audited as AGENT_TOOL_BLOCKED with state, permitted set, reason and arguments hash → replan
      </T>

      <Path d="M406 168 V270" stroke={C.rule} dash="2 3" />
      <Box x={24} y={280} w={952} h={54} fill={C.white} stroke={C.ink} />
      <rect x={24} y={280} width={952} height={3} fill={C.ink} />
      <T x={44} y={310} size={9} mono upper tracking={1.2} fill={C.ink3}>Deterministic layer — the only path to money</T>
      <T x={44} y={328} size={12} mono fill={C.ink}>
        Frozen ML → Financial Engine → Policy Engine → State Machine → Razorpay → Webhooks → Audit
      </T>

      <Box x={24} y={350} w={952} h={44} fill={C.soft} stroke={C.accent} />
      <T x={44} y={368} size={9} mono upper tracking={1.2} fill={C.accent}>Measured on /agent</T>
      <T x={44} y={386} size={11.5} fill={C.ink}>
        unauthorized executions 0 · policy bypasses 0 · blocked tool calls non-zero — a gate that never blocks anything is decorative
      </T>
    </Frame>
  );
}