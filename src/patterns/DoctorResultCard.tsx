import { Check, Star } from 'lucide-react'
import { initials } from '../components/Avatar'
import type { LanguageCode, SpokenLanguage } from '../data/types'
import { cx } from '../lib/cx'
import { SlotChip } from './SlotChip'

export type DoctorResultCardProps = {
  name: string
  /** Portrait URL; initials when missing */
  photo?: string
  /** Specialty, e.g. "GP" */
  subtitle: string
  distance: string
  earliest: { day: string; time: string }
  /** Next bookable times on the earliest day (up to three); the first one is the earliest */
  slots: string[]
  languages: SpokenLanguage[]
  languageNames: Record<LanguageCode, string>
  matchedLanguages?: LanguageCode[]
  rating: number
  reviewCount: number
  onOpen?: () => void
  onBookSlot?: (time: string) => void
  labels?: Partial<typeof DEFAULT_LABELS>
  /** Kept for callers; insurance, video and referral live on the profile, not the list */
  insuranceLabel?: string
  video?: boolean
  referralExpected?: boolean
}

const DEFAULT_LABELS = {
  speaks: 'Speaks',
  earliest: 'Earliest',
  book: (time: string) => `Book ${time}`,
  allTimes: 'All times',
  rating: (value: number, count: number) => `Rated ${value.toFixed(1)} from ${count} reviews`,
  video: 'Video',
  referral: 'Referral',
}

/**
 * One result in the patient's search. The photo leads the identity; the bottom row leads with the
 * earliest real slot and books it in one tap. Everything else (insurance, visit types, referral)
 * waits on the profile, so the list stays light.
 */
export const DoctorResultCard = ({
  name,
  photo,
  subtitle,
  distance,
  earliest,
  slots,
  languages,
  languageNames,
  matchedLanguages,
  rating,
  reviewCount,
  onOpen,
  onBookSlot,
  labels: overrides,
}: DoctorResultCardProps) => {
  const labels = { ...DEFAULT_LABELS, ...overrides }
  const times = slots.length ? slots.slice(0, 3) : [earliest.time]
  // The filter already lists the patient's languages; the card says which of them this doctor speaks
  const shared = languages.filter((l) => matchedLanguages?.includes(l.code))
  const spoken = (shared.length ? shared : languages).map((l) => languageNames[l.code]).join(', ')

  return (
    <article className="relative rounded-card bg-surface p-4 shadow-card">
      <div className="flex gap-4">
        {photo ? (
          <img
            src={photo}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-[72px] shrink-0 rounded-[18px] bg-brand-soft object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="flex size-[72px] shrink-0 items-center justify-center rounded-[18px] bg-brand-soft text-title3 font-semibold text-brand"
          >
            {initials(name)}
          </span>
        )}

        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-headline text-ink">
              {/* Stretched button: the whole card opens the profile; slot buttons sit above it */}
              <button
                type="button"
                onClick={onOpen}
                className="text-left after:absolute after:inset-0 after:rounded-card after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-brand"
              >
                {name}
              </button>
            </h3>
            <span className="flex shrink-0 items-center gap-0.5 pt-0.5 text-subheadline font-semibold text-ink tabular-nums">
              <span className="sr-only">{labels.rating(rating, reviewCount)}</span>
              <Star aria-hidden size={14} className="fill-accent text-accent" />
              <span aria-hidden>{rating.toFixed(1)}</span>
            </span>
          </div>
          <p className="text-subheadline text-muted">
            {subtitle} · <span className="tabular-nums">{distance}</span>
          </p>
          <p
            className={cx(
              'mt-1.5 flex items-center gap-1 text-subheadline',
              shared.length ? 'font-medium text-brand' : 'text-muted',
            )}
          >
            {shared.length > 0 && <Check aria-hidden size={15} strokeWidth={2.5} className="shrink-0" />}
            <span className="truncate">
              {labels.speaks} {spoken}
            </span>
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-4 border-t border-line pt-3">
        <p className="text-footnote text-muted">
          {labels.earliest} · <span className="font-semibold text-accent-text">{earliest.day}</span>
        </p>
        <div className="mt-2 flex items-center gap-2">
          {times.map((time, i) => (
            <SlotChip key={time} time={time} earliest={i === 0} label={labels.book(time)} onSelect={() => onBookSlot?.(time)} />
          ))}
          <button
            type="button"
            onClick={onOpen}
            className="ml-auto min-h-11 px-1 text-subheadline font-semibold whitespace-nowrap text-brand transition-opacity active:opacity-60"
          >
            {labels.allTimes}
          </button>
        </div>
      </div>
    </article>
  )
}
