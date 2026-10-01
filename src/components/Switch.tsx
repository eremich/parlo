import { useId } from 'react'
import { cx } from '../lib/cx'

export type SwitchProps = {
  label: string
  /** Keep the label for screen readers only, when a list row already shows it */
  hideLabel?: boolean
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

/** iOS-style switch for settings that apply immediately (notifications, filters). */
export const Switch = ({ label, hideLabel, description, checked, onChange, disabled }: SwitchProps) => {
  const id = useId()
  return (
    <div className={cx('flex min-h-11 items-center justify-between', hideLabel ? 'gap-0' : 'gap-4')}>
      <div className={cx('min-w-0', hideLabel && 'sr-only')}>
        <label htmlFor={id} className="text-body text-ink">
          {label}
        </label>
        {description && <p className="text-footnote text-muted">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cx(
          'relative h-[31px] w-[51px] shrink-0 rounded-chip transition-colors duration-200 ease-out',
          'disabled:opacity-45',
          checked ? 'bg-brand' : 'bg-line',
        )}
      >
        <span
          aria-hidden
          className={cx(
            'absolute top-0.5 left-0.5 size-[27px] rounded-full bg-white shadow-[0_2px_6px_rgb(0_0_0/0.18)]',
            'transition-transform duration-200 ease-out',
            checked && 'translate-x-5',
          )}
        />
      </button>
    </div>
  )
}
