import { Heart } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Avatar } from '../../components/Avatar'
import { Button } from '../../components/Button'
import { Chip } from '../../components/Chip'
import { NavBar } from '../../components/NavBar'
import { Screen } from '../../components/Screen'
import { StarRating } from '../../components/StarRating'
import { TextArea } from '../../components/TextArea'
import { doctorById, practiceById } from '../../data/doctors'
import type { ReviewReason } from '../../data/types'
import { useT } from '../../i18n'
import { useFormat } from '../../i18n/useFormat'
import { useApp } from '../../store/app'

const POSITIVE: ReviewReason[] = ['spokeMyLanguage', 'explainedClearly', 'tookTime', 'friendlyStaff', 'onTime']
const NEGATIVE: ReviewReason[] = ['longWait', 'startedLate']

/** Doctor and practice are rated separately; reasons are chips that feed the practice's insights. */
export const ReviewScreen = () => {
  const { id } = useParams()
  const t = useT()
  const tr = t.patient.review
  const f = useFormat()
  const navigate = useNavigate()
  const appointment = useApp((s) => s.appointments.find((a) => a.id === id))
  const submitReview = useApp((s) => s.submitReview)
  const [doctorRating, setDoctorRating] = useState(0)
  const [practiceRating, setPracticeRating] = useState(0)
  const [reasons, setReasons] = useState<ReviewReason[]>([])
  const [comment, setComment] = useState('')
  const [tried, setTried] = useState(false)
  const [sent, setSent] = useState(false)

  if (!appointment) return null
  const doctor = doctorById(appointment.doctorId)
  const practice = practiceById(doctor.practiceId)
  const ready = doctorRating > 0 && practiceRating > 0
  const toggle = (r: ReviewReason) => setReasons((rs) => (rs.includes(r) ? rs.filter((x) => x !== r) : [...rs, r]))

  if (sent)
    return (
      <Screen
        footer={
          <Button size="lg" fullWidth onClick={() => navigate('/appointments', { replace: true })}>
            {tr.back}
          </Button>
        }
      >
        <div className="flex flex-col items-center px-6 pt-28 text-center">
          <span className="flex size-20 animate-pop-in items-center justify-center rounded-full bg-accent-soft text-accent-text">
            <Heart aria-hidden size={36} strokeWidth={1.75} />
          </span>
          <h1 className="mt-5 font-display text-large-title font-bold text-ink">{tr.thanks}</h1>
          <p className="mt-2 max-w-[30ch] text-body text-pretty text-muted">{tr.thanksBody}</p>
        </div>
      </Screen>
    )

  return (
    <Screen
      push
      footer={
        <>
          {tried && !ready && (
            <p role="alert" className="pb-2 text-center text-footnote text-error-text">
              {tr.needRating}
            </p>
          )}
          <Button
            size="lg"
            fullWidth
            onClick={() => {
              setTried(true)
              if (!ready) return
              submitReview(appointment.id, { doctorRating, practiceRating, reasons, comment: comment.trim() || undefined })
              setSent(true)
            }}
          >
            {tr.send}
          </Button>
        </>
      }
    >
      <NavBar backLabel={t.common.back} onBack={() => navigate(-1)} />
      <div className="px-4 pt-3">
        <h1 className="font-display text-[28px] leading-[34px] font-bold tracking-[-0.01em] text-ink">{tr.title}</h1>
        <p className="mt-1 text-subheadline text-muted">
          {f.date(appointment.date)} · {practice.name}
        </p>

        <div className="mt-5 divide-y divide-line rounded-card bg-surface px-4 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2 py-3">
            <span className="flex items-center gap-3">
              <Avatar name={doctor.name} src={doctor.photo} size="sm" />
              <span>
                <span className="block text-footnote text-muted">{tr.doctor}</span>
                <span className="block text-headline text-ink">{doctor.name}</span>
              </span>
            </span>
            <StarRating label={`${tr.doctor}: ${doctor.name}`} value={doctorRating} onChange={setDoctorRating} starLabel={tr.stars} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 py-3">
            <span>
              <span className="block text-footnote text-muted">{tr.practice}</span>
              <span className="block text-headline text-ink">{practice.name}</span>
            </span>
            <StarRating label={`${tr.practice}: ${practice.name}`} value={practiceRating} onChange={setPracticeRating} starLabel={tr.stars} />
          </div>
        </div>

        <h2 className="pt-7 pb-2.5 text-headline text-ink">{tr.what}</h2>
        <div className="flex flex-wrap gap-2">
          {[...POSITIVE, ...NEGATIVE].map((r) => (
            <Chip key={r} selected={reasons.includes(r)} onPressedChange={() => toggle(r)}>
              {t.reason[r]}
            </Chip>
          ))}
        </div>

        <TextArea
          className="pt-6"
          label={tr.comment}
          placeholder={tr.commentPlaceholder}
          hint={tr.note}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
    </Screen>
  )
}
