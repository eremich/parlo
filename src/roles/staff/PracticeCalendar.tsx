import { ChevronLeft, ChevronRight, Keyboard } from 'lucide-react'
import { useMemo } from 'react'
import { Button } from '../../components/Button'
import { Segmented } from '../../components/Segmented'
import { doctorById } from '../../data/doctors'
import { useT } from '../../i18n'
import { useFormat } from '../../i18n/useFormat'
import { addDays } from '../../lib/format'
import { CalendarGrid, type CalendarBlock, type CalendarColumn } from '../../patterns/CalendarGrid'
import { useApp } from '../../store/app'
import { affectedBy, dayHours, isPracticeAppointment, PRACTICE_DOCTORS, toEvent, weekStart } from './practice'
import { useStaffUi, type CalendarView } from './StaffUi'

const WEEK = [0, 1, 2, 3, 4]

/** Toolbar plus calendar grid. `allowWeek` adds the day/week switch used on the Calendar page. */
export const PracticeCalendar = ({ allowWeek = false }: { allowWeek?: boolean }) => {
  const t = useT()
  const tc = t.staff.calendar
  const f = useFormat()
  const ui = useStaffUi()
  const clock = useApp((s) => s.clock)
  const appointments = useApp((s) => s.appointments)
  const patients = useApp((s) => s.patients)
  const blocks = useApp((s) => s.blocks)
  const moveAppointment = useApp((s) => s.moveAppointment)
  const offers = useApp((s) => s.offers)

  const view: CalendarView = allowWeek ? ui.view : 'day'
  const monday = weekStart(ui.date)
  const days = view === 'week' ? WEEK.map((i) => addDays(monday, i)) : [ui.date]
  const labels = {
    visitType: t.visitType,
    newPatient: t.visitType.new,
    // A cancelled slot that is currently offered to someone on the waitlist says so
    offered: (a: { id: string }) =>
      offers.some((o) => o.freedBy === a.id && o.status === 'open') ? t.staff.calendar.offered : undefined,
  }

  const columns: CalendarColumn[] =
    view === 'day'
      ? PRACTICE_DOCTORS.map((d) => ({
          id: d.id,
          name: d.name,
          photo: d.photo,
          subtitle: `${t.specialty[d.specialty]} · ${d.languages.map((l) => l.code).join(', ')}`,
        }))
      : days.map((date) => ({ id: date, name: f.date(date), avatar: false }))

  const events = useMemo(
    () =>
      appointments
        .filter((a) => isPracticeAppointment(a) && days.includes(a.date))
        .filter((a) => view === 'day' || a.doctorId === ui.weekDoctor)
        .map((a) => toEvent(a, clock, patients, labels, view === 'day' ? a.doctorId : a.date, ui.focusId)),
    [appointments, offers, clock, patients, view, ui.date, ui.weekDoctor, ui.focusId, t],
  )

  const calendarBlocks: CalendarBlock[] = blocks
    .filter((b) => days.includes(b.date) && (view === 'day' || b.doctorId === ui.weekDoctor))
    .map((b) => ({
      id: b.id,
      columnId: view === 'day' ? b.doctorId : b.date,
      start: b.start,
      end: b.end,
      label: b.label,
      conflict: !b.resolved && affectedBy(b, appointments).length > 0,
    }))

  const hours = days.map(dayHours).filter((h): h is NonNullable<typeof h> => !!h)
  const start = Math.min(...hours.map((h) => h.start), 8)
  const end = Math.max(...hours.map((h) => h.end), start + 1)
  const closed = hours.length === 0
  const step = view === 'week' ? 7 : 1
  const title = view === 'week' ? `${f.date(monday)} – ${f.date(addDays(monday, 4))}` : f.date(ui.date)

  const place = (columnId: string) =>
    view === 'day' ? { doctorId: columnId, date: ui.date } : { doctorId: ui.weekDoctor, date: columnId }

  return (
    <section aria-label={tc.title}>
      <div className="flex flex-wrap items-center gap-3 pb-4">
        <div className="flex items-center gap-1">
          <IconButton label={tc.prev} onClick={() => ui.setDate(addDays(ui.date, -step))}>
            <ChevronLeft aria-hidden size={18} />
          </IconButton>
          <IconButton label={tc.next} onClick={() => ui.setDate(addDays(ui.date, step))}>
            <ChevronRight aria-hidden size={18} />
          </IconButton>
        </div>
        <h2 className="text-section font-semibold text-ink tabular-nums">{title}</h2>
        {ui.date !== clock.date && (
          <Button size="sm" variant="plain" onClick={() => ui.setDate(clock.date)}>
            {tc.today}
          </Button>
        )}
        <div className="ml-auto flex items-center gap-3">
          {allowWeek && view === 'week' && (
            <label className="flex items-center gap-2 text-meta text-muted">
              {tc.doctor}
              <select
                value={ui.weekDoctor}
                onChange={(e) => ui.setWeekDoctor(e.target.value)}
                className="min-h-9 rounded-control border border-line bg-surface px-2.5 text-meta font-semibold text-ink outline-none focus:border-brand"
              >
                {PRACTICE_DOCTORS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {allowWeek && (
            <Segmented<CalendarView>
              label={tc.view}
              value={view}
              onChange={ui.setView}
              options={[
                { value: 'day', label: tc.day },
                { value: 'week', label: tc.week },
              ]}
            />
          )}
          <Shortcuts />
        </div>
      </div>

      {closed ? (
        <p className="rounded-card bg-surface p-8 text-center text-web-body text-muted shadow-card">{tc.closed}</p>
      ) : (
        <CalendarGrid
          columns={columns}
          events={events}
          blocks={calendarBlocks}
          startHour={start}
          endHour={end}
          now={days.includes(clock.date) && view === 'day' ? clock.time : undefined}
          statusLabels={t.status}
          filledLabel={t.common.filledFromWaitlist}
          lateLabel={tc.late}
          moveLabel={tc.move}
          onEventClick={(id) => ui.open({ kind: 'appointment', id })}
          onSlotClick={(columnId, time) => ui.open({ kind: 'booking', ...place(columnId), time })}
          onMove={(id, columnId, time) => {
            const target = place(columnId)
            const name = patients.find((p) => p.id === appointments.find((a) => a.id === id)?.patientId)?.name ?? ''
            moveAppointment(id, target.doctorId, target.date, time)
            ui.toast(t.staff.toast.moved(name, `${f.day(target.date)} ${time} · ${doctorById(target.doctorId).name}`))
          }}
        />
      )}
    </section>
  )
}

const IconButton = ({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className="flex size-9 items-center justify-center rounded-control border border-line bg-surface text-ink transition-colors hover:bg-canvas"
  >
    {children}
  </button>
)

/** Keyboard shortcuts, discoverable without a manual. */
const Shortcuts = () => {
  const t = useT()
  return (
    <details className="group relative">
      <summary className="flex min-h-9 cursor-pointer list-none items-center gap-1.5 rounded-control px-2.5 text-meta font-semibold text-muted transition-colors hover:bg-canvas hover:text-ink [&::-webkit-details-marker]:hidden">
        <Keyboard aria-hidden size={16} />
        {t.staff.calendar.shortcuts}
      </summary>
      <dl className="absolute top-full right-0 z-40 mt-1 w-56 space-y-1.5 rounded-card border border-line bg-surface p-3 shadow-sheet">
        {t.staff.calendar.keys.map(([key, label]) => (
          <div key={key} className="flex items-center justify-between gap-3 text-meta">
            <dt className="text-muted">{label}</dt>
            <dd>
              <kbd className="rounded-[5px] border border-line bg-canvas px-1.5 py-0.5 font-sans text-label font-semibold text-ink">
                {key}
              </kbd>
            </dd>
          </div>
        ))}
      </dl>
    </details>
  )
}
