'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ErrorBar,
  LabelList,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';

const INK = '#15181A';
const INK2 = '#4E565C';
const INK3 = '#7C858B';
const RULE = '#D2D6D1';
const ACCENT = '#0E5A63';
const CAUTION = '#8F4F10';
const GREY = '#B6BCB6';

const axis = {
  stroke: RULE,
  tick: { fill: INK3, fontSize: 11, fontFamily: 'var(--font-mono), monospace' },
  tickLine: false,
};

function Shell({ h = 300, children }: { h?: number; children: React.ReactElement }) {
  return (
    <div style={{ width: '100%', height: h }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

const tip = {
  contentStyle: {
    background: '#fff',
    border: `1px solid ${RULE}`,
    borderRadius: 0,
    fontSize: 12,
    fontFamily: 'var(--font-mono), monospace',
    color: INK,
  },
  cursor: { fill: 'rgba(14,90,99,0.06)' },
};

/* ------------------------------------------------------------------ */

export function AstroguardCorpus() {
  const data = [
    { k: 'ISRO Annual Reports', v: 5563 },
    { k: 'ESA Debris Reports', v: 3492 },
    { k: 'India space research', v: 3444 },
    { k: 'Debris Mitigation RP', v: 1317 },
    { k: 'News (Samachar)', v: 1180 },
    { k: 'Launch Missions', v: 1066 },
    { k: 'Policy & Mitigation', v: 973 },
    { k: 'Orbital debris report', v: 277 },
    { k: 'Other docs', v: 238 },
    { k: 'ISSAR Reports', v: 237 },
    { k: 'Debris News (EN)', v: 131 },
  ];
  return (
    <Shell h={340}>
      <BarChart data={data} layout="vertical" margin={{ left: 130, right: 40, top: 8, bottom: 8 }}>
        <CartesianGrid horizontal={false} stroke={RULE} />
        <XAxis type="number" {...axis} />
        <YAxis type="category" dataKey="k" width={128} {...axis} />
        <Tooltip {...tip} formatter={(v: number) => [`${v.toLocaleString()} chunks`, '']} />
        <Bar dataKey="v" fill={ACCENT} maxBarSize={16} />
      </BarChart>
    </Shell>
  );
}

export function AstroguardTelemetry() {
  const data = [
    { k: 'Decompose', v: 14.6, d: false },
    { k: 'Parallel analysis', v: 275.8, d: false },
    { k: 'Debate R1 · critique', v: 312.3, d: true },
    { k: 'Debate R2 · refine', v: 240.9, d: true },
    { k: 'Supervisor synthesis', v: 78.5, d: false },
  ];
  return (
    <Shell h={300}>
      <BarChart data={data} margin={{ left: 8, right: 16, top: 24, bottom: 8 }}>
        <CartesianGrid vertical={false} stroke={RULE} />
        <XAxis dataKey="k" {...axis} interval={0} tick={{ ...axis.tick, fontSize: 10 }} />
        <YAxis {...axis} unit="s" />
        <Tooltip {...tip} formatter={(v: number) => [`${v}s mean`, '']} />
        <Bar dataKey="v" maxBarSize={72}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.d ? ACCENT : GREY} />
          ))}
          <LabelList
            dataKey="v"
            position="top"
            style={{ fill: INK, fontSize: 11, fontFamily: 'var(--font-mono), monospace' }}
          />
        </Bar>
      </BarChart>
    </Shell>
  );
}

export function RadioResults() {
  const data = [
    { k: 'Ensemble', v: 97.6, e: 0.31, best: true },
    { k: 'ConvNeXt-Tiny', v: 96.59, e: 0.22, best: false },
    { k: 'EfficientNet-B0', v: 95.35, e: 0.42, best: false },
    { k: 'ResNet-34', v: 92.09, e: 0.6, best: false },
    { k: 'ViT (scratch)', v: 85.39, e: 0.53, best: false },
  ];
  return (
    <Shell h={320}>
      <BarChart data={data} layout="vertical" margin={{ left: 104, right: 60, top: 8, bottom: 8 }}>
        <CartesianGrid horizontal={false} stroke={RULE} />
        <XAxis type="number" domain={[80, 100]} unit="%" {...axis} />
        <YAxis type="category" dataKey="k" width={102} {...axis} />
        <Tooltip {...tip} formatter={(v: number, _n, p: any) => [`${v}% ± ${p.payload.e}`, '']} />
        <Bar dataKey="v" maxBarSize={26}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.best ? ACCENT : GREY} />
          ))}
          <ErrorBar dataKey="e" width={5} strokeWidth={1.2} stroke={INK} direction="x" />
          <LabelList
            dataKey="v"
            position="right"
            formatter={(v: number) => `${v}%`}
            style={{ fill: INK, fontSize: 11, fontFamily: 'var(--font-mono), monospace' }}
          />
        </Bar>
      </BarChart>
    </Shell>
  );
}

export function BetaRange() {
  const data = [
    { k: 'ITC', lo: -0.04, hi: 2.48 },
    { k: 'SBIN', lo: 0.57, hi: 2.91 },
    { k: 'SUNPHARMA', lo: -0.48, hi: 1.82 },
    { k: 'INFY', lo: -0.17, hi: 1.99 },
    { k: 'BAJFINANCE', lo: 0.27, hi: 2.43 },
    { k: 'NESTLEIND', lo: -0.25, hi: 1.61 },
    { k: 'TATASTEEL', lo: 0.69, hi: 2.53 },
    { k: 'TCS', lo: -0.24, hi: 1.5 },
    { k: 'MARUTI', lo: 0.14, hi: 1.83 },
    { k: 'RELIANCE', lo: 0.28, hi: 1.95 },
    { k: 'HINDUNILVR', lo: -0.26, hi: 1.37 },
    { k: 'ICICIBANK', lo: 0.52, hi: 2.12 },
    { k: 'HDFCBANK', lo: 0.28, hi: 1.78 },
    { k: 'AXISBANK', lo: 0.56, hi: 2.05 },
  ].map((d) => ({ ...d, base: d.lo, span: d.hi - d.lo }));

  return (
    <Shell h={400}>
      <BarChart data={data} layout="vertical" margin={{ left: 96, right: 40, top: 8, bottom: 8 }}>
        <CartesianGrid horizontal={false} stroke={RULE} />
        <XAxis type="number" domain={[-1, 3]} {...axis} />
        <YAxis type="category" dataKey="k" width={94} {...axis} />
        <Tooltip
          {...tip}
          formatter={(_v: number, _n, p: any) => [`β ${p.payload.lo} → ${p.payload.hi}`, '']}
        />
        <Bar dataKey="base" stackId="a" fill="transparent" />
        <Bar dataKey="span" stackId="a" fill={ACCENT} maxBarSize={13} />
      </BarChart>
    </Shell>
  );
}

export function BetaModels() {
  const data = [
    { k: 'XGBoost', v: 0.0391, best: true },
    { k: 'Static 60d OLS', v: 0.0477, best: false },
    { k: 'LSTM', v: 0.0661, best: false },
    { k: 'Kalman filter', v: 0.0749, best: false },
  ];
  return (
    <Shell h={260}>
      <BarChart data={data} margin={{ left: 8, right: 16, top: 26, bottom: 8 }}>
        <CartesianGrid vertical={false} stroke={RULE} />
        <XAxis dataKey="k" {...axis} />
        <YAxis {...axis} />
        <Tooltip {...tip} formatter={(v: number) => [`MAE ${v}`, '']} />
        <Bar dataKey="v" maxBarSize={72}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.best ? ACCENT : GREY} />
          ))}
          <LabelList
            dataKey="v"
            position="top"
            style={{ fill: INK, fontSize: 11, fontFamily: 'var(--font-mono), monospace' }}
          />
        </Bar>
      </BarChart>
    </Shell>
  );
}

export function BetaShap() {
  const data = [
    { k: 'betavol_60', v: 0.028, b: true },
    { k: 'betavol_trend', v: 0.0205, b: true },
    { k: 'betavol_30', v: 0.0132, b: true },
    { k: 'market_vol_60d', v: 0.0074, b: false },
    { k: 'betavol_120', v: 0.0037, b: true },
    { k: 'combined_flow', v: 0.0036, b: false },
    { k: 'beta_60_30_spread', v: 0.0028, b: true },
    { k: 'beta_120', v: 0.0023, b: true },
    { k: 'vix_zscore', v: 0.0022, b: false },
    { k: 'rfr', v: 0.0014, b: false },
  ];
  return (
    <Shell h={330}>
      <BarChart data={data} layout="vertical" margin={{ left: 130, right: 40, top: 8, bottom: 8 }}>
        <CartesianGrid horizontal={false} stroke={RULE} />
        <XAxis type="number" {...axis} />
        <YAxis type="category" dataKey="k" width={128} {...axis} />
        <Tooltip {...tip} formatter={(v: number) => [`mean |SHAP| ${v}`, '']} />
        <Bar dataKey="v" maxBarSize={15}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.b ? ACCENT : GREY} />
          ))}
        </Bar>
      </BarChart>
    </Shell>
  );
}

export function BetaRiskReturn() {
  const pts = [
    { k: 'AdaptiveBeta', x: 11.26, y: 9.24, ours: true },
    { k: 'Static MVO', x: 18.35, y: 11.38, ours: false },
    { k: 'Kalman MVO', x: 18.48, y: 10.92, ours: false },
    { k: 'Equal Weight', x: 17.04, y: 15.86, ours: false },
    { k: 'NIFTY-50', x: 17.19, y: 12.16, ours: false },
    { k: 'Momentum-Q', x: 18.03, y: 17.47, ours: false },
  ];
  return (
    <Shell h={330}>
      <ScatterChart margin={{ left: 8, right: 30, top: 20, bottom: 24 }}>
        <CartesianGrid stroke={RULE} />
        <XAxis
          type="number"
          dataKey="x"
          domain={[9, 21]}
          unit="%"
          name="Annualised volatility"
          {...axis}
          label={{ value: 'annualised volatility', position: 'bottom', offset: 4, fill: INK3, fontSize: 11 }}
        />
        <YAxis
          type="number"
          dataKey="y"
          domain={[8, 19]}
          unit="%"
          name="CAGR"
          {...axis}
        />
        <ZAxis range={[110, 110]} />
        <Tooltip
          {...tip}
          cursor={{ stroke: RULE }}
          formatter={(v: number, n: string) => [`${v}%`, n]}
          labelFormatter={(() => '') as any}
          content={({ payload }: any) =>
            payload && payload[0] ? (
              <div style={{ background: '#fff', border: `1px solid ${RULE}`, padding: '6px 9px', fontSize: 12 }}>
                <strong>{payload[0].payload.k}</strong>
                <div style={{ fontFamily: 'var(--font-mono), monospace', color: INK2 }}>
                  vol {payload[0].payload.x}% · CAGR {payload[0].payload.y}%
                </div>
              </div>
            ) : null
          }
        />
        <Scatter data={pts}>
          {pts.map((p, i) => (
            <Cell key={i} fill={p.ours ? ACCENT : GREY} />
          ))}
          <LabelList
            dataKey="k"
            position="right"
            offset={9}
            style={{ fill: INK2, fontSize: 10.5 }}
          />
        </Scatter>
      </ScatterChart>
    </Shell>
  );
}

export function BetaStress() {
  const data = [
    { k: 'COVID Crash', ours: -8.97, mvo: -35.33, nifty: -37.63 },
    { k: 'ADANI Crisis', ours: -5.87, mvo: -13.71, nifty: -5.9 },
    { k: '2018 Rate Hike', ours: -12.86, mvo: -14.33, nifty: -13.45 },
    { k: 'IL&FS Crisis', ours: -13.54, mvo: -15.85, nifty: -14.55 },
  ];
  return (
    <Shell h={310}>
      <BarChart data={data} margin={{ left: 8, right: 16, top: 16, bottom: 8 }}>
        <CartesianGrid vertical={false} stroke={RULE} />
        <XAxis dataKey="k" {...axis} />
        <YAxis {...axis} unit="%" domain={[-40, 0]} />
        <Tooltip {...tip} formatter={(v: number, n: string) => [`${v}%`, n]} />
        <Bar dataKey="ours" name="AdaptiveBeta" fill={ACCENT} maxBarSize={30} />
        <Bar dataKey="mvo" name="Static MVO" fill={CAUTION} maxBarSize={30} />
        <Bar dataKey="nifty" name="NIFTY-50" fill={GREY} maxBarSize={30} />
      </BarChart>
    </Shell>
  );
}

export function EcoAttribution() {
  const data = [
    { k: 'EcoTransformer · Everglades', v: 50332, ok: true },
    { k: 'UNet-Mamba · Everglades', v: 34113, ok: false },
    { k: 'UNet-Temporal · Everglades', v: 698259, ok: false },
    { k: 'EcoTransformer · Barataria', v: 146458, ok: true },
    { k: 'UNet-Mamba · Barataria', v: 149006, ok: false },
    { k: 'UNet-Temporal · Barataria', v: 1006257, ok: false },
  ];
  return (
    <Shell h={330}>
      <BarChart data={data} layout="vertical" margin={{ left: 186, right: 60, top: 8, bottom: 8 }}>
        <CartesianGrid horizontal={false} stroke={RULE} />
        <XAxis type="number" scale="log" domain={[10000, 2000000]} {...axis} tickFormatter={(v) => `${v / 1000}k`} />
        <YAxis type="category" dataKey="k" width={184} {...axis} tick={{ ...axis.tick, fontSize: 10 }} />
        <Tooltip {...tip} formatter={(v: number) => [`${v.toLocaleString()} tCO₂-eq`, '']} />
        <Bar dataKey="v" maxBarSize={18}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.ok ? ACCENT : CAUTION} />
          ))}
        </Bar>
      </BarChart>
    </Shell>
  );
}

export function SsaF1() {
  const data = [
    { k: 'DATE', v: 0.9534 },
    { k: 'LAUNCH_VEHICLE', v: 0.9371 },
    { k: 'ORBITAL_PARAM', v: 0.9342 },
    { k: 'ORGANIZATION', v: 0.901 },
    { k: 'SATELLITE', v: 0.8718 },
    { k: 'DEBRIS_ACTION', v: 0.8704 },
    { k: 'LOCATION', v: 0.8254 },
    { k: 'MISSION', v: 0.7733 },
  ];
  return (
    <Shell h={310}>
      <BarChart data={data} layout="vertical" margin={{ left: 130, right: 60, top: 8, bottom: 8 }}>
        <CartesianGrid horizontal={false} stroke={RULE} />
        <XAxis type="number" domain={[0.7, 1]} {...axis} />
        <YAxis type="category" dataKey="k" width={128} {...axis} />
        <Tooltip {...tip} formatter={(v: number) => [`F1 ${v}`, '']} />
        <Bar dataKey="v" maxBarSize={18}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.v > 0.9 ? ACCENT : d.v < 0.8 ? CAUTION : GREY} />
          ))}
          <LabelList
            dataKey="v"
            position="right"
            formatter={(v: number) => v.toFixed(4)}
            style={{ fill: INK, fontSize: 10.5, fontFamily: 'var(--font-mono), monospace' }}
          />
        </Bar>
      </BarChart>
    </Shell>
  );
}
