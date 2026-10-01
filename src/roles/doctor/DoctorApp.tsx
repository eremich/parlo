import { CalendarClock, ListChecks, UserRound, UsersRound } from 'lucide-react'
import { MemoryRouter, Navigate, Route, useLocation, useNavigate } from 'react-router'
import { StackRoutes } from '../../components/StackRoutes'
import { Avatar } from '../../components/Avatar'
import { LargeTitle } from '../../components/LargeTitle'
import { ListGroup, ListRow } from '../../components/List'
import { Screen } from '../../components/Screen'
import { TabBar } from '../../components/TabBar'
import { displayStatus } from '../../data/background'
import { practiceById } from '../../data/doctors'
import { useT } from '../../i18n'
import { useFormat } from '../../i18n/useFormat'
import { LanguageList } from '../../patterns/LanguageChips'
import { StatusBadge } from '../../patterns/StatusBadge'
import { heroAppointmentId, useApp } from '../../store/app'
import { START_PATH, useShell } from '../../store/shell'
import { BriefScreen } from './BriefScreen'
import { InviteScreen } from './InviteScreen'
import { DOCTOR_ID, doctor } from './doctor'
import { MyDayScreen } from './MyDayScreen'
import { ScheduleScreen } from './ScheduleScreen'

export const DoctorApp = () => {
  // After the visit, the hero scenario opens the doctor on Omar's brief
  const scenario = useShell((s) => s.scenario)
  const heroId = heroAppointmentId()
  const start =
    scenario === 'onboarding'
      ? ['/invite']
      : scenario === 'conflict'
        ? ['/schedule']
        : (scenario === 'hero-done' || scenario === 'running-late') && heroId
          ? ['/day', `/brief/${heroId}`]
          : ['/day']
  return (
    <MemoryRouter initialEntries={START_PATH ? ['/day', START_PATH] : start}>
      <DoctorRoutes />
    </MemoryRouter>
  )
}

/** Tab roots: moving between them crossfades */
const TABS = ['/day', '/schedule', '/patients', '/profile']

const DoctorRoutes = () => {
  const t = useT()
  const tabs = t.doctor.tabs
  const { pathname } = useLocation()
  return (
    <>
      <StackRoutes tabs={TABS}>
        <Route path="/day" element={<MyDayScreen />} />
        <Route path="/brief/:id" element={<BriefScreen />} />
        <Route path="/invite" element={<InviteScreen />} />
        <Route path="/schedule" element={<ScheduleScreen />} />
        <Route path="/patients" element={<PatientsScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="*" element={<Navigate to="/day" replace />} />
      </StackRoutes>
      {!pathname.startsWith('/brief/') && pathname !== '/invite' && (
        <TabBar
          items={[
            { to: '/day', label: tabs.day, icon: ListChecks },
            { to: '/schedule', label: tabs.schedule, icon: CalendarClock },
            { to: '/patients', label: tabs.patients, icon: UsersRound },
            { to: '/profile', label: tabs.profile, icon: UserRound },
          ]}
        />
      )}
    </>
  )
}

/** Today's patients at a glance, each opening their brief. */
const PatientsScreen = () => {
  const t = useT()
  const navigate = useNavigate()
  const clock = useApp((s) => s.clock)
  const appointments = useApp((s) => s.appointments)
  const patients = useApp((s) => s.patients)
  const today = appointments
    .filter((a) => a.doctorId === DOCTOR_ID && a.date === clock.date && a.status !== 'cancelled' && a.status !== 'declined')
    .sort((a, b) => a.time.localeCompare(b.time))

  return (
    <Screen tabBar>
      <LargeTitle>{t.doctor.patients.title}</LargeTitle>
      {today.length === 0 ? (
        <p className="px-4 pt-4 text-body text-muted">{t.doctor.patients.empty}</p>
      ) : (
        <ListGroup title={t.doctor.patients.today}>
          {today.map((a) => {
            const patient = patients.find((p) => p.id === a.patientId)
            const status = displayStatus(a, clock)
            return (
              <ListRow
                key={a.id}
                leading={<Avatar name={patient?.name ?? ''} size="sm" />}
                title={patient?.name}
                subtitle={`${a.time} · ${patient?.languages.join(', ')}`}
                trailing={<StatusBadge status={status} label={t.status[status]} size="sm" />}
                onClick={() => navigate(`/brief/${a.id}`)}
              />
            )
          })}
        </ListGroup>
      )}
    </Screen>
  )
}

const ProfileScreen = () => {
  const t = useT()
  const tp = t.doctor.profile
  const f = useFormat()
  const practice = practiceById(doctor.practiceId)
  return (
    <Screen tabBar>
      <LargeTitle>{tp.title}</LargeTitle>
      <div className="space-y-6 pt-2">
        <ListGroup>
          <ListRow
            leading={<Avatar name={doctor.name} src={doctor.photo} size="lg" />}
            title={doctor.name}
            subtitle={`${t.specialty[doctor.specialty]} · ${practice.name}`}
          />
        </ListGroup>
        <section className="px-4">
          <h2 className="px-4 pb-1.5 text-footnote font-semibold text-muted">{tp.languages}</h2>
          <div className="rounded-card bg-surface px-4 shadow-card">
            <LanguageList
              languages={doctor.languages}
              names={f.languageNames}
              levels={{ native: t.common.native, fluent: t.common.fluent }}
            />
          </div>
        </section>
        <ListGroup title={tp.visits}>
          {doctor.visitTypes.map((v) => (
            <ListRow key={v} title={t.visitType[v]} />
          ))}
          <ListRow title={tp.acceptsNew} value={doctor.acceptsNewPatients ? '✓' : '—'} />
        </ListGroup>
      </div>
    </Screen>
  )
}
