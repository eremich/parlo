import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Button } from '../../components/Button'
import { NavBar } from '../../components/NavBar'
import { Screen } from '../../components/Screen'
import { doctorById } from '../../data/doctors'
import { availability } from '../../data/schedule'
import { useT } from '../../i18n'
import { useFormat } from '../../i18n/useFormat'
import { SlotPicker } from '../../patterns/SlotPicker'
import { useApp } from '../../store/app'
import { StepBody } from './BookingScreen'

/** Move an appointment to another free time with the same doctor. The old slot is freed. */
export const RescheduleScreen = () => {
  const { id } = useParams()
  const t = useT()
  const f = useFormat()
  const navigate = useNavigate()
  const appointments = useApp((s) => s.appointments)
  const clock = useApp((s) => s.clock)
  const reschedule = useApp((s) => s.reschedule)
  const appointment = appointments.find((a) => a.id === id)

  const days = useMemo(
    () => (appointment ? availability(appointment.doctorId, appointments) : []),
    [appointment, appointments, clock],
  )
  const first = days.find((d) => d.times.length)
  const [date, setDate] = useState(first?.date ?? clock.date)
  const [time, setTime] = useState<string>()

  if (!appointment) return null
  const doctor = doctorById(appointment.doctorId)
  const when = time ? `${f.day(date)}, ${time}` : ''

  return (
    <Screen
      push
      footer={
        <Button
          size="lg"
          fullWidth
          disabled={!time}
          onClick={() => {
            if (!time) return
            reschedule(appointment.id, date, time)
            navigate(`/appointment/${appointment.id}`, { replace: true, state: { movedTo: when } })
          }}
        >
          {time ? t.patient.reschedule.move(when) : t.patient.doctor.pickTime}
        </Button>
      }
    >
      <NavBar backLabel={t.common.back} onBack={() => navigate(-1)} />
      <div className="px-4 pt-3">
        <StepBody title={t.patient.reschedule.title} lead={`${doctor.name} · ${f.day(appointment.date)}, ${appointment.time}`}>
          <SlotPicker
            days={days.slice(0, 21).map((d) => ({
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
            emptyLabel={t.patient.doctor.noTimes}
            bookLabel={(tm) => t.patient.reschedule.move(tm)}
            daysLabel={t.patient.reschedule.title}
          />
        </StepBody>
      </div>
    </Screen>
  )
}
