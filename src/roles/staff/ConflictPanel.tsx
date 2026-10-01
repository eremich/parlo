import { ArrowRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '../../components/Button'
import { Drawer } from '../../components/Drawer'
import { doctorById } from '../../data/doctors'
import { nextSlots } from '../../data/schedule'
import { useT } from '../../i18n'
import { useFormat } from '../../i18n/useFormat'
import { useApp } from '../../store/app'
import { affectedBy } from './practice'
import { useStaffUi } from './StaffUi'

/** Blocked time with patients inside it: suggest a new slot for each, move and notify in one go. */
export const ConflictPanel = ({ blockId, onClose }: { blockId: string; onClose: () => void }) => {
  const t = useT()
  const tc = t.staff.conflict
  const f = useFormat()
  const ui = useStaffUi()
  const block = useApp((s) => s.blocks.find((b) => b.id === blockId))
  const appointments = useApp((s) => s.appointments)
  const patients = useApp((s) => s.patients)
  const resolveConflict = useApp((s) => s.resolveConflict)

  const affected = useMemo(() => (block ? affectedBy(block, appointments) : []), [block, appointments])
  // One distinct suggestion per patient, the earliest free slots after the block
  const options = useMemo(
    () => (block ? nextSlots(block.doctorId, appointments, affected.length + 6) : []),
    [block, appointments, affected.length],
  )
  const [choice, setChoice] = useState<Record<string, number>>(() =>
    Object.fromEntries(affected.map((a, i) => [a.id, i])),
  )

  if (!block) return null
  const doctor = doctorById(block.doctorId)
  const when = (i: number) => options[i] && `${f.day(options[i].date)} ${options[i].time}`

  return (
    <Drawer
      open
      onClose={onClose}
      title={tc.title}
      closeLabel={t.common.close}
      subtitle={`${doctor.name} · ${block.label}`}
      footer={
        <Button
          fullWidth
          disabled={!affected.length}
          onClick={() => {
            resolveConflict(
              block.id,
              affected.map((a) => ({ appointmentId: a.id, ...options[choice[a.id] ?? 0] })),
            )
            ui.toast(t.staff.toast.resolved(affected.length))
            onClose()
          }}
        >
          {tc.moveAll(affected.length)}
        </Button>
      }
    >
      <p className="pb-4 text-web-body text-pretty text-ink">
        {tc.lead(doctor.name, `${f.day(block.date)} ${block.start}–${block.end}`)}
      </p>
      <ul className="divide-y divide-line rounded-card border border-line">
        {affected.map((a) => (
          <li key={a.id} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-web-body font-semibold text-ink">
                {patients.find((p) => p.id === a.patientId)?.name}
              </p>
              <p className="text-meta text-muted line-through tabular-nums">{a.time}</p>
            </div>
            <ArrowRight aria-hidden size={16} className="shrink-0 text-muted" />
            <label className="shrink-0">
              <span className="sr-only">{tc.suggested}</span>
              <select
                value={choice[a.id] ?? 0}
                onChange={(e) => setChoice({ ...choice, [a.id]: Number(e.target.value) })}
                className="min-h-9 rounded-control border border-line bg-surface px-2.5 text-meta font-semibold text-ink tabular-nums outline-none focus:border-brand"
              >
                {options.map((_, i) => (
                  <option key={i} value={i}>
                    {when(i)}
                  </option>
                ))}
              </select>
            </label>
          </li>
        ))}
      </ul>
    </Drawer>
  )
}
