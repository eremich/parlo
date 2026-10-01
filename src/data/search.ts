import { DOCTORS, practiceById } from './doctors'
import { nextSlots, today } from './schedule'
import { addDays } from '../lib/format'
import type { Appointment, Doctor, Insurance, LanguageCode, Specialty } from './types'

export type Filters = {
  specialty: Specialty | null
  /** Free-text doctor name, when the patient searched for one */
  doctorQuery: string
  insurance: Insurance
  /** Doctor speaks at least one of these */
  languages: LanguageCode[]
  when: 'any' | 'today' | 'week'
  maxKm: number | null
  video: boolean
  newPatients: boolean
  stepFree: boolean
}

export const DEFAULT_FILTERS: Filters = {
  specialty: null,
  doctorQuery: '',
  insurance: 'public',
  languages: [],
  when: 'any',
  maxKm: null,
  video: false,
  newPatients: false,
  stepFree: false,
}

export type Result = {
  doctor: Doctor
  earliest: { date: string; time: string }
  slots: { date: string; time: string }[]
}

const matches = (doctor: Doctor, f: Filters, earliest?: { date: string }) => {
  const practice = practiceById(doctor.practiceId)
  if (f.specialty && doctor.specialty !== f.specialty) return false
  if (f.doctorQuery && !doctor.name.toLowerCase().includes(f.doctorQuery.toLowerCase())) return false
  if (!doctor.insurance.includes(f.insurance)) return false
  if (f.languages.length && !doctor.languages.some((l) => f.languages.includes(l.code))) return false
  if (f.maxKm !== null && practice.distanceKm > f.maxKm) return false
  if (f.video && !doctor.visitTypes.includes('video')) return false
  if (f.newPatients && !doctor.acceptsNewPatients) return false
  if (f.stepFree && !practice.stepFree) return false
  if (!earliest) return false
  if (f.when === 'today' && earliest.date !== today()) return false
  if (f.when === 'week' && earliest.date > addDays(today(), 6)) return false
  return true
}

/** Matching doctors, earliest real slot first. */
export const search = (filters: Filters, appointments: Appointment[]): Result[] =>
  DOCTORS.map((doctor) => {
    const slots = nextSlots(doctor.id, appointments, 3)
    return { doctor, earliest: slots[0], slots }
  })
    .filter((r) => matches(r.doctor, filters, r.earliest))
    .sort((a, b) =>
      `${a.earliest.date} ${a.earliest.time}`.localeCompare(`${b.earliest.date} ${b.earliest.time}`),
    )

/**
 * When nothing matches, propose one relaxed search that does: the patient's first language
 * and a 3 km radius, dropping the rarer constraints.
 */
export const relaxFilters = (filters: Filters, patientLanguages: LanguageCode[], appointments: Appointment[]) => {
  const language = patientLanguages.find((l) => l !== 'DE') ?? 'EN'
  const relaxed: Filters = {
    ...DEFAULT_FILTERS,
    specialty: filters.specialty,
    insurance: filters.insurance,
    languages: [language],
    maxKm: 3,
  }
  if (search(relaxed, appointments).length) return { filters: relaxed, language, km: 3 }
  const wider = { ...relaxed, maxKm: null }
  return search(wider, appointments).length ? { filters: wider, language, km: null } : null
}

/** Words patients type, mapped to a specialty. Suggests where to look; never gives medical advice. */
const KEYWORDS: [Specialty, string[]][] = [
  ['gp', ['gp', 'general', 'family', 'hausarzt', 'allgemein', 'cough', 'husten', 'fever', 'fieber', 'cold', 'erkältung', 'blood', 'blut', 'sick note', 'krankschreibung', 'back', 'rücken']],
  ['dentist', ['dentist', 'dental', 'tooth', 'teeth', 'zahn', 'zähne']],
  ['gynecology', ['gyn', 'frauen', 'pregnan', 'schwanger']],
  ['dermatology', ['derm', 'skin', 'haut', 'rash', 'ausschlag', 'mole', 'muttermal', 'acne', 'akne']],
  ['pediatrics', ['pediatr', 'child', 'kid', 'baby', 'kinder', 'kind']],
  ['ent', ['ent', 'ear', 'nose', 'throat', 'ohr', 'nase', 'hals', 'hno']],
]

export const suggestSpecialties = (query: string): Specialty[] => {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []
  return KEYWORDS.filter(([, words]) => words.some((w) => w.startsWith(q) || (w.length > 3 && q.includes(w)))).map(([s]) => s)
}

export const suggestDoctors = (query: string): Doctor[] => {
  const q = query.trim().toLowerCase().replace(/^dr\.?\s*/, '')
  if (q.length < 2) return []
  return DOCTORS.filter((d) => d.name.toLowerCase().replace('dr. ', '').split(' ').some((part) => part.startsWith(q)))
}
