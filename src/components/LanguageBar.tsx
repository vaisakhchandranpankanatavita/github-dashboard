import type { GithubLanguages } from '../lib/github/index.ts'
import { getLanguageColor } from '../lib/languageColors.ts'

interface LanguageBarProps {
  languages: GithubLanguages
}

export function LanguageBar({ languages }: LanguageBarProps) {
  const entries = Object.entries(languages)
  const total = entries.reduce((sum, [, b]) => sum + b, 0)
  if (total === 0) return null

  const computed = entries.map(([lang, bytes]) => ({
    lang,
    pct: Math.round((bytes / total) * 1000) / 10,
    color: getLanguageColor(lang),
  }))

  const ariaLabel =
    'Language breakdown: ' + computed.map(({ lang, pct }) => `${lang} ${pct}%`).join(', ')

  return (
    <div role="img" aria-label={ariaLabel}>
      <div className="lang-segments">
        {computed.map(({ lang, pct, color }) => (
          <div key={lang} style={{ width: `${pct}%`, backgroundColor: color, height: '100%' }} />
        ))}
      </div>
      <ul className="lang-legend" aria-hidden="true">
        {computed.map(({ lang, pct, color }) => (
          <li key={lang}>
            <span className="lang-legend-dot" style={{ backgroundColor: color }} />
            {lang} {pct}%
          </li>
        ))}
      </ul>
    </div>
  )
}
