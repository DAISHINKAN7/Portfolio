import type { ElementType } from 'react';

/**
 * Text that is read in as you scroll: each word brightens in turn as the
 * element travels up the viewport. Server-rendered words; the effect is pure
 * CSS driven by the --se scroll variable, so without motion (or without
 * JavaScript) the text is simply fully visible.
 */
export function ScrubText({
  text,
  as: Tag = 'p',
  className = '',
  style,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  style?: React.CSSProperties;
}) {
  const words = text.split(' ');
  return (
    <Tag className={`scrub ${className}`} data-scroll style={{ ...style, ['--n' as string]: words.length }}>
      {words.map((w, i) => (
        <span key={i} className="scrub-w" style={{ ['--i' as string]: i }}>
          {w}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  );
}
