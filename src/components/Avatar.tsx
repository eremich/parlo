import { cx } from '../lib/cx'

export type AvatarProps = {
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Portrait URL; initials are shown when missing. */
  src?: string
}

const SIZES = {
  sm: 'size-8 text-caption',
  md: 'size-11 text-subheadline',
  lg: 'size-14 text-headline',
  xl: 'size-20 text-title2',
}

/** Initials skip titles like "Dr." so "Dr. Emre Aydın" becomes "EA". */
export const initials = (name: string) =>
  name
    .replace(/^(Dr\.|Prof\.)\s+/g, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

export const Avatar = ({ name, size = 'md', src }: AvatarProps) =>
  src ? (
    <img src={src} alt="" loading="lazy" decoding="async" className={cx('shrink-0 rounded-full bg-brand-soft object-cover', SIZES[size])} />
  ) : (
    <span
      aria-hidden
      className={cx(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-brand-soft font-semibold text-brand',
        SIZES[size],
      )}
    >
      {initials(name)}
    </span>
  )
