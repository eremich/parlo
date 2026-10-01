import {
  Accessibility,
  ArrowUpToLine,
  CalendarClock,
  Clock,
  CreditCard,
  DoorOpen,
  MapPin,
  Navigation,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { Avatar } from '../../components/Avatar'
import { Banner } from '../../components/Banner'
import { Button } from '../../components/Button'
import { Chip } from '../../components/Chip'
import { ListGroup, ListRow } from '../../components/List'
import { NavBar } from '../../components/NavBar'
import { Screen } from '../../components/Screen'
import { BACK } from '../../components/StackRoutes'
import { Segmented } from '../../components/Segmented'
import { Sheet } from '../../components/Sheet'
import { doctorById, practiceById } from '../../data/doctors'
import type { Appointment } from '../../data/types'
import { useT } from '../../i18n'
import { useFormat } from '../../i18n/useFormat'
import { addDays } from '../../lib/format'
import { EarliestSlot } from '../../patterns/EarliestSlot'
import { StatusBadge } from '../../patterns/StatusBadge'
import { minutesUntil, useApp, useCurrentPatient } from '../../store/app'

const DAY = 24 * 60
const LATE_OPTIONS = [10, 20]

export const AppointmentScreen = () => {
  const { id } = useParams()
  const location = useLocation()
  const state = (location.state ?? {}) as { cancel?: boolean; moved?: boolean; movedTo?: string }
  const t = useT()
  const td = t.patient.detail
  const f = useFormat()
  const navigate = useNavigate()
  const patient = useCurrentPatient()
  const clock = useApp((s) => s.clock)
  const appointment = useApp((s) => s.appointments.find((a) => a.id === id))
  const waiting = useApp((s) => s.waitlist.find((w) => w.appointmentId === id))
  const patients = useApp((s) => s.patients)
  const checkIn = useApp((s) => s.checkIn)
  const leaveWaitlist = useApp((s) => s.leaveWaitlist)
  const delays = useApp((s) => s.delays)
  const [sheet, setSheet] = useState<'cancel' | 'late' | 'waitlist' | null>(state.cancel ? 'cancel' : null)

  if (!appointment) return null
  const doctor = doctorById(appointment.doctorId)
  const practice = practiceById(doctor.practiceId)
  const minutes = minutesUntil(clock, appointment)
  const live = appointment.status === 'confirmed' || appointment.status === 'pending'
  const isToday = appointment.date === clock.date
  const canCheckIn = appointment.status === 'confirmed' && isToday && minutes <= 30 && minutes >= -15
  const canReportLate = appointment.status === 'confirmed' && isToday && minutes > -10
  const canChange = live && minutes > 0
  const who = patients.find((p) => p.id === appointment.patientId)

  return (
    <Screen push>
      <NavBar title={td.title} backLabel={t.common.back} onBack={() => navigate('/appointments', { state: BACK })} />

      <div className="space-y-4 px-4 pt-3">
        <div className="rounded-card bg-surface p-4 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <EarliestSlot day={f.day(appointment.date)} time={appointment.time} />
            <StatusBadge status={appointment.status} label={t.status[appointment.status]} />
          </div>
          <div className="mt-3 flex items-center gap-3 border-t border-line pt-3">
            <Avatar name={doctor.name} src={doctor.photo} />
            <div className="min-w-0">
              <p className="text-headline text-ink">{doctor.name}</p>
              <p className="text-subheadline text-muted">
                {t.specialty[doctor.specialty]} · {t.visitType[appointment.visitType]}
                {who && who.id !== patient?.id && ` · ${who.name.split(' ')[0]}`}
              </p>
            </div>
          </div>
          {(appointment.filledFromWaitlist || appointment.lateBy) && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {appointment.filledFromWaitlist && <StatusBadge status="filledFromWaitlist" label={t.common.filledFromWaitlist} />}
              {appointment.lateBy && (
                <StatusBadge status="runningLate" label={t.patient.late.option(appointment.lateBy)} />
              )}
            </div>
          )}
        </div>

        {state.moved && (
          <Banner tone="ok" title={t.patient.appointments.offerTaken(`${f.day(appointment.date)} ${appointment.time}`)} />
        )}
        {state.movedTo && <Banner tone="ok" title={t.patient.reschedule.move(state.movedTo)} />}
        {appointment.status === 'pending' && <Banner tone="warn" title={t.patient.appointments.pendingNote} />}
        {appointment.status === 'cancelled' && <Banner tone="error" title={td.cancelledNote} />}
        {appointment.status === 'done' && <Banner tone="ok" title={td.doneNote} />}
        {appointment.status === 'checkedIn' && <Banner tone="ok" icon={DoorOpen} title={td.checkedIn} />}
        {isToday && (delays[appointment.doctorId] ?? 0) > 0 && (appointment.status === 'confirmed' || appointment.status === 'checkedIn') && (
          <Banner tone="warn" icon={Clock} title={td.delay(doctor.name, delays[appointment.doctorId])} />
        )}
        {appointment.lateBy && appointment.status === 'confirmed' && (
          <Banner tone="warn" icon={Clock} title={td.lateSent(appointment.lateBy)} />
        )}

        {canCheckIn && (
          <div className="rounded-card bg-surface p-4 shadow-card">
            <Button size="lg" fullWidth icon={DoorOpen} onClick={() => checkIn(appointment.id)}>
              {td.checkIn}
            </Button>
            <p className="mt-2 text-center text-footnote text-muted">{td.checkInHint}</p>
          </div>
        )}

        {appointment.firstVisit && live && <Banner tone="info" icon={CreditCard} title={t.patient.booked.cardTitle}>{t.patient.booked.cardBody}</Banner>}
      </div>

      <div className="space-y-6 pt-6">
        {(canReportLate || canChange || waiting) && (
          <ListGroup>
            {canReportLate && (
              <ListRow icon={Clock} title={td.runningLate} subtitle={td.runningLateHint} onClick={() => setSheet('late')} />
            )}
            {canChange && (
              <ListRow
                icon={CalendarClock}
                title={td.reschedule}
                onClick={() => navigate(`/appointment/${appointment.id}/reschedule`)}
              />
            )}
            {waiting ? (
              <ListRow
                icon={ArrowUpToLine}
                title={td.onWaitlist(f.date(waiting.before))}
                trailing={
                  <Button variant="plain" onClick={() => leaveWaitlist(waiting.id)}>
                    {td.leaveWaitlist}
                  </Button>
                }
              />
            ) : (
              canChange &&
              appointment.status === 'confirmed' &&
              minutes > DAY && (
                <ListRow
                  icon={ArrowUpToLine}
                  title={td.joinWaitlist}
                  subtitle={td.joinWaitlistHint}
                  onClick={() => setSheet('waitlist')}
                />
              )
            )}
          </ListGroup>
        )}

        <ListGroup title={td.where}>
          <ListRow icon={MapPin} title={practice.name} subtitle={`${practice.street}, ${practice.district}`} />
          {practice.stepFree && <ListRow icon={Accessibility} title={t.common.stepFree} />}
          <ListRow
            icon={Navigation}
            title={t.patient.booked.directions}
            onClick={() =>
              window.open(
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${practice.street}, Berlin`)}`,
                '_blank',
                'noreferrer',
              )
            }
          />
        </ListGroup>

        {appointment.reason && (
          <ListGroup title={td.reason}>
            <ListRow title={appointment.reason} />
          </ListGroup>
        )}

        {canChange && (
          <ListGroup>
            <ListRow icon={Trash2} title={td.cancel} destructive onClick={() => setSheet('cancel')} />
          </ListGroup>
        )}
      </div>

      <CancelSheet open={sheet === 'cancel'} appointment={appointment} onClose={() => setSheet(null)} />
      <LateSheet open={sheet === 'late'} appointment={appointment} onClose={() => setSheet(null)} />
      <WaitlistSheet open={sheet === 'waitlist'} appointment={appointment} onClose={() => setSheet(null)} />
    </Screen>
  )
}

type SheetProps = { open: boolean; appointment: Appointment; onClose: () => void }

const CancelSheet = ({ open, appointment, onClose }: SheetProps) => {
  const t = useT()
  const tc = t.patient.cancel
  const f = useFormat()
  const navigate = useNavigate()
  const clock = useApp((s) => s.clock)
  const cancel = useApp((s) => s.cancel)
  const late = minutesUntil(clock, appointment) < DAY
  const deadline = `${f.date(addDays(appointment.date, -1))}, ${appointment.time}`

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={tc.title}
      detent="medium"
      closeLabel={t.common.close}
      footer={
        <div className="flex flex-col gap-2">
          <Button
            size="lg"
            variant="destructive"
            fullWidth
            onClick={() => {
              cancel(appointment.id)
              onClose()
              navigate('/appointments', { replace: true })
            }}
          >
            {tc.confirm}
          </Button>
          <Button variant="plain" fullWidth onClick={onClose}>
            {tc.keep}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {late ? <Banner tone="warn" title={tc.late} /> : <p className="text-body text-ink">{tc.free(deadline)}</p>}
        <p className="text-subheadline text-muted">{tc.releaseNote}</p>
      </div>
    </Sheet>
  )
}

const LateSheet = ({ open, appointment, onClose }: SheetProps) => {
  const t = useT()
  const reportLate = useApp((s) => s.reportLate)
  return (
    <Sheet open={open} onClose={onClose} title={t.patient.late.title} detent="medium" closeLabel={t.common.close}>
      <p className="pb-4 text-subheadline text-muted">{t.patient.late.lead}</p>
      <div className="space-y-2">
        {LATE_OPTIONS.map((min) => (
          <Button
            key={min}
            size="lg"
            variant={appointment.lateBy === min ? 'primary' : 'secondary'}
            fullWidth
            onClick={() => {
              reportLate(appointment.id, min)
              onClose()
            }}
          >
            {t.patient.late.option(min)}
          </Button>
        ))}
      </div>
    </Sheet>
  )
}

type HowEarly = 'any' | 'within3' | 'week'
const WEEKDAYS = [1, 2, 3, 4, 5]

const WaitlistSheet = ({ open, appointment, onClose }: SheetProps) => {
  const t = useT()
  const tw = t.patient.waitlist
  const f = useFormat()
  const today = useApp((s) => s.clock.date)
  const joinWaitlist = useApp((s) => s.joinWaitlist)
  const [how, setHow] = useState<HowEarly>('any')
  const [days, setDays] = useState<number[]>(WEEKDAYS)
  const doctor = doctorById(appointment.doctorId)

  // Friday of this week, for "this week"
  const weekday = new Date(`${today}T12:00:00Z`).getUTCDay()
  const friday = addDays(today, Math.max(0, 5 - weekday))
  const limit = { any: appointment.date, within3: addDays(today, 3), week: friday }[how]
  const before = limit < appointment.date ? addDays(limit, 1) : appointment.date

  // A reference week (Mon 16 – Fri 20 Mar 2026) gives localized weekday names
  const weekdayName = (n: number) => f.weekday(addDays('2026-03-15', n))

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={tw.title}
      closeLabel={t.common.close}
      footer={
        <Button
          size="lg"
          fullWidth
          disabled={days.length === 0}
          onClick={() => {
            joinWaitlist({
              patientId: appointment.patientId,
              doctorId: appointment.doctorId,
              appointmentId: appointment.id,
              before,
              days,
            })
            onClose()
          }}
        >
          {tw.join}
        </Button>
      }
    >
      <p className="text-body text-pretty text-ink">
        {tw.lead(doctor.name, `${f.date(appointment.date)} ${appointment.time}`)}
      </p>
      <h3 className="pt-6 pb-2 text-headline text-ink">{tw.how}</h3>
      <Segmented<HowEarly>
        label={tw.how}
        fullWidth
        value={how}
        onChange={setHow}
        options={[
          { value: 'any', label: tw.anyEarlier },
          { value: 'within3', label: tw.within3 },
          { value: 'week', label: tw.thisWeek },
        ]}
      />
      <h3 className="pt-6 pb-2 text-headline text-ink">{tw.days}</h3>
      <div className="flex flex-wrap gap-2">
        {WEEKDAYS.map((d) => (
          <Chip
            key={d}
            selected={days.includes(d)}
            onPressedChange={(on) => setDays(on ? [...days, d].sort() : days.filter((x) => x !== d))}
          >
            {weekdayName(d)}
          </Chip>
        ))}
      </div>
      <p className="pt-6 text-footnote text-muted">{tw.rule}</p>
    </Sheet>
  )
}
