import { SearchX, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '../../components/Button'
import { NavBar } from '../../components/NavBar'
import { Screen } from '../../components/Screen'
import { Segmented } from '../../components/Segmented'
import { practiceById } from '../../data/doctors'
import { relaxFilters, search, type Filters, type Result } from '../../data/search'
import { useT } from '../../i18n'
import { useFormat } from '../../i18n/useFormat'
import { useApp, useCurrentPatient } from '../../store/app'
import { DoctorResultCard } from '../../patterns/DoctorResultCard'
import { Skeleton } from '../../components/Skeleton'
import { FiltersSheet } from './FiltersSheet'
import { OfflineBanner } from './OfflineBanner'
import { ResultsMap } from './ResultsMap'

const LOAD_MS = 450

export const ResultsScreen = () => {
  const t = useT()
  const navigate = useNavigate()
  const filters = useApp((s) => s.filters)
  const setFilters = useApp((s) => s.setFilters)
  const resetFilters = useApp((s) => s.resetFilters)
  const appointments = useApp((s) => s.appointments)
  const patient = useCurrentPatient()
  const [view, setView] = useState<'list' | 'map'>('list')
  const [sheet, setSheet] = useState(false)
  // Results arrive after a short fetch in a real app; skeletons keep the layout steady meanwhile
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), LOAD_MS)
    return () => window.clearTimeout(timer)
  }, [])

  const results = useMemo(() => search(filters, appointments), [filters, appointments])
  const title = filters.doctorQuery || (filters.specialty ? t.specialtyPlural[filters.specialty] : t.patient.results.all)

  return (
    <Screen tabBar push>
      <NavBar
        title={title}
        backLabel={t.common.back}
        onBack={() => navigate(-1)}
        trailing={
          <button
            type="button"
            onClick={() => setSheet(true)}
            aria-label={t.patient.results.filters}
            className="flex size-11 items-center justify-center text-brand transition-opacity active:opacity-50"
          >
            <SlidersHorizontal aria-hidden size={22} />
          </button>
        }
      />

      <div className="space-y-3 px-4 pt-2 pb-3">
        <Segmented
          label={t.patient.results.view}
          fullWidth
          value={view}
          onChange={setView}
          options={[
            { value: 'list', label: t.patient.results.list },
            { value: 'map', label: t.patient.results.map },
          ]}
        />
        <ActiveFilters filters={filters} onChange={setFilters} />
      </div>

      <OfflineBanner />
      {loading ? (
        <ResultSkeletons />
      ) : results.length === 0 ? (
        <NoMatch
          onRelax={(relaxed) => setFilters(relaxed)}
          onReset={resetFilters}
          suggestion={relaxFilters(filters, patient?.languages ?? ['EN'], appointments)}
        />
      ) : view === 'list' ? (
        <ResultList results={results} />
      ) : (
        <ResultsMap results={results} />
      )}

      <FiltersSheet open={sheet} onClose={() => setSheet(false)} />
    </Screen>
  )
}

const ResultList = ({ results }: { results: Result[] }) => {
  const t = useT()
  const f = useFormat()
  const navigate = useNavigate()
  const filters = useApp((s) => s.filters)

  return (
    <>
      <p className="px-4 pb-2 text-footnote text-muted">{t.patient.results.count(results.length)}</p>
      <ul className="space-y-3 px-4">
        {results.map(({ doctor, earliest, slots }) => {
          const practice = practiceById(doctor.practiceId)
          const sameDay = slots.filter((s) => s.date === earliest.date).map((s) => s.time)
          return (
            <li key={doctor.id}>
              <DoctorResultCard
                name={doctor.name}
                photo={doctor.photo}
                subtitle={t.specialty[doctor.specialty]}
                distance={f.distance(practice.distanceKm)}
                earliest={{ day: f.day(earliest.date), time: earliest.time }}
                slots={sameDay}
                languages={doctor.languages}
                languageNames={f.languageNames}
                matchedLanguages={filters.languages}
                insuranceLabel={f.insurance(doctor)}
                rating={doctor.rating}
                reviewCount={doctor.reviewCount}
                video={doctor.visitTypes.includes('video')}
                referralExpected={doctor.referralExpected}
                onOpen={() => navigate(`/doctor/${doctor.id}`)}
                onBookSlot={(time) =>
                  navigate(`/book/${doctor.id}`, { state: { date: earliest.date, time } })
                }
                labels={{
                  speaks: t.common.speaks,
                  earliest: t.patient.doctor.earliest,
                  book: t.common.book,
                  allTimes: t.common.allTimes,
                  rating: t.common.rating,
                  video: t.common.video,
                  referral: t.common.referral,
                }}
              />
            </li>
          )
        })}
      </ul>
    </>
  )
}

/** Removable summary of what is narrowing the list. Insurance always applies, so it is not removable. */
const ActiveFilters = ({ filters, onChange }: { filters: Filters; onChange: (p: Partial<Filters>) => void }) => {
  const t = useT()
  const chips: { key: string; label: string; clear?: () => void }[] = [
    { key: 'insurance', label: filters.insurance === 'public' ? t.common.public : t.common.private },
  ]
  if (filters.languages.length)
    chips.push({ key: 'lang', label: `${t.common.speaks} ${filters.languages.join(', ')}`, clear: () => onChange({ languages: [] }) })
  if (filters.when !== 'any')
    chips.push({
      key: 'when',
      label: filters.when === 'today' ? t.patient.results.today : t.patient.results.thisWeek,
      clear: () => onChange({ when: 'any' }),
    })
  if (filters.maxKm !== null)
    chips.push({ key: 'km', label: t.patient.results.withinKm(filters.maxKm), clear: () => onChange({ maxKm: null }) })
  if (filters.video) chips.push({ key: 'video', label: t.common.video, clear: () => onChange({ video: false }) })
  if (filters.newPatients)
    chips.push({ key: 'new', label: t.patient.results.newPatients, clear: () => onChange({ newPatients: false }) })
  if (filters.stepFree) chips.push({ key: 'step', label: t.common.stepFree, clear: () => onChange({ stepFree: false }) })

  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
      {chips.map((chip) =>
        chip.clear ? (
          <button
            key={chip.key}
            type="button"
            onClick={chip.clear}
            aria-label={`${chip.label}, ${t.patient.results.clear}`}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-chip bg-ink/[0.05] pr-2.5 pl-3.5 text-subheadline font-medium text-ink transition-[background-color,transform] duration-150 ease-out active:scale-[0.97]"
          >
            {chip.label}
            <X aria-hidden size={15} className="text-muted" />
          </button>
        ) : (
          <span
            key={chip.key}
            className="inline-flex h-9 shrink-0 items-center rounded-chip bg-ink/[0.05] px-3.5 text-subheadline font-medium text-ink"
          >
            {chip.label}
          </span>
        ),
      )}
    </div>
  )
}

type NoMatchProps = {
  suggestion: ReturnType<typeof relaxFilters>
  onRelax: (filters: Filters) => void
  onReset: () => void
}

const NoMatch = ({ suggestion, onRelax, onReset }: NoMatchProps) => {
  const t = useT()
  const f = useFormat()
  return (
    <div className="flex flex-col items-center px-8 pt-10 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-surface text-muted shadow-card">
        <SearchX aria-hidden size={26} />
      </span>
      <h2 className="mt-4 text-title2 font-semibold text-balance text-ink">{t.patient.results.noMatchTitle}</h2>
      {suggestion && (
        <p className="mt-2 text-body text-pretty text-muted">
          {t.patient.results.noMatchSuggest(f.languageNames[suggestion.language], suggestion.km)}
        </p>
      )}
      <div className="mt-6 flex w-full flex-col gap-2">
        {suggestion && (
          <Button size="lg" fullWidth onClick={() => onRelax(suggestion.filters)}>
            {t.patient.results.noMatchAction}
          </Button>
        )}
        <Button variant="plain" fullWidth onClick={onReset}>
          {t.patient.results.noMatchReset}
        </Button>
      </div>
    </div>
  )
}

/** Placeholder cards shaped like DoctorResultCard */
const ResultSkeletons = () => (
  <ul aria-hidden className="space-y-3 px-4 pt-7">
    {[0, 1, 2].map((i) => (
      <li key={i} className="space-y-3 rounded-card bg-surface p-4 shadow-card">
        <Skeleton className="h-7 w-44" />
        <div className="flex gap-3">
          <Skeleton className="size-[72px] rounded-[18px]" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <div className="flex gap-1.5">
          <Skeleton className="h-9 w-[3.75rem] rounded-chip" />
          <Skeleton className="h-9 w-[3.75rem] rounded-chip" />
          <Skeleton className="h-9 w-[3.75rem] rounded-chip" />
        </div>
      </li>
    ))}
  </ul>
)
