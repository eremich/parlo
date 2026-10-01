import { MessageSquareReply, Star } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../components/Button'
import { TextArea } from '../../components/TextArea'
import { doctorById } from '../../data/doctors'
import type { Review } from '../../data/types'
import { useT } from '../../i18n'
import { useFormat } from '../../i18n/useFormat'
import { useApp } from '../../store/app'
import { PRACTICE_DOCTORS } from './practice'

/** Every review with its reasons; reception can reply publicly. */
export const ReviewsPage = () => {
  const t = useT()
  const tr = t.staff.reviewsPage
  const reviews = useApp((s) => s.reviews)
  const ids = PRACTICE_DOCTORS.map((d) => d.id)
  const practiceReviews = reviews.filter((r) => ids.includes(r.doctorId))

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-page-title font-semibold text-ink">{tr.title}</h1>
        <p className="mt-0.5 text-web-body text-muted">{tr.lead}</p>
      </header>
      <ul className="space-y-4">
        {practiceReviews.map((r) => (
          <ReviewItem key={r.id} review={r} />
        ))}
      </ul>
    </div>
  )
}

const ReviewItem = ({ review: r }: { review: Review }) => {
  const t = useT()
  const tr = t.staff.reviewsPage
  const f = useFormat()
  const replyToReview = useApp((s) => s.replyToReview)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(r.reply ?? '')

  return (
    <li className="rounded-card bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-web-body font-semibold text-ink">{r.author}</p>
          <p className="text-meta text-muted">
            {f.date(r.date)} · {doctorById(r.doctorId).name}
          </p>
        </div>
        <div className="flex gap-4 text-meta text-muted">
          {(
            [
              [t.patient.review.doctor, r.doctorRating],
              [t.patient.review.practice, r.practiceRating],
            ] as const
          ).map(([label, value]) => (
            <span key={label} className="flex items-center gap-1">
              {label}
              <Star aria-hidden size={14} className="fill-accent text-accent" />
              <span className="font-semibold text-ink tabular-nums">{value}</span>
            </span>
          ))}
        </div>
      </div>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {r.reasons.map((reason) => (
          <li key={reason} className="rounded-chip bg-brand-soft px-2.5 py-1 text-meta font-medium text-brand">
            {t.reason[reason]}
          </li>
        ))}
      </ul>
      <p className="mt-3 max-w-[70ch] text-web-body text-pretty text-ink">
        {r.comment ?? <span className="text-muted">{tr.noComment}</span>}
      </p>

      {r.reply && !editing ? (
        <div className="mt-4 rounded-card bg-canvas p-4">
          <p className="flex items-center gap-1.5 text-meta font-semibold text-ink">
            <MessageSquareReply aria-hidden size={15} className="text-brand" />
            {tr.replied}
          </p>
          <p className="mt-1 text-web-body text-ink">{r.reply}</p>
          <Button size="sm" variant="plain" className="mt-1 -ml-3" onClick={() => setEditing(true)}>
            {tr.edit}
          </Button>
        </div>
      ) : editing ? (
        <div className="mt-4 space-y-2">
          <TextArea label={tr.replyLabel} placeholder={tr.replyPlaceholder} value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus />
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={!draft.trim()}
              onClick={() => {
                replyToReview(r.id, draft.trim())
                setEditing(false)
              }}
            >
              {tr.send}
            </Button>
            <Button size="sm" variant="plain" onClick={() => setEditing(false)}>
              {t.common.close}
            </Button>
          </div>
        </div>
      ) : (
        <Button size="sm" variant="secondary" icon={MessageSquareReply} className="mt-4" onClick={() => setEditing(true)}>
          {tr.reply}
        </Button>
      )}
    </li>
  )
}
