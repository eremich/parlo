import { addDays, fromMinutes, toMinutes } from '../lib/format'
import { doctorById } from './doctors'
import type { Appointment, Block, Specialty } from './types'

/**
 * Deterministic availability. The same inputs always give the same free slots, so screenshots never change.
 * A slot is free when it is inside working hours, not taken by the background (seeded hash), and not held by
 * a live appointment in the store. Cancelling an appointment therefore frees its slot for everyone.
 */

/** Background availability is anchored to this date so slots never reshuffle when the clock moves. */
const BASE_DATE = '2026-03-11'

export type Clock = { date: string; time: string }

/**
 * The prototype's clock. It starts on Wednesday, 11 March 2026, 08:30 and only moves when the
 * presenter jumps ahead (e.g. to the morning of the visit) — see CLOCK_PRESETS.
 */
export const CLOCK_PRESETS: { id: string; clock: Clock }[] = [
  { id: 'wed', clock: { date: '2026-03-11', time: '08:30' } },
  { id: 'thu-morning', clock: { date: '2026-03-12', time: '08:45' } },
  { id: 'thu-nine', clock: { date: '2026-03-12', time: '09:00' } },
  { id: 'thu-later', clock: { date: '2026-03-12', time: '09:40' } },
]

let clock: Clock = CLOCK_PRESETS[0].clock
/** Called by the store only; components read the clock from the store so they re-render. */
export const setScheduleClock = (next: Clock) => {
  clock = next
}
export const today = () => clock.date
export const now = () => clock.time

export const SLOT_MINUTES = 20
export const HORIZON_DAYS = 28

/** Working hours per weekday (0 = Sunday), as [start, end] pairs in minutes. */
export const HOURS: Record<number, [number, number][]> = {
  1: [[480, 720], [840, 1080]],
  2: [[480, 720], [840, 1080]],
  3: [[480, 780]],
  4: [[480, 720], [840, 1080]],
  5: [[480, 780]],
}

/** Share of slots already taken by other patients, by how many days away they are. */
const density = (specialty: Specialty, day: number): number => {
  switch (specialty) {
    case 'gp':
      return [0.94, 0.82, 0.72][day] ?? 0.6
    case 'pediatrics':
      return [0.96, 0.88, 0.78][day] ?? 0.62
    case 'dentist':
      return day < 2 ? 0.95 : 0.7
    case 'gynecology':
      return day < 5 ? 1 : 0.72
    case 'ent':
      return day < 7 ? 1 : 0.76
    case 'dermatology':
      return day < 14 ? 1 : 0.8
  }
}

/** FNV-1a hash to a number in [0, 1). */
export const hash = (key: string) => {
  let h = 2166136261
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967296
}

const weekday = (iso: string) => new Date(`${iso}T12:00:00Z`).getUTCDay()

export const slotKey = (doctorId: string, date: string, time: string) => `${doctorId}|${date}|${time}`

/** Times inside working hours for one day. */
export const workingTimes = (date: string): string[] =>
  (HOURS[weekday(date)] ?? []).flatMap(([start, end]) =>
    Array.from({ length: (end - start) / SLOT_MINUTES }, (_, i) => fromMinutes(start + i * SLOT_MINUTES)),
  )

/** Seeded appointments own their slots; the background hash never claims them. */
let reserved = new Set<string>()
export const reserveSeedSlots = (appointments: Appointment[]) => {
  reserved = new Set(appointments.map((a) => slotKey(a.doctorId, a.date, a.time)))
}

/** Blocked time is never bookable */
let blocks: Block[] = []
export const setScheduleBlocks = (next: Block[]) => {
  blocks = next
}
const isBlocked = (doctorId: string, date: string, time: string) =>
  blocks.some(
    (b) => b.doctorId === doctorId && b.date === date && toMinutes(time) >= toMinutes(b.start) && toMinutes(time) < toMinutes(b.end),
  )

/** Taken by someone outside the store: the generator turns these into named appointments for the demo practice. */
export const isTakenInBackground = (doctorId: string, date: string, time: string) => {
  const day = Math.round((Date.parse(date) - Date.parse(BASE_DATE)) / 86_400_000)
  return day >= 0 && takenInBackground(doctorId, date, time, day)
}

const takenInBackground = (doctorId: string, date: string, time: string, day: number) => {
  const key = slotKey(doctorId, date, time)
  if (reserved.has(key)) return false
  return hash(key) < density(doctorById(doctorId).specialty, day)
}

const isLive = (a: Appointment) => a.status !== 'cancelled' && a.status !== 'declined'

/** Free times for a doctor on one date. */
export const freeTimes = (doctorId: string, date: string, appointments: Appointment[]): string[] => {
  const day = Math.round((Date.parse(date) - Date.parse(BASE_DATE)) / 86_400_000)
  if (date < clock.date) return []
  const held = new Set(
    appointments.filter((a) => a.doctorId === doctorId && a.date === date && isLive(a)).map((a) => a.time),
  )
  return workingTimes(date).filter(
    (time) =>
      !(date === clock.date && toMinutes(time) <= toMinutes(clock.time)) &&
      !held.has(time) &&
      !isBlocked(doctorId, date, time) &&
      !takenInBackground(doctorId, date, time, day),
  )
}

export type DaySlots = { date: string; times: string[] }

/** Free slots day by day across the horizon. */
export const availability = (doctorId: string, appointments: Appointment[], days = HORIZON_DAYS): DaySlots[] =>
  Array.from({ length: days }, (_, i) => {
    const date = addDays(clock.date, i)
    return { date, times: freeTimes(doctorId, date, appointments) }
  })

/** Earliest free slot plus the next few times after it. */
export const nextSlots = (doctorId: string, appointments: Appointment[], count = 3) => {
  const found: { date: string; time: string }[] = []
  for (const { date, times } of availability(doctorId, appointments)) {
    for (const time of times) {
      found.push({ date, time })
      if (found.length === count) return found
    }
  }
  return found
}
