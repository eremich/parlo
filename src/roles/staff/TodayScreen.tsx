import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '../../components/Button'
import { displayStatus } from '../../data/background'
import { doctorById, practiceById } from '../../data/doctors'
import { freeTimes } from '../../data/schedule'
import { useT } from '../../i18n'
import { useFormat } from '../../i18n/useFormat'
import { NeedsAttention, type AttentionItem } from '../../patterns/NeedsAttention'
import { useApp } from '../../store/app'
import { affectedBy, isPracticeAppointment, PRACTICE_DOCTORS } from './practice'
import { PracticeCalendar } from './PracticeCalendar'
import { useStaffUi } from './StaffUi'

const MAX_REQUESTS = 3

export const TodayScreen = () => {
  const t = useT()
  const tt = t.staff.today
  const f = useFormat()
  const ui = useStaffUi()
  const clock = useApp((s) => s.clock)

  // Today always opens on the current day
  useEffect(() => {
    ui.setDate(clock.date)
  }, [clock.date])

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-page-title font-semibold text-ink">{tt.title}</h1>
          <p className="mt-0.5 text-web-body text-muted">
            {f.date(clock.date)} · {practiceById(PRACTICE_DOCTORS[0].practiceId).name}
          </p>
        </div>
        <Button icon={Plus} onClick={() => ui.open({ kind: 'booking', date: clock.date })}>
          {tt.newBooking}
          <kbd className="ml-1 rounded-[4px] bg-on-brand/15 px-1.5 text-label font-semibold">N</kbd>
        </Button>
      </header>

      <Attention />
      <Kpis />
      <PracticeCalendar />
    </div>
  )
}

/** What reception must do now, most urgent first: conflicts, late patients, waitlist (it has a timer), requests. */
const Attention = () => {
  const t = useT()
  const ta = t.staff.attention
  const f = useFormat()
  const ui = useStaffUi()
  const navigate = useNavigate()
  const clock = useApp((s) => s.clock)
  const appointments = useApp((s) => s.appointments)
  const patients = useApp((s) => s.patients)
  const offers = useApp((s) => s.offers)
  const blocks = useApp((s) => s.blocks)
  const acknowledgeLate = useApp((s) => s.acknowledgeLate)
  const delays = useApp((s) => s.delays)
  const [nowMs, setNowMs] = useState(() => Date.now())

  // Waitlist countdowns tick while an offer is open
  const hasOpenOffer = offers.some((o) => o.status === 'open')
  useEffect(() => {
    if (!hasOpenOffer) return
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [hasOpenOffer])

  const nameOf = (patientId: string) => patients.find((p) => p.id === patientId)?.name ?? '—'
  const short = (patientId: string) => {
    const [first, last] = nameOf(patientId).split(' ')
    return `${first} ${last?.[0] ?? ''}.`
  }
  const inPractice = (doctorId: string) => PRACTICE_DOCTORS.some((d) => d.id === doctorId)
  const when = (date: string, time: string) => `${f.day(date)} ${time}`
  const show = (appointmentId: string, date: string) => {
    ui.focus(appointmentId, date)
    navigate('/calendar')
  }

  const items: AttentionItem[] = []

  for (const block of blocks.filter((b) => !b.resolved && inPractice(b.doctorId))) {
    const affected = affectedBy(block, appointments)
    if (!affected.length) continue
    items.push({
      id: block.id,
      kind: 'conflict',
      title: ta.conflict(doctorById(block.doctorId).name, `${f.day(block.date)} ${block.start}–${block.end}`),
      detail: ta.conflictDetail(affected.length),
      actionLabel: ta.resolve,
      onAction: () => ui.open({ kind: 'conflict', blockId: block.id }),
    })
  }

  // A doctor running behind: patients were told; reception only needs to know
  for (const d of PRACTICE_DOCTORS.filter((doc) => (delays[doc.id] ?? 0) > 0)) {
    const waiting = appointments.filter(
      (a) =>
        a.doctorId === d.id &&
        a.date === clock.date &&
        a.time >= clock.time &&
        ['confirmed', 'checkedIn'].includes(displayStatus(a, clock)),
    ).length
    items.push({ id: `behind-${d.id}`, kind: 'late', title: ta.behind(d.name, delays[d.id]), detail: ta.behindDetail(waiting) })
  }

  for (const a of appointments.filter(
    (x) => x.lateBy && !x.lateAcknowledged && x.status === 'confirmed' && x.date === clock.date && inPractice(x.doctorId),
  )) {
    const doctor = doctorById(a.doctorId).name
    items.push({
      id: `late-${a.id}`,
      kind: 'late',
      title: ta.late(nameOf(a.patientId), a.lateBy ?? 0),
      detail: ta.lateDetail(a.time, doctor),
      actionLabel: ta.notify(doctor),
      onAction: () => {
        acknowledgeLate(a.id)
        ui.toast(t.staff.toast.notified(doctor))
      },
    })
  }

  for (const o of offers.filter((x) => inPractice(x.doctorId) && (x.status === 'open' || x.status === 'accepted'))) {
    const freedBy = appointments.find((a) => a.id === o.freedBy)
    if (o.status === 'open') {
      const left = Math.max(0, o.expiresAt - nowMs)
      const mm = String(Math.floor(left / 60_000)).padStart(2, '0')
      const ss = String(Math.floor((left % 60_000) / 1000)).padStart(2, '0')
      items.push({
        id: o.id,
        kind: 'waitlist',
        title: ta.offering(when(o.date, o.time)),
        detail: ta.offeringDetail(freedBy ? short(freedBy.patientId) : '—', short(o.patientId), `${mm}:${ss}`),
        actionLabel: ta.viewCalendar,
        onAction: () => freedBy && show(freedBy.id, o.date),
      })
    } else {
      const filled = appointments.find(
        (a) => a.filledFromWaitlist && a.doctorId === o.doctorId && a.date === o.date && a.time === o.time && a.status !== 'cancelled',
      )
      if (filled)
        items.push({
          id: o.id,
          kind: 'waitlist',
          title: ta.filled(when(o.date, o.time)),
          detail: ta.filledDetail(nameOf(o.patientId)),
          actionLabel: ta.viewCalendar,
          onAction: () => show(filled.id, o.date),
        })
    }
  }

  const requests = appointments
    .filter((a) => isPracticeAppointment(a) && displayStatus(a, clock) === 'pending' && a.date >= clock.date)
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  for (const a of requests.slice(0, MAX_REQUESTS)) {
    const patient = patients.find((p) => p.id === a.patientId)
    items.push({
      id: `req-${a.id}`,
      kind: 'request',
      title: ta.request(nameOf(a.patientId), when(a.date, a.time)),
      detail: ta.requestDetail(
        a.firstVisit ? t.visitType.new : t.visitType[a.visitType],
        patient?.insurance === 'private' ? t.common.private : t.common.public,
      ),
      actionLabel: ta.review,
      onAction: () => ui.open({ kind: 'appointment', id: a.id }),
    })
  }

  return (
    <NeedsAttention
      items={items}
      title={ta.title}
      emptyTitle={ta.emptyTitle}
      emptyDetail={ta.emptyDetail}
      moreLabel={requests.length > MAX_REQUESTS ? ta.moreRequests(requests.length - MAX_REQUESTS) : undefined}
    />
  )
}

/** The day at a glance: four facts, not a dashboard of vanity numbers. */
const Kpis = () => {
  const t = useT()
  const tt = t.staff.today
  const ui = useStaffUi()
  const clock = useApp((s) => s.clock)
  const appointments = useApp((s) => s.appointments)

  const day = appointments.filter((a) => isPracticeAppointment(a) && a.date === ui.date)
  const statuses = day.map((a) => displayStatus(a, clock))
  const live = statuses.filter((s) => s !== 'cancelled' && s !== 'declined')
  const facts = [
    { label: tt.appointments, value: live.length },
    { label: tt.arrived, value: statuses.filter((s) => s === 'checkedIn' || s === 'inProgress' || s === 'done').length },
    { label: tt.noShows, value: statuses.filter((s) => s === 'noShow').length },
    {
      label: tt.freeSlots,
      value: PRACTICE_DOCTORS.reduce((sum, d) => sum + freeTimes(d.id, ui.date, appointments).length, 0),
    },
  ]

  return (
    <dl className="grid grid-cols-4 divide-x divide-line rounded-card bg-surface shadow-card">
      {facts.map((fact) => (
        <div key={fact.label} className="px-5 py-4">
          <dt className="text-meta text-muted">{fact.label}</dt>
          <dd className="mt-0.5 text-page-title font-semibold text-ink tabular-nums">{fact.value}</dd>
        </div>
      ))}
    </dl>
  )
}
