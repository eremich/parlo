import { CalendarCheck, CalendarPlus, CircleCheck, CreditCard, Hourglass, Navigation } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Avatar } from '../../components/Avatar'
import { Banner } from '../../components/Banner'
import { Button } from '../../components/Button'
import { Screen } from '../../components/Screen'
import { doctorById, practiceById } from '../../data/doctors'
import { useT } from '../../i18n'
import { useFormat } from '../../i18n/useFormat'
import { cx } from '../../lib/cx'
import { EarliestSlot } from '../../patterns/EarliestSlot'
import { StatusBadge } from '../../patterns/StatusBadge'
import { useApp } from '../../store/app'

export const BookedScreen = () => {
  const { id } = useParams()
  const t = useT()
  const tb = t.patient.booked
  const f = useFormat()
  const navigate = useNavigate()
  const appointment = useApp((s) => s.appointments.find((a) => a.id === id))
  const [added, setAdded] = useState(false)
  if (!appointment) return null

  const doctor = doctorById(appointment.doctorId)
  const practice = practiceById(doctor.practiceId)
  const pending = appointment.status === 'pending'
  const Icon = pending ? Hourglass : CircleCheck

  return (
    <Screen
      footer={
        <Button size="lg" fullWidth onClick={() => navigate('/appointments', { replace: true })}>
          {tb.toAppointments}
        </Button>
      }
    >
      <div className="flex flex-col items-center px-6 pt-24 text-center">
        <span
          className={cx(
            'flex size-20 animate-pop-in items-center justify-center rounded-full',
            pending ? 'bg-warn-soft text-warn-text' : 'bg-ok-soft text-ok-text',
          )}
        >
          <Icon aria-hidden size={40} strokeWidth={1.75} />
        </span>
        <h1 className="mt-5 font-display text-large-title font-bold tracking-[-0.01em] text-ink">
          {pending ? tb.requested : tb.booked}
        </h1>
        <p className="mt-2 max-w-[30ch] text-body text-pretty text-muted">{pending ? tb.requestedLead : tb.bookedLead}</p>
      </div>

      <div className="mx-4 mt-8 rounded-card bg-surface p-4 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <EarliestSlot day={f.day(appointment.date)} time={appointment.time} />
          <StatusBadge status={appointment.status} label={t.status[appointment.status]} />
        </div>
        <div className="mt-3 flex items-center gap-3 border-t border-line pt-3">
          <Avatar name={doctor.name} src={doctor.photo} />
          <div className="min-w-0">
            <p className="text-headline text-ink">{doctor.name}</p>
            <p className="text-subheadline text-muted">
              {practice.name} · {practice.street}
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            icon={added ? CalendarCheck : CalendarPlus}
            aria-pressed={added}
            onClick={() => setAdded(true)}
          >
            {added ? tb.addedToCalendar : tb.addToCalendar}
          </Button>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${practice.street}, Berlin`)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-4 text-subheadline font-semibold text-brand transition-[background-color,transform] duration-150 ease-out hover:bg-brand-soft/60 active:scale-[0.97]"
          >
            <Navigation aria-hidden size={18} className="shrink-0" />
            {tb.directions}
          </a>
        </div>
      </div>

      {appointment.firstVisit && (
        <div className="mx-4 mt-3">
          <Banner tone="info" icon={CreditCard} title={tb.cardTitle}>
            {tb.cardBody}
          </Banner>
        </div>
      )}
    </Screen>
  )
}
