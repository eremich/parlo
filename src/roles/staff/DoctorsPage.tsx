import { ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Avatar } from '../../components/Avatar'
import { Switch } from '../../components/Switch'
import { useT } from '../../i18n'
import { useFormat } from '../../i18n/useFormat'
import { formatPrice } from '../../lib/format'
import { LanguageList } from '../../patterns/LanguageChips'
import { PRACTICE_DOCTORS } from './practice'

/** Private prices and durations per service; public patients are covered. */
const SERVICES = [
  { minutes: 20, price: 85 },
  { minutes: 10, price: 25 },
  { minutes: 10, price: 20 },
  { minutes: 10, price: undefined },
  { minutes: 15, price: 60 },
  { minutes: 30, price: 95 },
]

/** Dr. Busch only sees new public patients on Tuesdays and Thursdays */
const RULES: Record<string, 'newPublic' | undefined> = { busch: 'newPublic' }

export const DoctorsPage = () => {
  const t = useT()
  const td = t.staff.doctorsPage
  const f = useFormat()
  const [accepting, setAccepting] = useState<Record<string, boolean>>(
    Object.fromEntries(PRACTICE_DOCTORS.map((d) => [d.id, d.acceptsNewPatients])),
  )

  return (
    <div className="space-y-8">
      <h1 className="text-page-title font-semibold text-ink">{td.title}</h1>

      <section>
        <h2 className="pb-3 text-section font-semibold text-ink">{td.doctors}</h2>
        <div className="grid grid-cols-3 gap-4">
          {PRACTICE_DOCTORS.map((d) => (
            <article key={d.id} className="flex flex-col rounded-card bg-surface p-5 shadow-card">
              <div className="flex items-center gap-3">
                <Avatar name={d.name} src={d.photo} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-web-body font-semibold text-ink">{d.name}</p>
                  <p className="text-meta text-muted">{t.specialty[d.specialty]}</p>
                </div>
              </div>
              <p className="pt-4 text-label font-semibold text-muted">{td.languages}</p>
              <LanguageList
                languages={d.languages}
                names={f.languageNames}
                levels={{ native: t.common.native, fluent: t.common.fluent }}
              />
              <p className="pt-3 text-label font-semibold text-muted">{td.visits}</p>
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {d.visitTypes.map((v) => (
                  <li key={v} className="rounded-chip bg-canvas px-2.5 py-1 text-meta text-ink ring-1 ring-line ring-inset">
                    {t.visitType[v]} · <span className="tabular-nums">{td.minutes(v === 'video' ? 15 : 20)}</span>
                  </li>
                ))}
              </ul>
              <p className="pt-3 text-label font-semibold text-muted">{td.rules}</p>
              <p className="mt-1 flex items-start gap-1.5 text-meta text-ink">
                <ShieldCheck aria-hidden size={15} className="mt-px shrink-0 text-brand" />
                {RULES[d.id] === 'newPublic' ? td.ruleNewPublic : td.ruleNone}
              </p>
              <div className="mt-auto border-t border-line pt-2">
                <Switch
                  label={td.acceptsNew}
                  checked={accepting[d.id]}
                  onChange={(v) => setAccepting({ ...accepting, [d.id]: v })}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="pb-3 text-section font-semibold text-ink">{td.services}</h2>
        <div className="overflow-hidden rounded-card bg-surface shadow-card">
          <table className="w-full text-left">
            <thead className="border-b border-line text-label text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">{td.service}</th>
                <th className="px-3 py-3 font-semibold">{td.duration}</th>
                <th className="px-5 py-3 text-right font-semibold">{td.price}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-web-body text-ink">
              {td.serviceNames.map((name, i) => (
                <tr key={name}>
                  <td className="px-5 py-3">{name}</td>
                  <td className="px-3 py-3 text-meta tabular-nums">{td.minutes(SERVICES[i].minutes)}</td>
                  <td className="px-5 py-3 text-right text-meta tabular-nums">
                    {SERVICES[i].price ? formatPrice(SERVICES[i].price) : <span className="text-muted">{td.covered}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
