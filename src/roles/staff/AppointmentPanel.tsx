import { ArrowUpToLine, CalendarClock, Clock, DoorOpen, Trash2, UserX } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Banner } from '../../components/Banner'
import { Button } from '../../components/Button'
import { Chip } from '../../components/Chip'
import { Drawer } from '../../components/Drawer'
import { displayStatus } from '../../data/background'
import { doctorById } from '../../data/doctors'
import { nextSlots } from '../../data/schedule'
import { useT } from '../../i18n'
import { useFormat } from '../../i18n/useFormat'
import { LanguageChips } from '../../patterns/LanguageChips'
import { StatusBadge } from '../../patterns/StatusBadge'
import { minutesUntil, useApp } from '../../store/app'
import { useStaffUi } from './StaffUi'

const NO_SHOW_AFTER = 15
const MAX_PROPOSALS = 3

type Slot = { date: string; time: string }
const key = (s: Slot) => `${s.date} ${s.time}`

export const AppointmentPanel = ({ id, onClose }: { id: string; onClose: () => void }) => {
  const t = useT()
  const tp = t.staff.panel
  const toast = t.staff.toast
  const f = useFormat()
  const ui = useStaffUi()
  const clock = useApp((s) => s.clock)
  const appointments = useApp((s) => s.appointments)
  const patients = useApp((s) => s.patients)
  const { confirmRequest, proposeTimes, markArrived, markNoShow, moveAppointment, cancel } = useApp()
  const [mode, setMode] = useState<'idle' | 'move' | 'propose'>('idle')
  const [picked, setPicked] = useState<Slot[]>([])

  const a = appointments.find((x) => x.id === id)
  if (!a) return null
  const patient = patients.find((p) => p.id === a.patientId)
  const name = patient?.name ?? '—'
  const doctor = doctorById(a.doctorId)
  const status = displayStatus(a, clock)
  const minutes = minutesUntil(clock, a)
  const isToday = a.date === clock.date
  const canNoShow = isToday && minutes <= -NO_SHOW_AFTER
  const options = nextSlots(a.doctorId, appointments, 8)
  const when = (s: Slot) => `${f.day(s.date)} ${s.time}`

  const done = (message: string) => {
    ui.toast(message)
    onClose()
  }

  const footer: ReactNode =
    status === 'pending' ? (
      mode === 'propose' ? (
        <Button
          fullWidth
          disabled={!picked.length}
          onClick={() => {
            proposeTimes(a.id, picked)
            done(toast.proposed(name))
          }}
        >
          {tp.sendProposal(picked.length)}
        </Button>
      ) : (
        <div className="flex gap-2">
          <Button fullWidth onClick={() => (confirmRequest(a.id), done(toast.confirmed(name)))}>
            {tp.confirm(a.time)}
          </Button>
          <Button variant="secondary" fullWidth onClick={() => setMode('propose')}>
            {tp.propose}
          </Button>
        </div>
      )
    ) : status === 'confirmed' ? (
      mode === 'move' ? (
        <Button
          fullWidth
          disabled={!picked.length}
          onClick={() => {
            moveAppointment(a.id, a.doctorId, picked[0].date, picked[0].time)
            done(toast.moved(name, when(picked[0])))
          }}
        >
          {picked.length ? tp.moveTo(when(picked[0])) : tp.move}
        </Button>
      ) : (
        isToday && (
          <Button fullWidth icon={DoorOpen} onClick={() => (markArrived(a.id), done(toast.arrived(name)))}>
            {tp.arrived}
          </Button>
        )
      )
    ) : null

  return (
    <Drawer
      open
      onClose={onClose}
      title={name}
      closeLabel={t.common.close}
      subtitle={
        <span className="flex flex-wrap items-center gap-2">
          <span className="tabular-nums">
            {f.day(a.date)} · {a.time} · {doctor.name}
          </span>
          <StatusBadge status={status} label={t.status[status]} size="sm" />
        </span>
      }
      footer={footer}
    >
      <div className="space-y-4">
        {a.filledFromWaitlist && <Banner tone="info" icon={ArrowUpToLine} title={tp.filled} />}
        {a.lateBy && status === 'confirmed' && <Banner tone="warn" icon={Clock} title={tp.lateNote(a.lateBy)} />}

        <dl className="divide-y divide-line rounded-card border border-line">
          <Row label={tp.visit}>
            {t.visitType[a.visitType]} · {a.firstVisit ? tp.firstVisit : tp.returning}
          </Row>
          {patient && (
            <Row label={tp.speaks}>
              <LanguageChips
                size="sm"
                languages={patient.languages.map((code) => ({ code, level: 'fluent' as const }))}
                names={f.languageNames}
                prefix={tp.speaks}
              />
            </Row>
          )}
          {patient && (
            <Row label={tp.insurance}>
              {patient.insurance === 'public' ? t.common.public : t.common.private} · {patient.insurer}
            </Row>
          )}
          {patient?.phone && <Row label={tp.phone}>{patient.phone}</Row>}
          {a.reason && <Row label={tp.reason}>{a.reason}</Row>}
          <Row label={tp.source}>{a.byPhone ? tp.byPhone : tp.online}</Row>
        </dl>

        {status === 'confirmed' && mode === 'idle' && (
          <div className="space-y-2">
            <Button variant="secondary" fullWidth icon={CalendarClock} onClick={() => setMode('move')}>
              {tp.move}
            </Button>
            <p className="text-center text-label text-muted">{tp.moveHint}</p>
            {isToday && (
              <>
                <Button
                  variant="secondary"
                  fullWidth
                  icon={UserX}
                  disabled={!canNoShow}
                  onClick={() => (markNoShow(a.id), done(toast.noShow(name)))}
                >
                  {tp.noShow}
                </Button>
                {!canNoShow && <p className="text-center text-label text-muted">{tp.noShowHint}</p>}
              </>
            )}
            <Button variant="destructive" fullWidth icon={Trash2} onClick={() => (cancel(a.id), done(toast.cancelled(name)))}>
              {tp.cancel}
            </Button>
            <p className="text-center text-label text-muted">{tp.cancelHint}</p>
          </div>
        )}

        {mode !== 'idle' && (
          <section>
            <h3 className="pb-1 text-web-body font-semibold text-ink">{mode === 'move' ? tp.move : tp.propose}</h3>
            {mode === 'propose' && <p className="pb-3 text-meta text-muted">{tp.proposeHint}</p>}
            <div className="flex flex-wrap gap-2 pt-2">
              {options.map((slot) => {
                const selected = picked.some((p) => key(p) === key(slot))
                return (
                  <Chip
                    key={key(slot)}
                    selected={selected}
                    onPressedChange={(on) =>
                      setPicked(
                        mode === 'move'
                          ? on
                            ? [slot]
                            : []
                          : on
                            ? [...picked, slot].slice(0, MAX_PROPOSALS)
                            : picked.filter((p) => key(p) !== key(slot)),
                      )
                    }
                  >
                    <span className="tabular-nums">{when(slot)}</span>
                  </Chip>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </Drawer>
  )
}

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex items-center justify-between gap-4 px-4 py-2.5">
    <dt className="shrink-0 text-meta text-muted">{label}</dt>
    <dd className="text-right text-web-body text-ink">{children}</dd>
  </div>
)
