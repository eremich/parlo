import { Star } from 'lucide-react'
import { cx } from '../lib/cx'

export type StarRatingProps = {
  label: string
  value: number
  onChange: (value: number) => void
  /** Accessible name per star, e.g. (n) => `${n} of 5` */
  starLabel: (n: number) => string
}

/** Five tappable stars as a radio group; arrow keys move the value. */
export const StarRating = ({ label, value, onChange, starLabel }: StarRatingProps) => (
  <div role="radiogroup" aria-label={label} className="flex gap-1">
    {[1, 2, 3, 4, 5].map((n) => {
      const filled = n <= value
      return (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={starLabel(n)}
          tabIndex={value === n || (value === 0 && n === 1) ? 0 : -1}
          onClick={() => onChange(n)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') onChange(Math.min(5, value + 1))
            if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') onChange(Math.max(1, value - 1))
          }}
          className="flex size-11 items-center justify-center transition-transform duration-150 ease-out active:scale-90"
        >
          <Star
            aria-hidden
            size={32}
            strokeWidth={1.75}
            className={cx('transition-colors duration-150', filled ? 'fill-accent text-accent' : 'text-line')}
          />
        </button>
      )
    })}
  </div>
)
