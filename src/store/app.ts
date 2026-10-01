import { create } from 'zustand'
import { BACKGROUND_PATIENTS, backgroundAppointments } from '../data/background'
import { doctorById } from '../data/doctors'
import { PATIENTS } from '../data/patients'
import { REVIEWS } from '../data/reviews'
import {
  CLOCK_PRESETS,
  freeTimes,
  nextSlots,
  reserveSeedSlots,
  setScheduleBlocks,
  setScheduleClock,
  SLOT_MINUTES,
  type Clock,
} from '../data/schedule'
import { DEFAULT_FILTERS, type Filters } from '../data/search'
import { SEED_APPOINTMENTS, SEED_WAITLIST } from '../data/seed'
import type {
  Appointment,
  Block,
  Onboarding,
  Insurance,
  Offer,
  Patient,
  Review,
  ReviewReason,
  VisitType,
  WaitlistEntry,
} from '../data/types'
import { useShell } from './shell'

/**
 * One store shared by all three roles: every change is instantly true for the patient,
 * the doctor and reception. Presentational components never read it; screens do.
 */

export type BookingRequest = {
  patientId: string
  doctorId: string
  date: string
  time: string
  visitType: VisitType
  reason?: string
}

export type BookingResult =
  | { status: 'booked'; appointment: Appointment }
  | { status: 'taken'; next?: { date: string; time: string } }

export type ReviewInput = {
  doctorRating: number
  practiceRating: number
  reasons: ReviewReason[]
  comment?: string
}

/** A waitlist offer stays open this long */
export const OFFER_MINUTES = 30

export type PhoneBooking = {
  /** An existing patient, or a quick new one with just three fields */
  patientId?: string
  newPatient?: { name: string; phone: string; insurance: Insurance }
  doctorId: string
  date: string
  time: string
  visitType: VisitType
}

/** Dr. Busch's Monday training was added after patients had booked: reception must move them. */
const SEED_BLOCKS: Block[] = [
  { id: 'b-busch-training', doctorId: 'busch', date: '2026-03-16', start: '14:00', end: '16:00', label: 'Training' },
]

type AppState = {
  clock: Clock
  patients: Patient[]
  currentPatientId: string | null
  appointments: Appointment[]
  /** "patientId|practiceId" pairs the patient agreed to share booking details with */
  consents: string[]
  waitlist: WaitlistEntry[]
  offers: Offer[]
  reviews: Review[]
  blocks: Block[]
  /** Minutes a doctor is running behind, announced to waiting patients */
  delays: Record<string, number>
  filters: Filters
  /** Scenario "slot-taken": the next confirmation loses its slot to someone else once */
  slotTakenOnce: boolean
  /** The patient's phone has no connection */
  offline: boolean
  onboarding: Onboarding

  setClock: (clock: Clock) => void
  setFilters: (patch: Partial<Filters>) => void
  resetFilters: () => void
  signIn: (patientId: string) => void
  signUp: (patient: Omit<Patient, 'id'>) => string
  signOut: () => void
  updatePatient: (id: string, patch: Partial<Patient>) => void
  addFamilyMember: (member: Omit<Patient, 'id'>) => void
  giveConsent: (patientId: string, practiceId: string) => void
  withdrawConsent: (patientId: string, practiceId: string) => void

  book: (request: BookingRequest) => BookingResult
  cancel: (appointmentId: string) => void
  reschedule: (appointmentId: string, date: string, time: string) => void
  acceptAlternative: (appointmentId: string, date: string, time: string) => void
  joinWaitlist: (entry: Omit<WaitlistEntry, 'id'>) => void
  leaveWaitlist: (waitlistId: string) => void
  acceptOffer: (offerId: string) => Appointment | undefined
  declineOffer: (offerId: string) => void
  expireOffer: (offerId: string) => void
  confirmReminder: (appointmentId: string) => void
  reportLate: (appointmentId: string, minutes: number) => void
  checkIn: (appointmentId: string) => void
  submitReview: (appointmentId: string, review: ReviewInput) => void

  // Reception
  confirmRequest: (appointmentId: string) => void
  proposeTimes: (appointmentId: string, times: { date: string; time: string }[]) => void
  markArrived: (appointmentId: string) => void
  markNoShow: (appointmentId: string) => void
  moveAppointment: (appointmentId: string, doctorId: string, date: string, time: string) => void
  phoneBook: (booking: PhoneBooking) => Appointment | undefined
  acknowledgeLate: (appointmentId: string) => void
  resolveConflict: (blockId: string, moves: { appointmentId: string; date: string; time: string }[]) => void

  // Doctor
  startVisit: (appointmentId: string) => void
  completeVisit: (appointmentId: string) => void
  setDelay: (doctorId: string, minutes: number) => void
  addBlock: (block: Omit<Block, 'id'>) => void
  removeBlock: (blockId: string) => void

  replyToReview: (reviewId: string, reply: string) => void
  updateOnboarding: (patch: Partial<Onboarding>) => void
  setOffline: (offline: boolean) => void
}

const savedFilters = (patient?: Patient): Filters => ({
  ...DEFAULT_FILTERS,
  insurance: patient?.insurance ?? 'public',
  languages: patient?.languages.filter((l) => l !== 'DE') ?? [],
})

const anna = PATIENTS.find((p) => p.id === 'anna')

/** Extra appointments some scenarios start with; reserved so the background never double-books them */
const SCENARIO_APPOINTMENTS: Appointment[] =
  useShell.getState().scenario === 'request-pending'
    ? [
        {
          id: 'a-lukas-busch',
          patientId: 'lukas',
          doctorId: 'busch',
          date: '2026-03-13',
          time: '12:20',
          duration: 20,
          visitType: 'new',
          status: 'pending',
          firstVisit: true,
          reason: 'Check-up',
        },
      ]
    : []

/** A fresh practice, before anything is filled in */
const EMPTY_ONBOARDING: Onboarding = {
  practice: { name: '', street: '', district: '', specialties: [], insurance: ['public', 'private'], receptionLanguages: ['DE'] },
  verification: 'none',
  services: [],
  invite: { name: '', email: '', status: 'none' },
  doctorProfile: { languages: [{ code: 'DE', level: 'native' }], bio: '', photo: false, done: false },
  hoursSet: false,
  live: false,
}

/** Scenario "onboarding": halfway through, the doctor has been invited but not yet accepted */
const ONBOARDING_IN_PROGRESS: Onboarding = {
  practice: {
    name: 'Hausarztpraxis Schillerkiez',
    street: 'Herrfurthstraße 21',
    district: 'Neukölln',
    specialties: ['gp'],
    insurance: ['public', 'private'],
    receptionLanguages: ['DE', 'EN', 'TR'],
  },
  document: 'KV-Zulassung_Lehmann.pdf',
  verification: 'pending',
  services: ['Check-ups', 'Blood tests', 'Vaccinations', 'Sick notes'],
  invite: { name: 'Dr. Nora Lehmann', email: 'n.lehmann@example.com', status: 'sent' },
  doctorProfile: { languages: [{ code: 'DE', level: 'native' }], bio: '', photo: false, done: false },
  hoursSet: false,
  live: false,
}

/** Starting state for each URL scenario (see docs/parlo-prototype-brief.md §9). */
const initialState = (scenario: string) => {
  const base = {
    clock: CLOCK_PRESETS[0].clock,
    patients: [...PATIENTS, ...BACKGROUND_PATIENTS],
    currentPatientId: 'anna' as string | null,
    appointments: [...SEED_APPOINTMENTS, ...BACKGROUND],
    consents: ['anna|goerlitzer', 'anna|kinder-neukoelln', 'omar|goerlitzer', 'lukas|haut-prenzlauer', 'lukas|hno-mitte'],
    waitlist: SEED_WAITLIST,
    offers: [] as Offer[],
    reviews: REVIEWS,
    blocks: SEED_BLOCKS,
    delays: {} as Record<string, number>,
    filters: savedFilters(anna),
    slotTakenOnce: false,
    offline: false,
    onboarding: EMPTY_ONBOARDING,
  }
  switch (scenario) {
    case 'no-match':
      return { ...base, filters: { ...base.filters, specialty: 'gp' as const, languages: ['FA' as const], maxKm: 1 } }
    case 'slot-taken':
      return { ...base, slotTakenOnce: true }
    case 'empty':
      return { ...base, appointments: [], waitlist: [], filters: DEFAULT_FILTERS }
    case 'onboarding':
      return { ...base, onboarding: ONBOARDING_IN_PROGRESS }
    case 'offline':
      return { ...base, offline: true }
    case 'request-pending':
      return { ...base, currentPatientId: 'lukas', appointments: [...base.appointments, ...SCENARIO_APPOINTMENTS] }
    case 'conflict':
      return {
        ...base,
        blocks: [
          ...base.blocks,
          { id: 'b-aydin-training', doctorId: 'aydin', date: '2026-03-13', start: '08:00', end: '10:00', label: 'Training' },
        ],
      }
    default:
      return base
  }
}

// Seeded appointments and proposed alternatives own their slots; the background never claims them.
// Blocks apply before anything computes availability.
reserveSeedSlots([
  ...SEED_APPOINTMENTS,
  ...SCENARIO_APPOINTMENTS,
  ...SEED_APPOINTMENTS.flatMap((a) => (a.alternatives ?? []).map((alt) => ({ ...a, ...alt }))),
])

setScheduleBlocks(SEED_BLOCKS)

/** Named appointments that fill the demo practice's calendar */
const BACKGROUND = backgroundAppointments('2026-03-11')

let nextId = 1
const id = (prefix: string) => `${prefix}-${nextId++}`

const weekday = (iso: string) => new Date(`${iso}T12:00:00Z`).getUTCDay()
const isLive = (a: Appointment) => a.status !== 'cancelled' && a.status !== 'declined'

/**
 * A slot just became free: offer it to the first waitlisted patient who wants something earlier
 * with this doctor on that weekday. The offer is open for 30 minutes.
 */
const offerFreedSlot = (
  state: Pick<AppState, 'waitlist' | 'offers' | 'appointments'>,
  freed: Appointment,
): Offer[] => {
  const alreadyOffered = state.offers.some(
    (o) => o.status === 'open' && o.doctorId === freed.doctorId && o.date === freed.date && o.time === freed.time,
  )
  if (alreadyOffered) return state.offers
  const match = state.waitlist.find(
    (w) =>
      w.doctorId === freed.doctorId &&
      w.patientId !== freed.patientId &&
      freed.date < w.before &&
      w.days.includes(weekday(freed.date)) &&
      !state.offers.some((o) => o.waitlistId === w.id && o.status === 'open'),
  )
  if (!match) return state.offers
  return [
    ...state.offers,
    {
      id: id('o'),
      waitlistId: match.id,
      patientId: match.patientId,
      doctorId: freed.doctorId,
      date: freed.date,
      time: freed.time,
      expiresAt: Date.now() + OFFER_MINUTES * 60_000,
      status: 'open',
      freedBy: freed.id,
    },
  ]
}

export const useApp = create<AppState>()((set, get) => {
  const patchAppointment = (appointmentId: string, patch: Partial<Appointment>) =>
    set((s) => ({ appointments: s.appointments.map((a) => (a.id === appointmentId ? { ...a, ...patch } : a)) }))

  const stamp = () => `${get().clock.date} ${get().clock.time}`

  return {
    ...initialState(useShell.getState().scenario),

    setClock: (clock) => {
      setScheduleClock(clock)
      set({ clock })
    },

    setFilters: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),
    resetFilters: () =>
      set((s) => ({
        filters: {
          ...savedFilters(s.patients.find((p) => p.id === s.currentPatientId)),
          specialty: s.filters.specialty,
        },
      })),

    signIn: (patientId) =>
      set((s) => ({
        currentPatientId: patientId,
        filters: { ...savedFilters(s.patients.find((p) => p.id === patientId)), specialty: s.filters.specialty },
      })),
    signUp: (patient) => {
      const newId = id('p')
      set((s) => ({ patients: [...s.patients, { ...patient, id: newId }], currentPatientId: newId }))
      return newId
    },
    signOut: () => set({ currentPatientId: null }),
    updatePatient: (patientId, patch) =>
      set((s) => ({ patients: s.patients.map((p) => (p.id === patientId ? { ...p, ...patch } : p)) })),
    addFamilyMember: (member) => set((s) => ({ patients: [...s.patients, { ...member, id: id('p') }] })),

    giveConsent: (patientId, practiceId) =>
      set((s) => ({ consents: [...new Set([...s.consents, `${patientId}|${practiceId}`])] })),
    withdrawConsent: (patientId, practiceId) =>
      set((s) => ({ consents: s.consents.filter((c) => c !== `${patientId}|${practiceId}`) })),

    book: (request) => {
      const { appointments, slotTakenOnce } = get()
      const stillFree = freeTimes(request.doctorId, request.date, appointments).includes(request.time)

      if (!stillFree || slotTakenOnce) {
        // Someone else got there first: hold the slot for them and offer the next one
        const taken: Appointment = {
          id: id('a'),
          patientId: 'external',
          doctorId: request.doctorId,
          date: request.date,
          time: request.time,
          duration: SLOT_MINUTES,
          visitType: 'followUp',
          status: 'confirmed',
        }
        const updated = slotTakenOnce ? [...appointments, taken] : appointments
        set({ appointments: updated, slotTakenOnce: false })
        return { status: 'taken', next: nextSlots(request.doctorId, updated, 1)[0] }
      }

      const doctor = doctorById(request.doctorId)
      // GPs, pediatricians and dentists confirm automatically; specialists review requests first
      const autoConfirm = ['gp', 'pediatrics', 'dentist'].includes(doctor.specialty)
      // The insurance card is shown on the first visit of each quarter at a practice
      const quarter = (iso: string) => `${iso.slice(0, 4)}-${Math.floor((Number(iso.slice(5, 7)) - 1) / 3)}`
      const firstVisit = !appointments.some(
        (a) =>
          a.patientId === request.patientId &&
          doctorById(a.doctorId).practiceId === doctor.practiceId &&
          quarter(a.date) === quarter(request.date) &&
          isLive(a),
      )
      const appointment: Appointment = {
        id: id('a'),
        ...request,
        duration: SLOT_MINUTES,
        status: autoConfirm ? 'confirmed' : 'pending',
        firstVisit,
      }
      set({ appointments: [...appointments, appointment] })
      return { status: 'booked', appointment }
    },

    cancel: (appointmentId) => {
      const cancelled = get().appointments.find((a) => a.id === appointmentId)
      if (!cancelled) return
      patchAppointment(appointmentId, { status: 'cancelled', cancelledAt: stamp() })
      set((s) => ({
        // Cancelling also ends any wait for an earlier slot tied to this appointment
        waitlist: s.waitlist.filter((w) => w.appointmentId !== appointmentId),
        offers: offerFreedSlot(s, cancelled),
      }))
    },

    reschedule: (appointmentId, date, time) => {
      const old = get().appointments.find((a) => a.id === appointmentId)
      if (!old) return
      patchAppointment(appointmentId, { date, time, confirmedByPatient: false })
      set((s) => ({ offers: offerFreedSlot(s, old) }))
    },

    acceptAlternative: (appointmentId, date, time) =>
      patchAppointment(appointmentId, { date, time, status: 'confirmed', alternatives: undefined }),

    joinWaitlist: (entry) =>
      set((s) => ({
        waitlist: [...s.waitlist.filter((w) => w.appointmentId !== entry.appointmentId), { ...entry, id: id('w') }],
      })),
    leaveWaitlist: (waitlistId) => set((s) => ({ waitlist: s.waitlist.filter((w) => w.id !== waitlistId) })),

    acceptOffer: (offerId) => {
      const { offers, waitlist, appointments } = get()
      const offer = offers.find((o) => o.id === offerId)
      const entry = waitlist.find((w) => w.id === offer?.waitlistId)
      const current = appointments.find((a) => a.id === entry?.appointmentId)
      if (!offer || !entry || !current || offer.status !== 'open') return undefined

      const moved: Appointment = {
        ...current,
        id: id('a'),
        date: offer.date,
        time: offer.time,
        status: 'confirmed',
        filledFromWaitlist: true,
        confirmedByPatient: false,
      }
      set((s) => ({
        // The old slot is released for everyone; the new one is confirmed straight away
        appointments: [
          ...s.appointments.map((a) =>
            a.id === current.id ? { ...a, status: 'cancelled' as const, cancelledAt: stamp() } : a,
          ),
          moved,
        ],
        offers: s.offers.map((o) => (o.id === offerId ? { ...o, status: 'accepted' as const } : o)),
        waitlist: s.waitlist.filter((w) => w.id !== entry.id),
      }))
      return moved
    },
    declineOffer: (offerId) =>
      set((s) => ({ offers: s.offers.map((o) => (o.id === offerId ? { ...o, status: 'declined' as const } : o)) })),
    expireOffer: (offerId) =>
      set((s) => ({
        offers: s.offers.map((o) => (o.id === offerId && o.status === 'open' ? { ...o, status: 'expired' as const } : o)),
      })),

    confirmReminder: (appointmentId) => patchAppointment(appointmentId, { confirmedByPatient: true }),
    reportLate: (appointmentId, minutes) => patchAppointment(appointmentId, { lateBy: minutes }),
    checkIn: (appointmentId) => patchAppointment(appointmentId, { status: 'checkedIn', lateBy: undefined }),

    submitReview: (appointmentId, input) => {
      const appointment = get().appointments.find((a) => a.id === appointmentId)
      const author = get().patients.find((p) => p.id === appointment?.patientId)
      if (!appointment || !author) return
      const [first, last] = author.name.split(' ')
      patchAppointment(appointmentId, { reviewed: true })
      set((s) => ({
        reviews: [
          {
            id: id('r'),
            doctorId: appointment.doctorId,
            author: `${first} ${last?.[0] ?? ''}.`,
            date: s.clock.date,
            ...input,
          },
          ...s.reviews,
        ],
      }))
    },

    confirmRequest: (appointmentId) => patchAppointment(appointmentId, { status: 'confirmed' }),
    proposeTimes: (appointmentId, times) =>
      patchAppointment(appointmentId, { status: 'declined', alternatives: times }),
    markArrived: (appointmentId) => patchAppointment(appointmentId, { status: 'checkedIn', lateBy: undefined }),
    markNoShow: (appointmentId) => patchAppointment(appointmentId, { status: 'noShow' }),

    moveAppointment: (appointmentId, doctorId, date, time) => {
      const old = get().appointments.find((a) => a.id === appointmentId)
      if (!old) return
      // Materialise background appointments so their new status sticks
      patchAppointment(appointmentId, { doctorId, date, time, background: false, confirmedByPatient: false })
      set((s) => ({ offers: offerFreedSlot(s, old) }))
    },

    phoneBook: (booking) => {
      let patientId = booking.patientId
      if (!patientId && booking.newPatient) {
        patientId = id('p')
        const { name, phone, insurance } = booking.newPatient
        const newcomer: Patient = { id: patientId, name, phone, insurance, insurer: insurance === 'public' ? 'AOK' : 'DKV', birthDate: '', languages: ['DE'] }
        set((s) => ({ patients: [...s.patients, newcomer] }))
      }
      if (!patientId) return undefined
      const appointment: Appointment = {
        id: id('a'),
        patientId,
        doctorId: booking.doctorId,
        date: booking.date,
        time: booking.time,
        duration: SLOT_MINUTES,
        visitType: booking.visitType,
        status: 'confirmed',
        byPhone: true,
        firstVisit: !!booking.newPatient,
      }
      set((s) => ({ appointments: [...s.appointments, appointment] }))
      return appointment
    },

    acknowledgeLate: (appointmentId) => patchAppointment(appointmentId, { lateAcknowledged: true }),

    resolveConflict: (blockId, moves) => {
      for (const move of moves) {
        const a = get().appointments.find((x) => x.id === move.appointmentId)
        if (a) patchAppointment(a.id, { date: move.date, time: move.time, background: false })
      }
      set((s) => ({ blocks: s.blocks.map((b) => (b.id === blockId ? { ...b, resolved: true } : b)) }))
    },

    startVisit: (appointmentId) => patchAppointment(appointmentId, { status: 'inProgress', background: false }),
    completeVisit: (appointmentId) => patchAppointment(appointmentId, { status: 'done', background: false }),
    setDelay: (doctorId, minutes) => set((s) => ({ delays: { ...s.delays, [doctorId]: minutes } })),
    addBlock: (block) => {
      const blocks = [...get().blocks, { ...block, id: id('b') }]
      // Availability reads blocks directly, so patients stop seeing the time at once
      setScheduleBlocks(blocks)
      set({ blocks })
    },
    replyToReview: (reviewId, reply) =>
      set((s) => ({ reviews: s.reviews.map((r) => (r.id === reviewId ? { ...r, reply } : r)) })),
    updateOnboarding: (patch) => set((s) => ({ onboarding: { ...s.onboarding, ...patch } })),
    setOffline: (offline) => set({ offline }),

    removeBlock: (blockId) => {
      const blocks = get().blocks.filter((b) => b.id !== blockId)
      setScheduleBlocks(blocks)
      set({ blocks })
    },
  }
})

/**
 * Hero scenario steps from the URL (?scenario=hero-offer …): replay the story up to that point,
 * so every step can be opened directly for screenshots and demos.
 */
const applyHeroScenario = (scenario: string) => {
  if (scenario === 'running-late') return applyRunningLate()
  if (!scenario.startsWith('hero-') || scenario === 'hero-start') return
  const act = () => useApp.getState()
  act().cancel('a-anna-aydin')
  act().signIn('omar')
  if (scenario === 'hero-offer') return
  const offer = act().offers.find((o) => o.status === 'open' && o.patientId === 'omar')
  const moved = offer && act().acceptOffer(offer.id)
  if (scenario !== 'hero-done' || !moved) return
  act().setClock(CLOCK_PRESETS.find((p) => p.id === 'thu-later')!.clock)
  act().checkIn(moved.id)
  act().completeVisit(moved.id)
}
/** Omar, now at 09:00 thanks to the waitlist, tells the practice he is 10 minutes late */
const applyRunningLate = () => {
  applyHeroScenario('hero-filled')
  const act = useApp.getState()
  act.setClock(CLOCK_PRESETS.find((p) => p.id === 'thu-morning')!.clock)
  const moved = act.appointments.find((a) => a.patientId === 'omar' && a.filledFromWaitlist)
  if (moved) act.reportLate(moved.id, 10)
}

setScheduleBlocks(useApp.getState().blocks)
applyHeroScenario(useShell.getState().scenario)

/** Omar's appointment that came from the waitlist, once the hero scenario has reached it */
export const heroAppointmentId = () =>
  useApp.getState().appointments.find((a) => a.patientId === 'omar' && a.filledFromWaitlist)?.id

export const useCurrentPatientId = () => useApp((s) => s.currentPatientId)

export const useCurrentPatient = () =>
  useApp((s) => s.patients.find((p) => p.id === s.currentPatientId) ?? null)

/** The patient plus family members they manage. */
export const useHousehold = () => {
  const patient = useCurrentPatient()
  const patients = useApp((s) => s.patients)
  return patient ? [patient, ...patients.filter((p) => p.guardianId === patient.id)] : []
}

/** Minutes between the clock and an appointment start (negative once it has started). */
export const minutesUntil = (clock: Clock, a: Pick<Appointment, 'date' | 'time'>) => {
  const toMs = (date: string, time: string) => Date.parse(`${date}T${time}:00Z`)
  return Math.round((toMs(a.date, a.time) - toMs(clock.date, clock.time)) / 60_000)
}
