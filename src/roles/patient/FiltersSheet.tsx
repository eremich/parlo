import { Accessibility, UserPlus, Video } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '../../components/Button'
import { Chip } from '../../components/Chip'
import { Segmented } from '../../components/Segmented'
import { Sheet } from '../../components/Sheet'
import { Switch } from '../../components/Switch'
import { search, type Filters } from '../../data/search'
import type { Insurance, LanguageCode } from '../../data/types'
import { useT } from '../../i18n'
import { useFormat } from '../../i18n/useFormat'
import { useApp } from '../../store/app'

const LANGUAGES: LanguageCode[] = ['EN', 'DE', 'TR', 'AR', 'RU', 'UK', 'PL', 'FR', 'ES', 'FA']
const DISTANCES = [1, 3, 5, 10]

type FiltersSheetProps = { open: boolean; onClose: () => void }

/** Edits a draft; the footer shows the live count and applies it. */
export const FiltersSheet = ({ open, onClose }: FiltersSheetProps) => {
  const t = useT()
  const f = useFormat()
  const filters = useApp((s) => s.filters)
  const setFilters = useApp((s) => s.setFilters)
  const appointments = useApp((s) => s.appointments)
  const [draft, setDraft] = useState<Filters>(filters)
  const [lastOpen, setLastOpen] = useState(open)

  // Start from the applied filters every time the sheet opens
  if (open !== lastOpen) {
    setLastOpen(open)
    if (open) setDraft(filters)
  }

  const count = useMemo(() => search(draft, appointments).length, [draft, appointments])
  const patch = (p: Partial<Filters>) => setDraft((d) => ({ ...d, ...p }))
  const toggleLanguage = (code: LanguageCode) =>
    patch({
      languages: draft.languages.includes(code)
        ? draft.languages.filter((c) => c !== code)
        : [...draft.languages, code],
    })

  const ft = t.patient.filters
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={ft.title}
      closeLabel={t.common.close}
      footer={
        <div className="flex items-center gap-3">
          <Button
            variant="plain"
            onClick={() =>
              setDraft({
                ...draft,
                languages: [],
                when: 'any',
                maxKm: null,
                video: false,
                newPatients: false,
                stepFree: false,
              })
            }
          >
            {ft.reset}
          </Button>
          <Button
            size="lg"
            fullWidth
            disabled={count === 0}
            onClick={() => {
              setFilters(draft)
              onClose()
            }}
          >
            {ft.show(count)}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <Section title={ft.insurance}>
          <Segmented<Insurance>
            label={ft.insurance}
            fullWidth
            value={draft.insurance}
            onChange={(insurance) => patch({ insurance })}
            options={[
              { value: 'public', label: t.common.public },
              { value: 'private', label: t.common.private },
            ]}
          />
        </Section>

        <Section title={ft.languages} hint={ft.languagesHint}>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((code) => (
              <Chip key={code} selected={draft.languages.includes(code)} onPressedChange={() => toggleLanguage(code)}>
                {f.languageNames[code]}
              </Chip>
            ))}
          </div>
        </Section>

        <Section title={ft.when}>
          <Segmented
            label={ft.when}
            fullWidth
            value={draft.when}
            onChange={(when) => patch({ when })}
            options={[
              { value: 'any', label: ft.any },
              { value: 'today', label: ft.today },
              { value: 'week', label: ft.week },
            ]}
          />
        </Section>

        <Section title={ft.distance}>
          <div className="flex flex-wrap gap-2">
            <Chip selected={draft.maxKm === null} onPressedChange={() => patch({ maxKm: null })}>
              {ft.anyDistance}
            </Chip>
            {DISTANCES.map((km) => (
              <Chip key={km} selected={draft.maxKm === km} onPressedChange={() => patch({ maxKm: km })}>
                {t.patient.results.withinKm(km)}
              </Chip>
            ))}
          </div>
        </Section>

        <Section title={ft.visit}>
          <div className="divide-y divide-line rounded-card bg-canvas px-3">
            <SwitchRow icon={Video} label={ft.videoOnly} checked={draft.video} onChange={(video) => patch({ video })} />
            <SwitchRow
              icon={UserPlus}
              label={ft.newPatients}
              checked={draft.newPatients}
              onChange={(newPatients) => patch({ newPatients })}
            />
            <SwitchRow
              icon={Accessibility}
              label={ft.stepFree}
              checked={draft.stepFree}
              onChange={(stepFree) => patch({ stepFree })}
            />
          </div>
        </Section>
      </div>
    </Sheet>
  )
}

const Section = ({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) => (
  <section>
    <h3 className="text-headline text-ink">{title}</h3>
    {hint && <p className="text-footnote text-muted">{hint}</p>}
    <div className="mt-2.5">{children}</div>
  </section>
)

type SwitchRowProps = {
  icon: typeof Video
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}

const SwitchRow = ({ icon: Icon, label, checked, onChange }: SwitchRowProps) => (
  <div className="flex items-center gap-3 py-1">
    <Icon aria-hidden size={18} className="shrink-0 text-muted" />
    <div className="flex-1">
      <Switch label={label} checked={checked} onChange={onChange} />
    </div>
  </div>
)
