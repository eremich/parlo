import { CircleCheck, CircleDashed, FileUp, Hourglass, PartyPopper, Send, UserRoundSearch } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Banner } from '../../components/Banner'
import { Button } from '../../components/Button'
import { Chip } from '../../components/Chip'
import { TextField } from '../../components/TextField'
import { SERVICES } from '../../data/services'
import type { Insurance, LanguageCode, Onboarding, Specialty } from '../../data/types'
import { useT } from '../../i18n'
import { useFormat } from '../../i18n/useFormat'
import { cx } from '../../lib/cx'
import { useApp } from '../../store/app'

type StepId = 'details' | 'verification' | 'services' | 'invite' | 'profile' | 'hours' | 'live'
type Status = 'todo' | 'done' | 'pending' | 'waiting'

const STEPS: StepId[] = ['details', 'verification', 'services', 'invite', 'profile', 'hours', 'live']
const SPECIALTIES: Specialty[] = ['gp', 'dentist', 'gynecology', 'dermatology', 'pediatrics', 'ent']
const LANGUAGES: LanguageCode[] = ['DE', 'EN', 'TR', 'AR', 'RU', 'UK', 'PL', 'FR', 'ES', 'FA']

const statusOf = (step: StepId, o: Onboarding): Status => {
  switch (step) {
    case 'details':
      return o.practice.name && o.practice.street ? 'done' : 'todo'
    case 'verification':
      return o.verification === 'verified' ? 'done' : o.verification === 'pending' ? 'pending' : 'todo'
    case 'services':
      return o.services.length ? 'done' : 'todo'
    case 'invite':
      return o.invite.status === 'accepted' ? 'done' : o.invite.status === 'sent' ? 'waiting' : 'todo'
    case 'profile':
      return o.doctorProfile.done ? 'done' : o.invite.status !== 'none' ? 'waiting' : 'todo'
    case 'hours':
      return o.hoursSet ? 'done' : o.invite.status !== 'none' ? 'waiting' : 'todo'
    case 'live':
      return o.live ? 'done' : 'todo'
  }
}

const ICON: Record<Status, { icon: LucideIcon; tone: string }> = {
  done: { icon: CircleCheck, tone: 'text-ok-text' },
  pending: { icon: Hourglass, tone: 'text-warn-text' },
  waiting: { icon: UserRoundSearch, tone: 'text-info-text' },
  todo: { icon: CircleDashed, tone: 'text-muted' },
}

/** A new practice joins Parlo: checklist on the left, the current step on the right. */
export const OnboardingPage = () => {
  const t = useT()
  const to = t.staff.onboarding
  const onboarding = useApp((s) => s.onboarding)
  const statuses = STEPS.map((step) => statusOf(step, onboarding))
  const firstOpen = STEPS.find((_, i) => statuses[i] !== 'done') ?? 'live'
  const [active, setActive] = useState<StepId>(firstOpen)
  const done = statuses.filter((s) => s === 'done').length

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-page-title font-semibold text-ink">{to.title}</h1>
        <p className="mt-0.5 text-web-body text-muted">{onboarding.practice.name || to.lead}</p>
      </header>

      <div className="grid grid-cols-[380px_1fr] items-start gap-6">
        <nav aria-label={to.checklist} className="rounded-card bg-surface p-4 shadow-card">
          <div className="flex items-baseline justify-between px-2 pb-3">
            <h2 className="text-section font-semibold text-ink">{to.checklist}</h2>
            <span className="text-meta text-muted tabular-nums">{to.progress(done, STEPS.length)}</span>
          </div>
          <div aria-hidden className="mx-2 mb-3 h-1.5 overflow-hidden rounded-full bg-canvas">
            <div
              className="h-full origin-left rounded-full bg-brand transition-transform duration-300 ease-out"
              style={{ transform: `scaleX(${done / STEPS.length})` }}
            />
          </div>
          <ol className="space-y-0.5">
            {STEPS.map((step, i) => {
              const { icon: Icon, tone } = ICON[statuses[i]]
              return (
                <li key={step}>
                  <button
                    type="button"
                    aria-current={active === step ? 'step' : undefined}
                    onClick={() => setActive(step)}
                    className={cx(
                      'flex min-h-11 w-full items-center gap-3 rounded-control px-2.5 text-left transition-colors duration-150',
                      active === step ? 'bg-brand-soft' : 'hover:bg-canvas',
                    )}
                  >
                    <Icon aria-hidden size={20} className={cx('shrink-0', tone)} />
                    <span className="flex-1 text-web-body font-semibold text-ink">{to.steps[step]}</span>
                    <span className={cx('shrink-0 text-meta whitespace-nowrap', tone)}>{to.status[statuses[i]]}</span>
                  </button>
                </li>
              )
            })}
          </ol>
        </nav>

        <section className="rounded-card bg-surface p-6 shadow-card">
          <h2 className="pb-1 text-section font-semibold text-ink">{to.steps[active]}</h2>
          <StepPanel step={active} statuses={statuses} onNext={() => setActive(STEPS[STEPS.indexOf(active) + 1] ?? 'live')} />
        </section>
      </div>
    </div>
  )
}

const StepPanel = ({ step, statuses, onNext }: { step: StepId; statuses: Status[]; onNext: () => void }) => {
  const t = useT()
  const to = t.staff.onboarding
  const f = useFormat()
  const onboarding = useApp((s) => s.onboarding)
  const update = useApp((s) => s.updateOnboarding)
  const p = onboarding.practice
  const setPractice = (patch: Partial<Onboarding['practice']>) => update({ practice: { ...p, ...patch } })
  const toggle = <T,>(list: T[], item: T, on: boolean) => (on ? [...list, item] : list.filter((x) => x !== item))

  switch (step) {
    case 'details':
      return (
        <div className="space-y-5 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <TextField label={to.name} value={p.name} onChange={(e) => setPractice({ name: e.target.value })} />
            <TextField label={to.district} value={p.district} onChange={(e) => setPractice({ district: e.target.value })} />
          </div>
          <TextField label={to.street} value={p.street} onChange={(e) => setPractice({ street: e.target.value })} />
          <ChipGroup label={to.specialties}>
            {SPECIALTIES.map((s) => (
              <Chip key={s} selected={p.specialties.includes(s)} onPressedChange={(on) => setPractice({ specialties: toggle(p.specialties, s, on) })}>
                {t.specialty[s]}
              </Chip>
            ))}
          </ChipGroup>
          <ChipGroup label={to.insurance}>
            {(['public', 'private'] as Insurance[]).map((i) => (
              <Chip key={i} selected={p.insurance.includes(i)} onPressedChange={(on) => setPractice({ insurance: toggle(p.insurance, i, on) })}>
                {i === 'public' ? t.common.public : t.common.private}
              </Chip>
            ))}
          </ChipGroup>
          <ChipGroup label={to.receptionLanguages}>
            {LANGUAGES.map((code) => (
              <Chip
                key={code}
                selected={p.receptionLanguages.includes(code)}
                onPressedChange={(on) => setPractice({ receptionLanguages: toggle(p.receptionLanguages, code, on) })}
              >
                {f.languageNames[code]}
              </Chip>
            ))}
          </ChipGroup>
          <Button disabled={!p.name || !p.street} onClick={onNext}>
            {to.save}
          </Button>
        </div>
      )

    case 'verification':
      return (
        <div className="space-y-4 pt-2">
          <p className="max-w-[60ch] text-web-body text-muted">{to.verifyLead}</p>
          {onboarding.document ? (
            <p className="flex items-center gap-2 text-web-body text-ink">
              <FileUp aria-hidden size={18} className="text-brand" />
              {to.uploaded(onboarding.document)}
            </p>
          ) : (
            <Button
              icon={FileUp}
              variant="secondary"
              onClick={() => update({ document: 'Approbation.pdf', verification: 'pending' })}
            >
              {to.upload}
            </Button>
          )}
          {onboarding.verification === 'pending' && (
            <Banner
              tone="warn"
              icon={Hourglass}
              title={to.pendingTitle}
              action={
                <Button size="sm" variant="plain" onClick={() => update({ verification: 'verified' })}>
                  {to.approveDemo}
                </Button>
              }
            >
              {to.pendingBody}
            </Banner>
          )}
          {onboarding.verification === 'verified' && <Banner tone="ok" title={to.verifiedTitle} />}
          {onboarding.document && <Button onClick={onNext}>{t.common.continue}</Button>}
        </div>
      )

    case 'services': {
      const all = SERVICES[f.lang][p.specialties[0] ?? 'gp']
      return (
        <div className="space-y-4 pt-2">
          <p className="text-web-body text-muted">{to.servicesLead}</p>
          <div className="flex flex-wrap gap-2">
            {all.map((s) => (
              <Chip key={s} selected={onboarding.services.includes(s)} onPressedChange={(on) => update({ services: toggle(onboarding.services, s, on) })}>
                {s}
              </Chip>
            ))}
          </div>
          <Button disabled={!onboarding.services.length} onClick={onNext}>
            {to.save}
          </Button>
        </div>
      )
    }

    case 'invite':
      return <InviteStep onNext={onNext} />

    case 'profile':
    case 'hours': {
      const isDone = step === 'profile' ? onboarding.doctorProfile.done : onboarding.hoursSet
      return (
        <div className="pt-2">
          {isDone ? (
            <Banner tone="ok" title={to.status.done}>
              {step === 'profile' && onboarding.doctorProfile.bio}
            </Banner>
          ) : (
            <Banner tone="info" icon={Hourglass} title={to.status.waiting}>
              {step === 'profile' ? to.profileWaiting : to.hoursWaiting}
            </Banner>
          )}
        </div>
      )
    }

    case 'live': {
      const ready = statuses.slice(0, -1).every((s) => s === 'done')
      if (onboarding.live)
        return (
          <div className="flex flex-col items-center py-10 text-center">
            <span className="flex size-16 animate-pop-in items-center justify-center rounded-full bg-ok-soft text-ok-text">
              <PartyPopper aria-hidden size={30} />
            </span>
            <p className="mt-4 text-section font-semibold text-ink">{to.liveTitle}</p>
            <p className="mt-1 max-w-[46ch] text-web-body text-muted">{to.liveBody}</p>
          </div>
        )
      return (
        <div className="space-y-3 pt-2">
          <Button disabled={!ready} onClick={() => update({ live: true })}>
            {to.goLive}
          </Button>
          {!ready && <p className="text-meta text-muted">{to.goLiveBlocked}</p>}
        </div>
      )
    }
  }
}

const InviteStep = ({ onNext }: { onNext: () => void }) => {
  const t = useT()
  const to = t.staff.onboarding
  const invite = useApp((s) => s.onboarding.invite)
  const update = useApp((s) => s.updateOnboarding)
  const [name, setName] = useState(invite.name)
  const [email, setEmail] = useState(invite.email)

  if (invite.status !== 'none')
    return (
      <div className="space-y-4 pt-2">
        <Banner tone={invite.status === 'accepted' ? 'ok' : 'info'} icon={invite.status === 'accepted' ? CircleCheck : Send} title={invite.status === 'accepted' ? to.inviteAccepted(invite.name) : to.inviteSent(invite.name)}>
          {invite.email}
        </Banner>
        <Button variant="secondary" onClick={onNext}>
          {t.common.continue}
        </Button>
      </div>
    )

  return (
    <div className="space-y-4 pt-2">
      <p className="max-w-[60ch] text-web-body text-muted">{to.inviteLead}</p>
      <div className="grid grid-cols-2 gap-4">
        <TextField label={to.doctorName} value={name} onChange={(e) => setName(e.target.value)} />
        <TextField label={to.doctorEmail} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <Button icon={Send} disabled={!name.trim() || !email.includes('@')} onClick={() => update({ invite: { name: name.trim(), email: email.trim(), status: 'sent' } })}>
        {to.sendInvite}
      </Button>
    </div>
  )
}

const ChipGroup = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <p className="pb-2 text-footnote font-semibold text-ink">{label}</p>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
)
