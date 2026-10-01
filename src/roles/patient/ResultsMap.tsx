import { useState } from 'react'
import { useNavigate } from 'react-router'
import { practiceById } from '../../data/doctors'
import type { Result } from '../../data/search'
import { useT } from '../../i18n'
import { useFormat } from '../../i18n/useFormat'
import { BerlinMap, type MapPin } from '../../patterns/BerlinMap'
import { DoctorResultCard } from '../../patterns/DoctorResultCard'
import { useApp } from '../../store/app'

/** Kreuzberg, the patients' default location on the drawn map */
const YOU = { x: 57, y: 66 }

/** One pin per practice, labelled with its earliest time; the selected practice's doctors slide up below. */
export const ResultsMap = ({ results }: { results: Result[] }) => {
  const t = useT()
  const f = useFormat()
  const navigate = useNavigate()
  const matched = useApp((s) => s.filters.languages)

  const byPractice = new Map<string, Result[]>()
  for (const r of results) byPractice.set(r.doctor.practiceId, [...(byPractice.get(r.doctor.practiceId) ?? []), r])

  const [selected, setSelected] = useState(results[0].doctor.practiceId)
  const selectedResults = byPractice.get(selected) ?? byPractice.values().next().value ?? []

  const pins: MapPin[] = [...byPractice.entries()].map(([practiceId, rs]) => {
    const practice = practiceById(practiceId)
    const first = rs[0].earliest
    // "Today 10:00", "Tomorrow 08:20", then weekday only: pins must stay short
    const day = f.day(first.date)
    const label = `${day.includes(',') ? f.weekday(first.date) : day} ${first.time}`
    return {
      id: practiceId,
      x: practice.map.x,
      y: practice.map.y,
      label,
      count: rs.length,
      title: `${practice.name}, ${f.day(first.date)} ${first.time}`,
    }
  })

  return (
    <div>
      <div className="relative h-[300px] overflow-hidden border-y border-line">
        <BerlinMap
          pins={pins}
          selectedId={selected}
          onSelect={setSelected}
          you={{ ...YOU, label: t.patient.results.youAreHere }}
          label={t.patient.results.mapLabel}
        />
      </div>
      <ul
        key={selected}
        className="flex shrink-0 snap-x snap-mandatory gap-3 overflow-x-auto px-4 pt-3 [scrollbar-width:none]"
      >
        {selectedResults.map(({ doctor, earliest, slots }) => {
          const practice = practiceById(doctor.practiceId)
          return (
            <li key={doctor.id} className="w-[calc(100%-16px)] shrink-0 snap-center animate-pop-in first:w-full">
              <DoctorResultCard
                name={doctor.name}
                photo={doctor.photo}
                subtitle={t.specialty[doctor.specialty]}
                distance={f.distance(practice.distanceKm)}
                earliest={{ day: f.day(earliest.date), time: earliest.time }}
                slots={slots.filter((s) => s.date === earliest.date).map((s) => s.time)}
                languages={doctor.languages}
                languageNames={f.languageNames}
                matchedLanguages={matched}
                insuranceLabel={f.insurance(doctor)}
                rating={doctor.rating}
                reviewCount={doctor.reviewCount}
                onOpen={() => navigate(`/doctor/${doctor.id}`)}
                onBookSlot={(time) => navigate(`/book/${doctor.id}`, { state: { date: earliest.date, time } })}
                labels={{ speaks: t.common.speaks, earliest: t.patient.doctor.earliest, book: t.common.book, allTimes: t.common.allTimes, rating: t.common.rating }}
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
