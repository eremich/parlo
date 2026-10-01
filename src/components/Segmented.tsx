import { useLayoutEffect, useRef, useState } from 'react'
import { cx } from '../lib/cx'

type Option<T extends string> = { value: T; label: string }

export type SegmentedProps<T extends string> = {
  /** Accessible name of the group */
  label: string
  value: T
  options: Option<T>[]
  onChange: (value: T) => void
  fullWidth?: boolean
}

type Thumb = { left: number; width: number }

/**
 * Switches between views of the same content: List / Map, Upcoming / Past, Day / Week.
 * The selected thumb slides to the chosen option, as in iOS.
 */
export const Segmented = <T extends string>({ label, value, options, onChange, fullWidth }: SegmentedProps<T>) => {
  const group = useRef<HTMLDivElement>(null)
  const [thumb, setThumb] = useState<Thumb | null>(null)
  // The first placement snaps; only later changes glide
  const [animate, setAnimate] = useState(false)

  useLayoutEffect(() => {
    const node = group.current
    if (!node) return
    const place = () => {
      const button = node.querySelector<HTMLElement>('[aria-pressed="true"]')
      if (!button) return
      const next = { left: button.offsetLeft, width: button.offsetWidth }
      setThumb((prev) => (prev && prev.left === next.left && prev.width === next.width ? prev : next))
    }
    place()
    const observer = new ResizeObserver(place)
    observer.observe(node)
    return () => observer.disconnect()
  }, [value, options.length])

  useLayoutEffect(() => {
    if (!thumb || animate) return
    const frame = requestAnimationFrame(() => setAnimate(true))
    return () => cancelAnimationFrame(frame)
  }, [thumb, animate])

  return (
    <div
      ref={group}
      role="group"
      aria-label={label}
      className={cx('relative flex rounded-control bg-ink/[0.06] p-0.5', fullWidth && 'w-full')}
    >
      {thumb && (
        <span
          aria-hidden
          className={cx(
            'pointer-events-none absolute top-0.5 bottom-0.5 left-0 rounded-[8px] bg-surface shadow-card',
            animate && 'transition-[transform,width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
          )}
          style={{ width: thumb.width, transform: `translateX(${thumb.left}px)` }}
        />
      )}
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cx(
              'relative min-h-8 rounded-[8px] px-3 text-meta font-semibold whitespace-nowrap',
              'transition-[color,transform] duration-200 ease-out active:scale-[0.97]',
              fullWidth && 'min-w-0 flex-1 px-2',
              active ? 'text-ink' : 'text-muted hover:text-ink',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
