import { Accessibility, Check, FileText, MapPin, ShieldCheck, UserPlus, Video } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Avatar } from '../../components/Avatar'
import { Button } from '../../components/Button'
import { NavBar } from '../../components/NavBar'
import { Screen } from '../../components/Screen'
import { doctorById, practiceById } from '../../data/doctors'
import { REVIEWS } from '../../data/reviews'
import { availability } from '../../data/schedule'
import { SERVICES } from '../../data/services'
import type { ReviewReason } from '../../data/types'
import { useT } from '../../i18n'
import { useFormat } from '../../i18n/useFormat'
import { BerlinMap } from '../../patterns/BerlinMap'
import { LanguageChips, LanguageList } from '../../patterns/LanguageChips'
import { Rating } from '../../patterns/Meta'
import { SlotPicker } from '../../patterns/SlotPicker'
import { useApp, useCurrentPatient } from '../../store/app'

const PICKER_DAYS = 14

export const DoctorScreen = () => {
  const { id = '' } = useParams()
  const t = useT()
  const f = useFormat()
  const navigate = useNavigate()
  const appointments = useApp((s) => s.appointments)
  const clock = useApp((s) => s.clock)
  const insurance = useCurrentPatient()?.insurance ?? useApp.getState().filters.insurance
  const doctor = doctorById(id)
  const practice = practiceById(doctor.practiceId)

  const days = useMemo(() => availability(doctor.id, appointments), [doctor.id, appointments, clock])
  const firstFree = days.find((d) => d.times.length)
  const [date, setDate] = useState(firstFree?.date ?? days[0].date)
  const [time, setTime] = useState(firstFree?.times[0])

  const reviews = REVIEWS.filter((r) => r.doctorId === doctor.id)
  const td = t.patient.doctor

  // Show the whole horizon when the earliest slot is weeks away (specialists)
  const pickerDays = days.slice(0, Math.max(PICKER_DAYS, days.findIndex((d) => d.times.length) + 7))

  return (
    <Screen
      push
      footer={
        <Button
          size="lg"
          fullWidth
          disabled={!time}
          onClick={() => navigate(`/book/${doctor.id}`, { state: { date, time } })}
        >
          {time ? td.bookAt(f.day(date), time) : td.pickTime}
        </Button>
      }
    >
      <NavBar backLabel={t.common.back} onBack={() => navigate(-1)} />

      <header className="flex flex-col items-center px-4 pt-2 text-center">
        <Avatar name={doctor.name} src={doctor.photo} size="xl" />
        <h1 className="mt-3 font-display text-[28px] leading-[34px] font-bold tracking-[-0.01em] text-balance text-ink">
          {doctor.name}
        </h1>
        <p className="mt-0.5 text-subheadline text-muted">
          {t.specialty[doctor.specialty]} · {practice.name}
        </p>
        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
          <Rating value={doctor.rating} count={doctor.reviewCount} label={t.common.rating(doctor.rating, doctor.reviewCount)} />
        </div>
      </header>

      <Section title={td.pickTime}>
        <SlotPicker
          days={pickerDays.map((d) => ({
            date: d.date,
            weekday: f.weekday(d.date),
            dayOfMonth: String(Number(d.date.slice(8))),
            times: d.times,
          }))}
          selectedDate={date}
          selectedTime={time}
          onSelectDate={(d) => {
            setDate(d)
            setTime(undefined)
          }}
          onSelectTime={setTime}
          emptyLabel={td.noTimes}
          bookLabel={t.common.book}
          daysLabel={td.pickTime}
        />
        {doctor.referralExpected && (
          <p className="mt-3 flex items-start gap-1.5 text-subheadline text-muted">
            <FileText aria-hidden size={15} className="mt-px shrink-0" />
            {td.referralNote}
          </p>
        )}
      </Section>

      <Section title={td.languages}>
        <div className="rounded-card bg-surface px-4 shadow-card">
          <LanguageList
            languages={doctor.languages}
            names={f.languageNames}
          />
        </div>
      </Section>

      <Section title={td.insurance}>
        <FactList>
          <Fact icon={ShieldCheck} title={f.insurance(doctor)} detail={f.cost(doctor, insurance)} />
          <Fact
            icon={UserPlus}
            title={doctor.acceptsNewPatients ? td.acceptsNew : td.notAcceptingNew}
          />
          {doctor.visitTypes.includes('video') && <Fact icon={Video} title={t.visitType.video} />}
        </FactList>
      </Section>

      <Section title={td.services}>
        <ul className="flex flex-wrap gap-2">
          {SERVICES[f.lang][doctor.specialty].map((service) => (
            <li key={service} className="rounded-chip bg-surface px-3 py-1.5 text-subheadline text-ink ring-1 ring-line ring-inset">
              {service}
            </li>
          ))}
        </ul>
      </Section>

      <Section title={td.practice}>
        <div className="overflow-hidden rounded-card bg-surface shadow-card">
          <div className="h-32">
            <BerlinMap
              districts={false}
              label={practice.name}
              pins={[{ id: practice.id, x: practice.map.x, y: practice.map.y, label: practice.district, title: practice.name }]}
              selectedId={practice.id}
            />
          </div>
          <div className="space-y-2 p-4">
            <p className="text-headline text-ink">{practice.name}</p>
            <p className="flex items-center gap-1.5 text-subheadline text-muted">
              <MapPin aria-hidden size={15} />
              {practice.street}, {practice.district} · {f.distance(practice.distanceKm)}
            </p>
            {practice.stepFree && (
              <p className="flex items-center gap-1.5 text-subheadline text-muted">
                <Accessibility aria-hidden size={15} />
                {t.common.stepFree}
              </p>
            )}
            <div className="flex items-center gap-2 pt-1 text-subheadline text-muted">
              {td.receptionSpeaks}
              <LanguageChips
                size="sm"
                languages={practice.receptionLanguages.map((code) => ({ code, level: 'fluent' as const }))}
                names={f.languageNames}
                prefix={td.receptionSpeaks}
              />
            </div>
          </div>
        </div>
      </Section>

      {reviews.length > 0 && <Reviews reviews={reviews} />}
    </Screen>
  )
}

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="px-4 pt-7">
    <h2 className="pb-2.5 text-title2 font-semibold text-ink">{title}</h2>
    {children}
  </section>
)

const FactList = ({ children }: { children: ReactNode }) => (
  <ul className="divide-y divide-line rounded-card bg-surface px-4 shadow-card">{children}</ul>
)

const Fact = ({ icon: Icon, title, detail }: { icon: typeof Check; title: string; detail?: string }) => (
  <li className="flex min-h-11 items-center gap-3 py-2.5">
    <Icon aria-hidden size={18} className="shrink-0 text-brand" />
    <span className="min-w-0">
      <span className="block text-body text-ink">{title}</span>
      {detail && <span className="block text-subheadline text-muted">{detail}</span>}
    </span>
  </li>
)

const Reviews = ({ reviews }: { reviews: typeof REVIEWS }) => {
  const t = useT()
  const f = useFormat()
  const td = t.patient.doctor
  const avg = (key: 'doctorRating' | 'practiceRating') => reviews.reduce((s, r) => s + r[key], 0) / reviews.length

  const counts = new Map<ReviewReason, number>()
  for (const r of reviews) for (const reason of r.reasons) counts.set(reason, (counts.get(reason) ?? 0) + 1)
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4)

  return (
    <Section title={td.reviews}>
      <div className="grid grid-cols-2 gap-3">
        {(['doctorRating', 'practiceRating'] as const).map((key) => (
          <div key={key} className="rounded-card bg-surface p-4 shadow-card">
            <p className="text-footnote text-muted">{key === 'doctorRating' ? td.doctorRating : td.practiceRating}</p>
            <p className="text-title2 font-semibold text-ink tabular-nums">
              {avg(key).toLocaleString(f.lang === 'de' ? 'de-DE' : 'en-GB', { maximumFractionDigits: 1, minimumFractionDigits: 1 })}
            </p>
          </div>
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-2">
        {top.map(([reason, n]) => (
          <li
            key={reason}
            className="inline-flex h-8 items-center gap-1.5 rounded-chip bg-brand-soft px-3 text-subheadline font-medium text-brand"
          >
            {t.reason[reason]}
            <span className="text-footnote text-brand/80 tabular-nums">{td.mentioned(n)}</span>
          </li>
        ))}
      </ul>
      <ul className="mt-3 space-y-3">
        {reviews.map((review) => (
          <li key={review.id} className="rounded-card bg-surface p-4 shadow-card">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-headline text-ink">{review.author}</p>
              <p className="text-footnote text-muted">{f.date(review.date)}</p>
            </div>
            <p className="mt-1 text-subheadline text-muted">{review.reasons.map((r) => t.reason[r]).join(' · ')}</p>
            {review.comment && <p className="mt-2 text-body text-pretty text-ink">{review.comment}</p>}
          </li>
        ))}
      </ul>
    </Section>
  )
}
