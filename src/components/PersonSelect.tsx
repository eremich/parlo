import { Check, ChevronsUpDown } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { cx } from '../lib/cx'
import { Avatar } from './Avatar'

export type PersonOption = {
  id: string
  name: string
  /** "You", "Child · 6 years" */
  detail?: string
  photo?: string
}

export type PersonSelectProps = {
  label: string
  value: string
  options: PersonOption[]
  onChange: (id: string) => void
}

/**
 * Who an action is for (booking for a child or parent). A row that opens an iOS-style pull-down
 * menu, so it scales from two people to a whole family.
 */
export const PersonSelect = ({ label, value, options, onChange }: PersonSelectProps) => {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const listId = useId()
  const selected = options.find((o) => o.id === value) ?? options[0]

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={root} className="relative">
      <p className="pb-1.5 text-footnote text-muted">{label}</p>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-14 w-full items-center gap-3 rounded-card bg-surface px-3.5 py-2 text-left shadow-card transition-transform duration-150 ease-out active:scale-[0.99]"
      >
        <Avatar name={selected.name} src={selected.photo} size="md" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-headline text-ink">{selected.name}</span>
          {selected.detail && <span className="block truncate text-subheadline text-muted">{selected.detail}</span>}
        </span>
        <ChevronsUpDown aria-hidden size={18} className="shrink-0 text-muted" />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute inset-x-0 top-full z-30 mt-2 max-h-[280px] origin-top animate-pop-in overflow-y-auto rounded-card bg-surface/95 p-1.5 shadow-sheet ring-1 ring-line/70 backdrop-blur-xl"
        >
          {options.map((o) => {
            const active = o.id === value
            return (
              <li key={o.id} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o.id)
                    setOpen(false)
                  }}
                  className={cx(
                    'flex min-h-12 w-full items-center gap-3 rounded-control px-2.5 py-1.5 text-left transition-colors duration-150',
                    active ? 'bg-brand-soft' : 'hover:bg-canvas',
                  )}
                >
                  <Avatar name={o.name} src={o.photo} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body text-ink">{o.name}</span>
                    {o.detail && <span className="block truncate text-footnote text-muted">{o.detail}</span>}
                  </span>
                  {active && <Check aria-hidden size={18} strokeWidth={2.5} className="shrink-0 text-brand" />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
