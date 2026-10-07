import { Fragment } from 'react';

/**
 * The name, set letter by letter so each glyph can rise out of its own slot.
 * Server-rendered; the motion is pure CSS and only runs under `html.motion`.
 * Screen readers get the plain name once via aria-label.
 */
export function HeroTitle({ text }: { text: string }) {
  let i = 0;
  const words = text.split(' ');
  return (
    <h1 className="display-xl hero-title mt-6" aria-label={text}>
      {words.map((word, w) => (
        <Fragment key={w}>
          {w > 0 && ' '}
          <span className="hero-word" aria-hidden>
            {word.split('').map((ch) => (
              <span key={i} className="hero-letter" style={{ ['--i' as string]: i++ }}>
                {ch}
              </span>
            ))}
          </span>
        </Fragment>
      ))}
    </h1>
  );
}
