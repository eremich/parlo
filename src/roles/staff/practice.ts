import { DEMO_PRACTICE, displayStatus } from '../../data/background'
import { DOCTORS } from '../../data/doctors'
import { workingTimes, type Clock } from '../../data/schedule'
import type { Appointment, Block, Patient } from '../../data/types'
import { addDays, toMinutes } from '../../lib/format'
import type { CalendarEvent } from '../../patterns/CalendarGrid'

/** The practice this dashboard belongs to */
export const PRACTICE_DOCTORS = DOCTORS.filter((d) => d.practiceId === DEMO_PRACTICE)
export const isPracticeAppointment = (a: Appointment) => PRACTICE_DOCTORS.some((d) => d.id === a.doctorId)

/** Opening hours of a day as whole hours, for the calendar's height; null when closed. */
export const dayHours = (date: string) => {
  const times = workingTimes(date)
  if (!times.length) return null
  return { start: Math.floor(toMinutes(times[0]) / 60), end: Math.ceil((toMinutes(times[times.length - 1]) + 20) / 60) }
}

/** Monday of the week that contains the date */
export const weekStart = (date: string) => {
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay() || 7
  return addDays(date, 1 - weekday)
}

type EventLabels = { visitType: Record<string, string>; newPatient: string; offered?: (a: Appointment) => string | undefined }

export const toEvent = (
  a: Appointment,
  clock: Clock,
  patients: Patient[],
  labels: EventLabels,
  columnId: string,
  focusId: string | null,
): CalendarEvent => {
  const patient = patients.find((p) => p.id === a.patientId)
  const status = displayStatus(a, clock)
  return {
    id: a.id,
    columnId,
    start: a.time,
    duration: a.duration,
    title: patient?.name ?? '—',
    detail: [a.firstVisit ? labels.newPatient : labels.visitType[a.visitType], patient?.languages.join(', ')]
      .filter(Boolean)
      .join(' · '),
    status: status === 'declined' ? 'cancelled' : status,
    filledFromWaitlist: a.filledFromWaitlist,
    lateBy: a.lateBy && status === 'confirmed' ? a.lateBy : undefined,
    fresh: a.id === focusId && status !== 'cancelled',
    note: status === 'cancelled' ? labels.offered?.(a) : undefined,
  }
}

/** Live appointments inside a block are conflicts until reception moves them. */
export const affectedBy = (block: Block, appointments: Appointment[]) =>
  appointments.filter(
    (a) =>
      a.doctorId === block.doctorId &&
      a.date === block.date &&
      (a.status === 'confirmed' || a.status === 'pending') &&
      toMinutes(a.time) >= toMinutes(block.start) &&
      toMinutes(a.time) < toMinutes(block.end),
  )
