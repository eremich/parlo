import { CalendarDays, ChevronRight, Navigation, Search, SlidersHorizontal, Stethoscope } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ROW_ICON_SIZE } from '../../components/List'
import { Avatar } from '../../components/Avatar'
import { Chip } from '../../components/Chip'
import { Screen } from '../../components/Screen'
import { TextField } from '../../components/TextField'
import { doctorById } from '../../data/doctors'
import { suggestDoctors, suggestSpecialties } from '../../data/search'
import type { Specialty } from '../../data/types'
import { useT } from '../../i18n'
import { useFormat } from '../../i18n/useFormat'
import { useApp, useCurrentPatient } from '../../store/app'
import { OfflineBanner } from './OfflineBanner'

const QUICK: Specialty[] = ['gp', 'dentist', 'gynecology', 'dermatology', 'pediatrics', 'ent']

export const SearchScreen = () => {
  const t = useT()
  const f = useFormat()
  const navigate = useNavigate()
  const patient = useCurrentPatient()
  const filters = useApp((s) => s.filters)
  const setFilters = useApp((s) => s.setFilters)
  const appointments = useApp((s) => s.appointments)
  const today = useApp((s) => s.clock.date)
  const hour = Number(useApp((s) => s.clock.time).slice(0, 2))
  const dayPart = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'
  const [query, setQuery] = useState('')

  const next = patient
    ? appointments
        .filter((a) => (a.patientId === patient.id) && a.date >= today && (a.status === 'confirmed' || a.status === 'pending'))
        .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0]
    : undefined

  const openResults = (patch: Parameters<typeof setFilters>[0]) => {
    setFilters({ doctorQuery: '', ...patch })
    navigate('/results')
  }

  const specialties = suggestSpecialties(query)
  const doctors = suggestDoctors(query)
  const typing = query.trim().length >= 2

  return (
    <Screen tabBar>
      {/* Status-bar backing: fades in only once the page scrolls, so at rest the header is one seamless surface.
          Also turns the clock white. */}
      <div
        data-statusbar="light"
        aria-hidden
        className="hero-surface hero-strip pointer-events-none sticky top-0 z-20 -mb-[54px] h-[54px]"
      />

      <div className="hero-surface pb-6 text-on-hero">
        <header className="px-4 pt-[62px] pb-3">
          {patient && (
            <p className="mb-1 text-subheadline text-on-hero/80">{t.patient.search.greeting(dayPart, patient.name.split(' ')[0])}</p>
          )}
          <h1 className="font-display text-large-title font-bold tracking-[-0.01em]">{t.patient.search.title}</h1>
        </header>

        <form
          className="px-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (specialties[0]) openResults({ specialty: specialties[0] })
            else if (doctors.length) openResults({ specialty: null, doctorQuery: query.trim() })
          }}
        >
          <TextField
            label={t.patient.search.field}
            hideLabel
            icon={Search}
            type="search"
            placeholder={t.patient.search.field}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-describedby="search-hint"
          />
          <p id="search-hint" className="mt-2 flex items-center gap-1.5 text-footnote text-on-hero/80">
            <Navigation aria-hidden size={13} />
            {t.patient.search.location} {t.patient.search.locationValue}
          </p>
        </form>

        {!typing && (
          <section className="pt-6">
            <h2 className="px-4 pb-2 text-footnote text-on-hero/80">{t.patient.search.quick}</h2>
            <div className="flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
              {QUICK.map((s) => (
                <Chip key={s} tone="onHero" onPressedChange={() => openResults({ specialty: s })}>
                  {t.specialty[s]}
                </Chip>
              ))}
            </div>
          </section>
        )}
      </div>
      <OfflineBanner />

      {typing ? (
        <Suggestions
          specialties={specialties}
          doctorIds={doctors.map((d) => d.id)}
          onSpecialty={(s) => openResults({ specialty: s })}
          onDoctor={(id) => navigate(`/doctor/${id}`)}
        />
      ) : (
        <div className="space-y-7 pt-7">
          {patient && (
            <section className="px-4">
              <h2 className="pb-2 text-footnote text-muted">{t.patient.search.saved}</h2>
              <button
                type="button"
                onClick={() => openResults({ specialty: null })}
                className="flex w-full items-center gap-3 rounded-card bg-surface p-4 text-left shadow-card transition-transform duration-150 ease-out active:scale-[0.99]"
              >
                <span className="flex w-7 shrink-0 items-center justify-center text-brand">
                  <SlidersHorizontal aria-hidden size={ROW_ICON_SIZE} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-headline text-ink">
                    {t.patient.search.savedLanguages(f.languageList(filters.languages.length ? filters.languages : patient.languages))}
                  </span>
                  <span className="block text-subheadline text-muted">{t.patient.search.savedInsurance[filters.insurance]}</span>
                </span>
                <ChevronRight aria-hidden size={18} className="shrink-0 text-muted/70" />
              </button>
            </section>
          )}

          {next && (
            <section className="px-4">
              <h2 className="pb-2 text-footnote text-muted">{t.patient.search.nextAppointment}</h2>
              <button
                type="button"
                onClick={() => navigate('/appointments')}
                className="flex w-full items-center gap-3 rounded-card bg-surface p-4 text-left shadow-card transition-transform duration-150 ease-out active:scale-[0.99]"
              >
                <span className="flex w-7 shrink-0 items-center justify-center text-accent-text">
                  <CalendarDays aria-hidden size={ROW_ICON_SIZE} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-headline text-ink">
                    {f.day(next.date)} · <span className="tabular-nums">{next.time}</span>
                  </span>
                  <span className="block truncate text-subheadline text-muted">{doctorById(next.doctorId).name}</span>
                </span>
                <ChevronRight aria-hidden size={18} className="shrink-0 text-muted/70" />
              </button>
            </section>
          )}
        </div>
      )}
    </Screen>
  )
}

type SuggestionsProps = {
  specialties: Specialty[]
  doctorIds: string[]
  onSpecialty: (s: Specialty) => void
  onDoctor: (id: string) => void
}

const Suggestions = ({ specialties, doctorIds, onSpecialty, onDoctor }: SuggestionsProps) => {
  const t = useT()
  if (!specialties.length && !doctorIds.length)
    return <p className="px-4 pt-6 text-subheadline text-muted">{t.patient.search.noSuggestions}</p>

  const row = 'flex min-h-11 w-full items-center gap-3 px-4 py-2.5 text-left transition-colors active:bg-canvas'
  return (
    <div className="space-y-5 pt-5">
      {specialties.length > 0 && (
        <section>
          <h2 className="px-4 pb-1.5 text-footnote text-muted">{t.patient.search.lookFor}</h2>
          <ul className="mx-4 divide-y divide-line overflow-hidden rounded-card bg-surface shadow-card">
            {specialties.map((s) => (
              <li key={s}>
                <button type="button" className={row} onClick={() => onSpecialty(s)}>
                  <span className="flex w-7 shrink-0 items-center justify-center text-brand">
                    <Stethoscope aria-hidden size={ROW_ICON_SIZE} />
                  </span>
                  <span className="flex-1 text-body text-ink">{t.specialtyPlural[s]}</span>
                  <ChevronRight aria-hidden size={18} className="text-muted/70" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      {doctorIds.length > 0 && (
        <section>
          <h2 className="px-4 pb-1.5 text-footnote text-muted">{t.patient.search.doctors}</h2>
          <ul className="mx-4 divide-y divide-line overflow-hidden rounded-card bg-surface shadow-card">
            {doctorIds.map((id) => {
              const doctor = doctorById(id)
              return (
                <li key={id}>
                  <button type="button" className={row} onClick={() => onDoctor(id)}>
                    <Avatar name={doctor.name} src={doctor.photo} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-body text-ink">{doctor.name}</span>
                      <span className="block text-subheadline text-muted">{t.specialty[doctor.specialty]}</span>
                    </span>
                    <ChevronRight aria-hidden size={18} className="text-muted/70" />
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </div>
  )
}
