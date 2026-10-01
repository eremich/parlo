import { BellRing, CalendarDays, ChevronRight, CircleCheck, Star, Timer } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { Avatar } from '../../components/Avatar'
import { Button } from '../../components/Button'
import { LargeTitle } from '../../components/LargeTitle'
import { Screen } from '../../components/Screen'
import { Segmented } from '../../components/Segmented'
import { cx } from '../../lib/cx'
import { addDays } from '../../lib/format'
import { doctorById, practiceById } from '../../data/doctors'
import type { Appointment, Offer } from '../../data/types'
import { useT } from '../../i18n'
import { useFormat } from '../../i18n/useFormat'
import { OfferCard } from '../../patterns/OfferCard'
import { StatusBadge } from '../../patterns/StatusBadge'
import { useApp, useCurrentPatient, useHousehold } from '../../store/app'
import { OfflineBanner } from './OfflineBanner'
import { useOfferCountdown } from './useOffer'

const isUpcoming = (a: Appointment, today: string) =>
  a.date >= today && ['confirmed', 'pending', 'checkedIn', 'inProgress', 'declined'].includes(a.status)

/** Upcoming and past visits for the patient and their family, with anything that needs a decision on top. */
export const AppointmentsScreen = () => {
  const t = useT()
  const ta = t.patient.appointments
  const navigate = useNavigate()
  const patient = useCurrentPatient()
  const household = useHousehold()
  const all = useApp((s) => s.appointments)
  const offers = useApp((s) => s.offers)
  const today = useApp((s) => s.clock.date)
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')

  const ids = household.map((p) => p.id)
  const mine = all.filter((a) => ids.includes(a.patientId))
  const upcoming = mine
    .filter((a) => isUpcoming(a, today))
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  const past = mine
    .filter((a) => !isUpcoming(a, today) && a.status !== 'cancelled')
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))
  const list = tab === 'upcoming' ? upcoming : past

  const myOffers = offers.filter(
    (o) => patient && o.patientId === patient.id && (o.status === 'open' || o.status === 'expired'),
  )
  const reminders = upcoming.filter((a) => a.date === addDays(today, 1) && a.status === 'confirmed')
  const declined = upcoming.filter((a) => a.status === 'declined' && a.alternatives?.length)
  const toReview = past.filter((a) => a.status === 'done' && !a.reviewed).slice(0, 1)

  return (
    <Screen tabBar>
      <LargeTitle>{t.patient.tabs.appointments}</LargeTitle>
      <div className="px-4 pt-2 pb-4">
        <Segmented
          label={t.patient.tabs.appointments}
          fullWidth
          value={tab}
          onChange={setTab}
          options={[
            { value: 'upcoming', label: ta.upcoming },
            { value: 'past', label: ta.past },
          ]}
        />
      </div>

      <OfflineBanner />

      {tab === 'upcoming' && (myOffers.length > 0 || declined.length > 0) && (
        <div className="space-y-3 px-4 pb-4">
          {myOffers.map((offer) => (
            <OfferBlock key={offer.id} offer={offer} />
          ))}
          {declined.map((a) => (
            <DeclinedCard key={a.id} appointment={a} />
          ))}
        </div>
      )}

      {tab === 'past' && toReview.map((a) => <ReviewPrompt key={a.id} appointment={a} />)}

      {list.length === 0 ? (
        <div className="flex flex-col items-center px-8 pt-10 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-surface text-muted shadow-card">
            <CalendarDays aria-hidden size={26} />
          </span>
          <h2 className="mt-4 text-title2 font-semibold text-ink">{tab === 'upcoming' ? ta.empty : ta.emptyPast}</h2>
          {tab === 'upcoming' && (
            <>
              <p className="mt-2 text-body text-pretty text-muted">{ta.emptyLead}</p>
              <Button size="lg" className="mt-6" onClick={() => navigate('/search')}>
                {ta.findDoctor}
              </Button>
            </>
          )}
        </div>
      ) : (
        <ul className="space-y-3 px-4">
          {list.map((a) => (
            <li key={a.id}>
              <AppointmentCard
                appointment={a}
                onOpen={() => navigate(`/appointment/${a.id}`)}
                footer={tab === 'upcoming' && reminders.includes(a) ? <ReminderPrompt appointment={a} /> : undefined}
              />
            </li>
          ))}
        </ul>
      )}
    </Screen>
  )
}

export type AppointmentCardProps = {
  appointment: Appointment
  onOpen: () => void
  /** Inline question under the card, e.g. the day-before "Are you coming?" */
  footer?: ReactNode
}

export const AppointmentCard = ({ appointment: a, onOpen, footer }: AppointmentCardProps) => {
  const t = useT()
  const f = useFormat()
  const patient = useCurrentPatient()
  const patients = useApp((s) => s.patients)
  const waiting = useApp((s) => s.waitlist.some((w) => w.appointmentId === a.id))
  const doctor = doctorById(a.doctorId)
  const who = patients.find((p) => p.id === a.patientId)

  const card = (
    <button
      type="button"
      onClick={onOpen}
      className={cx(
        'w-full p-4 text-left transition-transform duration-150 ease-out',
        footer ? 'rounded-t-card active:bg-canvas/60' : 'rounded-card bg-surface shadow-card active:scale-[0.99]',
      )}
    >
      <span className="flex items-start justify-between gap-3">
        <span className="text-headline text-ink">
          {f.day(a.date)} · <span className="tabular-nums">{a.time}</span>
        </span>
        <StatusBadge status={a.status} label={t.status[a.status]} />
      </span>
      <span className="mt-3 flex items-center gap-3">
        <Avatar name={doctor.name} src={doctor.photo} size="sm" />
        <span className="min-w-0 flex-1">
          <span className="block text-subheadline font-semibold text-ink">{doctor.name}</span>
          <span className="block truncate text-subheadline text-muted">
            {practiceById(doctor.practiceId).name}
            {who && who.id !== patient?.id && ` · ${who.name.split(' ')[0]}`}
          </span>
        </span>
        <ChevronRight aria-hidden size={18} className="shrink-0 text-muted/70" />
      </span>
      {(waiting || a.filledFromWaitlist || a.lateBy) && (
        <span className="mt-3 flex flex-wrap gap-1.5">
          {waiting && <StatusBadge status="waitlist" label={t.patient.appointments.onWaitlist} />}
          {a.filledFromWaitlist && <StatusBadge status="filledFromWaitlist" label={t.common.filledFromWaitlist} />}
          {a.lateBy && <StatusBadge status="runningLate" label={t.patient.late.option(a.lateBy)} />}
        </span>
      )}
    </button>
  )

  if (!footer) return card
  return (
    <div className="rounded-card bg-surface shadow-card">
      {card}
      <div className="border-t border-line px-4 pt-3 pb-4">{footer}</div>
    </div>
  )
}

export const OfferBlock = ({ offer }: { offer: Offer }) => {
  const t = useT()
  const ta = t.patient.appointments
  const f = useFormat()
  const navigate = useNavigate()
  const acceptOffer = useApp((s) => s.acceptOffer)
  const declineOffer = useApp((s) => s.declineOffer)
  const waitlist = useApp((s) => s.waitlist)
  const appointments = useApp((s) => s.appointments)
  const entry = waitlist.find((w) => w.id === offer.waitlistId)
  const current = appointments.find((a) => a.id === entry?.appointmentId)
  const countdown = useOfferCountdown(offer)
  const doctor = doctorById(offer.doctorId)
  const when = `${f.day(offer.date)} ${offer.time}`
  const currentWhen = current ? `${f.date(current.date)} ${current.time}` : ''

  return (
    <OfferCard
      title={ta.offerTitle(when, doctor.name)}
      question={ta.offerQuestion}
      remaining={ta.offerLeft(countdown.label)}
      progress={countdown.progress}
      note={ta.offerReleases(currentWhen)}
      takeLabel={ta.offerTake(when)}
      keepLabel={ta.offerKeep(currentWhen)}
      onTake={() => {
        const moved = acceptOffer(offer.id)
        if (moved) navigate(`/appointment/${moved.id}`, { state: { moved: true } })
      }}
      onKeep={() => declineOffer(offer.id)}
      expired={offer.status === 'expired' ? { title: ta.offerExpired, body: ta.offerExpiredBody } : undefined}
    />
  )
}

/** The day-before check, inside the appointment's own card: one clear yes, a quiet way out. */
export const ReminderPrompt = ({ appointment: a }: { appointment: Appointment }) => {
  const t = useT()
  const ta = t.patient.appointments
  const navigate = useNavigate()
  const confirmReminder = useApp((s) => s.confirmReminder)

  if (a.confirmedByPatient)
    return (
      <p className="flex items-center gap-1.5 text-subheadline font-medium text-ok-text">
        <CircleCheck aria-hidden size={18} className="shrink-0" />
        {ta.reminderConfirmed}
      </p>
    )

  return (
    <div>
      <p className="flex items-center gap-1.5 text-subheadline text-ink">
        <BellRing aria-hidden size={18} className="shrink-0 text-accent-text" />
        {ta.reminderQuestion}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <Button className="flex-1" onClick={() => confirmReminder(a.id)}>
          {ta.reminderConfirm}
        </Button>
        <Button
          variant="plainDestructive"
          onClick={() => navigate(`/appointment/${a.id}`, { state: { cancel: true } })}
        >
          {ta.reminderCancel}
        </Button>
      </div>
    </div>
  )
}

const DeclinedCard = ({ appointment: a }: { appointment: Appointment }) => {
  const t = useT()
  const ta = t.patient.appointments
  const f = useFormat()
  const acceptAlternative = useApp((s) => s.acceptAlternative)
  const doctor = doctorById(a.doctorId)
  return (
    <div className="rounded-card bg-surface p-4 shadow-card">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-warn-soft text-warn-text">
          <Timer aria-hidden size={20} />
        </span>
        <div className="min-w-0">
          <p className="text-headline text-pretty text-ink">{ta.declinedTitle(doctor.name)}</p>
          <p className="text-subheadline text-muted">{ta.declinedBody}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {a.alternatives?.map((alt) => (
          <Button
            key={`${alt.date}${alt.time}`}
            variant="secondary"
            onClick={() => acceptAlternative(a.id, alt.date, alt.time)}
          >
            {ta.takeAlternative(`${f.day(alt.date)}, ${alt.time}`)}
          </Button>
        ))}
      </div>
    </div>
  )
}

const ReviewPrompt = ({ appointment: a }: { appointment: Appointment }) => {
  const t = useT()
  const navigate = useNavigate()
  const doctor = doctorById(a.doctorId)
  return (
    <div className="px-4 pb-4">
      <button
        type="button"
        onClick={() => navigate(`/review/${a.id}`)}
        className="flex w-full items-center gap-3 rounded-card bg-surface p-4 text-left shadow-card transition-transform duration-150 ease-out active:scale-[0.99]"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-accent-soft text-accent-text">
          <Star aria-hidden size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-headline text-pretty text-ink">
            {t.patient.appointments.reviewPrompt(doctor.name)}
          </span>
          <span className="block text-subheadline font-semibold text-brand">{t.patient.appointments.reviewAction}</span>
        </span>
        <ChevronRight aria-hidden size={18} className="shrink-0 text-muted/70" />
      </button>
    </div>
  )
}
