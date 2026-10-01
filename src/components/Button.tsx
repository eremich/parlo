import type { LucideIcon } from 'lucide-react'
import { LoaderCircle } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'
import { cx } from '../lib/cx'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** primary: one per screen · secondary: alternatives · plain: low emphasis · destructive: cancel, no-show ·
   * plainDestructive: a quiet way out next to a primary ("Cancel" beside "I'm coming") */
  variant?: 'primary' | 'secondary' | 'plain' | 'destructive' | 'plainDestructive'
  /** lg: mobile primary actions (50 px, capsule) · md: mobile secondary, web primary (44 px) · sm: dense web (36 px) */
  size?: 'lg' | 'md' | 'sm'
  icon?: LucideIcon
  loading?: boolean
  fullWidth?: boolean
}

const VARIANTS = {
  primary: 'bg-brand text-on-brand hover:bg-brand/90',
  secondary: 'bg-brand-soft text-brand hover:bg-brand-soft/70',
  plain: 'text-brand hover:bg-brand-soft/60',
  destructive: 'bg-error-soft text-error-text hover:bg-error-soft/70',
  plainDestructive: 'text-error-text hover:bg-error-soft/60',
}

const SIZES = {
  lg: 'min-h-[50px] px-6 text-headline rounded-chip gap-2',
  md: 'min-h-11 px-4 text-subheadline font-semibold rounded-control gap-2',
  sm: 'min-h-9 px-3 text-meta font-semibold rounded-control gap-1.5',
}

const ICON_SIZE = { lg: 20, md: 18, sm: 16 }

/** Says what happens: "Book 08:40", "Take earlier slot", "Mark as no-show". */
export const Button = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  fullWidth = false,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) => (
  <button
    type="button"
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    className={cx(
      'inline-flex select-none items-center justify-center whitespace-nowrap',
      'transition-[background-color,transform,opacity] duration-150 ease-out active:scale-[0.97]',
      'disabled:pointer-events-none disabled:opacity-45',
      VARIANTS[variant],
      SIZES[size],
      fullWidth && 'w-full',
      className,
    )}
    {...rest}
  >
    {loading ? (
      <LoaderCircle aria-hidden size={ICON_SIZE[size]} className="shrink-0 animate-spin" />
    ) : (
      // shrink-0: a long label must never squeeze the icon
      Icon && <Icon aria-hidden size={ICON_SIZE[size]} className="shrink-0" />
    )}
    {children}
  </button>
)
