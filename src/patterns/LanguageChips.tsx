import { Check } from 'lucide-react'
import type { LanguageCode, LanguageLevel, SpokenLanguage } from '../data/types'
import { cx } from '../lib/cx'

export type LanguageChipsProps = {
  languages: SpokenLanguage[]
  /** Names in the UI language, used for the accessible label and the detailed list */
  names: Record<LanguageCode, string>
  /** The patient's languages; matching codes are highlighted and listed first */
  matched?: LanguageCode[]
  /** Accessible prefix: "Speaks" → "Speaks Turkish, English, German" */
  prefix?: string
  size?: 'sm' | 'md'
}

const byMatch = (languages: SpokenLanguage[], matched: LanguageCode[]) =>
  [...languages].sort((a, b) => Number(matched.includes(b.code)) - Number(matched.includes(a.code)))

/**
 * Signature element: languages as codes in soft pills, never flags (flags are countries, not languages).
 * Screen readers hear the full names.
 */
export const LanguageChips = ({ languages, names, matched = [], prefix = 'Speaks', size = 'md' }: LanguageChipsProps) => {
  const sorted = byMatch(languages, matched)
  return (
    <ul aria-label={`${prefix} ${sorted.map((l) => names[l.code]).join(', ')}`} className="flex flex-wrap gap-1">
      {sorted.map(({ code }) => {
        const isMatch = matched.includes(code)
        return (
          <li
            key={code}
            aria-hidden
            className={cx(
              'inline-flex items-center gap-0.5 rounded-chip font-semibold tracking-[0.04em] tabular-nums',
              size === 'sm' ? 'h-5 px-1.5 text-caption2' : 'h-7 px-2.5 text-footnote',
              isMatch ? 'bg-brand-soft text-brand' : 'bg-canvas text-muted ring-1 ring-line ring-inset',
            )}
          >
            {isMatch && <Check aria-hidden size={size === 'sm' ? 10 : 13} strokeWidth={3} />}
            {code}
          </li>
        )
      })}
    </ul>
  )
}

export type LanguageListProps = {
  languages: SpokenLanguage[]
  names: Record<LanguageCode, string>
  /** Staff and the doctor's own profile show the level; patients only need the languages */
  levels?: Record<LanguageLevel, string>
}

/** Every language the doctor speaks, all rows equal; the level ("Native") only when `levels` is given. */
export const LanguageList = ({ languages, names, levels }: LanguageListProps) => (
  <ul className="divide-y divide-line">
    {languages.map(({ code, level }) => (
      <li key={code} className="flex min-h-11 items-center gap-3 py-2">
        <span
          aria-hidden
          className="inline-flex h-7 w-10 items-center justify-center rounded-chip bg-canvas text-footnote font-semibold tracking-[0.04em] text-muted ring-1 ring-line ring-inset"
        >
          {code}
        </span>
        <span className="flex-1 text-body text-ink">{names[code]}</span>
        {levels && <span className="text-subheadline text-muted">{levels[level]}</span>}
      </li>
    ))}
  </ul>
)
