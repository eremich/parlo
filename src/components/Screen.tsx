import type { ReactNode } from 'react'
import { cx } from '../lib/cx'

export type ScreenProps = {
  children: ReactNode
  /** Pinned action area above the home indicator, e.g. "Book 08:40" */
  footer?: ReactNode
  /** Leaves room for the floating tab bar */
  tabBar?: boolean
  /** Pushed screen (kept for readability; the navigation stack animates it) */
  push?: boolean
}

/** One phone screen: its own scroll area, an optional pinned footer. */
export const Screen = ({ children, footer, tabBar }: ScreenProps) => (
  <div className="flex h-full flex-col bg-canvas">
    <div className={cx('min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none]', tabBar ? 'pb-28' : 'pb-6')}>
      {children}
    </div>
    {footer && (
      <div className="z-30 shrink-0 border-t border-line bg-surface/90 px-4 pt-3 pb-9 backdrop-blur-xl">{footer}</div>
    )}
  </div>
)
