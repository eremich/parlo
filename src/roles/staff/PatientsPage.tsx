import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Avatar } from '../../components/Avatar'
import { Button } from '../../components/Button'
import { TextField } from '../../components/TextField'
import { displayStatus } from '../../data/background'
import { useT } from '../../i18n'
import { useFormat } from '../../i18n/useFormat'
import { LanguageChips } from '../../patterns/LanguageChips'
import { useApp } from '../../store/app'
import { isPracticeAppointment } from './practice'
import { useStaffUi } from './StaffUi'

/** Everyone who has an appointment at the practice, with their languages and insurance at a glance. */
export const PatientsPage = () => {
  const t = useT()
  const tp = t.staff.patientsPage
  const f = useFormat()
  const ui = useStaffUi()
  const clock = useApp((s) => s.clock)
  const appointments = useApp((s) => s.appointments)
  const patients = useApp((s) => s.patients)
  const [query, setQuery] = useState('')

  const rows = useMemo(() => {
    const byPatient = new Map<string, { next?: string; last?: string }>()
    for (const a of appointments) {
      if (!isPracticeAppointment(a)) continue
      const status = displayStatus(a, clock)
      if (status === 'cancelled' || status === 'declined') continue
      const entry = byPatient.get(a.patientId) ?? {}
      const when = `${a.date} ${a.time}`
      const upcoming = ['confirmed', 'pending', 'checkedIn', 'inProgress'].includes(status)
      if (upcoming && (!entry.next || when < entry.next)) entry.next = when
      if (status === 'done' && (!entry.last || when > entry.last)) entry.last = when
      byPatient.set(a.patientId, entry)
    }
    return patients
      .filter((p) => byPatient.has(p.id))
      .map((p) => ({ patient: p, ...byPatient.get(p.id)! }))
      .sort((a, b) => a.patient.name.localeCompare(b.patient.name))
  }, [appointments, patients, clock])

  const q = query.trim().toLowerCase()
  const shown = q
    ? rows.filter((r) => r.patient.name.toLowerCase().includes(q) || r.patient.phone?.replace(/\s/g, '').includes(q.replace(/\s/g, '')))
    : rows
  const when = (value?: string) => {
    if (!value) return <span className="text-muted">{tp.none}</span>
    const [date, time] = value.split(' ')
    return (
      <span className="tabular-nums">
        {f.day(date)} {time}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-page-title font-semibold text-ink">{tp.title}</h1>
          <p className="mt-0.5 text-web-body text-muted">{tp.count(rows.length)}</p>
        </div>
        <div className="w-80">
          <TextField label={tp.search} hideLabel icon={Search} placeholder={tp.search} value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </header>

      <div className="overflow-hidden rounded-card bg-surface shadow-card">
        <table className="w-full text-left">
          <thead className="border-b border-line text-label text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">{tp.name}</th>
              <th className="px-3 py-3 font-semibold">{tp.languages}</th>
              <th className="px-3 py-3 font-semibold">{tp.insurance}</th>
              <th className="px-3 py-3 font-semibold">{tp.next}</th>
              <th className="px-3 py-3 font-semibold">{tp.last}</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-web-body text-ink">
            {shown.map(({ patient, next, last }) => (
              <tr key={patient.id} className="transition-colors hover:bg-canvas/60">
                <td className="px-5 py-2.5">
                  <span className="flex items-center gap-3">
                    <Avatar name={patient.name} size="sm" />
                    <span>
                      <span className="block font-semibold">{patient.name}</span>
                      <span className="block text-meta text-muted tabular-nums">{patient.phone ?? patient.email}</span>
                    </span>
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <LanguageChips
                    size="sm"
                    languages={patient.languages.map((code) => ({ code, level: 'fluent' as const }))}
                    names={f.languageNames}
                    prefix={tp.languages}
                  />
                </td>
                <td className="px-3 py-2.5 text-meta">
                  {patient.insurance === 'public' ? t.common.public : t.common.private} · {patient.insurer}
                </td>
                <td className="px-3 py-2.5 text-meta">{when(next)}</td>
                <td className="px-3 py-2.5 text-meta">{when(last)}</td>
                <td className="px-5 py-2.5 text-right">
                  <Button size="sm" variant="secondary" onClick={() => ui.open({ kind: 'booking', patientId: patient.id })}>
                    {tp.book}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {shown.length === 0 && <p className="px-5 py-8 text-center text-web-body text-muted">{tp.empty}</p>}
      </div>
    </div>
  )
}
