import { Frame, Defs, Box, T, Label, Path, C, Chip } from './primitives';

export function AstroguardPipeline() {
  const stages = [
    { n: '01—02', t: 'Ingest & chunk', m: 'pipeline.py', d: '150 docs · Hindi strip · table-aware\n1000 tok / 200 overlap' },
    { n: '03', t: 'Embed & index', m: 'embed_and_index.py', d: 'bge-m3 → LanceDB IVF-PQ\nACL column written per row' },
    { n: '04', t: 'Knowledge graph', m: 'graph_builder.py', d: 'regex NER → NetworkX\n3,927 nodes / 12,554 edges' },
  ];
  const run = [
    { n: '05', t: 'Agent swarm', m: 'agent_swarm.py', d: 'decompose → analyse ∥4\n→ critique → refine → synthesise' },
    { n: '06', t: 'Output & memory', m: 'report_generator.py', d: 'synthesis.json · report.md\nJSONL audit log' },
  ];

  return (
    <Frame viewBox="0 0 1000 430" minWidth={720} title="AstroGuard six-stage pipeline">
      <Defs />

      {/* index construction band */}
      <Box x={24} y={44} w={952} h={128} fill={C.panel} stroke={C.rule} dash="3 3" />
      <Label x={36} y={36}>Index construction · runs once</Label>
      {stages.map((s, i) => {
        const x = 44 + i * 310;
        return (
          <g key={s.n}>
            <Box x={x} y={64} w={272} h={88} />
            <rect x={x} y={64} width={3} height={88} fill={C.accent} />
            <T x={x + 16} y={86} size={9} mono upper tracking={1.2} fill={C.accent}>{s.n}</T>
            <T x={x + 16} y={106} size={14} weight={600}>{s.t}</T>
            <T x={x + 16} y={122} size={9.5} mono fill={C.ink3}>{s.m}</T>
            {s.d.split('\n').map((l, li) => (
              <T key={li} x={x + 16} y={138 + li * 12} size={10.5} fill={C.ink2}>{l}</T>
            ))}
            {i < 2 ? <Path d={`M${x + 278} 108 H${x + 304}`} marker="a" /> : null}
          </g>
        );
      })}

      {/* retrieval layer */}
      <Box x={44} y={200} w={582} h={72} fill={C.soft} stroke={C.accent} />
      <T x={60} y={222} size={9} mono upper tracking={1.2} fill={C.accent}>Retrieval layer · retrieval.py · singleton-cached</T>
      <T x={60} y={244} size={12} fill={C.ink}>Dense semantic (over-fetch k×5 → ACL filter → dedupe → top-k)</T>
      <T x={60} y={262} size={12} fill={C.ink}>⊕ Symbolic BFS depth 2, capped at 40 relations → 9,000-char fused context</T>
      <Path d="M180 176 V196" marker="ac" stroke={C.accent} />
      <Path d="M488 176 V196" marker="ac" stroke={C.accent} />

      {/* per-query band */}
      <Box x={24} y={300} w={952} h={106} fill={C.panel} stroke={C.rule} dash="3 3" />
      <Label x={36} y={292}>Per query · ~922s mean</Label>
      {run.map((s, i) => {
        const x = 44 + i * 310;
        return (
          <g key={s.n}>
            <Box x={x} y={318} w={272} h={72} />
            <rect x={x} y={318} width={3} height={72} fill={C.ink} />
            <T x={x + 16} y={338} size={9} mono upper tracking={1.2} fill={C.ink3}>{s.n}</T>
            <T x={x + 16} y={356} size={14} weight={600}>{s.t}</T>
            {s.d.split('\n').map((l, li) => (
              <T key={li} x={x + 16} y={372 + li * 12} size={10.5} fill={C.ink2}>{l}</T>
            ))}
            {i < 1 ? <Path d={`M${x + 278} 354 H${x + 304}`} marker="a" /> : null}
          </g>
        );
      })}
      <Path d="M180 276 V314" marker="a" />
      <Path d="M340 354 H316" stroke={C.rule2} />

      {/* memory write-back */}
      <Path
        d="M900 318 V292 Q900 282 890 282 H700"
        stroke={C.caution}
        dash="4 3"
        marker="aw"
      />
      <T x={706} y={278} size={10} mono fill={C.caution}>graph write-back · the graph grows each run</T>
      <Path d="M700 282 Q690 282 690 272 V200" stroke={C.caution} dash="4 3" marker="aw" />

      <g>
        <Chip x={636} y={218} label="ACL enforced at index + read time" color={C.accent} />
        <Chip x={636} y={240} label="every chunk header carries doc_id / page / year" color={C.rule2} />
        <Chip x={636} y={262} label="model, table handle & graph loaded once per process" color={C.rule2} />
      </g>
    </Frame>
  );
}

export function AstroguardSwarm() {
  const agents = [
    { k: 'Policy Oracle', chunks: 7789, kk: 12, risk: 29.5 },
    { k: 'Debris Physicist', chunks: 5110, kk: 12, risk: 36.1 },
    { k: 'Mission Historian', chunks: 1307, kk: 15, risk: 25.1 },
    { k: 'Media Sentinel', chunks: 131, kk: 8, risk: 15.7 },
  ];
  const maxC = 7789;

  return (
    <Frame viewBox="0 0 1000 440" minWidth={720} title="AstroGuard agent swarm and debate topology">
      <Defs />
      <Label x={24} y={26}>Four disjoint corpus views · ACL enforced in the index</Label>

      {agents.map((a, i) => {
        const y = 46 + i * 82;
        const bw = (a.chunks / maxC) * 190;
        return (
          <g key={a.k}>
            <Box x={24} y={y} w={340} h={66} />
            <rect x={24} y={y} width={3} height={66} fill={i === 1 ? C.accent : C.rule2} />
            <T x={40} y={y + 22} size={13.5} weight={600}>{a.k}</T>
            <T x={352} y={y + 22} size={11} mono fill={C.ink3} anchor="end">k={a.kk}</T>
            <rect x={40} y={y + 32} width={190} height={7} fill={C.panel2} />
            <rect x={40} y={y + 32} width={bw} height={7} fill={i === 1 ? C.accent : C.rule2} />
            <T x={40} y={y + 56} size={10.5} mono fill={C.ink2}>
              {a.chunks.toLocaleString()} chunks
            </T>
            <T x={352} y={y + 56} size={12} mono anchor="end" fill={i === 1 || i === 3 ? C.accent : C.ink2}>
              mean risk {a.risk}
            </T>
          </g>
        );
      })}

      {/* debate column */}
      <Box x={412} y={46} w={196} h={310} fill={C.panel} stroke={C.rule} dash="3 3" />
      <Label x={424} y={38}>Two debate rounds</Label>

      <Box x={428} y={72} w={164} h={110} fill={C.white} />
      <T x={444} y={94} size={9} mono upper tracking={1.2} fill={C.accent}>R1 · critique</T>
      <T x={444} y={114} size={11.5} fill={C.ink2}>Sees own analysis</T>
      <T x={444} y={130} size={11.5} fill={C.ink2}>+ all three peers</T>
      <T x={444} y={154} size={10.5} mono fill={C.ink3}>emits: disagreements[]</T>
      <T x={444} y={168} size={10.5} mono fill={C.ink3}>severity ∈ 4 levels</T>

      <Box x={428} y={200} w={164} h={140} fill={C.white} />
      <T x={444} y={222} size={9} mono upper tracking={1.2} fill={C.accent}>R2 · refine</T>
      <T x={444} y={242} size={11.5} fill={C.ink2}>Sees only critiques</T>
      <T x={444} y={258} size={11.5} fill={C.ink2}>aimed at itself</T>
      <T x={444} y={282} size={10.5} mono fill={C.ink3}>emits: addressed[]</T>
      <T x={444} y={296} size={10.5} mono fill={C.ink3}>AND maintained[]</T>
      <line x1={444} y1={308} x2={578} y2={308} stroke={C.rule} />
      <T x={444} y={326} size={10.5} fill={C.caution}>cannot silently capitulate</T>

      <Path d="M368 180 H408" marker="ac" stroke={C.accent} />
      <Path d="M608 200 H636" marker="a" />

      {/* supervisor */}
      <Box x={648} y={46} w={328} h={196} fill={C.white} stroke={C.ink} />
      <rect x={648} y={46} width={328} height={3} fill={C.ink} />
      <T x={668} y={76} size={9} mono upper tracking={1.2} fill={C.ink3}>Supervisor synthesis</T>
      <T x={668} y={100} size={14} weight={600}>Weighted, never touches the corpus</T>
      {[
        ['debris_physicist', 0.35],
        ['mission_historian', 0.25],
        ['policy_oracle', 0.25],
        ['media_sentinel', 0.15],
      ].map(([k, w], i) => (
        <g key={k as string}>
          <T x={668} y={128 + i * 24} size={11} mono fill={C.ink2}>{k as string}</T>
          <rect x={824} y={120 + i * 24} width={110} height={9} fill={C.panel2} />
          <rect x={824} y={120 + i * 24} width={(w as number) * 300} height={9} fill={C.accent} />
          <T x={956} y={128 + i * 24} size={10.5} mono anchor="end" fill={C.ink2}>{(w as number).toFixed(2)}</T>
        </g>
      ))}

      {/* divergence bracket */}
      <Box x={648} y={264} w={328} h={92} fill={C.soft} stroke={C.accent} />
      <T x={668} y={290} size={9} mono upper tracking={1.2} fill={C.accent}>Headline finding · stable over 88 runs</T>
      <T x={668} y={324} size={30} mono fill={C.accent}>20.4</T>
      <T x={724} y={324} size={12} fill={C.ink2}>point divergence between</T>
      <T x={724} y={340} size={12} fill={C.ink2}>technical risk and media salience</T>

      <line x1={24} y1={382} x2={976} y2={382} stroke={C.rule} />
      <T x={24} y={406} size={11} fill={C.ink2}>
        Because the agents see different evidence, disagreement is signal. 1,032 critique pairs produced 919 logged disagreements — all auditable.
      </T>
    </Frame>
  );
}
