import type { LucideIcon } from 'lucide-react'
import {
  ArrowUpToLine,
  Ban,
  CircleCheck,
  CircleCheckBig,
  CircleDot,
  CircleSlash,
  Clock,
  DoorOpen,
  Hourglass,
  Timer,
  Video,
} from 'lucide-react'
import type { AppointmentStatus } from '../data/types'
import { cx } from '../lib/cx'

export type BadgeStatus = AppointmentStatus | 'filledFromWaitlist' | 'waitlist' | 'runningLate' | 'video'

type Tone = 'ok' | 'warn' | 'error' | 'info' | 'neutral'

const STATUS: Record<BadgeStatus, { tone: Tone; icon: LucideIcon; label: string }> = {
  confirmed: { tone: 'ok', icon: CircleCheck, label: 'Confirmed' },
  pending: { tone: 'warn', icon: Hourglass, label: 'Pending' },
  checkedIn: { tone: 'ok', icon: DoorOpen, label: 'Checked in' },
  inProgress: { tone: 'info', icon: CircleDot, label: 'In progress' },
  done: { tone: 'neutral', icon: CircleCheckBig, label: 'Done' },
  noShow: { tone: 'error', icon: CircleSlash, label: 'No-show' },
  cancelled: { tone: 'error', icon: Ban, label: 'Cancelled' },
  declined: { tone: 'error', icon: Ban, label: 'Declined' },
  filledFromWaitlist: { tone: 'info', icon: ArrowUpToLine, label: 'Filled from waitlist' },
  waitlist: { tone: 'info', icon: Timer, label: 'On waitlist' },
  runningLate: { tone: 'warn', icon: Clock, label: 'Running late' },
  video: { tone: 'info', icon: Video, label: 'Video visit' },
}

const TONES: Record<Tone, string> = {
  ok: 'bg-ok-soft text-ok-text',
  warn: 'bg-warn-soft text-warn-text',
  error: 'bg-error-soft text-error-text',
  info: 'bg-info-soft text-info-text',
  neutral: 'bg-canvas text-muted ring-1 ring-line ring-inset',
}

export type StatusBadgeProps = {
  status: BadgeStatus
  /** Translated label; English by default. Extra detail can be appended: "Running late · 10 min" */
  label?: string
  size?: 'sm' | 'md'
}

/** Status is always icon + text, never color alone. */
export const StatusBadge = ({ status, label, size = 'md' }: StatusBadgeProps) => {
  const { tone, icon: Icon, label: fallback } = STATUS[status]
  return (
    <span
      className={cx(
        'inline-flex shrink-0 items-center gap-1 rounded-chip font-semibold whitespace-nowrap',
        size === 'sm' ? 'h-5 px-1.5 text-caption2' : 'h-7 px-2.5 text-footnote',
        TONES[tone],
      )}
    >
      <Icon aria-hidden size={size === 'sm' ? 12 : 14} strokeWidth={2.25} />
      {label ?? fallback}
    </span>
  )
}

export const statusTone = (status: BadgeStatus) => STATUS[status].tone
