import { addDays, toMinutes } from '../lib/format'
import { DOCTORS } from './doctors'
import { hash, isTakenInBackground, workingTimes, type Clock } from './schedule'
import type { Appointment, LanguageCode, Patient } from './types'

/**
 * The demo practice (Hausarztpraxis am Görlitzer Park) needs a real-looking calendar. Every slot the
 * schedule marks as taken becomes a named appointment here, so patients and reception see the same day.
 */

export const DEMO_PRACTICE = 'goerlitzer'

const PEOPLE: [string, LanguageCode[], 'public' | 'private'][] = [
  ['Hannah Lange', ['DE', 'EN'], 'public'],
  ['Mehmet Öztürk', ['TR', 'DE'], 'public'],
  ['Sophie Klein', ['DE'], 'private'],
  ['Jan Hoffmann', ['DE', 'EN'], 'public'],
  ['Maria Rossi', ['EN', 'DE'], 'public'],
  ['Lea Braun', ['DE'], 'public'],
  ['Ali Yıldız', ['TR', 'DE'], 'public'],
  ['Felix Neumann', ['DE', 'EN'], 'private'],
  ['Nina Roth', ['DE'], 'public'],
  ['Yusuf Demir', ['TR', 'EN'], 'public'],
  ['Petra Wolf', ['DE'], 'public'],
  ['Tomasz Nowicki', ['PL', 'DE'], 'public'],
  ['Clara Fischer', ['DE', 'FR'], 'private'],
  ['Ahmed Mansour', ['AR', 'EN'], 'public'],
  ['Emma Schulz', ['DE', 'EN'], 'public'],
  ['Kateryna Bondar', ['UK', 'RU'], 'public'],
  ['Lukas Becker', ['DE'], 'public'],
  ['Sara Haddad', ['AR', 'DE'], 'public'],
  ['Daniel Kim', ['EN'], 'private'],
  ['Elif Kaya', ['TR', 'DE', 'EN'], 'public'],
  ['Moritz Wagner', ['DE'], 'public'],
  ['Olga Ivanova', ['RU', 'DE'], 'public'],
  ['Pablo García', ['ES', 'EN'], 'public'],
  ['Ines Vogel', ['DE'], 'public'],
  ['Reza Karimi', ['FA', 'DE'], 'public'],
  ['Julia Meyer', ['DE', 'EN'], 'private'],
  ['Kofi Mensah', ['EN', 'DE'], 'public'],
  ['Anja Krüger', ['DE'], 'public'],
]

export const BACKGROUND_PATIENTS: Patient[] = PEOPLE.map(([name, languages, insurance], i) => ({
  id: `bg-p-${i}`,
  name,
  birthDate: `19${60 + ((i * 7) % 40)}-0${1 + (i % 9)}-1${i % 9}`,
  insurance,
  insurer: insurance === 'public' ? ['TK', 'AOK', 'Barmer', 'DAK'][i % 4] : ['DKV', 'Allianz'][i % 2],
  languages,
  phone: `+49 30 ${String(5550000 + i * 137).slice(0, 7)}`,
}))

const REASONS = ['Check-up', 'Blood test results', 'Prescription', 'Vaccination', 'Sick note', 'Back pain', 'Follow-up']

/** Named appointments for the demo practice, from the start date through the next two working weeks. */
export const backgroundAppointments = (start: string): Appointment[] => {
  const doctors = DOCTORS.filter((d) => d.practiceId === DEMO_PRACTICE)
  const out: Appointment[] = []
  for (let offset = 0; offset <= 9; offset++) {
    const date = addDays(start, offset)
    for (const doctor of doctors) {
      for (const time of workingTimes(date)) {
        if (!isTakenInBackground(doctor.id, date, time)) continue
        const h = hash(`${doctor.id}${date}${time}`)
        const patient = BACKGROUND_PATIENTS[Math.floor(h * 997) % BACKGROUND_PATIENTS.length]
        const kind = hash(`${time}${date}${doctor.id}kind`)
        const visitType = doctor.visitTypes.includes('video') && kind < 0.06 ? 'video' : kind < 0.3 ? 'new' : 'followUp'
        out.push({
          id: `bg-${doctor.id}-${date}-${time}`,
          patientId: patient.id,
          doctorId: doctor.id,
          date,
          time,
          duration: 20,
          visitType,
          // A few requests for later days still wait for reception
          status: offset >= 2 && kind > 0.985 ? 'pending' : 'confirmed',
          reason: REASONS[Math.floor(kind * 100) % REASONS.length],
          firstVisit: visitType === 'new',
          background: true,
        })
      }
    }
  }
  return out
}

/**
 * Background appointments move through the day with the clock: done once over, in progress now,
 * mostly checked in shortly before. Store-driven appointments keep the status people give them.
 */
export const displayStatus = (a: Appointment, clock: Clock): Appointment['status'] => {
  if (!a.background || a.status !== 'confirmed') return a.status
  if (a.date < clock.date) return hash(`${a.id}ns`) < 0.05 ? 'noShow' : 'done'
  if (a.date > clock.date) return a.status
  const start = toMinutes(a.time)
  const now = toMinutes(clock.time)
  if (start + a.duration <= now) return hash(`${a.id}ns`) < 0.05 ? 'noShow' : 'done'
  if (start <= now) return 'inProgress'
  if (start - now <= 20 && hash(`${a.id}ci`) < 0.7) return 'checkedIn'
  return a.status
}
