import { displayStatus } from '../../data/background'
import { doctorById } from '../../data/doctors'
import { workingTimes, type Clock } from '../../data/schedule'
import type { Appointment, Block } from '../../data/types'
import { fromMinutes, toMinutes } from '../../lib/format'

/** The doctor signed in to the doctor app */
export const DOCTOR_ID = 'aydin'
export const doctor = doctorById(DOCTOR_ID)

const SLOT = 20
const LIVE = ['confirmed', 'pending', 'checkedIn', 'inProgress', 'done', 'noShow']

export type TimelineEntry =
  | { kind: 'visit'; appointment: Appointment; status: Appointment['status'] }
  | { kind: 'free'; from: string; to: string }
  | { kind: 'block'; block: Block }

/** The day in order: visits, blocked time and free stretches merged into ranges. */
export const timeline = (date: string, appointments: Appointment[], blocks: Block[], clock: Clock): TimelineEntry[] => {
  const visits = appointments
    .filter((a) => a.doctorId === DOCTOR_ID && a.date === date)
    .map((a) => ({ a, status: displayStatus(a, clock) }))
    .filter(({ status }) => LIVE.includes(status))
  const dayBlocks = blocks.filter((b) => b.doctorId === DOCTOR_ID && b.date === date)
  const taken = new Set(visits.map(({ a }) => a.time))
  const blocked = (time: string) =>
    dayBlocks.some((b) => toMinutes(time) >= toMinutes(b.start) && toMinutes(time) < toMinutes(b.end))

  const entries: { start: number; entry: TimelineEntry }[] = [
    ...visits.map(({ a, status }) => ({ start: toMinutes(a.time), entry: { kind: 'visit' as const, appointment: a, status } })),
    ...dayBlocks.map((block) => ({ start: toMinutes(block.start), entry: { kind: 'block' as const, block } })),
  ]

  // Consecutive free slots become one "Free 10:00–10:40" row; a break in working hours ends a run
  let runStart: number | null = null
  let previousEnd: number | null = null
  const flush = (end: number | null) => {
    if (runStart !== null && end !== null)
      entries.push({ start: runStart, entry: { kind: 'free', from: fromMinutes(runStart), to: fromMinutes(end) } })
    runStart = null
  }
  for (const time of workingTimes(date)) {
    const start = toMinutes(time)
    if (previousEnd !== null && previousEnd !== start) flush(previousEnd)
    if (!taken.has(time) && !blocked(time)) runStart ??= start
    else flush(start)
    previousEnd = start + SLOT
  }
  flush(previousEnd)

  return entries.sort((x, y) => x.start - y.start).map((e) => e.entry)
}

/** The visit to prepare for: the one in progress, otherwise the next one that has not happened yet. */
export const nextVisit = (entries: TimelineEntry[], clock: Clock, date: string) => {
  const visits = entries.filter((e): e is Extract<TimelineEntry, { kind: 'visit' }> => e.kind === 'visit')
  const inProgress = visits.find((v) => v.status === 'inProgress')
  if (inProgress) return inProgress
  return visits.find(
    (v) =>
      (v.status === 'confirmed' || v.status === 'checkedIn') &&
      (date > clock.date || toMinutes(v.appointment.time) + v.appointment.duration > toMinutes(clock.time)),
  )
}

export { ageOf } from '../../lib/format'
