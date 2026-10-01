import { ArrowUpToLine, CalendarCheck, Star, UserX } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { displayStatus } from '../../data/background'
import { photoByName } from '../../data/doctors'
import { INSIGHTS_BASELINE } from '../../data/insights'
import { workingTimes } from '../../data/schedule'
import type { LanguageCode, ReviewReason } from '../../data/types'
import { useT } from '../../i18n'
import { useFormat } from '../../i18n/useFormat'
import { addDays } from '../../lib/format'
import { Avatar } from '../../components/Avatar'
import { useApp } from '../../store/app'
import { PRACTICE_DOCTORS, weekStart } from './practice'

/** What the practice gained this week: refilled slots, fewer no-shows, languages, reviews. */
export const InsightsScreen = () => {
  const t = useT()
  const ti = t.staff.insights
  const f = useFormat()
  const clock = useApp((s) => s.clock)
  const offers = useApp((s) => s.offers)
  const appointments = useApp((s) => s.appointments)
  const reviews = useApp((s) => s.reviews)

  const monday = weekStart(clock.date)
  const inWeek = (date: string) => date >= monday && date <= addDays(monday, 6)
  const practiceIds = PRACTICE_DOCTORS.map((d) => d.id)
  const filled =
    INSIGHTS_BASELINE.filledThisWeek +
    offers.filter((o) => o.status === 'accepted' && practiceIds.includes(o.doctorId) && inWeek(o.date)).length

  // Occupancy: booked share of the working slots left this week (from today on)
  const occupancy = PRACTICE_DOCTORS.map((d) => {
    let total = 0
    let booked = 0
    for (let i = 0; i < 5; i++) {
      const date = addDays(monday, i)
      if (date < clock.date) continue
      const times = workingTimes(date)
      total += times.length
      booked += appointments.filter(
        (a) => a.doctorId === d.id && a.date === date && !['cancelled', 'declined'].includes(displayStatus(a, clock)),
      ).length
    }
    return { id: d.id, name: d.name, value: total ? Math.round((booked / total) * 100) : 0 }
  })

  const byLanguage = Object.entries(INSIGHTS_BASELINE.newPatientsByLanguage)
    .map(([code, n]) => ({ code: code as LanguageCode, value: n ?? 0 }))
    .sort((a, b) => b.value - a.value)

  const practiceReviews = reviews.filter((r) => practiceIds.includes(r.doctorId))
  const avg = (key: 'doctorRating' | 'practiceRating') =>
    practiceReviews.reduce((sum, r) => sum + r[key], 0) / Math.max(1, practiceReviews.length)
  const reasonCounts = new Map<ReviewReason, number>()
  for (const r of practiceReviews) for (const reason of r.reasons) reasonCounts.set(reason, (reasonCounts.get(reason) ?? 0) + 1)
  const topReasons = [...reasonCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
  const seedIds = new Set(['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8', 'r9'])
  const decimal = (n: number) => n.toLocaleString(f.lang === 'de' ? 'de-DE' : 'en-GB', { maximumFractionDigits: 1, minimumFractionDigits: 1 })

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-page-title font-semibold text-ink">{ti.title}</h1>
        <p className="mt-0.5 text-web-body text-muted">{ti.lead}</p>
      </header>

      <div className="grid grid-cols-3 gap-4">
        <Stat icon={ArrowUpToLine} tone="info" label={ti.filled} value={String(filled)} note={ti.filledNote(INSIGHTS_BASELINE.refillMinutes)} />
        <Stat
          icon={UserX}
          tone="ok"
          label={ti.noShow}
          value={`${decimal(INSIGHTS_BASELINE.noShowRate)} %`}
          note={ti.noShowNote(`${decimal(INSIGHTS_BASELINE.noShowRateBefore)} %`)}
        />
        <Stat
          icon={CalendarCheck}
          tone="neutral"
          label={ti.confirm}
          value={ti.duration(INSIGHTS_BASELINE.confirmMinutes)}
          note={ti.confirmNote}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Panel title={ti.occupancy} note={ti.occupancyNote}>
          <Bars
            rows={occupancy.map((o) => ({ key: o.id, label: o.name, value: o.value, display: `${o.value} %` }))}
            max={100}
            lead={(row) => <Avatar name={row.label} src={photoByName(row.label)} size="sm" />}
          />
        </Panel>
        <Panel title={ti.newPatients} note={ti.newPatientsNote(INSIGHTS_BASELINE.newPatientsGermanOnly)}>
          <Bars
            rows={byLanguage.map((l) => ({ key: l.code, label: f.languageNames[l.code], value: l.value, display: String(l.value) }))}
            max={Math.max(...byLanguage.map((l) => l.value))}
            lead={(row) => (
              <span className="inline-flex h-6 w-9 shrink-0 items-center justify-center rounded-chip bg-canvas text-label font-semibold text-muted ring-1 ring-line ring-inset">
                {row.key}
              </span>
            )}
          />
        </Panel>
      </div>

      <Panel title={ti.reviews}>
        <div className="grid grid-cols-[220px_1fr] gap-8">
          <div className="space-y-4">
            {(['doctorRating', 'practiceRating'] as const).map((key) => (
              <div key={key}>
                <p className="text-meta text-muted">{key === 'doctorRating' ? ti.doctorAvg : ti.practiceAvg}</p>
                <p className="flex items-center gap-1.5 text-page-title font-semibold text-ink tabular-nums">
                  <Star aria-hidden size={20} className="fill-accent text-accent" />
                  {decimal(avg(key))}
                </p>
              </div>
            ))}
            <p className="text-label text-muted">{ti.fromReviews(practiceReviews.length)}</p>
            <div>
              <p className="pb-2 text-meta font-semibold text-ink">{ti.topReasons}</p>
              <ul className="flex flex-wrap gap-1.5">
                {topReasons.map(([reason, n]) => (
                  <li key={reason} className="inline-flex h-7 items-center gap-1.5 rounded-chip bg-brand-soft px-2.5 text-meta font-medium text-brand">
                    {t.reason[reason]}
                    <span className="text-label tabular-nums">{n}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            <p className="pb-2 text-meta font-semibold text-ink">{ti.latest}</p>
            <ul className="divide-y divide-line rounded-card border border-line">
              {practiceReviews.slice(0, 3).map((r) => (
                <li key={r.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="flex items-center gap-2 text-web-body font-semibold text-ink">
                      {r.author}
                      {!seedIds.has(r.id) && (
                        <span className="rounded-chip bg-info-soft px-2 py-0.5 text-label font-semibold text-info-text">{ti.isNew}</span>
                      )}
                    </p>
                    <p className="text-meta text-muted tabular-nums">
                      {PRACTICE_DOCTORS.find((d) => d.id === r.doctorId)?.name} · ★ {r.doctorRating}/{r.practiceRating}
                    </p>
                  </div>
                  <p className="mt-0.5 text-meta text-muted">{r.reasons.map((x) => t.reason[x]).join(' · ')}</p>
                  {r.comment && <p className="mt-1 text-web-body text-pretty text-ink">{r.comment}</p>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Panel>
    </div>
  )
}

const TONE = {
  info: 'bg-info-soft text-info-text',
  ok: 'bg-ok-soft text-ok-text',
  neutral: 'bg-canvas text-muted',
}

type StatProps = { icon: LucideIcon; tone: keyof typeof TONE; label: string; value: string; note: string }

const Stat = ({ icon: Icon, tone, label, value, note }: StatProps) => (
  <div className="rounded-card bg-surface p-5 shadow-card">
    <div className="flex items-start justify-between gap-3">
      <p className="text-web-body font-semibold text-ink">{label}</p>
      <span className={`flex size-9 shrink-0 items-center justify-center rounded-[10px] ${TONE[tone]}`}>
        <Icon aria-hidden size={18} />
      </span>
    </div>
    <p className="mt-2 text-[40px] leading-[44px] font-semibold tracking-[-0.02em] text-ink tabular-nums">{value}</p>
    <p className="mt-1 text-meta text-muted">{note}</p>
  </div>
)

const Panel = ({ title, note, children }: { title: string; note?: string; children: ReactNode }) => (
  <section className="rounded-card bg-surface p-5 shadow-card">
    <h2 className="text-section font-semibold text-ink">{title}</h2>
    {note && <p className="text-meta text-muted">{note}</p>}
    <div className="mt-4">{children}</div>
  </section>
)

type Row = { key: string; label: string; value: number; display: string }

/**
 * Single-series horizontal bars: one hue (brand), values labelled directly, so no legend is needed.
 * The list itself is the accessible table: label and value are text.
 */
const Bars = ({ rows, max, lead }: { rows: Row[]; max: number; lead: (row: Row) => ReactNode }) => (
  <dl className="space-y-2.5">
    {rows.map((row) => (
      <div key={row.key} className="group grid grid-cols-[minmax(0,160px)_1fr_48px] items-center gap-3" title={`${row.label}: ${row.display}`}>
        <dt className="flex min-w-0 items-center gap-2 text-web-body text-ink">
          {lead(row)}
          <span className="truncate">{row.label}</span>
        </dt>
        <div aria-hidden className="h-3 rounded-r-[4px] bg-canvas">
          <div
            className="h-full rounded-r-[4px] bg-brand transition-opacity duration-150 group-hover:opacity-80"
            style={{ width: `${Math.max(2, (row.value / max) * 100)}%` }}
          />
        </div>
        <dd className="text-right text-meta font-semibold text-ink tabular-nums">{row.display}</dd>
      </div>
    ))}
  </dl>
)
