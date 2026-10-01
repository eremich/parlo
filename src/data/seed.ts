import type { Appointment, WaitlistEntry } from './types'

/**
 * Appointments at the start of every session. Dates are relative to the frozen clock (Wed, 11 Mar 2026).
 * Hero scenario: Anna holds Thu 12 Mar 09:00 with Dr. Aydın; Omar holds Mon 16 Mar 10:20 and waits for earlier.
 */
export const SEED_APPOINTMENTS: Appointment[] = [
  {
    id: 'a-anna-aydin',
    patientId: 'anna',
    doctorId: 'aydin',
    date: '2026-03-12',
    time: '09:00',
    duration: 20,
    visitType: 'followUp',
    status: 'confirmed',
    reason: 'Blood test results',
  },
  {
    id: 'a-mia-marchenko',
    patientId: 'mia',
    doctorId: 'marchenko',
    date: '2026-03-18',
    time: '15:00',
    duration: 20,
    visitType: 'followUp',
    status: 'confirmed',
    reason: 'U9 check-up',
  },
  {
    id: 'a-anna-busch-past',
    patientId: 'anna',
    doctorId: 'busch',
    date: '2026-02-10',
    time: '10:40',
    duration: 20,
    visitType: 'new',
    status: 'done',
    firstVisit: true,
    reason: 'Blood test',
  },
  {
    id: 'a-omar-aydin',
    patientId: 'omar',
    doctorId: 'aydin',
    date: '2026-03-16',
    time: '10:20',
    duration: 20,
    visitType: 'new',
    status: 'confirmed',
    firstVisit: true,
    reason: 'Back pain for two weeks',
  },
  {
    id: 'a-lukas-weber',
    patientId: 'lukas',
    doctorId: 'weber',
    date: '2026-03-27',
    time: '11:20',
    duration: 20,
    visitType: 'new',
    status: 'pending',
    firstVisit: true,
  },
  {
    id: 'a-lukas-berger',
    patientId: 'lukas',
    doctorId: 'berger',
    date: '2026-03-13',
    time: '10:00',
    duration: 20,
    visitType: 'new',
    status: 'declined',
    firstVisit: true,
    alternatives: [
      { date: '2026-03-17', time: '11:20' },
      { date: '2026-03-19', time: '08:40' },
    ],
  },
]

/** Omar would take anything earlier than his Monday appointment with Dr. Aydın. */
export const SEED_WAITLIST: WaitlistEntry[] = [
  {
    id: 'w-omar-aydin',
    patientId: 'omar',
    doctorId: 'aydin',
    appointmentId: 'a-omar-aydin',
    before: '2026-03-16',
    days: [1, 2, 3, 4, 5],
  },
]
