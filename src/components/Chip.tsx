import type { LucideIcon } from 'lucide-react'
import { Check } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'
import { cx } from '../lib/cx'

export type ChipProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & {
  selected?: boolean
  icon?: LucideIcon
  onPressedChange?: (selected: boolean) => void
  /** onHero: translucent white, for chips sitting on the branded header */
  tone?: 'default' | 'onHero'
}

/**
 * Selectable pill for quick picks and filters ("GP", "Today", "Step-free").
 * Visually 36 px; the hit area extends to 44 px.
 */
export const Chip = ({ selected = false, icon: Icon, onPressedChange, tone = 'default', className, children, ...rest }: ChipProps) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={() => onPressedChange?.(!selected)}
    className={cx(
      'relative inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-chip border px-3.5 text-subheadline font-medium',
      'before:absolute before:-inset-y-1 before:inset-x-0 before:content-[""]',
      'transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.97]',
      'disabled:pointer-events-none disabled:opacity-45',
      tone === 'onHero'
        ? 'border-transparent bg-on-hero/15 text-on-hero hover:bg-on-hero/25'
        : selected
          ? 'border-brand bg-brand-soft text-brand'
          : 'border-line bg-surface text-ink hover:border-muted/50',
      className,
    )}
    {...rest}
  >
    {selected ? <Check aria-hidden size={16} strokeWidth={2.5} /> : Icon && <Icon aria-hidden size={16} />}
    {children}
  </button>
)
