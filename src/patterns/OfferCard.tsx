import { ArrowUpToLine, TimerOff } from 'lucide-react'
import { Button } from '../components/Button'
import { cx } from '../lib/cx'

export type OfferCardProps = {
  /** "Earlier slot: Thu 09:00 with Dr. Aydın" */
  title: string
  /** "Take it?" */
  question: string
  /** "24:12 left" */
  remaining: string
  /** 0–1 of the offer window still left, drives the bar */
  progress: number
  /** "Your Mon 16 Mar appointment will be released." */
  note: string
  takeLabel: string
  keepLabel: string
  onTake: () => void
  onKeep: () => void
  expired?: { title: string; body: string }
}

/**
 * Signature moment of the waitlist: a freed slot offered for 30 minutes.
 * One tap takes it; the old appointment is released automatically.
 */
export const OfferCard = ({
  title,
  question,
  remaining,
  progress,
  note,
  takeLabel,
  keepLabel,
  onTake,
  onKeep,
  expired,
}: OfferCardProps) => {
  if (expired)
    return (
      <div role="status" className="flex gap-3 rounded-card bg-surface p-4 shadow-card">
        <TimerOff aria-hidden size={20} className="mt-px shrink-0 text-muted" />
        <div>
          <p className="text-headline text-ink">{expired.title}</p>
          <p className="mt-0.5 text-subheadline text-muted">{expired.body}</p>
        </div>
      </div>
    )

  return (
    <section
      aria-label={title}
      className="animate-pop-in overflow-hidden rounded-card bg-surface shadow-card ring-2 ring-info"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-info-soft text-info-text">
            <ArrowUpToLine aria-hidden size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-headline text-pretty text-ink">
              {title} <span className="text-muted">{question}</span>
            </p>
            <p className="mt-1 text-footnote font-semibold text-info-text tabular-nums" aria-live="off">
              {remaining}
            </p>
          </div>
        </div>
        <p className="mt-3 text-footnote text-muted">{note}</p>
        <div className="mt-3 flex flex-col gap-2">
          <Button size="lg" fullWidth onClick={onTake}>
            {takeLabel}
          </Button>
          <Button variant="plain" fullWidth onClick={onKeep}>
            {keepLabel}
          </Button>
        </div>
      </div>
      {/* The remaining window as a bar: scaleX only, so it never reflows */}
      <div aria-hidden className="h-1 bg-info-soft">
        <div
          className={cx('h-full origin-left bg-info transition-transform duration-1000 ease-linear')}
          style={{ transform: `scaleX(${Math.max(0, Math.min(1, progress))})` }}
        />
      </div>
    </section>
  )
}
