import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F1F2EF',
        'paper-2': '#E8EAE6',
        surface: '#FFFFFF',
        ink: '#15181A',
        'ink-2': '#4E565C',
        'ink-3': '#7C858B',
        rule: '#D2D6D1',
        'rule-2': '#B6BCB6',
        accent: '#0E5A63',
        'accent-2': '#12777F',
        'accent-soft': '#DBE9EA',
        caution: '#8F4F10',
        'caution-soft': '#EFE3D3',
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui'],
        sans: ['var(--font-body)', 'ui-sans-serif', 'system-ui'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        label: ['0.6875rem', { lineHeight: '1.1', letterSpacing: '0.12em' }],
        micro: ['0.75rem', { lineHeight: '1.35' }],
      },
      maxWidth: { measure: '68ch', shell: '84rem' },
      transitionDuration: { 180: '180ms', 320: '320ms' },
    },
  },
  plugins: [],
};
export default config;
