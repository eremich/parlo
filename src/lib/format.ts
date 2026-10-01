import type { Lang } from '../i18n'

/**
 * German-style dates and 24-hour times in both languages: "Thu, 12 Mar" / "Do., 12. März", "08:40".
 * Dates are ISO strings (YYYY-MM-DD) so mock data stays readable and timezone-free.
 */

const LOCALE: Record<Lang, string> = { en: 'en-GB', de: 'de-DE' }
const RELATIVE: Record<Lang, [string, string]> = { en: ['Today', 'Tomorrow'], de: ['Heute', 'Morgen'] }

const parse = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

const daysBetween = (from: string, to: string) => Math.round((parse(to).getTime() - parse(from).getTime()) / 86_400_000)

/** "Thu, 12 Mar" */
export const formatDate = (iso: string, lang: Lang) =>
  parse(iso).toLocaleDateString(LOCALE[lang], { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })

/** "Today", "Tomorrow", otherwise "Thu, 12 Mar" */
export const formatDay = (iso: string, today: string, lang: Lang) => {
  const diff = daysBetween(today, iso)
  if (diff === 0) return RELATIVE[lang][0]
  if (diff === 1) return RELATIVE[lang][1]
  return formatDate(iso, lang)
}

/** "Thu" */
export const formatWeekday = (iso: string, lang: Lang) =>
  parse(iso).toLocaleDateString(LOCALE[lang], { weekday: 'short', timeZone: 'UTC' })

export const addDays = (iso: string, days: number) => {
  const date = parse(iso)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

/** "08:40" → minutes since midnight, and back */
export const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}
export const fromMinutes = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

/** "€ 85" — prices are only ever shown to private patients */
export const formatPrice = (euros: number) => `€ ${euros}`

export const formatDistance = (km: number, lang: Lang) =>
  `${km.toLocaleString(LOCALE[lang], { maximumFractionDigits: 1 })} km`

/** Full years between a birth date and a day (both ISO); undefined when the birth date is unknown */
export const ageOf = (birthDate: string, today: string) => {
  if (!birthDate) return undefined
  const [by, bm, bd] = birthDate.split('-').map(Number)
  const [ty, tm, td] = today.split('-').map(Number)
  return ty - by - (tm < bm || (tm === bm && td < bd) ? 1 : 0)
}
