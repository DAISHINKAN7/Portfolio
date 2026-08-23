import { Frame, Defs, Box, T, Label, Path, C } from './primitives';

const LAB: Record<string, string> = {
  LAUNCH_VEHICLE: C.accent,
  ORGANIZATION: C.ink,
  LOCATION: C.caution,
  SATELLITE: C.accent2,
  ORBITAL_PARAM: C.ink2,
  DEBRIS_ACTION: C.caution,
  DATE: C.accent,
  MISSION: C.ink2,
};

export function SsaNer() {
  // Real probe output from the evaluation transcript, section K.
  const toks: { t: string; l?: string; c?: string; w: number }[] = [
    { t: 'PSLV-C54', l: 'LAUNCH_VEHICLE', c: '0.966', w: 96 },
    { t: 'was launched by', w: 112 },
    { t: 'ISRO', l: 'ORGANIZATION', c: '0.914', w: 52 },
    { t: 'from', w: 40 },
    { t: 'Sriharikota', l: 'LOCATION', c: '0.916', w: 96 },
    { t: 'carrying', w: 64 },
    { t: 'EOS-06', l: 'SATELLITE', c: '—', w: 66 },
    { t: 'into', w: 36 },
    { t: 'Sun Synchronous Orbit', l: 'ORBITAL_PARAM', c: '0.969', w: 176 },
  ];
  let x = 40;
  return (
    <Frame viewBox="0 0 1000 300" minWidth={760} title="Eight-class ontology applied to a real corpus sentence">
      <Defs />
      <Label x={24} y={26}>Live probe inference · verbatim from the evaluation transcript</Label>

      {toks.map((tk, i) => {
        const cx = x;
        x += tk.w + 10;
        if (!tk.l) {
          return (
            <T key={i} x={cx} y={92} size={15} fill={C.ink3}>{tk.t}</T>
          );
        }
        const col = LAB[tk.l];
        return (
          <g key={i}>
            <rect x={cx - 6} y={70} width={tk.w + 8} height={30} fill={col} opacity={0.1} />
            <rect x={cx - 6} y={98} width={tk.w + 8} height={2} fill={col} />
            <T x={cx} y={92} size={15} fill={C.ink} weight={500}>{tk.t}</T>
            <T x={cx - 6} y={118} size={8.5} mono upper tracking={0.8} fill={col}>{tk.l}</T>
            <T x={cx - 6} y={132} size={8.5} mono fill={C.ink3}>{tk.c !== '—' ? `conf ${tk.c}` : ''}</T>
          </g>
        );
      })}

      <line x1={24} y1={158} x2={976} y2={158} stroke={C.rule} />

      <T x={24} y={184} size={9} mono upper tracking={1.2} fill={C.ink3}>Eight classes · seventeen BIO labels · per-label test F1</T>
      {[
        ['DATE', 0.9534],
        ['LAUNCH_VEHICLE', 0.9371],
        ['ORBITAL_PARAM', 0.9342],
        ['ORGANIZATION', 0.901],
        ['SATELLITE', 0.8718],
        ['DEBRIS_ACTION', 0.8704],
        ['LOCATION', 0.8254],
        ['MISSION', 0.7733],
      ].map(([k, v], i) => {
        const px = 24 + (i % 4) * 240;
        const py = 208 + Math.floor(i / 4) * 44;
        const val = v as number;
        return (
          <g key={k as string}>
            <T x={px} y={py} size={10.5} mono fill={C.ink2}>{k as string}</T>
            <rect x={px} y={py + 8} width={200} height={7} fill={C.panel2} />
            <rect
              x={px}
              y={py + 8}
              width={((val - 0.7) / 0.3) * 200}
              height={7}
              fill={val > 0.9 ? C.accent : val < 0.8 ? C.caution : C.rule2}
            />
            <T x={px + 210} y={py + 15} size={10.5} mono fill={C.ink} anchor="start">{val.toFixed(4)}</T>
          </g>
        );
      })}
    </Frame>
  );
}

export function SsaFunnel() {
  const steps = [
    { n: '156', l: 'gold annotations', s: 'Label Studio · 16.7% conflict rate', w: 60 },
    { n: '3,502', l: 'silver sentences', s: 'gazetteers + regex · 22× multiplier', w: 210 },
    { n: '148', l: 'augmented samples', s: 'right-to-left entity swap, offset-safe', w: 56 },
    { n: '3,180', l: 'training samples', s: 'after 60/20/20 split · val 341 · test 274', w: 200 },
  ];
  return (
    <Frame viewBox="0 0 1000 300" minWidth={720} title="Scaling 156 annotations to a trainable dataset">
      <Defs />
      <Label x={24} y={26}>156 gold sentences cannot fine-tune a 125M-parameter encoder — five techniques compound to fix that</Label>
      {steps.map((s, i) => {
        const x = 24 + i * 244;
        const last = i === 3;
        return (
          <g key={s.l}>
            <Box x={x} y={44} w={222} h={118} fill={last ? C.soft : C.white} stroke={last ? C.accent : C.rule2} />
            <T x={x + 18} y={92} size={28} mono fill={last ? C.accent : C.ink}>{s.n}</T>
            <T x={x + 18} y={114} size={12} fill={C.ink2}>{s.l}</T>
            <line x1={x + 18} y1={126} x2={x + 204} y2={126} stroke={C.rule} />
            <T x={x + 18} y={146} size={10} fill={C.ink3}>{s.s}</T>
            {i < 3 ? <Path d={`M${x + 226} 100 H${x + 240}`} marker="a" /> : null}
          </g>
        );
      })}

      <Box x={24} y={186} w={952} h={92} fill={C.panel} stroke={C.rule} />
      <T x={44} y={212} size={9} mono upper tracking={1.2} fill={C.accent}>Two-stage fine-tuning</T>
      <Box x={44} y={224} w={440} h={40} fill={C.white} stroke={C.rule2} />
      <T x={60} y={249} size={11.5} fill={C.ink2}>Stage 1 — full silver + gold + augmented pool · learn domain vocabulary</T>
      <Path d="M488 244 H514" marker="ac" stroke={C.accent} />
      <Box x={518} y={224} w={438} h={40} fill={C.white} stroke={C.accent} />
      <T x={534} y={249} size={11.5} fill={C.ink2}>Stage 2 — reload best checkpoint, re-fit gold-only · strip gazetteer bias</T>
    </Frame>
  );
}

export function SsaLayers() {
  const L = [
    { t: 'Ingestion', d: 'MD5 dedupe · language detect · PyMuPDF / pdfplumber / docx · resumable', n: '352 → 150 files' },
    { t: 'Preprocessing', d: '3-tier keyword relevance filter · hyphen repair · header/footer strip', n: '5,324 pages · −3.2% chars' },
    { t: 'Dataset', d: 'weak supervision · augmentation · BIO conversion · priority ladder', n: '3,180 train samples' },
    { t: 'Modelling', d: 'class-weighted CE · two-stage gold fine-tune · seqeval · batched inference', n: '0.9055 test F1' },
    { t: 'Extraction', d: 'alias + RapidFuzz ≥85 canonicalisation · 7 relation rules · 3 event templates', n: '46,372 entities' },
    { t: 'Storage & serving', d: '5-table SQLite (9 indexes) · Neo4j graph · 8-page Streamlit dashboard', n: '96 MB DB ships in repo' },
  ];
  return (
    <Frame viewBox="0 0 1000 340" minWidth={700} title="SSA-Intel six-layer system architecture">
      <Defs />
      <Label x={24} y={26}>Fourteen phases across six layers, all driven by a single config.yaml</Label>
      {L.map((l, i) => {
        const y = 44 + i * 48;
        return (
          <g key={l.t}>
            <Box x={24} y={y} w={952} h={40} />
            <rect x={24} y={y} width={3} height={40} fill={i === 3 ? C.accent : C.rule2} />
            <T x={44} y={y + 18} size={9} mono upper tracking={1.2} fill={C.ink3}>{`layer ${i + 1}`}</T>
            <T x={124} y={y + 25} size={13.5} weight={600}>{l.t}</T>
            <T x={290} y={y + 25} size={11} fill={C.ink2}>{l.d}</T>
            <T x={956} y={y + 25} size={11} mono anchor="end" fill={i === 3 ? C.accent : C.ink2}>{l.n}</T>
            {i < 5 ? <Path d={`M48 ${y + 40} V${y + 48}`} stroke={C.rule2} /> : null}
          </g>
        );
      })}
    </Frame>
  );
}
