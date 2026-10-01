import { CalendarPlus, CircleCheck, Clock, Languages, Play, UserX } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Avatar } from '../../components/Avatar'
import { Banner } from '../../components/Banner'
import { Button } from '../../components/Button'
import { NavBar } from '../../components/NavBar'
import { Screen } from '../../components/Screen'
import { BACK } from '../../components/StackRoutes'
import { Sheet } from '../../components/Sheet'
import { displayStatus } from '../../data/background'
import { availability } from '../../data/schedule'
import { useT } from '../../i18n'
import { useFormat } from '../../i18n/useFormat'
import { addDays } from '../../lib/format'
import { LanguageChips } from '../../patterns/LanguageChips'
import { StatusBadge } from '../../patterns/StatusBadge'
import { SlotChip } from '../../patterns/SlotChip'
import { minutesUntil, useApp } from '../../store/app'
import { ageOf, doctor } from './doctor'

const NO_SHOW_AFTER = 15
/** Follow-ups are suggested about two weeks out */
const FOLLOW_UP_AFTER_DAYS = 14

/** Who is next and why, before the door opens: visit, reason, shared language, insurance, history. */
export const BriefScreen = () => {
  const { id } = useParams()
  const t = useT()
  const tb = t.doctor.brief
  const f = useFormat()
  const navigate = useNavigate()
  const clock = useApp((s) => s.clock)
  const appointments = useApp((s) => s.appointments)
  const patients = useApp((s) => s.patients)
  const { startVisit, completeVisit, markNoShow, phoneBook } = useApp()
  const [followUp, setFollowUp] = useState(false)
  const [booked, setBooked] = useState<string>()

  const a = appointments.find((x) => x.id === id)
  if (!a) return null
  const patient = patients.find((p) => p.id === a.patientId)
  const status = displayStatus(a, clock)
  const minutes = minutesUntil(clock, a)
  const isToday = a.date === clock.date
  const age = patient ? ageOf(patient.birthDate, clock.date) : undefined
  const doctorCodes = doctor.languages.map((l) => l.code)
  const shared = patient ? patient.languages.filter((c) => doctorCodes.includes(c)) : []
  // Prefer showing a shared language other than German: that is what makes the visit work
  const sharedNames = f.languageList(shared.filter((c) => c !== 'DE').length ? shared.filter((c) => c !== 'DE') : shared)
  const history = appointments.filter(
    (x) => x.patientId === a.patientId && x.doctorId === a.doctorId && x.id !== a.id && displayStatus(x, clock) === 'done',
  )
  const suggestions = availability(a.doctorId, appointments)
    .filter((d) => d.date >= addDays(clock.date, FOLLOW_UP_AFTER_DAYS))
    .flatMap((d) => d.times.map((time) => ({ date: d.date, time })))
    .slice(0, 6)

  const footer: ReactNode =
    status === 'inProgress' ? (
      <Button size="lg" fullWidth icon={CircleCheck} onClick={() => (completeVisit(a.id), setFollowUp(true))}>
        {tb.done}
      </Button>
    ) : status === 'confirmed' || status === 'checkedIn' ? (
      isToday && (
        <div className="space-y-2">
          <Button size="lg" fullWidth icon={Play} onClick={() => startVisit(a.id)}>
            {tb.start}
          </Button>
          {status === 'confirmed' && (
            <Button
              variant="plain"
              fullWidth
              icon={UserX}
              disabled={minutes > -NO_SHOW_AFTER}
              onClick={() => markNoShow(a.id)}
            >
              {tb.noShow}
            </Button>
          )}
          {status === 'confirmed' && minutes > -NO_SHOW_AFTER && (
            <p className="text-center text-footnote text-muted">{tb.noShowHint}</p>
          )}
        </div>
      )
    ) : status === 'done' ? (
      <Button size="lg" variant="secondary" fullWidth icon={CalendarPlus} onClick={() => setFollowUp(true)}>
        {tb.followUp}
      </Button>
    ) : null

  return (
    <Screen push footer={footer || undefined}>
      <NavBar title={tb.title} backLabel={t.common.back} onBack={() => navigate('/day', { state: BACK })} />

      <header className="flex items-center gap-4 px-4 pt-3">
        <Avatar name={patient?.name ?? ''} size="xl" />
        <div className="min-w-0">
          <h1 className="font-display text-[26px] leading-8 font-bold text-balance text-ink">{patient?.name}</h1>
          <p className="text-subheadline text-muted">
            {age !== undefined && `${tb.age(age)} · `}
            {a.firstVisit ? tb.newPatient : tb.returning}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <StatusBadge status={status} label={t.status[status]} />
            {a.filledFromWaitlist && <StatusBadge status="filledFromWaitlist" label={t.common.filledFromWaitlist} />}
          </div>
        </div>
      </header>

      <div className="space-y-4 px-4 pt-5">
        {a.lateBy && status === 'confirmed' && <Banner tone="warn" icon={Clock} title={tb.late(a.lateBy)} />}
        {booked && <Banner tone="ok" icon={CalendarPlus} title={tb.followUpBooked(booked)} />}
        {status === 'done' && !booked && <Banner tone="ok" title={tb.finished} />}

        <Card title={tb.visit}>
          <Row label={t.patient.booking.summaryWhen}>
            <span className="tabular-nums">
              {f.day(a.date)}, {a.time}
            </span>
          </Row>
          <Row label={t.patient.booking.summaryVisit}>{t.visitType[a.visitType]}</Row>
          <Row label={tb.reason}>{a.reason ?? <span className="text-muted">{tb.noReason}</span>}</Row>
        </Card>

        <Card title={tb.languages}>
          <div className="space-y-2.5 py-3">
            {patient && (
              <LanguageChips
                languages={patient.languages.map((code) => ({ code, level: 'fluent' as const }))}
                names={f.languageNames}
                matched={shared}
                prefix={t.common.speaks}
              />
            )}
            <p className="flex items-start gap-2 text-subheadline text-ink">
              <Languages aria-hidden size={18} className={shared.length ? 'text-brand' : 'text-warn-text'} />
              {shared.length ? tb.shared(sharedNames) : tb.noShared}
            </p>
          </div>
        </Card>

        <Card title={tb.insurance}>
          <Row label={tb.insurance}>
            {patient?.insurance === 'private' ? t.common.private : t.common.public} · {patient?.insurer}
          </Row>
          <Row label={tb.history}>
            {history.length ? tb.visits(history.length) : tb.newPatient}
            {history[0] && <span className="block text-subheadline text-muted">{tb.lastVisit(f.date(history[0].date))}</span>}
          </Row>
        </Card>
      </div>

      <Sheet open={followUp} onClose={() => setFollowUp(false)} title={tb.followUpTitle} closeLabel={t.common.close}>
        <p className="pb-4 text-subheadline text-muted">{tb.followUpLead(patient?.name ?? '')}</p>
        <div className="grid grid-cols-2 gap-2">
          {suggestions.map((s) => (
            <SlotChip
              key={`${s.date}${s.time}`}
              time={`${f.day(s.date)} ${s.time}`}
              label={tb.followUpBooked(`${f.day(s.date)} ${s.time}`)}
              onSelect={() => {
                phoneBook({ patientId: a.patientId, doctorId: a.doctorId, date: s.date, time: s.time, visitType: 'followUp' })
                setBooked(`${f.day(s.date)} ${s.time}`)
                setFollowUp(false)
              }}
            />
          ))}
        </div>
        <Button variant="plain" fullWidth className="mt-4" onClick={() => setFollowUp(false)}>
          {tb.followUpSkip}
        </Button>
      </Sheet>
    </Screen>
  )
}

const Card = ({ title, children }: { title: string; children: ReactNode }) => (
  <section>
    <h2 className="px-1 pb-1.5 text-footnote font-semibold text-muted">{title}</h2>
    <div className="divide-y divide-line rounded-card bg-surface px-4 shadow-card">{children}</div>
  </section>
)

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex min-h-11 items-center justify-between gap-4 py-2.5">
    <span className="shrink-0 text-subheadline text-muted">{label}</span>
    <span className="text-right text-subheadline text-ink">{children}</span>
  </div>
)
