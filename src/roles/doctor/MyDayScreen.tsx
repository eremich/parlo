import { ArrowUpToLine, ChevronRight, Clock, DoorOpen, Lock, Timer } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Avatar } from '../../components/Avatar'
import { Banner } from '../../components/Banner'
import { Button } from '../../components/Button'
import { LargeTitle } from '../../components/LargeTitle'
import { Screen } from '../../components/Screen'
import { Segmented } from '../../components/Segmented'
import { Sheet } from '../../components/Sheet'
import { useT } from '../../i18n'
import { useFormat } from '../../i18n/useFormat'
import { addDays, toMinutes } from '../../lib/format'
import { cx } from '../../lib/cx'
import { LanguageChips } from '../../patterns/LanguageChips'
import { StatusBadge } from '../../patterns/StatusBadge'
import { useApp } from '../../store/app'
import { useShell } from '../../store/shell'
import { DOCTOR_ID, doctor, nextVisit, timeline, type TimelineEntry } from './doctor'

const DELAYS = [10, 20, 30]

/** Timeline of the doctor's day: visits, gaps, blocked time, and the next patient on top. */
export const MyDayScreen = () => {
  const t = useT()
  const td = t.doctor.day
  const f = useFormat()
  const navigate = useNavigate()
  const clock = useApp((s) => s.clock)
  const appointments = useApp((s) => s.appointments)
  const patients = useApp((s) => s.patients)
  const blocks = useApp((s) => s.blocks)
  const delay = useApp((s) => s.delays[DOCTOR_ID] ?? 0)
  const setDelay = useApp((s) => s.setDelay)
  // Before the visit day, the hero scenario opens on tomorrow, where Omar is
  const heroTomorrow = ['hero-filled', 'hero-offer'].includes(useShell.getState().scenario)
  const [which, setWhich] = useState<'today' | 'tomorrow'>(heroTomorrow ? 'tomorrow' : 'today')
  const [sheet, setSheet] = useState(false)

  const date = which === 'today' ? clock.date : addDays(clock.date, 1)
  const entries = useMemo(() => timeline(date, appointments, blocks, clock), [date, appointments, blocks, clock])
  const visits = entries.filter((e): e is Extract<TimelineEntry, { kind: 'visit' }> => e.kind === 'visit')
  const next = nextVisit(entries, clock, date)
  const isToday = date === clock.date
  const nowMinutes = toMinutes(clock.time)
  const waiting = isToday
    ? visits.filter((v) => (v.status === 'confirmed' || v.status === 'checkedIn') && toMinutes(v.appointment.time) >= nowMinutes)
        .length
    : 0
  const nowIndex = isToday ? entries.findIndex((e) => startOf(e) >= nowMinutes) : -1
  const nameOf = (id: string) => patients.find((p) => p.id === id)

  return (
    <Screen tabBar>
      <LargeTitle subtitle={`${f.date(date)} · ${td.summary(visits.length)}`}>{td.title}</LargeTitle>

      <div className="space-y-4 px-4 pt-2">
        <Segmented
          label={td.which}
          fullWidth
          value={which}
          onChange={setWhich}
          options={[
            { value: 'today', label: td.today },
            { value: 'tomorrow', label: td.tomorrow },
          ]}
        />

        {isToday &&
          (delay > 0 ? (
            <Banner
              tone="warn"
              icon={Timer}
              title={td.behindActive(delay)}
              action={
                <Button size="md" variant="secondary" onClick={() => setDelay(DOCTOR_ID, 0)}>
                  {td.backOnTime}
                </Button>
              }
            >
              {td.behindNotified(waiting)}
            </Banner>
          ) : (
            <Button variant="secondary" fullWidth icon={Timer} onClick={() => setSheet(true)}>
              {td.behind}
            </Button>
          ))}

        {next && (
          <NextCard
            entry={next}
            minutes={isToday ? toMinutes(next.appointment.time) - nowMinutes : undefined}
            onOpen={() => navigate(`/brief/${next.appointment.id}`)}
          />
        )}
      </div>

      {visits.length === 0 ? (
        <div className="px-8 pt-12 text-center">
          <p className="text-title2 font-semibold text-ink">{td.nothing}</p>
          <p className="mt-1 text-body text-muted">{td.nothingLead}</p>
        </div>
      ) : (
        <ol className="px-4 pt-6">
          {entries.map((entry, i) => (
            <li key={keyOf(entry)}>
              {i === nowIndex && <NowLine label={`${td.now} ${clock.time}`} />}
              {entry.kind === 'visit' ? (
                <VisitRow
                  entry={entry}
                  name={nameOf(entry.appointment.patientId)?.name ?? '—'}
                  languages={nameOf(entry.appointment.patientId)?.languages ?? []}
                  highlight={entry === next}
                  onOpen={() => navigate(`/brief/${entry.appointment.id}`)}
                />
              ) : entry.kind === 'free' ? (
                <Gap label={td.free(entry.from, entry.to)} time={entry.from} />
              ) : (
                <Gap label={`${td.blocked} · ${entry.block.label}`} time={entry.block.start} blocked />
              )}
            </li>
          ))}
          {isToday && nowIndex === -1 && entries.length > 0 && <NowLine label={`${td.now} ${clock.time}`} />}
        </ol>
      )}

      <Sheet open={sheet} onClose={() => setSheet(false)} title={t.doctor.behind.title} detent="medium" closeLabel={t.common.close}>
        <p className="pb-4 text-subheadline text-muted">{t.doctor.behind.lead}</p>
        <div className="space-y-2">
          {DELAYS.map((m) => (
            <Button
              key={m}
              size="lg"
              variant="secondary"
              fullWidth
              onClick={() => {
                setDelay(DOCTOR_ID, m)
                setSheet(false)
              }}
            >
              {t.doctor.behind.option(m)}
            </Button>
          ))}
        </div>
      </Sheet>
    </Screen>
  )
}

const startOf = (e: TimelineEntry) =>
  toMinutes(e.kind === 'visit' ? e.appointment.time : e.kind === 'free' ? e.from : e.block.start)
const keyOf = (e: TimelineEntry) =>
  e.kind === 'visit' ? e.appointment.id : e.kind === 'free' ? `free-${e.from}` : e.block.id

type VisitEntry = Extract<TimelineEntry, { kind: 'visit' }>

const NextCard = ({ entry, minutes, onOpen }: { entry: VisitEntry; minutes?: number; onOpen: () => void }) => {
  const t = useT()
  const td = t.doctor.day
  const f = useFormat()
  const patient = useApp((s) => s.patients.find((p) => p.id === entry.appointment.patientId))
  const a = entry.appointment
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-card bg-surface p-4 text-left shadow-card ring-2 ring-brand transition-transform duration-150 ease-out active:scale-[0.99]"
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-footnote font-semibold text-brand">{td.next}</span>
        <span className="text-subheadline text-muted tabular-nums">
          {a.time}
          {minutes !== undefined && ` · ${td.inMinutes(minutes)}`}
        </span>
      </span>
      <span className="mt-2 flex items-center gap-3">
        <Avatar name={patient?.name ?? ''} size="lg" />
        <span className="min-w-0 flex-1">
          <span className="block text-title2 font-semibold text-ink">{patient?.name}</span>
          <span className="block text-subheadline text-muted">
            {a.firstVisit ? t.doctor.brief.newPatient : t.doctor.brief.returning}
            {a.visitType !== 'new' && ` · ${t.visitType[a.visitType]}`}
          </span>
        </span>
        <ChevronRight aria-hidden size={20} className="shrink-0 text-muted/70" />
      </span>
      <span className="mt-3 flex flex-wrap items-center gap-1.5">
        {patient && (
          <LanguageChips
            languages={patient.languages.map((code) => ({ code, level: 'fluent' as const }))}
            names={f.languageNames}
            matched={doctor.languages.map((l) => l.code).filter((c) => patient.languages.includes(c))}
            prefix={t.common.speaks}
          />
        )}
        {entry.status !== 'confirmed' && <StatusBadge status={entry.status} label={t.status[entry.status]} />}
        {a.filledFromWaitlist && <StatusBadge status="filledFromWaitlist" label={t.common.filledFromWaitlist} />}
        {a.lateBy && entry.status === 'confirmed' && (
          <StatusBadge status="runningLate" label={t.doctor.brief.late(a.lateBy)} />
        )}
      </span>
      {a.reason && <span className="mt-2.5 block text-subheadline text-ink">“{a.reason}”</span>}
    </button>
  )
}

type VisitRowProps = { entry: VisitEntry; name: string; languages: string[]; highlight: boolean; onOpen: () => void }

const VisitRow = ({ entry, name, languages, highlight, onOpen }: VisitRowProps) => {
  const t = useT()
  const a = entry.appointment
  const past = entry.status === 'done' || entry.status === 'noShow'
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cx(
        'flex w-full items-stretch gap-3 py-1 text-left transition-opacity duration-150 active:opacity-70',
        past && 'opacity-55',
      )}
    >
      <span className="w-12 shrink-0 pt-3 text-subheadline font-semibold text-ink tabular-nums">{a.time}</span>
      <span
        className={cx(
          'min-w-0 flex-1 rounded-card bg-surface px-3.5 py-2.5 shadow-card',
          highlight && 'ring-1 ring-brand',
        )}
      >
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-headline text-ink">{name}</span>
          {entry.status === 'checkedIn' ? (
            <DoorOpen aria-label={t.status.checkedIn} size={18} className="shrink-0 text-ok-text" />
          ) : entry.status !== 'confirmed' ? (
            <StatusBadge status={entry.status} label={t.status[entry.status]} size="sm" />
          ) : null}
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-subheadline text-muted">
          <span>{a.firstVisit ? t.doctor.brief.newPatient : t.visitType[a.visitType]}</span>
          <span aria-hidden>·</span>
          <span className="tracking-wide">{languages.join(' ')}</span>
          {a.filledFromWaitlist && (
            <span className="inline-flex items-center gap-1 font-semibold text-info-text">
              <ArrowUpToLine aria-hidden size={12} />
              {t.common.filledFromWaitlist}
            </span>
          )}
          {a.lateBy && entry.status === 'confirmed' && (
            <span className="inline-flex items-center gap-1 font-semibold text-warn-text">
              <Clock aria-hidden size={12} />
              {t.doctor.brief.late(a.lateBy)}
            </span>
          )}
        </span>
      </span>
    </button>
  )
}

const Gap = ({ label, time, blocked }: { label: string; time: string; blocked?: boolean }) => (
  <div className="flex items-center gap-3 py-1">
    <span className="w-12 shrink-0 text-footnote text-muted tabular-nums">{time}</span>
    <span
      className={cx(
        'flex flex-1 items-center gap-1.5 rounded-card border border-dashed px-3.5 py-2 text-subheadline',
        blocked ? 'border-line bg-canvas text-muted' : 'border-line text-muted',
      )}
    >
      {blocked && <Lock aria-hidden size={13} />}
      {label}
    </span>
  </div>
)

const NowLine = ({ label }: { label: string }) => (
  <div aria-label={label} className="flex items-center gap-2 py-1.5">
    <span className="w-12 shrink-0 text-footnote font-semibold text-accent-text tabular-nums">{label.split(' ').pop()}</span>
    <span className="size-2 rounded-full bg-accent" />
    <span className="h-0.5 flex-1 bg-accent" />
  </div>
)
