import type { HTMLAttributes } from 'react'
import { cx } from '../lib/cx'

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** none: content sets its own padding · md: 16 px (mobile) · lg: 24 px (web) */
  padding?: 'none' | 'md' | 'lg'
}

const PADDING = { none: '', md: 'p-4', lg: 'p-6' }

/** Plain surface. Cards are not clickable by default: no hover unless the content is an action. */
export const Card = ({ padding = 'md', className, ...rest }: CardProps) => (
  <div className={cx('rounded-card bg-surface shadow-card', PADDING[padding], className)} {...rest} />
)
