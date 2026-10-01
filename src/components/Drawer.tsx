import { X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { cx } from '../lib/cx'

export type DrawerProps = {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: ReactNode
  footer?: ReactNode
  closeLabel?: string
  children: ReactNode
}

/**
 * Side panel for the practice dashboard: opens from the right over the calendar, which stays visible.
 * Used for appointment details, requests, phone booking and conflicts.
 */
export const Drawer = ({ open, onClose, title, subtitle, footer, closeLabel = 'Close', children }: DrawerProps) => {
  const [mounted, setMounted] = useState(open)
  const [visible, setVisible] = useState(false)
  const panel = useRef<HTMLDivElement>(null)
  const titleId = useId()

  useEffect(() => {
    if (open) {
      setMounted(true)
      const frame = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
      return () => cancelAnimationFrame(frame)
    }
    setVisible(false)
  }, [open])

  useEffect(() => {
    if (!visible) return
    panel.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [visible, onClose])

  if (!mounted) return null

  return (
    <div className="absolute inset-0 z-50">
      <div
        aria-hidden
        onClick={onClose}
        className={cx(
          'absolute inset-0 bg-black/25 transition-opacity duration-200 ease-out',
          visible ? 'opacity-100' : 'opacity-0',
        )}
      />
      <aside
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onTransitionEnd={(e) => e.target === panel.current && !visible && setMounted(false)}
        className={cx(
          'absolute inset-y-0 right-0 flex w-[420px] flex-col border-l border-line bg-surface shadow-sheet outline-none',
          'transition-transform duration-300 ease-drawer motion-reduce:transition-none',
          visible ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-line px-6 py-5">
          <div className="min-w-0">
            <h2 id={titleId} className="text-section font-semibold text-ink">
              {title}
            </h2>
            {subtitle && <div className="mt-0.5 text-meta text-muted">{subtitle}</div>}
          </div>
          <button
            type="button"
            aria-label={closeLabel}
            onClick={onClose}
            className="flex size-9 shrink-0 items-center justify-center rounded-control text-muted transition-colors hover:bg-canvas hover:text-ink"
          >
            <X aria-hidden size={18} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <footer className="shrink-0 border-t border-line px-6 py-4">{footer}</footer>}
      </aside>
    </div>
  )
}
