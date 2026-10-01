/** Domain types shared by every role. All data is fictional. */

export type LanguageCode = 'DE' | 'EN' | 'TR' | 'AR' | 'RU' | 'UK' | 'PL' | 'FR' | 'ES' | 'FA'
export type LanguageLevel = 'native' | 'fluent'

export type SpokenLanguage = { code: LanguageCode; level: LanguageLevel }

/** Public (GKV, gesetzlich) or private (PKV). */
export type Insurance = 'public' | 'private'

export type VisitType = 'new' | 'followUp' | 'video'

export type Specialty = 'gp' | 'dentist' | 'gynecology' | 'dermatology' | 'pediatrics' | 'ent'

export type Practice = {
  id: string
  name: string
  street: string
  district: string
  /** Kilometres from the patient's default location (Kreuzberg) */
  distanceKm: number
  stepFree: boolean
  insurance: Insurance[]
  receptionLanguages: LanguageCode[]
  /** Position on the static map, 0–100 % of width and height */
  map: { x: number; y: number }
}

export type Doctor = {
  id: string
  name: string
  specialty: Specialty
  practiceId: string
  languages: SpokenLanguage[]
  insurance: Insurance[]
  visitTypes: VisitType[]
  acceptsNewPatients: boolean
  /** Specialists that usually expect an Überweisung */
  referralExpected: boolean
  rating: number
  reviewCount: number
  /** "€ 85 for private patients" */
  privatePrice?: number
  /** Generated portrait of a fictional person (public/doctors) */
  photo?: string
}

export type AppointmentStatus =
  | 'confirmed'
  | 'pending'
  | 'checkedIn'
  | 'inProgress'
  | 'done'
  | 'noShow'
  | 'cancelled'
  | 'declined'

/** Day as an ISO date (YYYY-MM-DD) and time as 24-hour HH:MM, so mock data stays readable. */
export type Slot = { doctorId: string; date: string; time: string }

export type Patient = {
  id: string
  name: string
  /** ISO date */
  birthDate: string
  insurance: Insurance
  /** Krankenkasse or private insurer, e.g. "TK" */
  insurer: string
  languages: LanguageCode[]
  email?: string
  phone?: string
  /** Family members are managed by a parent account */
  guardianId?: string
  relation?: 'child' | 'parent'
}

export type Appointment = {
  id: string
  patientId: string
  doctorId: string
  date: string
  time: string
  /** Minutes */
  duration: number
  visitType: VisitType
  status: AppointmentStatus
  reason?: string
  firstVisit?: boolean
  filledFromWaitlist?: boolean
  /** Minutes the patient said they will be late */
  lateBy?: number
  /** Booked by reception on the phone */
  byPhone?: boolean
  /** Patient confirmed the reminder the day before */
  confirmedByPatient?: boolean
  /** Patient left a review for this visit */
  reviewed?: boolean
  /** Times the practice proposed after declining a request */
  alternatives?: { date: string; time: string }[]
  /** Set when the appointment was cancelled or moved, for the calendar ghost and insights */
  cancelledAt?: string
  /** Generated to fill the demo practice's calendar (see data/background.ts) */
  background?: boolean
  /** Reception has seen the late notice and told the doctor */
  lateAcknowledged?: boolean
}

/** A patient waiting for an earlier slot with the same doctor. */
export type WaitlistEntry = {
  id: string
  patientId: string
  doctorId: string
  /** The appointment an accepted offer replaces */
  appointmentId: string
  /** Only offer slots before this date */
  before: string
  /** Weekdays that work (1 = Monday … 5 = Friday) */
  days: number[]
}

/** A freed slot offered to someone on the waitlist; they have 30 minutes to take it. */
export type Offer = {
  id: string
  waitlistId: string
  patientId: string
  doctorId: string
  date: string
  time: string
  /** Epoch ms; the countdown runs in real time */
  expiresAt: number
  status: 'open' | 'accepted' | 'declined' | 'expired'
  /** The appointment whose cancellation freed the slot */
  freedBy?: string
}

export type ReviewReason =
  | 'explainedClearly'
  | 'spokeMyLanguage'
  | 'tookTime'
  | 'friendlyStaff'
  | 'onTime'
  | 'longWait'
  | 'startedLate'

export type Review = {
  id: string
  doctorId: string
  author: string
  date: string
  doctorRating: number
  practiceRating: number
  reasons: ReviewReason[]
  comment?: string
  /** Public reply from the practice */
  reply?: string
}

/** Time a doctor is unavailable (training, home visits, vacation). Appointments inside it are conflicts. */
export type Block = {
  id: string
  doctorId: string
  date: string
  start: string
  end: string
  label: string
  /** Reception has moved or notified everyone affected */
  resolved?: boolean
}

/** A new practice joining Parlo, step by step until it is live in search. */
export type Onboarding = {
  practice: {
    name: string
    street: string
    district: string
    specialties: Specialty[]
    insurance: Insurance[]
    receptionLanguages: LanguageCode[]
  }
  /** File name of the uploaded licence (Approbation / KV-Zulassung) */
  document?: string
  verification: 'none' | 'pending' | 'verified'
  services: string[]
  invite: { name: string; email: string; status: 'none' | 'sent' | 'accepted' }
  doctorProfile: { languages: SpokenLanguage[]; bio: string; photo: boolean; done: boolean }
  hoursSet: boolean
  live: boolean
}
