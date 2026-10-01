import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Routes, useLocation, useNavigationType, type Location } from 'react-router'
import { cx } from '../lib/cx'

type Kind = 'push' | 'pop' | 'fade' | 'none'
type Layer = { location: Location; role: 'current' | 'leaving'; kind: Kind }

export type StackRoutesProps = {
  /** <Route> elements, rendered once per layer */
  children: ReactNode
  /** Top-level tab paths: going to one (tab bar) crossfades instead of sliding */
  tabs?: string[]
  /** "slide": iOS push and pop (phone apps) · "fade": quiet crossfade (web dashboard) */
  mode?: 'slide' | 'fade'
}

/** How long the leaving screen stays mounted; matches the longest keyframe in index.css */
const LEAVE_MS = { push: 420, pop: 420, fade: 180, none: 0 }

const isTab = (path: string, tabs: string[]) => tabs.includes(path)

/** Pass as navigation state when a button goes back to a known screen rather than one step in history */
export const BACK = { back: true }

/**
 * Routes with iOS-style screen transitions. The previous screen stays mounted while it leaves,
 * so push slides the new screen in from the right with the old one easing left and dimming;
 * pop plays it backwards; switching tabs crossfades. Reduced motion makes all of it instant.
 */
export const StackRoutes = ({ children, tabs = [], mode = 'slide' }: StackRoutesProps) => {
  const location = useLocation()
  const navigationType = useNavigationType()
  const [layers, setLayers] = useState<Layer[]>([{ location, role: 'current', kind: 'none' }])
  const timer = useRef<number>(undefined)

  useEffect(() => {
    setLayers((prev) => {
      const current = prev.find((l) => l.role === 'current') ?? prev[prev.length - 1]
      if (current.location.key === location.key) return prev
      const from = current.location.pathname
      const to = location.pathname
      const back = navigationType === 'POP' || (location.state as { back?: boolean } | null)?.back
      const kind: Kind = mode === 'fade' ? 'fade' : back ? 'pop' : isTab(to, tabs) && from !== to ? 'fade' : 'push'
      return [
        { location: current.location, role: 'leaving', kind },
        { location, role: 'current', kind },
      ]
    })
  }, [location, navigationType, tabs, mode])

  // Drop the leaving screen once its animation is over
  useEffect(() => {
    const leaving = layers.find((l) => l.role === 'leaving')
    if (!leaving) return
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(
      () => setLayers((prev) => prev.filter((l) => l.role === 'current')),
      LEAVE_MS[leaving.kind],
    )
    return () => window.clearTimeout(timer.current)
  }, [layers])

  return (
    <div className="relative h-full overflow-hidden">
      {layers.map((layer) => (
        <div
          key={layer.location.key}
          aria-hidden={layer.role === 'leaving' || undefined}
          className={cx(
            'absolute inset-0',
            layer.role === 'leaving' && 'pointer-events-none',
            // On push the new screen covers the old one; on pop the old one slides off on top
            layer.kind === 'pop' ? (layer.role === 'leaving' ? 'z-10' : 'z-0') : layer.role === 'current' ? 'z-10' : 'z-0',
            ANIMATION[layer.kind][layer.role],
          )}
        >
          <Routes location={layer.location}>{children}</Routes>
          {/* The screen underneath dims slightly, like iOS */}
          {(layer.kind === 'push' || layer.kind === 'pop') && (
            <div
              aria-hidden
              className={cx(
                'pointer-events-none absolute inset-0 bg-black/10',
                layer.kind === 'push' && layer.role === 'leaving' && 'animate-dim-in',
                layer.kind === 'pop' && layer.role === 'current' && 'animate-dim-out',
                !(
                  (layer.kind === 'push' && layer.role === 'leaving') ||
                  (layer.kind === 'pop' && layer.role === 'current')
                ) && 'hidden',
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}

const ANIMATION: Record<Kind, Record<Layer['role'], string>> = {
  push: { current: 'animate-push-enter shadow-[-8px_0_24px_rgb(0_0_0/0.12)]', leaving: 'animate-push-exit' },
  pop: { current: 'animate-pop-enter', leaving: 'animate-pop-exit shadow-[-8px_0_24px_rgb(0_0_0/0.12)]' },
  fade: { current: 'animate-fade-in', leaving: 'animate-fade-out' },
  none: { current: '', leaving: '' },
}
