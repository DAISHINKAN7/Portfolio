'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

/**
 * `mailto:` silently fails when no mail client is registered — common on
 * machines that use webmail only. This keeps the primary action working
 * and always leaves a copyable address behind.
 */
export function EmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard blocked — the address is visible on the page anyway */
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <a href={`mailto:${email}`} className="btn btn-primary">
        {email}
      </a>
      <button type="button" onClick={copy} className="btn btn-ghost">
        {copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
        {copied ? 'Copied' : 'Copy address'}
      </button>
      <a
        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`}
        target="_blank"
        rel="noreferrer"
        className="btn btn-ghost"
      >
        Open in Gmail
      </a>
      <span aria-live="polite" className="sr-only">
        {copied ? 'Email address copied to clipboard' : ''}
      </span>
    </div>
  );
}
