import * as React from 'react';

export const C = {
  ink: '#15181A',
  ink2: '#4E565C',
  ink3: '#7C858B',
  rule: '#D2D6D1',
  rule2: '#B6BCB6',
  accent: '#0E5A63',
  accent2: '#12777F',
  soft: '#DBE9EA',
  caution: '#8F4F10',
  cautionSoft: '#EFE3D3',
  panel: '#F7F8F6',
  panel2: '#E8EAE6',
  white: '#FFFFFF',
};

/**
 * All diagrams render inside this frame. It keeps the SVG at a readable
 * minimum width and lets narrow screens pan horizontally rather than
 * shrinking labels below legibility.
 */
export function Frame({
  viewBox,
  minWidth = 640,
  title,
  children,
}: {
  viewBox: string;
  minWidth?: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="scroll-x -mx-1">
      <svg
        viewBox={viewBox}
        role="img"
        aria-label={title}
        style={{ minWidth, width: '100%', height: 'auto', display: 'block' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>{title}</title>
        {children}
      </svg>
    </div>
  );
}

export function Box({
  x,
  y,
  w,
  h,
  fill = C.white,
  stroke = C.rule2,
  dash,
  strokeWidth = 1,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  fill?: string;
  stroke?: string;
  dash?: string;
  strokeWidth?: number;
}) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={dash}
    />
  );
}

export function T({
  x,
  y,
  children,
  size = 12,
  fill = C.ink,
  weight = 400,
  anchor = 'start',
  mono = false,
  tracking,
  upper = false,
}: {
  x: number;
  y: number;
  children: React.ReactNode;
  size?: number;
  fill?: string;
  weight?: number;
  anchor?: 'start' | 'middle' | 'end';
  mono?: boolean;
  tracking?: number;
  upper?: boolean;
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      fill={fill}
      fontWeight={weight}
      textAnchor={anchor}
      letterSpacing={tracking}
      style={{
        fontFamily: mono
          ? 'var(--font-mono), ui-monospace, monospace'
          : 'var(--font-body), ui-sans-serif, system-ui',
        textTransform: upper ? 'uppercase' : undefined,
      }}
    >
      {children}
    </text>
  );
}

export function Label({
  x,
  y,
  children,
  fill = C.ink3,
  anchor = 'start',
}: {
  x: number;
  y: number;
  children: React.ReactNode;
  fill?: string;
  anchor?: 'start' | 'middle' | 'end';
}) {
  return (
    <T x={x} y={y} size={9} fill={fill} mono upper tracking={1.2} anchor={anchor}>
      {children}
    </T>
  );
}

export function Arrow({
  x1,
  y1,
  x2,
  y2,
  stroke = C.rule2,
  dash,
  marker = 'a',
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke?: string;
  dash?: string;
  marker?: string;
}) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={stroke}
      strokeWidth={1}
      strokeDasharray={dash}
      markerEnd={`url(#${marker})`}
    />
  );
}

export function Path({
  d,
  stroke = C.rule2,
  dash,
  marker,
  fill = 'none',
  width = 1,
}: {
  d: string;
  stroke?: string;
  dash?: string;
  marker?: string;
  fill?: string;
  width?: number;
}) {
  return (
    <path
      d={d}
      fill={fill}
      stroke={stroke}
      strokeWidth={width}
      strokeDasharray={dash}
      markerEnd={marker ? `url(#${marker})` : undefined}
    />
  );
}

/** Arrowhead definitions. Include once per diagram. */
export function Defs() {
  return (
    <defs>
      <marker id="a" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M0,0 L8,4 L0,8 z" fill={C.rule2} />
      </marker>
      <marker id="ac" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M0,0 L8,4 L0,8 z" fill={C.accent} />
      </marker>
      <marker id="aw" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M0,0 L8,4 L0,8 z" fill={C.caution} />
      </marker>
    </defs>
  );
}

/** Small key/legend chip. */
export function Chip({
  x,
  y,
  label,
  color = C.accent,
}: {
  x: number;
  y: number;
  label: string;
  color?: string;
}) {
  return (
    <g>
      <rect x={x} y={y - 6} width={8} height={8} fill={color} />
      <T x={x + 13} y={y + 1} size={9.5} fill={C.ink2} mono>
        {label}
      </T>
    </g>
  );
}
