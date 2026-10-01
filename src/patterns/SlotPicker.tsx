import { useEffect, useRef } from 'react'
import { cx } from '../lib/cx'
import { SlotChip } from './SlotChip'

export type PickerDay = {
  date: string
  /** "Thu" */
  weekday: string
  /** "12" */
  dayOfMonth: string
  times: string[]
}

export type SlotPickerProps = {
  days: PickerDay[]
  selectedDate: string
  selectedTime?: string
  onSelectDate: (date: string) => void
  onSelectTime: (time: string) => void
  emptyLabel: string
  bookLabel: (time: string) => string
  /** Accessible name for the day strip */
  daysLabel: string
}

/** Day strip plus the free times of the chosen day. Days without free times are shown but disabled. */
export const SlotPicker = ({
  days,
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  emptyLabel,
  bookLabel,
  daysLabel,
}: SlotPickerProps) => {
  const strip = useRef<HTMLDivElement>(null)
  const times = days.find((d) => d.date === selectedDate)?.times ?? []

  // Keep the selected day in view when it is preselected far down the strip.
  // Scroll only the strip: scrollIntoView would also shift clipped ancestors (the phone screen).
  useEffect(() => {
    const container = strip.current
    const day = container?.querySelector<HTMLElement>('[aria-pressed="true"]')
    if (!container || !day) return
    const box = container.getBoundingClientRect()
    const item = day.getBoundingClientRect()
    if (item.left >= box.left && item.right <= box.right) return
    // Rects are in screen pixels; the phone frame may be scaled, scrollLeft is not
    const scale = box.width / container.offsetWidth
    container.scrollLeft += (item.left + item.width / 2 - (box.left + box.width / 2)) / scale
  }, [selectedDate])

  return (
    <div>
      <div
        ref={strip}
        role="group"
        aria-label={daysLabel}
        className="-mx-4 flex snap-x scroll-px-4 gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none]"
      >
        {days.map((day) => {
          const active = day.date === selectedDate
          const empty = day.times.length === 0
          return (
            <button
              key={day.date}
              type="button"
              aria-pressed={active}
              disabled={empty}
              onClick={() => onSelectDate(day.date)}
              className={cx(
                'flex h-[66px] w-[52px] shrink-0 snap-start flex-col items-center justify-center gap-0.5 rounded-[12px]',
                'transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.96]',
                active ? 'bg-brand text-on-brand' : 'bg-surface text-ink ring-1 ring-line ring-inset',
                empty && 'opacity-40',
              )}
            >
              <span className={cx('text-footnote font-medium', active ? 'text-on-brand/85' : 'text-muted')}>{day.weekday}</span>
              <span className="text-headline tabular-nums">{day.dayOfMonth}</span>
              <span
                aria-hidden
                className={cx('size-1 rounded-full', empty ? 'bg-transparent' : active ? 'bg-on-brand' : 'bg-accent')}
              />
            </button>
          )
        })}
      </div>

      {times.length === 0 ? (
        <p className="mt-4 text-subheadline text-muted">{emptyLabel}</p>
      ) : (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {times.map((time) => (
            <SlotChip
              key={time}
              time={time}
              label={bookLabel(time)}
              selected={time === selectedTime}
              onSelect={() => onSelectTime(time)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
