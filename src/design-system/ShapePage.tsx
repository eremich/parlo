import { useState } from 'react'
import { lightTokens } from './tokens'

const tokensIn = (group: string) => lightTokens.filter((t) => t.group === group)

const USES: Record<string, string> = {
  '--radius-chip': 'Language chips, status badges, pills',
  '--radius-control': 'Buttons, inputs, segmented controls',
  '--radius-card': 'Cards, result rows, list groups',
  '--radius-sheet': 'Bottom sheets, dialogs',
  '--shadow-card': 'Resting cards on canvas',
  '--shadow-sheet': 'Sheets and the floating tab bar',
  '--shadow-device': 'Presentation frames only',
}

/** Replays a short move so each easing curve can be compared by eye. */
const EasingDemo = ({ name, value }: { name: string; value: string }) => {
  const [moved, setMoved] = useState(false)
  return (
    <button
      type="button"
      onClick={() => setMoved((m) => !m)}
      className="group w-full rounded-card border border-line p-4 text-left transition-colors hover:border-brand"
    >
      <code className="text-footnote text-ink">{name}</code>
      <p className="text-caption font-normal text-muted">{value}</p>
      <div className="mt-3 h-8 rounded-chip bg-canvas p-1">
        <span
          className="block size-6 rounded-full bg-brand"
          style={{
            transform: moved ? 'translateX(200px)' : 'none',
            transition: `transform 600ms ${value}`,
          }}
        />
      </div>
      <p className="mt-2 text-caption font-normal text-muted">Click to replay · slowed to 600 ms</p>
    </button>
  )
}

export const ShapePage = () => (
  <div className="min-h-screen bg-surface px-10 py-10 text-ink">
    <h1 className="font-display text-page-title font-bold">Shape, elevation, motion</h1>
    <p className="mt-2 max-w-2xl text-web-body text-muted">
      Four radii, three shadows, three curves. Shadows are quiet: most separation comes from surface color and lines.
    </p>

    <section className="mt-10">
      <h2 className="text-section font-semibold">Radius</h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-4">
        {tokensIn('Radius').map((t) => (
          <li key={t.name}>
            <div className="h-24 border-2 border-brand bg-brand-soft" style={{ borderRadius: `var(${t.name})` }} />
            <code className="mt-2 block text-footnote">{t.name}</code>
            <p className="text-caption font-normal text-muted">
              {t.value} · {USES[t.name]}
            </p>
          </li>
        ))}
      </ul>
    </section>

    <section className="mt-10">
      <h2 className="text-section font-semibold">Elevation</h2>
      <ul className="mt-3 grid gap-6 rounded-card bg-canvas p-8 sm:grid-cols-3">
        {tokensIn('Elevation').map((t) => (
          <li key={t.name}>
            <div className="h-24 rounded-card bg-surface" style={{ boxShadow: `var(${t.name})` }} />
            <code className="mt-3 block text-footnote">{t.name}</code>
            <p className="text-caption font-normal text-muted">{USES[t.name]}</p>
          </li>
        ))}
      </ul>
    </section>

    <section className="mt-10">
      <h2 className="text-section font-semibold">Motion</h2>
      <p className="mt-1 max-w-2xl text-web-body text-muted">
        Press feedback 150 ms, UI changes 220 ms, sheets 360 ms. Enter with ease-out, move with ease-in-out, sheets use
        the drawer curve. Keyboard-driven actions in the dashboard do not animate. Reduced motion removes movement.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {tokensIn('Motion')
          .filter((t) => t.name.startsWith('--ease'))
          .map((t) => (
            <EasingDemo key={t.name} name={t.name} value={t.value} />
          ))}
      </div>
      <ul className="mt-4 flex flex-wrap gap-2">
        {tokensIn('Motion')
          .filter((t) => t.name.startsWith('--duration'))
          .map((t) => (
            <li key={t.name} className="rounded-chip bg-canvas px-3 py-1 text-footnote">
              <code>{t.name}</code> <span className="text-muted tabular-nums">{t.value}</span>
            </li>
          ))}
      </ul>
    </section>
  </div>
)
