import type { LucideIcon } from 'lucide-react'
import { CircleAlert } from 'lucide-react'
import { useId, type InputHTMLAttributes } from 'react'
import { cx } from '../lib/cx'

export type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  /** Visually hide the label (search fields); it stays available to screen readers. */
  hideLabel?: boolean
  hint?: string
  /** Says what happened and what to do: "Enter the 6-digit code from the SMS." */
  error?: string
  icon?: LucideIcon
}

export const TextField = ({ label, hideLabel, hint, error, icon: Icon, className, id, ...rest }: TextFieldProps) => {
  const autoId = useId()
  const inputId = id ?? autoId
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined

  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <label htmlFor={inputId} className={cx('text-footnote font-semibold text-ink', hideLabel && 'sr-only')}>
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon aria-hidden size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
        )}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cx(
            'min-h-11 w-full rounded-control border bg-surface px-3.5 text-body text-ink placeholder:text-muted',
            'transition-[border-color,box-shadow] duration-150 outline-none',
            'focus:border-brand focus:ring-3 focus:ring-brand/20',
            'disabled:opacity-45',
            Icon && 'pl-10',
            error ? 'border-error' : 'border-line',
          )}
          {...rest}
        />
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="flex items-start gap-1.5 text-footnote text-error-text">
          <CircleAlert aria-hidden size={16} className="mt-px shrink-0" />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${inputId}-hint`} className="text-footnote text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  )
}
