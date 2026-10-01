import { cx } from '../lib/cx'

export type SlotChipProps = {
  time: string
  /** Accessible action, e.g. "Book 08:40" */
  label?: string
  selected?: boolean
  /** The earliest real slot: the one warm accent in a row of neutral times */
  earliest?: boolean
  /** Someone else just took it */
  taken?: boolean
  onSelect?: () => void
}

/**
 * A bookable time. Tapping it starts the booking with that time preselected.
 * Times are neutral by default so color keeps its meaning: coral = earliest, teal = selected.
 */
export const SlotChip = ({ time, label, selected, earliest, taken, onSelect }: SlotChipProps) => (
  <button
    type="button"
    aria-label={label}
    aria-pressed={selected}
    disabled={taken}
    onClick={onSelect}
    className={cx(
      'relative inline-flex h-10 min-w-[4.25rem] items-center justify-center rounded-chip px-3 text-body font-semibold tabular-nums',
      'before:absolute before:-inset-y-1 before:inset-x-0 before:content-[""]',
      'transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.96]',
      taken
        ? 'bg-canvas text-muted line-through opacity-60'
        : selected
          ? 'bg-brand text-on-brand'
          : earliest
            ? 'bg-accent-soft text-accent-text hover:bg-accent-soft/70'
            : 'bg-ink/[0.05] text-ink hover:bg-ink/[0.08]',
    )}
  >
    {time}
  </button>
)
