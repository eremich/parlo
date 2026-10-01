import { Search, UserRound, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '../../components/Button'
import { Drawer } from '../../components/Drawer'
import { Segmented } from '../../components/Segmented'
import { TextField } from '../../components/TextField'
import { doctorById } from '../../data/doctors'
import { availability } from '../../data/schedule'
import type { Insurance, VisitType } from '../../data/types'
import { useT } from '../../i18n'
import { useFormat } from '../../i18n/useFormat'
import { SlotChip } from '../../patterns/SlotChip'
import { useApp } from '../../store/app'
import { PRACTICE_DOCTORS } from './practice'
import { useStaffUi } from './StaffUi'

type Prefill = { doctorId?: string; date?: string; time?: string; patientId?: string }

/** Reception books a caller: find them or add three fields, then pick a slot. */
export const PhoneBookingPanel = ({ prefill, onClose }: { prefill: Prefill; onClose: () => void }) => {
  const t = useT()
  const tp = t.staff.phone
  const f = useFormat()
  const ui = useStaffUi()
  const patients = useApp((s) => s.patients)
  const appointments = useApp((s) => s.appointments)
  const clock = useApp((s) => s.clock)
  const phoneBook = useApp((s) => s.phoneBook)

  const [who, setWho] = useState<'existing' | 'new'>('existing')
  const [query, setQuery] = useState('')
  const [patientId, setPatientId] = useState<string | undefined>(prefill.patientId)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [insurance, setInsurance] = useState<Insurance>('public')
  const [doctorId, setDoctorId] = useState(prefill.doctorId ?? PRACTICE_DOCTORS[0].id)
  const [date, setDate] = useState(prefill.date ?? clock.date)
  const [time, setTime] = useState<string | undefined>(prefill.time)
  const [visitType, setVisitType] = useState<VisitType>('followUp')

  const doctor = doctorById(doctorId)
  const days = useMemo(() => availability(doctorId, appointments, 14), [doctorId, appointments, clock])
  const dayTimes = days.find((d) => d.date === date)?.times ?? []
  // A clicked calendar slot can sit between free 20-minute starts; keep it selectable
  const times = time && !dayTimes.includes(time) && prefill.time === time ? [time, ...dayTimes].sort() : dayTimes

  const q = query.trim().toLowerCase()
  const matches = q.length >= 2
    ? patients.filter((p) => p.name.toLowerCase().includes(q) || p.phone?.replace(/\s/g, '').includes(q.replace(/\s/g, ''))).slice(0, 5)
    : []
  const selected = patients.find((p) => p.id === patientId)
  const callerName = who === 'existing' ? selected?.name : name.trim()
  const ready = !!time && !!callerName && (who === 'existing' || phone.trim().length > 4)

  return (
    <Drawer
      open
      onClose={onClose}
      title={tp.title}
      subtitle={tp.lead}
      closeLabel={t.common.close}
      footer={
        <Button
          fullWidth
          disabled={!ready}
          onClick={() => {
            if (!time || !callerName) return
            const booked = phoneBook({
              patientId: who === 'existing' ? patientId : undefined,
              newPatient: who === 'new' ? { name: callerName, phone: phone.trim(), insurance } : undefined,
              doctorId,
              date,
              time,
              visitType: who === 'new' ? 'new' : visitType,
            })
            if (!booked) return
            ui.toast(t.staff.toast.booked(callerName, `${f.day(date)} ${time}`))
            ui.focus(booked.id, date)
            onClose()
          }}
        >
          {ready && time && callerName ? tp.book(time, callerName) : tp.bookEmpty}
        </Button>
      }
    >
      <div className="space-y-6">
        <Segmented
          label={tp.title}
          fullWidth
          value={who}
          onChange={setWho}
          options={[
            { value: 'existing', label: tp.existing },
            { value: 'new', label: tp.newPatient },
          ]}
        />

        {who === 'existing' ? (
          selected ? (
            <div className="flex items-center gap-3 rounded-card border border-brand bg-brand-soft px-4 py-3">
              <UserRound aria-hidden size={18} className="text-brand" />
              <div className="min-w-0 flex-1">
                <p className="text-web-body font-semibold text-ink">{selected.name}</p>
                <p className="text-meta text-muted">
                  {selected.phone ?? selected.email} · {selected.insurance === 'public' ? t.common.public : t.common.private}
                </p>
              </div>
              <button
                type="button"
                aria-label={t.common.edit}
                onClick={() => setPatientId(undefined)}
                className="flex size-8 items-center justify-center rounded-control text-muted hover:bg-surface"
              >
                <X aria-hidden size={16} />
              </button>
            </div>
          ) : (
            <div>
              <TextField label={tp.search} icon={Search} value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
              {q.length >= 2 && (
                <ul className="mt-2 divide-y divide-line overflow-hidden rounded-card border border-line">
                  {matches.length === 0 ? (
                    <li className="px-4 py-3 text-meta text-muted">{tp.noMatch}</li>
                  ) : (
                    matches.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => setPatientId(p.id)}
                          className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-canvas"
                        >
                          <span className="text-web-body text-ink">{p.name}</span>
                          <span className="text-meta text-muted tabular-nums">{p.phone ?? ''}</span>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          )
        ) : (
          <div className="space-y-4">
            <TextField label={tp.name} value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
            <TextField label={tp.phone} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <div>
              <p className="pb-1.5 text-footnote font-semibold text-ink">{tp.insurance}</p>
              <Segmented<Insurance>
                label={tp.insurance}
                fullWidth
                value={insurance}
                onChange={setInsurance}
                options={[
                  { value: 'public', label: t.common.public },
                  { value: 'private', label: t.common.private },
                ]}
              />
            </div>
          </div>
        )}

        <section className="space-y-3">
          <h3 className="text-web-body font-semibold text-ink">{tp.slot}</h3>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block pb-1.5 text-footnote font-semibold text-ink">{tp.doctor}</span>
              <select
                value={doctorId}
                onChange={(e) => {
                  setDoctorId(e.target.value)
                  setTime(undefined)
                }}
                className="min-h-11 w-full rounded-control border border-line bg-surface px-3 text-web-body text-ink outline-none focus:border-brand"
              >
                {PRACTICE_DOCTORS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block pb-1.5 text-footnote font-semibold text-ink">{tp.date}</span>
              <select
                value={date}
                onChange={(e) => {
                  setDate(e.target.value)
                  setTime(undefined)
                }}
                className="min-h-11 w-full rounded-control border border-line bg-surface px-3 text-web-body text-ink outline-none focus:border-brand"
              >
                {days
                  .filter((d) => d.times.length || d.date === date)
                  .map((d) => (
                    <option key={d.date} value={d.date}>
                      {f.day(d.date)}
                    </option>
                  ))}
              </select>
            </label>
          </div>
          {times.length ? (
            <div className="grid grid-cols-4 gap-2">
              {times.map((tm) => (
                <SlotChip key={tm} time={tm} selected={tm === time} label={tp.book(tm, callerName ?? '')} onSelect={() => setTime(tm)} />
              ))}
            </div>
          ) : (
            <p className="text-meta text-muted">{tp.noTimes}</p>
          )}
          {who === 'existing' && (
            <div>
              <p className="pb-1.5 text-footnote font-semibold text-ink">{tp.visit}</p>
              <Segmented<VisitType>
                label={tp.visit}
                fullWidth
                value={visitType}
                onChange={setVisitType}
                options={doctor.visitTypes.map((v) => ({ value: v, label: t.visitType[v] }))}
              />
            </div>
          )}
        </section>
      </div>
    </Drawer>
  )
}
