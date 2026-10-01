import { X } from 'lucide-react'
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cx } from '../lib/cx'

export type SheetProps = {
  open: boolean
  onClose: () => void
  title: string
  /** medium: half height (quick choices) · large: nearly full (forms, filters) */
  detent?: 'medium' | 'large'
  footer?: ReactNode
  closeLabel?: string
  children: ReactNode
}

const HEIGHT = { medium: 'h-[52%]', large: 'h-[calc(100%-62px)]' }

/**
 * iOS bottom sheet over the whole phone screen, tab bar included: it portals to the nearest
 * `[data-overlay-root]` because each screen is its own stacking layer under the tab bar.
 * Without a root (Storybook) it stays inside the nearest positioned ancestor.
 * Stays mounted through its exit so it can slide out; Escape and the scrim close it.
 */
export const Sheet = ({ open, onClose, title, detent = 'large', footer, closeLabel = 'Close', children }: SheetProps) => {
  const [mounted, setMounted] = useState(open)
  const [visible, setVisible] = useState(false)
  const panel = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const anchor = useRef<HTMLSpanElement>(null)
  const [root, setRoot] = useState<HTMLElement | null>(null)

  useLayoutEffect(() => {
    setRoot(anchor.current?.closest<HTMLElement>('[data-overlay-root]') ?? null)
  }, [])

  useEffect(() => {
    if (open) {
      setMounted(true)
      // Wait a frame so the closed position is painted before transitioning to open
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

  const sheet = mounted && (
    <div className="absolute inset-0 z-50">
      <div
        aria-hidden
        onClick={onClose}
        className={cx(
          'absolute inset-0 bg-black/40 transition-opacity duration-300 ease-out',
          visible ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onTransitionEnd={(e) => e.target === panel.current && !visible && setMounted(false)}
        className={cx(
          'absolute inset-x-0 bottom-0 flex flex-col rounded-t-sheet bg-surface shadow-sheet outline-none',
          'transition-transform duration-[360ms] ease-drawer motion-reduce:transition-none',
          HEIGHT[detent],
          visible ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <div aria-hidden className="mx-auto mt-2 h-[5px] w-9 shrink-0 rounded-full bg-line" />
        <header className="flex shrink-0 items-center justify-between gap-3 px-4 pt-2 pb-3">
          <h2 id={titleId} className="text-headline text-ink">
            {title}
          </h2>
          <button
            type="button"
            aria-label={closeLabel}
            onClick={onClose}
            className="flex size-[30px] items-center justify-center rounded-full bg-canvas text-muted transition-transform duration-150 active:scale-[0.94]"
          >
            <X aria-hidden size={16} strokeWidth={2.5} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">{children}</div>
        {footer && <footer className="shrink-0 border-t border-line px-4 pt-3 pb-8">{footer}</footer>}
      </div>
    </div>
  )

  return (
    <>
      <span ref={anchor} hidden />
      {sheet && (root ? createPortal(sheet, root) : sheet)}
    </>
  )
}
