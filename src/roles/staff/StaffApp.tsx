import {
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  MessageSquareText,
  Settings,
  Stethoscope,
  UserRoundCog,
  UsersRound,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { MemoryRouter, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router'
import { Avatar } from '../../components/Avatar'
import { Logo } from '../../components/Logo'
import { Toast } from '../../components/Toast'
import { practiceById } from '../../data/doctors'
import { useT } from '../../i18n'
import { addDays } from '../../lib/format'
import { heroAppointmentId, useApp } from '../../store/app'
import { START_PATH, useShell } from '../../store/shell'
import { AppointmentPanel } from './AppointmentPanel'
import { CalendarScreen } from './CalendarScreen'
import { ConflictPanel } from './ConflictPanel'
import { PhoneBookingPanel } from './PhoneBookingPanel'
import { PRACTICE_DOCTORS } from './practice'
import { StaffUiContext, type CalendarView, type Panel, type StaffUi } from './StaffUi'
import { DoctorsPage } from './DoctorsPage'
import { InsightsScreen } from './InsightsScreen'
import { OnboardingPage } from './OnboardingPage'
import { PatientsPage } from './PatientsPage'
import { ReviewsPage } from './ReviewsPage'
import { SettingsPage } from './SettingsPage'
import { TeamPage } from './TeamPage'
import { TodayScreen } from './TodayScreen'

/** Where each hero step opens the dashboard */
const START: Record<string, string> = { 'hero-filled': '/calendar', 'hero-done': '/insights', onboarding: '/onboarding' }

export const StaffApp = () => {
  const scenario = useShell((s) => s.scenario)
  return (
    <MemoryRouter initialEntries={[START_PATH ?? START[scenario] ?? '/today']}>
      <StaffShell />
    </MemoryRouter>
  )
}

const StaffShell = () => {
  const t = useT()
  const nav = t.staff.nav
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const role = useShell((s) => s.role)
  const clock = useApp((s) => s.clock)

  const scenario = useShell((s) => s.scenario)
  // hero-filled opens the calendar on Omar's new slot, tomorrow
  const [date, setDate] = useState(scenario === 'hero-filled' ? addDays(clock.date, 1) : clock.date)
  const [view, setView] = useState<CalendarView>('day')
  const [weekDoctor, setWeekDoctor] = useState(PRACTICE_DOCTORS[0].id)
  const [panel, open] = useState<Panel>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [focusId, setFocusId] = useState<string | null>(scenario === 'hero-filled' ? heroAppointmentId() ?? null : null)
  const clearToast = useCallback(() => setMessage(null), [])
  const close = useCallback(() => open(null), [])

  const ui: StaffUi = useMemo(
    () => ({
      date,
      setDate,
      view,
      setView,
      weekDoctor,
      setWeekDoctor,
      panel,
      open,
      toast: setMessage,
      focusId,
      focus: (appointmentId, day) => {
        setFocusId(appointmentId)
        setDate(day)
        setView('day')
      },
    }),
    [date, view, weekDoctor, panel, focusId],
  )

  // Calendar shortcuts; only while the practice dashboard is on screen and nothing else has focus
  useEffect(() => {
    if (role !== 'staff') return
    const onKey = (e: KeyboardEvent) => {
      const target = e.target instanceof HTMLElement ? e.target : null
      if (panel || e.metaKey || e.ctrlKey || e.altKey || target?.closest('input, textarea, select, [role=dialog]')) return
      const step = view === 'week' ? 7 : 1
      const key = e.key.toLowerCase()
      if (key === 't') setDate(clock.date)
      else if (e.key === 'ArrowLeft') setDate((d) => addDays(d, -step))
      else if (e.key === 'ArrowRight') setDate((d) => addDays(d, step))
      else if (key === 'd' || key === 'w') {
        setView(key === 'd' ? 'day' : 'week')
        if (pathname !== '/calendar') navigate('/calendar')
      } else if (key === 'n') open({ kind: 'booking', date })
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [role, panel, view, clock.date, date, pathname, navigate])

  const items = [
    { to: '/today', label: nav.today, icon: LayoutDashboard },
    { to: '/calendar', label: nav.calendar, icon: CalendarDays },
    { to: '/patients', label: nav.patients, icon: UsersRound },
    { to: '/doctors', label: nav.doctors, icon: Stethoscope },
    { to: '/team', label: nav.team, icon: UserRoundCog },
    { to: '/insights', label: nav.insights, icon: BarChart3 },
    { to: '/reviews', label: nav.reviews, icon: MessageSquareText },
    { to: '/settings', label: nav.settings, icon: Settings },
  ]

  return (
    <StaffUiContext.Provider value={ui}>
      <div className="flex h-full">
        <aside className="flex w-60 shrink-0 flex-col border-r border-line bg-surface px-3 py-5">
          <div className="px-3 pb-6">
            <Logo size={24} />
            <p className="mt-1.5 text-meta text-muted">{practiceById(PRACTICE_DOCTORS[0].practiceId).name}</p>
          </div>
          <nav aria-label="Practice">
            <ul className="space-y-0.5">
              {items.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `flex min-h-10 items-center gap-3 rounded-control px-3 text-web-body transition-colors duration-150 ${
                        isActive ? 'bg-brand-soft font-semibold text-brand' : 'text-muted hover:bg-canvas hover:text-ink'
                      }`
                    }
                  >
                    <Icon aria-hidden size={18} />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto flex items-center gap-3 border-t border-line px-3 pt-4">
            <Avatar name={t.staff.user.name} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-meta font-semibold text-ink">{t.staff.user.name}</p>
              <p className="truncate text-label text-muted">{t.staff.user.role}</p>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto px-10 py-8">
          <div className="mx-auto max-w-[1120px]">
            <Routes>
              <Route path="/today" element={<TodayScreen />} />
              <Route path="/calendar" element={<CalendarScreen />} />
              <Route path="/insights" element={<InsightsScreen />} />
              <Route path="/patients" element={<PatientsPage />} />
              <Route path="/doctors" element={<DoctorsPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="*" element={<Navigate to="/today" replace />} />
            </Routes>
          </div>
        </main>
      </div>

      {panel?.kind === 'appointment' && <AppointmentPanel id={panel.id} onClose={close} />}
      {panel?.kind === 'booking' && <PhoneBookingPanel prefill={panel} onClose={close} />}
      {panel?.kind === 'conflict' && <ConflictPanel blockId={panel.blockId} onClose={close} />}
      <Toast message={message} onDone={clearToast} />
    </StaffUiContext.Provider>
  )
}
