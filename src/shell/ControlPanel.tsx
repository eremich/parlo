import type { ReactNode } from 'react'
import { useState } from 'react'
import { Logo } from '../components/Logo'
import { Segmented } from '../components/Segmented'
import { CLOCK_PRESETS } from '../data/schedule'
import { useT, type Lang } from '../i18n'
import { cx } from '../lib/cx'
import { formatDate } from '../lib/format'
import { useApp } from '../store/app'
import { SCENARIOS, useShell, type Role, type Scenario, type Theme } from '../store/shell'

/** Patients the presenter can view as */
const PERSONAS = ['anna', 'omar', 'lukas']

/** Who and when for each hero step; the copy lives in shell.steps. */
const STEPS: { role: Role; persona?: string; clock: string }[] = [
  { role: 'patient', persona: 'anna', clock: 'wed' },
  { role: 'staff', clock: 'wed' },
  { role: 'patient', persona: 'omar', clock: 'wed' },
  { role: 'staff', clock: 'wed' },
  { role: 'doctor', clock: 'wed' },
  { role: 'patient', persona: 'omar', clock: 'thu-morning' },
  { role: 'doctor', clock: 'thu-nine' },
  { role: 'patient', persona: 'omar', clock: 'thu-later' },
  { role: 'staff', clock: 'thu-later' },
]

/**
 * Presentation controls in a quiet left column, beside the device frame (same pattern as the other
 * portfolio prototypes). Nothing here is product UI.
 */
export const ControlPanel = () => {
  const t = useT()
  const ts = t.shell
  const { role, lang, theme, scenario, setRole, setLang, setTheme, setScenario } = useShell()
  const patients = useApp((s) => s.patients)
  const currentPatientId = useApp((s) => s.currentPatientId)
  const signIn = useApp((s) => s.signIn)
  const clock = useApp((s) => s.clock)
  const setClock = useApp((s) => s.setClock)
  const [step, setStep] = useState<number | null>(null)
  const clockId = CLOCK_PRESETS.find((p) => p.clock.date === clock.date && p.clock.time === clock.time)?.id ?? ''

  const go = (i: number) => {
    const target = STEPS[i]
    const preset = CLOCK_PRESETS.find((p) => p.id === target.clock)
    if (preset) setClock(preset.clock)
    if (target.persona) signIn(target.persona)
    setRole(target.role)
    setStep(i)
  }

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto px-5 py-5 text-stage-ink [scrollbar-width:none]">
      <div>
        <Logo size={26} />
        <p className="mt-1.5 text-label font-normal text-muted">{ts.subtitle}</p>
      </div>

      <Group label={ts.viewAs}>
        <Segmented<Role>
          label={ts.viewAs}
          fullWidth
          value={role}
          onChange={setRole}
          options={(['patient', 'doctor', 'staff'] as const).map((r) => ({ value: r, label: ts.roles[r] }))}
        />
        {role === 'patient' && (
          <ul className="mt-2 space-y-0.5">
            {PERSONAS.map((id) => {
              const p = patients.find((x) => x.id === id)
              if (!p) return null
              const active = currentPatientId === id
              return (
                <li key={id}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => signIn(id)}
                    className={cx(
                      'flex min-h-8 w-full items-center justify-between gap-2 rounded-control px-2.5 text-left text-meta transition-colors duration-150',
                      active ? 'bg-surface font-semibold text-ink shadow-card' : 'text-muted hover:text-stage-ink',
                    )}
                  >
                    <span className="truncate">{p.name}</span>
                    <span className="shrink-0 text-label font-normal tracking-wide text-muted">{p.languages.join(' ')}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </Group>

      <Group label={ts.scenario}>
        <StageSelect label={ts.scenario} value={scenario} onChange={(v) => setScenario(v as Scenario)}>
          {SCENARIOS.map((id) => (
            <option key={id} value={id}>
              {ts.scenarios[id]}
            </option>
          ))}
        </StageSelect>
      </Group>

      <Group label={ts.clock}>
        <StageSelect
          label={ts.clock}
          value={clockId}
          onChange={(id) => {
            const preset = CLOCK_PRESETS.find((p) => p.id === id)
            if (preset) setClock(preset.clock)
          }}
        >
          {CLOCK_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {formatDate(p.clock.date, lang)} · {p.clock.time}
            </option>
          ))}
        </StageSelect>
      </Group>

      <Group label={ts.language}>
          <Segmented<Lang>
            label={ts.language}
            fullWidth
            value={lang}
            onChange={setLang}
            options={[
              { value: 'en', label: 'EN' },
              { value: 'de', label: 'DE' },
            ]}
          />
      </Group>
      <Group label={ts.theme}>
          <Segmented<Theme>
            label={ts.theme}
            fullWidth
            value={theme}
            onChange={setTheme}
            options={(['light', 'dark', 'auto'] as const).map((th) => ({ value: th, label: ts.themes[th] }))}
          />
      </Group>

      <Group label={ts.jumpTo}>
        <ol className="space-y-0.5">
          {ts.steps.map(([title], i) => (
            <li key={title}>
              <button
                type="button"
                aria-current={step === i ? 'step' : undefined}
                onClick={() => go(i)}
                className={cx(
                  'flex min-h-7 w-full items-center gap-2 rounded-control px-2 text-left text-meta transition-colors duration-150',
                  step === i ? 'bg-surface font-semibold text-ink shadow-card' : 'text-muted hover:text-stage-ink',
                )}
              >
                <span className="w-4 shrink-0 text-right text-label tabular-nums">{i + 1}</span>
                <span className="truncate">{title}</span>
              </button>
            </li>
          ))}
        </ol>
        {step !== null && (
          <p className="mt-2 rounded-control bg-stage-ink/[0.06] px-2.5 py-2 text-label font-normal text-pretty text-stage-ink">
            <span className="font-semibold">{ts.tap}:</span> {ts.steps[step][1]}
          </p>
        )}
      </Group>

      <p className="mt-auto text-label font-normal text-pretty text-muted">
        {ts.clockNote(`${formatDate(clock.date, lang)}, ${clock.time}`)}
      </p>
    </div>
  )
}

const Group = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <p className="pb-1.5 text-label text-muted">{label}</p>
    {children}
  </div>
)

type StageSelectProps = { label: string; value: string; onChange: (value: string) => void; children: ReactNode }

const StageSelect = ({ label, value, onChange, children }: StageSelectProps) => (
  <select
    aria-label={label}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="min-h-9 w-full appearance-none rounded-control bg-stage-ink/[0.06] bg-[length:14px] bg-[right_10px_center] bg-no-repeat px-2.5 pr-8 text-meta font-semibold text-stage-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
    style={{
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239baaa5' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
    }}
  >
    {children}
  </select>
)
