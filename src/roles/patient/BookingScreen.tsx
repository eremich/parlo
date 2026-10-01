import type { LucideIcon } from 'lucide-react'
import { Check, ChevronRight, FileText, Stethoscope, UserRoundPlus, Video, X } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { ROW_ICON_SIZE } from '../../components/List'
import { Avatar } from '../../components/Avatar'
import { Banner } from '../../components/Banner'
import { Button } from '../../components/Button'
import { Checkbox } from '../../components/Checkbox'
import { Chip } from '../../components/Chip'
import { NavBar } from '../../components/NavBar'
import { Screen } from '../../components/Screen'
import { BACK } from '../../components/StackRoutes'
import { PersonSelect } from '../../components/PersonSelect'
import { TextArea } from '../../components/TextArea'
import { doctorById, practiceById } from '../../data/doctors'
import { availability } from '../../data/schedule'
import type { VisitType } from '../../data/types'
import { useT } from '../../i18n'
import { useFormat } from '../../i18n/useFormat'
import { cx } from '../../lib/cx'
import { ageOf } from '../../lib/format'
import { SlotPicker } from '../../patterns/SlotPicker'
import { useApp, useCurrentPatient } from '../../store/app'
import { AccountStep } from './AccountStep'

type Step = 'type' | 'slot' | 'account' | 'consent' | 'details'

const VISIT_ICONS: Record<VisitType, LucideIcon> = { new: UserRoundPlus, followUp: Stethoscope, video: Video }

export const BookingScreen = () => {
  const { id = '' } = useParams()
  const location = useLocation()
  const preset = (location.state ?? {}) as { date?: string; time?: string }
  const t = useT()
  const f = useFormat()
  const tb = t.patient.booking
  const navigate = useNavigate()

  const doctor = doctorById(id)
  const practice = practiceById(doctor.practiceId)
  const patient = useCurrentPatient()
  const patients = useApp((s) => s.patients)
  const appointments = useApp((s) => s.appointments)
  const clock = useApp((s) => s.clock)
  const consents = useApp((s) => s.consents)
  const giveConsent = useApp((s) => s.giveConsent)
  const book = useApp((s) => s.book)

  const days = useMemo(() => availability(doctor.id, appointments), [doctor.id, appointments, clock])
  const firstFree = days.find((d) => d.times.length)

  const [step, setStep] = useState<Step>('type')
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [visitType, setVisitType] = useState<VisitType>()
  const [date, setDate] = useState(preset.date ?? firstFree?.date ?? days[0].date)
  const [time, setTime] = useState(preset.time ?? firstFree?.times[0])
  const [forId, setForId] = useState<string>()
  const [consent, setConsent] = useState(false)
  const [consentError, setConsentError] = useState(false)
  const [reason, setReason] = useState('')
  const [taken, setTaken] = useState<{ date: string; time: string }>()

  const family = patient ? patients.filter((p) => p.guardianId === patient.id) : []
  const bookingFor = forId ?? patient?.id
  const hasConsent = patient ? consents.includes(`${patient.id}|${practice.id}`) : false
  const autoConfirm = ['gp', 'pediatrics', 'dentist'].includes(doctor.specialty)

  // Steps are decided up front so the progress count stays stable
  const [steps] = useState<Step[]>(() => [
    'type',
    'slot',
    ...(patient ? [] : (['account'] as Step[])),
    ...(hasConsent ? [] : (['consent'] as Step[])),
    'details',
  ])
  const index = steps.indexOf(step)
  const go = (delta: number) => {
    const next = steps[index + delta]
    setDirection(delta > 0 ? 'forward' : 'back')
    if (next) setStep(next)
    else navigate(-1)
  }

  const confirm = () => {
    if (!bookingFor || !visitType || !time) return
    const result = book({ patientId: bookingFor, doctorId: doctor.id, date, time, visitType, reason: reason || undefined })
    if (result.status === 'booked') navigate(`/booked/${result.appointment.id}`, { replace: true })
    else {
      setTaken(result.next)
      setTime(undefined)
    }
  }

  const footer: Record<Step, ReactNode> = {
    type: null,
    slot: (
      <Button size="lg" fullWidth disabled={!time} onClick={() => go(1)}>
        {t.common.continue}
      </Button>
    ),
    account: null,
    consent: (
      <Button
        size="lg"
        fullWidth
        onClick={() => {
          if (!consent || !patient) return setConsentError(true)
          giveConsent(patient.id, practice.id)
          go(1)
        }}
      >
        {t.common.continue}
      </Button>
    ),
    details: (
      <Button size="lg" fullWidth disabled={!time} onClick={confirm}>
        {time ? (autoConfirm ? tb.confirm(time) : tb.request(time)) : t.patient.doctor.pickTime}
      </Button>
    ),
  }

  return (
    <Screen push footer={footer[step]}>
      <NavBar
        title={tb.step(index + 1, steps.length)}
        backLabel={t.common.back}
        onBack={() => go(-1)}
        trailing={
          <button
            type="button"
            aria-label={t.common.close}
            onClick={() => navigate(`/doctor/${doctor.id}`, { replace: true, state: BACK })}
            className="flex size-11 items-center justify-center text-muted"
          >
            <X aria-hidden size={22} />
          </button>
        }
      />
      <Progress value={(index + 1) / steps.length} />

      <div key={step} className={cx('px-4 pt-5', direction === 'forward' ? 'animate-screen-in' : 'animate-screen-back')}>
        <DoctorLine name={doctor.name} photo={doctor.photo} detail={`${t.specialty[doctor.specialty]} · ${practice.name}`} />

        {step === 'type' && (
          <StepBody title={tb.typeTitle}>
            {family.length > 0 && patient && (
              <div className="mb-5">
                <PersonSelect
                  label={tb.forWhom}
                  value={bookingFor ?? patient.id}
                  onChange={setForId}
                  options={[patient, ...family].map((p) => ({
                    id: p.id,
                    name: p.name,
                    detail:
                      p.id === patient.id
                        ? t.patient.family.you
                        : `${t.patient.family.relation[p.relation ?? 'child']} · ${t.patient.family.age(ageOf(p.birthDate, clock.date) ?? 0)}`,
                  }))}
                />
              </div>
            )}
            <ul className="space-y-2.5">
              {doctor.visitTypes.map((type) => {
                const Icon = VISIT_ICONS[type]
                return (
                  <li key={type}>
                    <button
                      type="button"
                      onClick={() => {
                        setVisitType(type)
                        go(1)
                      }}
                      className={cx(
                        'flex w-full items-center gap-3 rounded-card bg-surface p-4 text-left shadow-card ring-inset',
                        'transition-[box-shadow,transform] duration-150 ease-out active:scale-[0.99]',
                        visitType === type ? 'ring-2 ring-brand' : 'ring-1 ring-transparent',
                      )}
                    >
                      <span className="flex w-7 shrink-0 items-center justify-center text-brand">
                        <Icon aria-hidden size={ROW_ICON_SIZE} />
                      </span>
                      <span className="flex-1">
                        <span className="block text-headline text-ink">{t.visitType[type]}</span>
                        <span className="block text-subheadline text-muted">{t.visitTypeHint[type]}</span>
                      </span>
                      <ChevronRight aria-hidden size={18} className="text-muted/70" />
                    </button>
                  </li>
                )
              })}
            </ul>
          </StepBody>
        )}

        {step === 'slot' && (
          <StepBody title={tb.slotTitle}>
            {doctor.referralExpected && visitType === 'new' && (
              <div className="mb-4">
                <Banner tone="info" icon={FileText} title={tb.referralTitle}>
                  {tb.referralBody}
                </Banner>
              </div>
            )}
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
              bookLabel={t.common.book}
              daysLabel={tb.slotTitle}
            />
          </StepBody>
        )}

        {step === 'account' && <AccountStep onDone={() => go(1)} />}

        {step === 'consent' && (
          <StepBody title={tb.consentTitle} lead={tb.consentLead(practice.name)}>
            <div className="rounded-card bg-surface p-4 shadow-card">
              <p className="text-footnote font-semibold text-muted">{tb.consentWhat}</p>
              <ul className="mt-2 space-y-1.5">
                {tb.consentItems.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-subheadline text-ink">
                    <Check aria-hidden size={16} className="mt-0.5 shrink-0 text-brand" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4">
              <Checkbox
                label={tb.consentCheck(practice.name)}
                description={tb.consentNote}
                checked={consent}
                onChange={(v) => {
                  setConsent(v)
                  setConsentError(false)
                }}
              />
              {consentError && (
                <p role="alert" className="mt-1 pl-9 text-footnote text-error-text">
                  {tb.consentRequired}
                </p>
              )}
            </div>
          </StepBody>
        )}

        {step === 'details' && (
          <StepBody title={tb.detailsTitle}>
            {taken && (
              <div className="mb-4">
                <Banner
                  tone="error"
                  title={tb.takenTitle}
                  action={
                    <Button
                      onClick={() => {
                        setDate(taken.date)
                        setTime(taken.time)
                        setTaken(undefined)
                      }}
                    >
                      {tb.takenAction(taken.time)}
                    </Button>
                  }
                >
                  {tb.takenBody(`${f.day(taken.date)} ${taken.time}`)}
                </Banner>
              </div>
            )}
            <div className="flex flex-wrap gap-2 pb-3">
              {tb.quickReasons.map((r) => (
                <Chip key={r} selected={reason === r} onPressedChange={(on) => setReason(on ? r : '')}>
                  {r}
                </Chip>
              ))}
            </div>
            <TextArea
              label={tb.reasonLabel}
              placeholder={tb.reasonPlaceholder}
              hint={tb.reasonHint}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <h3 className="pt-6 pb-2 text-headline text-ink">{tb.summary}</h3>
            <dl className="divide-y divide-line rounded-card bg-surface px-4 shadow-card">
              <Row label={tb.summaryVisit}>{visitType && t.visitType[visitType]}</Row>
              <Row label={tb.summaryWhen}>
                {time ? (
                  <span className="tabular-nums">
                    {f.day(date)}, {time}
                  </span>
                ) : (
                  '—'
                )}
              </Row>
              <Row label={tb.forWhom}>{patients.find((p) => p.id === bookingFor)?.name}</Row>
              <Row label={tb.summaryCost}>
                {f.cost(doctor, patients.find((p) => p.id === bookingFor)?.insurance ?? 'public')}
              </Row>
            </dl>
            {!autoConfirm && <p className="mt-3 text-footnote text-muted">{tb.requestNote}</p>}
          </StepBody>
        )}
      </div>
    </Screen>
  )
}

const Progress = ({ value }: { value: number }) => (
  <div aria-hidden className="mx-4 h-1 overflow-hidden rounded-full bg-line">
    <div
      className="h-full origin-left rounded-full bg-brand transition-transform duration-300 ease-out"
      style={{ transform: `scaleX(${value})` }}
    />
  </div>
)

const DoctorLine = ({ name, photo, detail }: { name: string; photo?: string; detail: string }) => (
  <div className="flex items-center gap-3 pb-5">
    <Avatar name={name} src={photo} size="sm" />
    <div className="min-w-0">
      <p className="text-subheadline font-semibold text-ink">{name}</p>
      <p className="truncate text-subheadline text-muted">{detail}</p>
    </div>
  </div>
)

export const StepBody = ({ title, lead, children }: { title: string; lead?: string; children: ReactNode }) => (
  <section>
    <h2 className="font-display text-[28px] leading-[34px] font-bold tracking-[-0.01em] text-balance text-ink">{title}</h2>
    {lead && <p className="mt-1.5 text-body text-pretty text-muted">{lead}</p>}
    <div className="mt-5">{children}</div>
  </section>
)

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex min-h-11 items-center justify-between gap-4 py-2.5">
    <dt className="text-subheadline text-muted">{label}</dt>
    <dd className="text-right text-subheadline font-semibold text-ink">{children}</dd>
  </div>
)
