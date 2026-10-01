import { Clock } from 'lucide-react'
import { cx } from '../lib/cx'

export type EarliestSlotProps = {
  /** "Tomorrow", "Thu, 12 Mar" */
  day: string
  /** "08:40" */
  time: string
  /** Small label above, e.g. "Earliest" / "Nächster Termin" */
  label?: string
  size?: 'md' | 'lg'
}

/**
 * Signature element: every result leads with the real next free time, not with ratings.
 * The time carries the accent; the rest stays calm.
 */
export const EarliestSlot = ({ day, time, label, size = 'lg' }: EarliestSlotProps) => (
  <div>
    {label && <p className="text-footnote text-muted">{label}</p>}
    <p
      className={cx(
        'flex items-center gap-1.5 font-semibold tracking-[-0.01em] text-ink',
        size === 'lg' ? 'text-title2' : 'text-headline',
      )}
    >
      <Clock aria-hidden size={size === 'lg' ? 20 : 17} strokeWidth={2.25} className="shrink-0 text-accent" />
      {/* Day and time stay together; long German dates never split from their time */}
      <span className="whitespace-nowrap">
        {day} <span className="text-accent-text tabular-nums">{time}</span>
      </span>
    </p>
  </div>
)
