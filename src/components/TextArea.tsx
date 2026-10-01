import { useId, type TextareaHTMLAttributes } from 'react'
import { cx } from '../lib/cx'

export type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  hint?: string
}

/** Multi-line companion to TextField, e.g. the optional reason for a visit. */
export const TextArea = ({ label, hint, className, id, ...rest }: TextAreaProps) => {
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <label htmlFor={fieldId} className="text-footnote font-semibold text-ink">
        {label}
      </label>
      <textarea
        id={fieldId}
        rows={3}
        aria-describedby={hint ? `${fieldId}-hint` : undefined}
        className="w-full resize-none rounded-control border border-line bg-surface px-3.5 py-2.5 text-body text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted focus:border-brand focus:ring-3 focus:ring-brand/20"
        {...rest}
      />
      {hint && (
        <p id={`${fieldId}-hint`} className="text-footnote text-muted">
          {hint}
        </p>
      )}
    </div>
  )
}
