import { LANGUAGE_NAMES } from '../data/languages'
import { useApp } from '../store/app'
import type { Doctor, Insurance } from '../data/types'
import { formatDate, formatDay, formatDistance, formatPrice, formatWeekday } from '../lib/format'
import { useShell } from '../store/shell'
import { useT } from '.'

/** Formatting bound to the current UI language and the prototype's frozen clock. */
export const useFormat = () => {
  const lang = useShell((s) => s.lang)
  const t = useT()
  // Subscribing to the clock re-renders every screen that formats dates when it moves
  const clock = useApp((s) => s.clock)

  return {
    lang,
    /** "Today" / "Tomorrow" / "Thu, 12 Mar" */
    day: (iso: string) => formatDay(iso, clock.date, lang),
    date: (iso: string) => formatDate(iso, lang),
    weekday: (iso: string) => formatWeekday(iso, lang),
    distance: (km: number) => formatDistance(km, lang),
    languageNames: LANGUAGE_NAMES[lang],
    /** "English, Russian" */
    languageList: (codes: string[]) =>
      codes.map((c) => LANGUAGE_NAMES[lang][c as keyof (typeof LANGUAGE_NAMES)['en']]).join(', '),
    insurance: (doctor: Pick<Doctor, 'insurance'>) =>
      doctor.insurance.length === 2
        ? t.common.publicAndPrivate
        : doctor.insurance[0] === 'private'
          ? t.common.privateOnly
          : t.common.public,
    /** What the visit costs this patient: nothing to show for public, a price for private */
    cost: (doctor: Doctor, insurance: Insurance) =>
      insurance === 'private' && doctor.privatePrice
        ? t.common.privatePrice(formatPrice(doctor.privatePrice))
        : t.common.coveredPublic,
  }
}
