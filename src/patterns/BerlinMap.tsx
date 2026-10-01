import { cx } from '../lib/cx'

export type MapPin = {
  id: string
  /** 0–100 % of the map width and height */
  x: number
  y: number
  /** Earliest time at this practice, e.g. "Thu 08:40" */
  label: string
  /** Doctors at this practice, shown when more than one */
  count?: number
  /** Accessible name: practice and earliest time */
  title: string
}

export type BerlinMapProps = {
  pins: MapPin[]
  selectedId?: string
  onSelect?: (id: string) => void
  /** The patient's location */
  you?: { x: number; y: number; label: string }
  label: string
  /** Shows district names; off for small inline maps */
  districts?: boolean
}

const DISTRICTS = [
  { name: 'Mitte', x: 44, y: 32 },
  { name: 'Prenzlauer Berg', x: 60, y: 16 },
  { name: 'Friedrichshain', x: 76, y: 38 },
  { name: 'Kreuzberg', x: 42, y: 66 },
  { name: 'Neukölln', x: 70, y: 84 },
  { name: 'Charlottenburg', x: 12, y: 30 },
  { name: 'Schöneberg', x: 26, y: 72 },
]

/**
 * A drawn, static map of central Berlin (no map provider): water, parks, main roads and practice pins.
 * The SVG stretches to the container; strokes keep their width and labels live in HTML so they never distort.
 */
export const BerlinMap = ({ pins, selectedId, onSelect, you, label, districts = true }: BerlinMapProps) => (
  <div role="group" aria-label={label} className="relative h-full w-full overflow-hidden bg-[color-mix(in_srgb,var(--canvas)_70%,var(--line))]">
    <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
      {/* Parks: Tiergarten, Volkspark Friedrichshain, Görlitzer Park, Hasenheide, Tempelhofer Feld */}
      <g className="fill-[color-mix(in_srgb,var(--ok-soft)_85%,var(--ok))]">
        <path d="M14 34 C20 30 34 31 38 35 C37 40 22 42 15 40 Z" />
        <path d="M64 18 C69 16 74 18 74 22 C71 25 65 25 63 22 Z" />
        <path d="M60 55 C63 54 66 55 66 58 C64 60 61 60 60 58 Z" />
        <path d="M54 70 C58 69 61 70 61 73 C59 75 55 75 54 73 Z" />
        <path d="M38 76 C46 74 56 76 57 81 C55 88 42 89 37 85 Z" />
      </g>
      {/* Spree and Landwehrkanal */}
      <path
        d="M0 36 C10 38 18 44 28 42 C36 40 40 34 46 37 C54 41 58 48 66 52 C76 57 86 60 100 66"
        className="fill-none stroke-[color-mix(in_srgb,var(--info-soft)_60%,var(--info))]"
        strokeWidth={9}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M18 58 C30 62 40 58 50 62 C58 65 64 61 72 60"
        className="fill-none stroke-[color-mix(in_srgb,var(--info-soft)_60%,var(--info))]"
        strokeWidth={3}
        vectorEffect="non-scaling-stroke"
      />
      {/* Main roads, with a hairline casing */}
      {[
        'M0 50 L100 46',
        'M48 0 L50 100',
        'M4 8 L96 94',
        'M0 24 L100 30',
        'M30 0 C34 30 26 60 32 100',
        'M100 12 C80 30 76 60 84 100',
        'M0 78 C30 70 60 74 100 82',
      ].map((d) => (
        <g key={d}>
          <path d={d} className="fill-none stroke-line" strokeWidth={6} vectorEffect="non-scaling-stroke" />
          <path d={d} className="fill-none stroke-surface" strokeWidth={4} vectorEffect="non-scaling-stroke" />
        </g>
      ))}
    </svg>

    {districts &&
      DISTRICTS.map((d) => (
        <span
          key={d.name}
          aria-hidden
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-[11px] font-semibold tracking-wide text-muted/80"
          style={{ left: `${d.x}%`, top: `${d.y}%` }}
        >
          {d.name}
        </span>
      ))}

    {you && (
      <span
        className="absolute size-4 -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${you.x}%`, top: `${you.y}%` }}
        role="img"
        aria-label={you.label}
      >
        <span className="absolute inset-0 rounded-full bg-info/30 motion-safe:animate-ping" />
        <span className="absolute inset-0.5 rounded-full border-2 border-surface bg-info shadow-card" />
      </span>
    )}

    {pins.map((pin) => {
      const active = pin.id === selectedId
      return (
        <button
          key={pin.id}
          type="button"
          aria-label={pin.title}
          aria-pressed={active}
          onClick={() => onSelect?.(pin.id)}
          className={cx(
            'absolute flex -translate-x-1/2 -translate-y-full flex-col items-center pb-1 transition-transform duration-200 ease-out',
            active ? 'z-20 scale-110' : 'z-10 active:scale-95',
          )}
          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
        >
          <span
            className={cx(
              'relative flex h-7 items-center gap-1 rounded-chip px-2.5 text-footnote font-semibold whitespace-nowrap tabular-nums shadow-[0_2px_8px_rgb(0_0_0/0.18)]',
              active ? 'bg-brand text-on-brand' : 'bg-surface text-ink',
            )}
          >
            {pin.label}
            {pin.count && pin.count > 1 && (
              <span
                className={cx(
                  'rounded-chip px-1.5 text-[11px]',
                  active ? 'bg-on-brand/20 text-on-brand' : 'bg-brand-soft text-brand',
                )}
              >
                {pin.count}
              </span>
            )}
          </span>
          <span aria-hidden className={cx('-mt-1 size-2.5 rotate-45 rounded-[2px]', active ? 'bg-brand' : 'bg-surface')} />
        </button>
      )
    })}
  </div>
)
