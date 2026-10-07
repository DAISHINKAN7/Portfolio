/**
 * A one-second boot log, shown once per session on the home page only. It is
 * server-rendered but hidden unless the pre-paint script marks the document
 * `booting`; any key, click, scroll or touch skips it, and a CSS timeout
 * removes it even if JavaScript never runs. While it is up, the hero's own
 * entrance is paused so the two read as one sequence.
 */
const LINES: [string, string][] = [
  ['init', 'weights'],
  ['load', 'case studies'],
  ['verify', 'provenance tags'],
  ['ready', ''],
];

export function BootScreen() {
  return (
    <div className="boot" aria-hidden>
      <div className="boot-inner">
        <p className="boot-title">kunal-ajgaonkar / portfolio</p>
        <ol>
          {LINES.map(([k, v], i) => (
            <li key={k} style={{ ['--i' as string]: i }}>
              <span className="boot-k">{k}</span>
              {v && <span className="boot-v">{v}</span>}
              {v && <span className="boot-ok">ok</span>}
            </li>
          ))}
        </ol>
        <span className="boot-bar" />
      </div>
    </div>
  );
}

/** Lifts the boot screen. Safe to call when it isn't showing. */
export function runBoot() {
  const html = document.documentElement;
  if (!html.classList.contains('booting')) return () => {};
  try {
    sessionStorage.setItem('kb', '1');
  } catch {
    /* private mode: it will simply show again next visit */
  }
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    html.classList.remove('booting');
    html.classList.add('boot-out');
    setTimeout(() => html.classList.remove('boot-out'), 750);
    events.forEach((e) => window.removeEventListener(e, finish));
  };
  const events = ['keydown', 'pointerdown', 'wheel', 'touchstart'] as const;
  events.forEach((e) => window.addEventListener(e, finish, { passive: true, once: true }));
  const t = setTimeout(finish, 1150);
  return () => {
    clearTimeout(t);
    finish();
  };
}
