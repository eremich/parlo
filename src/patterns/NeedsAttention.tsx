import type { LucideIcon } from 'lucide-react'
import { ArrowUpToLine, CalendarX2, CircleCheck, Clock, Inbox } from 'lucide-react'
import { Button } from '../components/Button'
import { cx } from '../lib/cx'

export type AttentionKind = 'request' | 'conflict' | 'late' | 'waitlist'

export type AttentionItem = {
  id: string
  kind: AttentionKind
  /** "Confirm Lukas Schmidt, Fri 10:20" */
  title: string
  /** "New patient · Private · requested 25 min ago" */
  detail: string
  actionLabel?: string
  onAction?: () => void
}

const KIND: Record<AttentionKind, { icon: LucideIcon; tile: string }> = {
  request: { icon: Inbox, tile: 'bg-warn-soft text-warn-text' },
  conflict: { icon: CalendarX2, tile: 'bg-error-soft text-error-text' },
  late: { icon: Clock, tile: 'bg-warn-soft text-warn-text' },
  waitlist: { icon: ArrowUpToLine, tile: 'bg-info-soft text-info-text' },
}

export type NeedsAttentionProps = {
  items: AttentionItem[]
  title?: string
  emptyTitle?: string
  emptyDetail?: string
  /** "3 more requests", shown under the list when some items are held back */
  moreLabel?: string
}

/**
 * Signature element of the practice dashboard: what staff must do now, before anything else.
 * Ordered by urgency by the caller; each item has one action.
 */
export const NeedsAttention = ({
  items,
  title = 'Needs attention',
  emptyTitle = 'All clear',
  emptyDetail = 'Nothing needs you right now. New requests and conflicts show up here.',
  moreLabel,
}: NeedsAttentionProps) => (
  <section aria-labelledby="needs-attention" className="rounded-card bg-surface p-5 shadow-card">
    <h2 id="needs-attention" className="flex items-center gap-2 text-section font-semibold text-ink">
      {title}
      {items.length > 0 && (
        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-chip bg-ink px-2 text-label font-semibold text-surface tabular-nums">
          {items.length}
        </span>
      )}
    </h2>

    {items.length === 0 ? (
      <p className="mt-3 flex items-center gap-2 text-web-body text-muted">
        <CircleCheck aria-hidden size={18} className="text-ok" />
        <span>
          <strong className="font-semibold text-ink">{emptyTitle}.</strong> {emptyDetail}
        </span>
      </p>
    ) : (
      <ul className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
        {items.map((item) => {
          const { icon: Icon, tile } = KIND[item.kind]
          return (
            <li key={item.id} className="flex flex-col gap-3 rounded-[12px] border border-line p-4">
              <div className="flex items-start gap-3">
                <span className={cx('flex size-9 shrink-0 items-center justify-center rounded-[10px]', tile)}>
                  <Icon aria-hidden size={18} />
                </span>
                <div className="min-w-0">
                  <p className="text-web-body font-semibold text-ink">{item.title}</p>
                  <p className="text-meta text-muted">{item.detail}</p>
                </div>
              </div>
              {item.actionLabel && (
                <Button size="sm" variant="secondary" onClick={item.onAction} className="mt-auto self-start">
                  {item.actionLabel}
                </Button>
              )}
            </li>
          )
        })}
      </ul>
    )}
    {moreLabel && <p className="mt-3 text-meta text-muted">{moreLabel}</p>}
  </section>
)
