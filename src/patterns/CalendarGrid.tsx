import { ArrowUpToLine, Clock, Lock, Move, Plus, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react'
import { Avatar } from '../components/Avatar'
import { cx } from '../lib/cx'
import { fromMinutes, toMinutes } from '../lib/format'
import { StatusBadge, statusTone, type BadgeStatus } from './StatusBadge'

export type CalendarColumn = { id: string; name: string; subtitle?: string; avatar?: boolean; photo?: string }

export type CalendarEvent = {
  id: string
  columnId: string
  start: string
  /** Minutes */
  duration: number
  title: string
  /** "New patient · EN, AR" */
  detail?: string
  status: Exclude<BadgeStatus, 'filledFromWaitlist' | 'waitlist' | 'video'>
  filledFromWaitlist?: boolean
  /** Minutes the patient said they will be late */
  lateBy?: number
  /** Just changed (e.g. filled from the waitlist); briefly highlighted */
  fresh?: boolean
  /** Extra line on a cancelled ghost, e.g. "Offered to waitlist" */
  note?: string
}

export type CalendarBlock = { id: string; columnId: string; start: string; end: string; label: string; conflict?: boolean }

export type CalendarGridProps = {
  columns: CalendarColumn[]
  events: CalendarEvent[]
  blocks?: CalendarBlock[]
  startHour?: number
  endHour?: number
  /** Free slots snap to this step */
  stepMinutes?: number
  pxPerMinute?: number
  /** Current time line, "10:20" */
  now?: string
  statusLabels?: Partial<Record<BadgeStatus, string>>
  filledLabel?: string
  lateLabel?: (minutes: number) => string
  /** "Move to 09:20": shown while dragging */
  moveLabel?: (time: string) => string
  onEventClick?: (id: string) => void
  onSlotClick?: (columnId: string, time: string) => void
  /** Enables drag to move; called only when the target is free */
  onMove?: (id: string, columnId: string, time: string) => void
}

const EVENT_TONE = {
  ok: 'bg-ok-soft',
  warn: 'bg-warn-soft',
  error: 'bg-error-soft',
  info: 'bg-info-soft',
  neutral: 'bg-canvas text-muted',
}

const DRAGGABLE: CalendarEvent['status'][] = ['confirmed', 'pending']
const DRAG_THRESHOLD = 4

type Drag = { id: string; startX: number; startY: number; columnId: string; minutes: number; moved: boolean }

/**
 * Signature element of the practice dashboard: doctors (or days) side by side, a status on every appointment.
 * Cancelled appointments stay visible as a thin ghost but do not block the slot.
 * Drag an appointment to move it; the same move is available from its panel for keyboard users.
 */
export const CalendarGrid = ({
  columns,
  events,
  blocks = [],
  startHour = 8,
  endHour = 18,
  stepMinutes = 10,
  pxPerMinute = 2.4,
  now,
  statusLabels = {},
  filledLabel = 'Filled from waitlist',
  lateLabel = (m) => `${m} min late`,
  moveLabel = (time) => `Move to ${time}`,
  onEventClick,
  onSlotClick,
  onMove,
}: CalendarGridProps) => {
  const [hover, setHover] = useState<{ columnId: string; minutes: number } | null>(null)
  const [drag, setDrag] = useState<Drag | null>(null)
  const body = useRef<HTMLDivElement>(null)
  const suppressClick = useRef(false)

  const dayStart = startHour * 60
  const dayEnd = endHour * 60
  const height = (endHour - startHour) * 60 * pxPerMinute
  const y = (time: string) => (toMinutes(time) - dayStart) * pxPerMinute
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i)
  const grid = `56px repeat(${columns.length}, minmax(0, 1fr))`

  /** Is this range inside a live (not cancelled) appointment or a block? */
  const isBusy = (columnId: string, minutes: number, ignore?: string, length = 1) =>
    events.some(
      (e) =>
        e.id !== ignore &&
        e.columnId === columnId &&
        e.status !== 'cancelled' &&
        minutes < toMinutes(e.start) + e.duration &&
        minutes + length > toMinutes(e.start),
    ) ||
    blocks.some((b) => b.columnId === columnId && minutes < toMinutes(b.end) && minutes + length > toMinutes(b.start))

  /** The browser frame may be scaled; convert screen pixels back to layout pixels. */
  const scaleOf = (el: HTMLElement) => el.getBoundingClientRect().height / el.offsetHeight || 1

  const minutesAt = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget
    const offset = (event.clientY - target.getBoundingClientRect().top) / scaleOf(target)
    const raw = dayStart + offset / pxPerMinute
    return Math.max(dayStart, Math.min(dayEnd - stepMinutes, Math.floor(raw / stepMinutes) * stepMinutes))
  }

  // While dragging, follow the pointer anywhere on the page, snapping to the step and to columns
  useEffect(() => {
    if (!drag) return
    const event = events.find((e) => e.id === drag.id)
    const container = body.current
    if (!event || !container) return

    const onPointerMove = (e: globalThis.PointerEvent) => {
      const dy = (e.clientY - drag.startY) / scaleOf(container)
      const moved = drag.moved || Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > DRAG_THRESHOLD
      const snapped = Math.round((toMinutes(event.start) + dy / pxPerMinute) / stepMinutes) * stepMinutes
      const minutes = Math.max(dayStart, Math.min(dayEnd - event.duration, snapped))
      const column = [...container.querySelectorAll<HTMLElement>('[data-column]')].find((el) => {
        const r = el.getBoundingClientRect()
        return e.clientX >= r.left && e.clientX < r.right
      })
      setDrag({ ...drag, moved, minutes, columnId: column?.dataset.column ?? drag.columnId })
    }
    const onPointerUp = () => {
      if (drag.moved) {
        suppressClick.current = true
        const changed = drag.columnId !== event.columnId || drag.minutes !== toMinutes(event.start)
        if (changed && !isBusy(drag.columnId, drag.minutes, event.id, event.duration))
          onMove?.(event.id, drag.columnId, fromMinutes(drag.minutes))
      }
      setDrag(null)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrag(null)

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('keydown', onKey)
    }
  })

  const dragged = drag?.moved ? events.find((e) => e.id === drag.id) : undefined
  const dropFree = dragged && drag ? !isBusy(drag.columnId, drag.minutes, dragged.id, dragged.duration) : false

  return (
    <div className="overflow-hidden rounded-card bg-surface shadow-card">
      {/* Column headers */}
      <div className="grid border-b border-line" style={{ gridTemplateColumns: grid }}>
        <span />
        {columns.map((column) => (
          <div key={column.id} className="flex min-w-0 items-center gap-2.5 border-l border-line px-3 py-2.5">
            {column.avatar !== false && <Avatar name={column.name} src={column.photo} size="sm" />}
            <div className="min-w-0">
              <p className="truncate text-web-body font-semibold text-ink">{column.name}</p>
              {column.subtitle && <p className="truncate text-label text-muted">{column.subtitle}</p>}
            </div>
          </div>
        ))}
      </div>

      <div
        ref={body}
        className={cx('relative grid', drag?.moved && 'cursor-grabbing select-none')}
        style={{ gridTemplateColumns: grid, height }}
      >
        {/* Time gutter */}
        <div className="relative">
          {hours.slice(0, -1).map((hour) => (
            <span
              key={hour}
              className="absolute right-2 -translate-y-1/2 text-label text-muted tabular-nums first:translate-y-1"
              style={{ top: (hour * 60 - dayStart) * pxPerMinute }}
            >
              {fromMinutes(hour * 60)}
            </span>
          ))}
        </div>

        {columns.map((column) => {
          const hovered =
            !drag && hover?.columnId === column.id && !isBusy(column.id, hover.minutes) ? hover.minutes : null
          return (
            <div
              key={column.id}
              data-column={column.id}
              className={cx('relative border-l border-line', onSlotClick && 'cursor-cell')}
              style={{
                // Hour lines and fainter half-hour lines
                backgroundImage: `linear-gradient(to bottom, var(--line) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--line) 45%, transparent) 1px, transparent 1px)`,
                backgroundSize: `100% ${60 * pxPerMinute}px, 100% ${30 * pxPerMinute}px`,
              }}
              onMouseMove={(e) => setHover({ columnId: column.id, minutes: minutesAt(e) })}
              onMouseLeave={() => setHover(null)}
              onClick={(e) => {
                if (suppressClick.current) {
                  suppressClick.current = false
                  return
                }
                const minutes = minutesAt(e)
                if (!isBusy(column.id, minutes)) onSlotClick?.(column.id, fromMinutes(minutes))
              }}
            >
              {hovered !== null && onSlotClick && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-1 flex items-center gap-1 rounded-[6px] border border-dashed border-brand/60 bg-brand-soft/60 px-2 text-label font-semibold text-brand"
                  style={{ top: (hovered - dayStart) * pxPerMinute, height: stepMinutes * pxPerMinute }}
                >
                  <Plus size={12} strokeWidth={3} />
                  <span className="tabular-nums">{fromMinutes(hovered)}</span>
                </div>
              )}

              {blocks
                .filter((b) => b.columnId === column.id)
                .map((block) => (
                  <div
                    key={block.id}
                    className={cx(
                      'absolute inset-x-1 flex items-start gap-1 overflow-hidden rounded-[6px] px-2 py-1 text-label font-semibold',
                      block.conflict ? 'text-error-text ring-1 ring-error/50 ring-inset' : 'text-muted',
                    )}
                    style={{
                      top: y(block.start),
                      height: (toMinutes(block.end) - toMinutes(block.start)) * pxPerMinute - 2,
                      background:
                        'repeating-linear-gradient(-45deg, var(--canvas), var(--canvas) 6px, color-mix(in srgb, var(--line) 70%, transparent) 6px, color-mix(in srgb, var(--line) 70%, transparent) 12px)',
                    }}
                  >
                    <Lock aria-hidden size={12} className="mt-0.5 shrink-0" />
                    {block.label}
                  </div>
                ))}

              {events
                .filter((e) => e.columnId === column.id)
                .map((event) =>
                  event.status === 'cancelled' ? (
                    <GhostEvent key={event.id} event={event} top={y(event.start)} pxPerMinute={pxPerMinute} />
                  ) : (
                    <EventBlock
                      key={event.id}
                      event={event}
                      top={y(event.start)}
                      pxPerMinute={pxPerMinute}
                      statusLabel={statusLabels[event.status]}
                      filledLabel={filledLabel}
                      lateLabel={lateLabel}
                      lifted={drag?.moved === true && drag.id === event.id}
                      overGhost={events.some(
                        (other) =>
                          other.columnId === column.id && other.status === 'cancelled' && other.start === event.start,
                      )}
                      onPointerDown={
                        onMove && DRAGGABLE.includes(event.status)
                          ? (e) => {
                              if (e.button !== 0) return
                              setDrag({
                                id: event.id,
                                startX: e.clientX,
                                startY: e.clientY,
                                columnId: event.columnId,
                                minutes: toMinutes(event.start),
                                moved: false,
                              })
                            }
                          : undefined
                      }
                      onClick={() => {
                        if (suppressClick.current) {
                          suppressClick.current = false
                          return
                        }
                        onEventClick?.(event.id)
                      }}
                    />
                  ),
                )}

              {dragged && drag?.columnId === column.id && (
                <div
                  aria-hidden
                  className={cx(
                    'pointer-events-none absolute inset-x-1 z-30 flex items-start gap-1 rounded-[6px] border-2 border-dashed px-2 py-1 text-label font-semibold',
                    dropFree ? 'border-brand bg-brand-soft/80 text-brand' : 'border-error bg-error-soft/80 text-error-text',
                  )}
                  style={{ top: (drag.minutes - dayStart) * pxPerMinute, height: dragged.duration * pxPerMinute - 2 }}
                >
                  <Move size={12} className="mt-0.5 shrink-0" />
                  <span className="truncate">
                    {moveLabel(fromMinutes(drag.minutes))} · {dragged.title}
                  </span>
                </div>
              )}
            </div>
          )
        })}

        {now && toMinutes(now) >= dayStart && toMinutes(now) <= dayEnd && (
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 left-[48px] z-20 flex items-center"
            style={{ top: y(now) }}
          >
            <span className="size-2 -translate-y-px rounded-full bg-accent" />
            <span className="h-0.5 flex-1 bg-accent" />
          </div>
        )}
      </div>
    </div>
  )
}

type EventProps = { event: CalendarEvent; top: number; pxPerMinute: number }

type EventBlockProps = EventProps & {
  statusLabel?: string
  filledLabel: string
  lateLabel: (m: number) => string
  overGhost: boolean
  lifted: boolean
  onClick: () => void
  onPointerDown?: (e: PointerEvent<HTMLButtonElement>) => void
}

const EventBlock = ({
  event,
  top,
  pxPerMinute,
  statusLabel,
  filledLabel,
  lateLabel,
  overGhost,
  lifted,
  onClick,
  onPointerDown,
}: EventBlockProps) => {
  const height = event.duration * pxPerMinute - 2
  const roomy = height >= 44
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      onPointerDown={onPointerDown}
      className={cx(
        'absolute inset-x-1 z-10 flex flex-col overflow-hidden rounded-[6px] px-2 py-1 text-left',
        'transition-[box-shadow,opacity] duration-150 ease-out hover:shadow-[0_2px_8px_rgb(0_0_0/0.12)]',
        onPointerDown ? 'cursor-grab touch-none' : 'cursor-pointer',
        EVENT_TONE[statusTone(event.status)],
        event.status === 'pending' && 'outline-1 -outline-offset-1 outline-warn outline-dashed',
        event.fresh && 'ring-2 ring-info ring-offset-1 ring-offset-surface',
        lifted && 'opacity-40',
      )}
      style={{ top, height, left: overGhost ? 12 : undefined }}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        <span className="shrink-0 text-label font-semibold text-muted tabular-nums">{event.start}</span>
        <span className="truncate text-meta font-semibold text-ink">{event.title}</span>
        {!roomy && <StatusBadge status={event.status} label={statusLabel} size="sm" />}
        {!roomy && event.lateBy && (
          <Clock aria-label={lateLabel(event.lateBy)} size={12} className="shrink-0 text-warn-text" />
        )}
      </span>
      {roomy && (
        <span className="mt-0.5 flex flex-wrap items-center gap-1">
          <StatusBadge status={event.status} label={statusLabel} size="sm" />
          {event.lateBy && <StatusBadge status="runningLate" label={lateLabel(event.lateBy)} size="sm" />}
          {event.filledFromWaitlist && (
            <span className="inline-flex h-5 items-center gap-1 rounded-chip bg-surface/70 px-1.5 text-[11px] font-semibold text-info-text">
              <ArrowUpToLine aria-hidden size={12} strokeWidth={2.25} />
              {filledLabel}
            </span>
          )}
          {event.detail && <span className="truncate text-label text-muted">{event.detail}</span>}
        </span>
      )}
      {event.fresh && <Sparkles aria-hidden size={12} className="absolute top-1 right-1 text-info" />}
    </button>
  )
}

/** Cancelled: a thin dashed trace along the left edge; the slot underneath stays clickable. */
const GhostEvent = ({ event, top, pxPerMinute }: EventProps) => (
  <div
    className="pointer-events-none absolute left-1 flex w-[calc(100%-8px)] items-start"
    style={{ top, height: event.duration * pxPerMinute - 2 }}
  >
    <span className="h-full w-1 rounded-full border border-dashed border-error/60" />
    <span className="ml-1.5 min-w-0 pt-0.5">
      <span className="block truncate text-label text-muted line-through decoration-error/60">
        {event.start} {event.title}
      </span>
      {event.note && (
        <span className="mt-0.5 inline-flex h-5 items-center gap-1 rounded-chip bg-info-soft px-1.5 text-[11px] font-semibold text-info-text">
          <ArrowUpToLine aria-hidden size={12} strokeWidth={2.25} />
          {event.note}
        </span>
      )}
    </span>
  </div>
)
