import type { LucideIcon } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { cx } from '../lib/cx'

/** iOS inset-grouped list: a titled group of rows on a rounded surface. */
export const ListGroup = ({ title, footer, children }: { title?: string; footer?: string; children: ReactNode }) => (
  <section className="px-4">
    {title && <h2 className="px-4 pb-1.5 text-footnote font-semibold text-muted">{title}</h2>}
    <ul className="divide-y divide-line overflow-hidden rounded-card bg-surface shadow-card">{children}</ul>
    {footer && <p className="px-4 pt-1.5 text-footnote text-muted">{footer}</p>}
  </section>
)

export type ListRowProps = {
  title: ReactNode
  subtitle?: ReactNode
  /** Trailing value, e.g. "Public · TK" */
  value?: ReactNode
  icon?: LucideIcon
  /** Custom leading element (avatar); overrides icon. */
  leading?: ReactNode
  /** Custom trailing element (switch, badge); overrides value and chevron. */
  trailing?: ReactNode
  onClick?: () => void
  destructive?: boolean
}

/** One size for every leading icon in a row, like iOS Settings; the icon sits in a 28px column so text lines up */
export const ROW_ICON_SIZE = 22

export const ListRow = ({ title, subtitle, value, icon: Icon, leading, trailing, onClick, destructive }: ListRowProps) => {
  const content = (
    <>
      {leading ??
        (Icon && (
          <span
            className={cx(
              'flex w-7 shrink-0 items-center justify-center',
              destructive ? 'text-error-text' : 'text-brand',
            )}
          >
            <Icon aria-hidden size={ROW_ICON_SIZE} />
          </span>
        ))}
      <span className="min-w-0 flex-1 text-left">
        <span className={cx('block text-body', destructive ? 'text-error-text' : 'text-ink')}>{title}</span>
        {subtitle && <span className="block text-subheadline text-muted">{subtitle}</span>}
      </span>
      {trailing ?? (
        <>
          {value && <span className="shrink-0 text-body text-muted">{value}</span>}
          {onClick && !destructive && <ChevronRight aria-hidden size={18} className="shrink-0 text-muted/70" />}
        </>
      )}
    </>
  )

  const base = 'flex min-h-11 w-full items-center gap-3 px-4 py-2.5'
  return (
    <li>
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className={cx(base, 'transition-colors duration-150 active:bg-canvas')}
        >
          {content}
        </button>
      ) : (
        <div className={base}>{content}</div>
      )}
    </li>
  )
}
