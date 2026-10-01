import { useId } from 'react'
import { cx } from '../lib/cx'

export type LogoMarkProps = {
  /** Height in px; width follows the 64 × 72 proportions */
  size?: number
  /** color: brand teal + coral dot · inverse: white mark for brand-colored backgrounds */
  tone?: 'color' | 'inverse'
  className?: string
}

/**
 * The Parlo mark: a lowercase "p" whose counter is a speech bubble with a coral dot, a word being
 * spoken. Colors come from tokens, so it follows light and dark themes. Static copy: public/logo.svg.
 */
export const LogoMark = ({ size = 28, tone = 'color', className }: LogoMarkProps) => {
  const mask = useId()
  return (
    <svg
      aria-hidden
      viewBox="0 0 64 72"
      height={size}
      width={(size * 64) / 72}
      className={cx('shrink-0', className)}
    >
      <defs>
        <mask id={mask} maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="72">
          <rect width="64" height="72" fill="#fff" />
          {/* The counter: a round bubble with a short tail towards the stem */}
          <circle cx="31.5" cy="31.5" r="17.5" fill="#000" />
          <path d="M17.2 40.2 L23.8 46.4 L14.9 50.2 Z" fill="#000" />
        </mask>
      </defs>
      <g mask={`url(#${mask})`} className={tone === 'color' ? 'fill-brand' : 'fill-on-brand'}>
        <circle cx="31.5" cy="31.5" r="30.5" />
        <path d="M1 31.5 H14.4 V64.3 A6.7 6.7 0 0 1 1 64.3 Z" />
      </g>
      <circle cx="31.5" cy="31.5" r="6.4" className="fill-accent" />
    </svg>
  )
}

export type LogoProps = {
  /** Height of the mark in px; the wordmark scales with it */
  size?: number
  className?: string
}

/** Mark plus the lowercase wordmark, as in the brand lockup. */
export const Logo = ({ size = 28, className }: LogoProps) => (
  <span className={cx('inline-flex items-center', className)} style={{ gap: size * 0.3 }}>
    <LogoMark size={size} />
    <span
      className="font-display font-semibold tracking-[-0.01em] text-brand"
      style={{ fontSize: size * 0.86, lineHeight: 1 }}
    >
      parlo
    </span>
  </span>
)

/**
 * App icon: the colour mark on white (home screen, push notifications, browser). App icons do not
 * change with the theme, so it always renders with the light tokens; a hairline keeps it visible on
 * white surfaces. The mark sits slightly low because its stem makes it taller than it is wide.
 */
export const AppIcon = ({ size = 36, className }: { size?: number; className?: string }) => (
  <span
    aria-hidden
    data-theme="light"
    className={cx('inline-flex shrink-0 items-center justify-center bg-surface ring-1 ring-black/[0.06]', className)}
    style={{ width: size, height: size, borderRadius: size * 0.225, paddingTop: size * 0.06 }}
  >
    <LogoMark size={size * 0.6} />
  </span>
)
