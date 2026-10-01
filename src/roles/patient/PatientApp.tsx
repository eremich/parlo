import { CalendarDays, Search, UserRound, UsersRound } from 'lucide-react'
import { useCallback, useState } from 'react'
import { MemoryRouter, Navigate, Route, useLocation, useNavigate } from 'react-router'
import { StackRoutes } from '../../components/StackRoutes'
import { TabBar } from '../../components/TabBar'
import { doctorById } from '../../data/doctors'
import { useT } from '../../i18n'
import { useFormat } from '../../i18n/useFormat'
import { PushNotification } from '../../patterns/PushNotification'
import { heroAppointmentId, useApp } from '../../store/app'
import { START_PATH, useShell } from '../../store/shell'
import { AppointmentScreen } from './AppointmentScreen'
import { AppointmentsScreen } from './AppointmentsScreen'
import { BookedScreen } from './BookedScreen'
import { BookingScreen } from './BookingScreen'
import { DoctorScreen } from './DoctorScreen'
import { FamilyScreen } from './FamilyScreen'
import { PrivacyScreen } from './PrivacyScreen'
import { ProfileScreen } from './ProfileScreen'
import { RescheduleScreen } from './RescheduleScreen'
import { ResultsScreen } from './ResultsScreen'
import { ReviewScreen } from './ReviewScreen'
import { SearchScreen } from './SearchScreen'

/** Where each URL scenario opens the patient app */
const startRoute = (scenario: string): string | undefined => {
  switch (scenario) {
    case 'no-match':
      return '/results'
    case 'slot-taken':
      return '/book/aydin'
    case 'hero-start':
      return '/appointment/a-anna-aydin'
    case 'hero-offer':
    case 'hero-filled':
      return '/appointments'
    case 'hero-done':
      return `/review/${heroAppointmentId()}`
  }
}

/** Tab roots: moving between them crossfades */
const TABS = ['/search', '/appointments', '/family', '/profile']

/** Flows that take the whole screen hide the tab bar */
const FULL_SCREEN = ['/doctor/', '/book/', '/booked/', '/appointment/', '/review/', '/privacy']

export const PatientApp = () => {
  const scenario = useShell((s) => s.scenario)
  return (
    <MemoryRouter initialEntries={['/search', ...(START_PATH ? [START_PATH] : startRoute(scenario) ? [startRoute(scenario)!] : [])]}>
      <PatientRoutes />
      <OfferPush />
    </MemoryRouter>
  )
}

const PatientRoutes = () => {
  const t = useT()
  const tabs = t.patient.tabs
  const { pathname } = useLocation()

  return (
    <>
      <StackRoutes tabs={TABS}>
        <Route path="/search" element={<SearchScreen />} />
        <Route path="/results" element={<ResultsScreen />} />
        <Route path="/doctor/:id" element={<DoctorScreen />} />
        <Route path="/book/:id" element={<BookingScreen />} />
        <Route path="/booked/:id" element={<BookedScreen />} />
        <Route path="/appointments" element={<AppointmentsScreen />} />
        <Route path="/appointment/:id" element={<AppointmentScreen />} />
        <Route path="/appointment/:id/reschedule" element={<RescheduleScreen />} />
        <Route path="/review/:id" element={<ReviewScreen />} />
        <Route path="/family" element={<FamilyScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/privacy" element={<PrivacyScreen />} />
        <Route path="*" element={<Navigate to="/search" replace />} />
      </StackRoutes>
      {!FULL_SCREEN.some((p) => pathname.startsWith(p)) && (
        <TabBar
          items={[
            { to: '/search', label: tabs.search, icon: Search, also: ['/results'] },
            { to: '/appointments', label: tabs.appointments, icon: CalendarDays },
            { to: '/family', label: tabs.family, icon: UsersRound },
            { to: '/profile', label: tabs.profile, icon: UserRound },
          ]}
        />
      )}
    </>
  )
}

/**
 * A new waitlist offer for the signed-in patient drops in as a push notification,
 * even when it was created from another role (reception or another patient cancelling).
 */
const OfferPush = () => {
  const t = useT()
  const f = useFormat()
  const navigate = useNavigate()
  const patientId = useApp((s) => s.currentPatientId)
  const offers = useApp((s) => s.offers)
  const role = useShell((s) => s.role)
  const [seen, setSeen] = useState<string[]>([])

  const offer = offers.find((o) => o.status === 'open' && o.patientId === patientId && !seen.includes(o.id))
  const dismiss = useCallback(() => offer && setSeen((s) => [...s, offer.id]), [offer])

  // Only while the patient's phone is on screen, so it is seen when switching back from reception
  if (!offer || role !== 'patient') return null
  return (
    <PushNotification
      app={t.patient.push.app}
      time={t.patient.push.now}
      title={t.patient.push.offerTitle}
      body={t.patient.push.offerBody(doctorById(offer.doctorId).name, `${f.day(offer.date)} ${offer.time}`)}
      onDismiss={dismiss}
      onOpen={() => {
        dismiss()
        navigate('/appointments')
      }}
    />
  )
}
