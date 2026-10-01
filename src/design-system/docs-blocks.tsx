import type { ReactNode } from 'react'

/* Small building blocks for the MDX documentation pages. */

export const Lead = ({ children }: { children: ReactNode }) => <p className="docs-lead">{children}</p>

export const CardGrid = ({ children }: { children: ReactNode }) => (
  <div className="docs-row grid gap-3 sm:grid-cols-2">{children}</div>
)

export const Card = ({ title, href, children }: { title: string; href: string; children: ReactNode }) => (
  <a
    href={href}
    target="_top"
    className="docs-card rounded-card border border-line bg-surface p-5 transition-colors duration-150 hover:border-brand"
  >
    <strong className="block text-headline">{title}</strong>
    <span className="mt-1 block text-subheadline">{children}</span>
  </a>
)

type Rule = { title: string; children: ReactNode; example?: ReactNode }

/** Side-by-side do / don't guidance. */
export const DoDont = ({ good, bad }: { good: Rule; bad: Rule }) => (
  <div className="docs-row grid gap-3 sm:grid-cols-2">
    <RuleCard tone="ok" label="Do" {...good} />
    <RuleCard tone="error" label="Don't" {...bad} />
  </div>
)

const RuleCard = ({ tone, label, title, children, example }: Rule & { tone: 'ok' | 'error'; label: string }) => (
  <div className="overflow-hidden rounded-card border border-line bg-surface">
    {example && <div className="flex min-h-28 items-center justify-center bg-canvas p-5">{example}</div>}
    <div className={`border-t-2 p-4 ${tone === 'ok' ? 'border-ok' : 'border-error'}`}>
      <p className={`text-caption uppercase tracking-wider ${tone === 'ok' ? 'text-ok-text' : 'text-error-text'}`}>
        {label}
      </p>
      <p className="mt-1 text-subheadline font-semibold text-ink">{title}</p>
      <div className="mt-1 text-footnote text-muted">{children}</div>
    </div>
  </div>
)

/** Renders the same example in light and dark, side by side. */
export const BothThemes = ({ children }: { children: ReactNode }) => (
  <div className="docs-row grid overflow-hidden rounded-card border border-line sm:grid-cols-2">
    {(['light', 'dark'] as const).map((theme) => (
      <div key={theme} data-theme={theme} className="flex flex-col items-start gap-3 bg-canvas p-6 text-ink">
        <span className="text-caption uppercase tracking-wider text-muted">{theme}</span>
        {children}
      </div>
    ))}
  </div>
)
