import type { LucideIcon } from 'lucide-react'
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { cx } from '../lib/cx'

export type BannerProps = {
  tone?: 'info' | 'ok' | 'warn' | 'error'
  title: ReactNode
  children?: ReactNode
  /** Override the tone icon, e.g. FileText for "Bring a referral". */
  icon?: LucideIcon
  action?: ReactNode
  onDismiss?: () => void
  dismissLabel?: string
}

const TONES = {
  info: { box: 'bg-info-soft', text: 'text-info-text', icon: Info },
  ok: { box: 'bg-ok-soft', text: 'text-ok-text', icon: CircleCheck },
  warn: { box: 'bg-warn-soft', text: 'text-warn-text', icon: TriangleAlert },
  error: { box: 'bg-error-soft', text: 'text-error-text', icon: CircleAlert },
}

/** Inline notice: referral needed, offline, request pending, slot taken. Always icon + text. */
export const Banner = ({ tone = 'info', title, children, icon, action, onDismiss, dismissLabel = 'Dismiss' }: BannerProps) => {
  const t = TONES[tone]
  const Icon = icon ?? t.icon
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cx('flex gap-3 rounded-card p-3.5', t.box)}>
      <Icon aria-hidden size={20} className={cx('mt-px shrink-0', t.text)} />
      <div className="min-w-0 flex-1">
        <p className={cx('text-headline', t.text)}>{title}</p>
        {children && <div className="mt-0.5 text-subheadline text-ink">{children}</div>}
        {action && <div className="mt-2.5">{action}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          aria-label={dismissLabel}
          onClick={onDismiss}
          className="-m-1.5 flex size-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-black/5"
        >
          <X aria-hidden size={16} />
        </button>
      )}
    </div>
  )
}
