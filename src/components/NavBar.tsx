import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'

export type NavBarProps = {
  title?: string
  backLabel?: string
  onBack?: () => void
  trailing?: ReactNode
}

/** iOS navigation bar for pushed screens: "Back" everywhere (previous titles truncate and echo the title), centered inline title. */
export const NavBar = ({ title, backLabel, onBack, trailing }: NavBarProps) => (
  <header className="sticky top-0 z-30 grid grid-cols-[1fr_auto_1fr] items-center gap-2 bg-canvas/85 px-2 pt-[54px] pb-1 backdrop-blur-xl">
    <div className="flex min-w-0">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex min-h-11 min-w-0 items-center text-body text-brand transition-opacity duration-150 active:opacity-50"
        >
          <ChevronLeft aria-hidden size={26} className="-mr-0.5 shrink-0" />
          <span className="truncate">{backLabel}</span>
        </button>
      )}
    </div>
    <h1 className="truncate text-center text-headline text-ink">{title}</h1>
    <div className="flex justify-end">{trailing}</div>
  </header>
)
