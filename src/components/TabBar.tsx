import type { LucideIcon } from 'lucide-react'
import { NavLink, useLocation } from 'react-router'
import { cx } from '../lib/cx'

export type TabItem = {
  to: string
  label: string
  icon: LucideIcon
  /** Pushed routes that belong to this tab, e.g. results and profiles under Search */
  also?: string[]
}

/**
 * iOS-style floating tab bar with labels (HIG: tabs are always labeled).
 * The active pill is one element that glides to the tapped tab, like iOS 26.
 */
export const TabBar = ({ items }: { items: TabItem[] }) => {
  const { pathname } = useLocation()
  const active = items.findIndex(
    ({ to, also = [] }) => pathname === to || also.some((prefix) => pathname.startsWith(prefix)),
  )

  return (
    <nav className="absolute inset-x-4 bottom-[26px] z-40">
      <ul className="relative flex rounded-full border border-line/70 bg-surface/85 p-1 shadow-sheet backdrop-blur-xl">
        {/* The pill: one slot wide, moved with transform so it never reflows */}
        <li
          aria-hidden
          className={cx(
            'pointer-events-none absolute inset-y-1 left-1 rounded-full bg-brand-soft',
            'transition-[transform,opacity] duration-[380ms] ease-[cubic-bezier(0.32,0.72,0,1)]',
            active === -1 && 'opacity-0',
          )}
          style={{
            width: `calc((100% - 8px) / ${items.length})`,
            transform: `translateX(${Math.max(0, active) * 100}%)`,
          }}
        />
        {items.map(({ to, label, icon: Icon }, i) => (
          <li key={to} className="relative min-w-0 flex-1">
            <NavLink
              to={to}
              aria-current={i === active ? 'page' : undefined}
              className={cx(
                'flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-full text-[10px] font-semibold',
                'transition-[color,transform] duration-200 ease-out active:scale-[0.94]',
                i === active ? 'text-brand' : 'text-muted',
              )}
            >
              <Icon aria-hidden size={22} strokeWidth={2} />
              <span className="max-w-full truncate px-1">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
