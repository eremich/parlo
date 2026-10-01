import { Check } from 'lucide-react'
import { useId, type ReactNode } from 'react'
import { cx } from '../lib/cx'

export type CheckboxProps = {
  label: ReactNode
  description?: ReactNode
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

/** For choices that need an explicit decision, such as consent. The whole row is the hit area. */
export const Checkbox = ({ label, description, checked, onChange, disabled }: CheckboxProps) => {
  const id = useId()
  return (
    <label
      htmlFor={id}
      className={cx('flex min-h-11 cursor-pointer items-start gap-3 py-2', disabled && 'cursor-default opacity-45')}
    >
      <span className="relative mt-px flex size-6 shrink-0 items-center justify-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className={cx(
            'absolute inset-0 appearance-none rounded-[7px] border-2 transition-colors duration-150',
            checked ? 'border-brand bg-brand' : 'border-muted/60 bg-surface',
          )}
        />
        <Check
          aria-hidden
          size={16}
          strokeWidth={3}
          className={cx(
            'relative text-on-brand transition-[opacity,transform] duration-150 ease-out',
            checked ? 'scale-100 opacity-100' : 'scale-75 opacity-0',
          )}
        />
      </span>
      <span className="min-w-0">
        <span className="block text-body text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-footnote text-muted">{description}</span>}
      </span>
    </label>
  )
}
