import type { ReactNode } from 'react'

/** iOS large title with optional secondary line. */
export const LargeTitle = ({ children, subtitle }: { children: ReactNode; subtitle?: ReactNode }) => (
  <header className="px-4 pb-2 pt-[62px]">
    <h1 className="font-display text-large-title font-bold tracking-[-0.01em] text-ink">{children}</h1>
    {subtitle && <p className="mt-1 text-subheadline text-muted">{subtitle}</p>}
  </header>
)
