import { ArrowRight, Building2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '../../components/Button'
import { Chip } from '../../components/Chip'
import { Segmented } from '../../components/Segmented'
import { Switch } from '../../components/Switch'
import { practiceById } from '../../data/doctors'
import type { LanguageCode } from '../../data/types'
import { useT } from '../../i18n'
import { useFormat } from '../../i18n/useFormat'
import { PRACTICE_DOCTORS } from './practice'

const LANGUAGES: LanguageCode[] = ['DE', 'EN', 'TR', 'AR', 'RU', 'UK', 'PL', 'FR', 'ES', 'FA']

export const SettingsPage = () => {
  const t = useT()
  const ts = t.staff.settings
  const f = useFormat()
  const navigate = useNavigate()
  const practice = practiceById(PRACTICE_DOCTORS[0].practiceId)
  const [autoConfirm, setAutoConfirm] = useState(true)
  const [reminders, setReminders] = useState(true)
  const [cancelHours, setCancelHours] = useState<'12' | '24' | '48'>('24')
  const [offerMinutes, setOfferMinutes] = useState<'15' | '30' | '60'>('30')
  const [languages, setLanguages] = useState<LanguageCode[]>(practice.receptionLanguages)

  return (
    <div className="max-w-[760px] space-y-6">
      <h1 className="text-page-title font-semibold text-ink">{ts.title}</h1>

      <Section title={ts.practice}>
        <div className="flex items-center gap-3">
          <Building2 aria-hidden size={20} className="text-brand" />
          <div>
            <p className="text-web-body font-semibold text-ink">{practice.name}</p>
            <p className="text-meta text-muted">
              {practice.street}, {practice.district}
            </p>
          </div>
        </div>
        <div className="pt-4">
          <p className="pb-2 text-meta font-semibold text-ink">{ts.receptionLanguages}</p>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((code) => (
              <Chip
                key={code}
                selected={languages.includes(code)}
                onPressedChange={(on) => setLanguages(on ? [...languages, code] : languages.filter((l) => l !== code))}
              >
                {f.languageNames[code]}
              </Chip>
            ))}
          </div>
        </div>
      </Section>

      <Section title={ts.booking}>
        <div className="divide-y divide-line">
          <div className="pb-2">
            <Switch label={ts.autoConfirm} description={ts.autoConfirmHint} checked={autoConfirm} onChange={setAutoConfirm} />
          </div>
          <div className="py-2">
            <Switch label={ts.reminders} checked={reminders} onChange={setReminders} />
          </div>
          <Row label={ts.cancelWindow}>
            <Segmented
              label={ts.cancelWindow}
              value={cancelHours}
              onChange={setCancelHours}
              options={(['12', '24', '48'] as const).map((h) => ({ value: h, label: ts.hoursBefore(Number(h)) }))}
            />
          </Row>
          <Row label={ts.offerWindow}>
            <Segmented
              label={ts.offerWindow}
              value={offerMinutes}
              onChange={setOfferMinutes}
              options={(['15', '30', '60'] as const).map((m) => ({ value: m, label: ts.minutesShort(Number(m)) }))}
            />
          </Row>
        </div>
      </Section>

      <Section title={ts.onboarding}>
        <div className="flex items-center justify-between gap-4">
          <p className="text-web-body text-muted">{ts.onboardingHint}</p>
          <Button variant="secondary" icon={ArrowRight} onClick={() => navigate('/onboarding')}>
            {ts.open}
          </Button>
        </div>
      </Section>
    </div>
  )
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-card bg-surface p-5 shadow-card">
    <h2 className="pb-4 text-section font-semibold text-ink">{title}</h2>
    {children}
  </section>
)

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-4 py-3">
    <span className="text-body text-ink">{label}</span>
    {children}
  </div>
)
