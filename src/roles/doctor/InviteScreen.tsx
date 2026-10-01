import { Camera, Check, MailOpen, PartyPopper } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Avatar } from '../../components/Avatar'
import { Button } from '../../components/Button'
import { Chip } from '../../components/Chip'
import { Screen } from '../../components/Screen'
import { Segmented } from '../../components/Segmented'
import { Switch } from '../../components/Switch'
import { TextArea } from '../../components/TextArea'
import { photoByName } from '../../data/doctors'
import type { LanguageCode, LanguageLevel } from '../../data/types'
import { useT } from '../../i18n'
import { useFormat } from '../../i18n/useFormat'
import { useApp } from '../../store/app'

const LANGUAGES: LanguageCode[] = ['DE', 'EN', 'TR', 'AR', 'RU', 'UK', 'PL', 'FR', 'ES', 'FA']
const WEEKDAYS = [1, 2, 3, 4, 5]

/** The invited doctor accepts in the app and fills in what patients will see. */
export const InviteScreen = () => {
  const t = useT()
  const ti = t.doctor.invite
  const f = useFormat()
  const navigate = useNavigate()
  const onboarding = useApp((s) => s.onboarding)
  const update = useApp((s) => s.updateOnboarding)
  const [step, setStep] = useState<'invite' | 'profile' | 'hours' | 'done'>(
    onboarding.hoursSet ? 'done' : onboarding.doctorProfile.done ? 'hours' : onboarding.invite.status === 'accepted' ? 'profile' : 'invite',
  )
  const profile = onboarding.doctorProfile
  const [days, setDays] = useState(WEEKDAYS)
  const [mornings, setMornings] = useState(true)
  const [afternoons, setAfternoons] = useState(true)
  const setProfile = (patch: Partial<typeof profile>) => update({ doctorProfile: { ...profile, ...patch } })
  const setLevel = (code: LanguageCode, level: LanguageLevel) =>
    setProfile({ languages: profile.languages.map((l) => (l.code === code ? { ...l, level } : l)) })
  const toggleLanguage = (code: LanguageCode, on: boolean) =>
    setProfile({
      languages: on ? [...profile.languages, { code, level: 'fluent' }] : profile.languages.filter((l) => l.code !== code),
    })
  // A reference week gives localized weekday names
  const weekdayName = (n: number) => f.weekday(`2026-03-${15 + n}`)

  const name = onboarding.invite.name || 'Dr.'

  return (
    <Screen
      footer={
        step === 'invite' ? (
          <Button size="lg" fullWidth onClick={() => (update({ invite: { ...onboarding.invite, status: 'accepted' } }), setStep('profile'))}>
            {ti.accept}
          </Button>
        ) : step === 'profile' ? (
          <Button size="lg" fullWidth disabled={!profile.bio.trim()} onClick={() => (setProfile({ done: true }), setStep('hours'))}>
            {ti.next}
          </Button>
        ) : step === 'hours' ? (
          <Button size="lg" fullWidth disabled={!days.length || (!mornings && !afternoons)} onClick={() => (update({ hoursSet: true }), setStep('done'))}>
            {ti.finish}
          </Button>
        ) : (
          <Button size="lg" variant="secondary" fullWidth onClick={() => navigate('/day')}>
            {t.doctor.day.title}
          </Button>
        )
      }
    >
      <div className="px-4 pt-[62px]">
        {step === 'invite' && (
          <div className="flex flex-col items-center pt-16 text-center">
            <span className="flex size-20 animate-pop-in items-center justify-center rounded-full bg-brand-soft text-brand">
              <MailOpen aria-hidden size={36} strokeWidth={1.75} />
            </span>
            <h1 className="mt-5 font-display text-large-title font-bold text-ink">{ti.title}</h1>
            <p className="mt-2 max-w-[32ch] text-body text-pretty text-muted">{ti.lead(onboarding.practice.name)}</p>
            <p className="mt-6 text-headline text-ink">{name}</p>
            <p className="text-subheadline text-muted">{onboarding.invite.email}</p>
          </div>
        )}

        {step === 'profile' && (
          <div className="space-y-6 pb-4">
            <div>
              <h1 className="font-display text-[28px] leading-[34px] font-bold text-ink">{ti.profileTitle}</h1>
              <p className="mt-1 text-body text-muted">{ti.profileLead}</p>
            </div>
            <button
              type="button"
              onClick={() => setProfile({ photo: !profile.photo })}
              className="flex items-center gap-4 text-left"
            >
              {profile.photo ? (
                <Avatar name={name} src={photoByName(name)} size="xl" />
              ) : (
                <span className="flex size-20 items-center justify-center rounded-full border-2 border-dashed border-line text-muted">
                  <Camera aria-hidden size={26} />
                </span>
              )}
              <span className="flex items-center gap-1.5 text-headline text-brand">
                {profile.photo && <Check aria-hidden size={18} />}
                {profile.photo ? ti.photoAdded : ti.photo}
              </span>
            </button>

            <section>
              <h2 className="pb-2 text-headline text-ink">{ti.languages}</h2>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((code) => (
                  <Chip
                    key={code}
                    selected={profile.languages.some((l) => l.code === code)}
                    onPressedChange={(on) => toggleLanguage(code, on)}
                  >
                    {f.languageNames[code]}
                  </Chip>
                ))}
              </div>
              <ul className="mt-3 divide-y divide-line rounded-card bg-surface px-4 shadow-card">
                {profile.languages.map((l) => (
                  <li key={l.code} className="flex min-h-12 items-center justify-between gap-3 py-2">
                    <span className="text-body text-ink">{f.languageNames[l.code]}</span>
                    <Segmented<LanguageLevel>
                      label={`${f.languageNames[l.code]}: ${ti.level}`}
                      value={l.level}
                      onChange={(level) => setLevel(l.code, level)}
                      options={[
                        { value: 'native', label: t.common.native },
                        { value: 'fluent', label: t.common.fluent },
                      ]}
                    />
                  </li>
                ))}
              </ul>
            </section>

            <TextArea
              label={ti.bio}
              placeholder={ti.bioPlaceholder}
              value={profile.bio}
              onChange={(e) => setProfile({ bio: e.target.value })}
            />
          </div>
        )}

        {step === 'hours' && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-[28px] leading-[34px] font-bold text-ink">{ti.hoursTitle}</h1>
              <p className="mt-1 text-body text-muted">{ti.hoursLead}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((d) => (
                <Chip key={d} selected={days.includes(d)} onPressedChange={(on) => setDays(on ? [...days, d] : days.filter((x) => x !== d))}>
                  {weekdayName(d)}
                </Chip>
              ))}
            </div>
            <div className="divide-y divide-line rounded-card bg-surface px-4 shadow-card">
              <Switch label={ti.mornings} checked={mornings} onChange={setMornings} />
              <Switch label={ti.afternoons} checked={afternoons} onChange={setAfternoons} />
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="flex flex-col items-center pt-24 text-center">
            <span className="flex size-20 animate-pop-in items-center justify-center rounded-full bg-ok-soft text-ok-text">
              <PartyPopper aria-hidden size={36} strokeWidth={1.75} />
            </span>
            <h1 className="mt-5 font-display text-large-title font-bold text-ink">{ti.doneTitle}</h1>
            <p className="mt-2 max-w-[30ch] text-body text-pretty text-muted">{ti.doneBody}</p>
          </div>
        )}
      </div>
    </Screen>
  )
}
