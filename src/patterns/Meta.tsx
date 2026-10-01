import { ShieldCheck, Star } from 'lucide-react'

/** Small inline facts used on result cards and profiles. */

export const InsuranceBadge = ({ label }: { label: string }) => (
  <span className="inline-flex h-7 items-center gap-1 rounded-chip bg-canvas px-2.5 text-footnote font-semibold text-muted ring-1 ring-line ring-inset">
    <ShieldCheck aria-hidden size={14} strokeWidth={2.25} />
    {label}
  </span>
)

export type RatingProps = {
  value: number
  count: number
  /** Accessible text, e.g. "Rated 4.8 from 212 reviews" */
  label: string
}

export const Rating = ({ value, count, label }: RatingProps) => (
  <span className="inline-flex items-center gap-1 text-subheadline text-muted">
    <span className="sr-only">{label}</span>
    <Star aria-hidden size={15} className="fill-current text-ink" />
    <span aria-hidden className="font-semibold text-ink tabular-nums">
      {value.toFixed(1)}
    </span>
    <span aria-hidden className="tabular-nums">
      ({count})
    </span>
  </span>
)
