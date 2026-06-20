import type { GithubLanguages } from '../lib/github/index.ts'

const COLORS = ['#3178c6', '#f1e05a', '#e34c26', '#563d7c', '#00ADD8', '#3572A5', '#b07219', '#A97BFF']

interface LanguageBarProps {
  languages: GithubLanguages
}

export function LanguageBar({ languages }: LanguageBarProps) {
  const entries = Object.entries(languages)
  const total = entries.reduce((sum, [, b]) => sum + b, 0)
  if (total === 0) return null

  const computed = entries.map(([lang, bytes], i) => ({
    lang,
    pct: Math.round((bytes / total) * 1000) / 10,
    color: COLORS[i % COLORS.length] ?? '#ccc',
  }))

  const ariaLabel =
    'Language breakdown: ' + computed.map(({ lang, pct }) => `${lang} ${pct}%`).join(', ')

  return (
    <div role="img" aria-label={ariaLabel}>
      <div style={{ display: 'flex', height: '8px' }}>
        {computed.map(({ lang, pct, color }) => (
          <div key={lang} style={{ width: `${pct}%`, backgroundColor: color, height: '100%' }} />
        ))}
      </div>
      <ul
        aria-hidden="true"
        style={{ listStyle: 'none', padding: 0, margin: '8px 0 0', display: 'flex', flexWrap: 'wrap', gap: '8px' }}
      >
        {computed.map(({ lang, pct, color }) => (
          <li key={lang} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
            <span
              style={{
                display: 'inline-block',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: color,
                flexShrink: 0,
              }}
            />
            {lang} {pct}%
          </li>
        ))}
      </ul>
    </div>
  )
}
