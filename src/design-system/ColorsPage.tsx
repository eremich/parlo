import { Check, TriangleAlert } from 'lucide-react'
import { byGroup, colorTokens, contrast, valueOf, type Token } from './tokens'

type Pair = { against: string; min: number; label: string }

/** What each color is checked against, and the WCAG minimum it must meet. */
const pairFor = (name: string): Pair | undefined => {
  if (name === '--on-brand') return { against: '--brand', min: 4.5, label: 'on brand' }
  if (name.endsWith('-soft') && name !== '--brand-soft')
    return { against: name.replace('-soft', '-text'), min: 4.5, label: 'text on it' }
  if (name === '--brand-soft') return { against: '--brand', min: 4.5, label: 'brand on it' }
  if (['--canvas', '--surface', '--line', '--stage', '--bezel', '--stage-ink'].includes(name)) return undefined
  const isText = name === '--ink' || name === '--muted' || name === '--brand' || name.endsWith('-text')
  return { against: '--surface', min: isText ? 4.5 : 3, label: isText ? 'text on surface' : 'icon on surface' }
}

const Ratio = ({ name, theme }: { name: string; theme: 'light' | 'dark' }) => {
  const pair = pairFor(name)
  const fg = valueOf(name, theme)
  const bg = pair && valueOf(pair.against, theme)
  if (!pair || !fg || !bg) return <span className="text-muted">—</span>
  const ratio = contrast(fg, bg)
  const pass = ratio >= pair.min
  return (
    <span className={`inline-flex items-center gap-1 tabular-nums ${pass ? 'text-ok-text' : 'text-error-text'}`}>
      {pass ? <Check aria-hidden size={14} /> : <TriangleAlert aria-hidden size={14} />}
      {ratio.toFixed(2)}
      <span className="sr-only">{pass ? 'passes' : 'fails'}</span>
    </span>
  )
}

const Swatch = ({ color }: { color?: string }) => (
  <span className="block size-10 rounded-control ring-1 ring-black/10 ring-inset" style={{ background: color }} />
)

const Row = ({ token }: { token: Token }) => {
  const pair = pairFor(token.name)
  const utility = token.name.replace('--', '')
  return (
    <tr className="border-t border-line align-middle">
      <td className="py-3 pr-3">
        <div className="flex gap-1.5">
          <Swatch color={valueOf(token.name, 'light')} />
          <Swatch color={valueOf(token.name, 'dark')} />
        </div>
      </td>
      <td className="py-3 pr-3">
        <code className="text-footnote text-ink">{token.name}</code>
        <p className="text-caption font-normal text-muted">
          <code>bg-{utility}</code> · <code>text-{utility}</code>
        </p>
      </td>
      <td className="py-3 pr-3 font-mono text-footnote text-muted uppercase">
        {valueOf(token.name, 'light')}
        <br />
        {valueOf(token.name, 'dark')}
      </td>
      <td className="py-3 pr-3 text-footnote text-muted">{pair ? `${pair.label} · ≥ ${pair.min}` : ''}</td>
      <td className="py-3 pr-3 text-footnote">
        <Ratio name={token.name} theme="light" />
      </td>
      <td className="py-3 text-footnote">
        <Ratio name={token.name} theme="dark" />
      </td>
    </tr>
  )
}

export const ColorsPage = () => (
  <div className="min-h-screen bg-surface px-10 py-10 text-ink">
    <h1 className="font-display text-page-title font-bold">Colors</h1>
    <p className="mt-2 max-w-2xl text-web-body text-muted">
      Read from <code>src/styles/tokens.css</code>. Contrast is computed live against WCAG 2.1 AA: 4.5:1 for text,
      3:1 for icons. A red value means the token must not carry text on that surface — use its <code>-text</code>{' '}
      companion.
    </p>
    {byGroup(colorTokens).map(([group, tokens]) => (
      <section key={group} className="mt-10">
        <h2 className="text-section font-semibold">{group}</h2>
        <table className="mt-3 w-full text-left">
          <thead>
            <tr className="text-label text-muted uppercase">
              <th className="pb-2 font-semibold">Light · Dark</th>
              <th className="pb-2 font-semibold">Token</th>
              <th className="pb-2 font-semibold">Value</th>
              <th className="pb-2 font-semibold">Checked as</th>
              <th className="pb-2 font-semibold">Light</th>
              <th className="pb-2 font-semibold">Dark</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token) => (
              <Row key={token.name} token={token} />
            ))}
          </tbody>
        </table>
      </section>
    ))}
  </div>
)
