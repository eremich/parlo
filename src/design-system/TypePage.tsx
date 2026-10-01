import { byGroup, fontTokens, typeScale } from './tokens'

const SAMPLE: Record<string, string> = {
  'large-title': 'Find a doctor',
  title2: 'Dr. Emre Aydın',
  headline: 'Tomorrow 08:40',
  body: 'Speaks German, English, Turkish',
  subheadline: 'Hausarztpraxis am Görlitzer Park · 1.2 km',
  footnote: 'Covered by public insurance',
  caption: 'EN · TR · DE',
  'page-title': 'Today',
  section: 'Needs attention',
  'web-body': 'Offering Thu 09:00 to the waitlist',
  meta: '3 patients affected',
  label: 'CHECKED IN',
}

/** Display face is reserved for brand moments and large titles. */
const usesDisplay = (name: string) => ['large-title', 'page-title'].includes(name)

export const TypePage = () => (
  <div className="min-h-screen bg-surface px-10 py-10 text-ink">
    <h1 className="font-display text-page-title font-bold">Typography</h1>
    <p className="mt-2 max-w-2xl text-web-body text-muted">
      Two scales: the iOS scale for the patient and doctor apps, a denser web scale for the practice dashboard. Times
      and prices always use <code>tabular-nums</code>.
    </p>

    <section className="mt-10">
      <h2 className="text-section font-semibold">Families</h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {fontTokens.map((font) => (
          <li key={font.name} className="rounded-card border border-line p-5">
            <p className="text-[32px] leading-tight" style={{ fontFamily: `var(${font.name})`, fontWeight: 700 }}>
              Parlo Aa 08:40
            </p>
            <code className="mt-2 block text-footnote text-muted">{font.name}</code>
            <p className="text-footnote text-muted">{font.value}</p>
          </li>
        ))}
      </ul>
    </section>

    {byGroup(typeScale).map(([group, steps]) => (
      <section key={group} className="mt-10">
        <h2 className="text-section font-semibold">{group}</h2>
        <ul className="mt-3">
          {steps.map((step) => (
            <li key={step.name} className="grid grid-cols-[180px_1fr] items-baseline gap-6 border-t border-line py-4">
              <div>
                <code className="text-footnote text-ink">text-{step.name}</code>
                <p className="text-caption font-normal text-muted tabular-nums">
                  {step.size} / {step.lineHeight}
                  {step.weight && ` · ${step.weight}`}
                </p>
              </div>
              <p
                className={`truncate ${usesDisplay(step.name) ? 'font-display font-bold' : ''}`}
                style={{ fontSize: step.size, lineHeight: step.lineHeight, fontWeight: step.weight }}
              >
                {SAMPLE[step.name] ?? 'Sample text'}
              </p>
            </li>
          ))}
        </ul>
      </section>
    ))}
  </div>
)
