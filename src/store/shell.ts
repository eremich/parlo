import { create } from 'zustand'
import type { Lang } from '../i18n'

/** Presentation controls that live outside the device frames. */
export type Role = 'patient' | 'doctor' | 'staff'
export type Theme = 'light' | 'dark' | 'auto'

const ROLES: Role[] = ['patient', 'doctor', 'staff']
const LANGS: Lang[] = ['en', 'de']
const THEMES: Theme[] = ['light', 'dark', 'auto']

/** Every state the prototype can start in (docs/parlo-prototype-brief.md §9 plus a few extra states). */
export const SCENARIOS = [
  'default',
  'hero-start',
  'hero-offer',
  'hero-filled',
  'hero-done',
  'no-match',
  'slot-taken',
  'request-pending',
  'running-late',
  'conflict',
  'offline',
  'onboarding',
  'empty',
] as const
export type Scenario = (typeof SCENARIOS)[number]

const pick = <T extends string>(value: string | null, allowed: readonly T[], fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback

const params = new URLSearchParams(window.location.search)

/** Screenshot mode: one bare screen at device size, no presentation shell (`?shot=1`) */
export const SHOT = params.has('shot')
/** Deep link into a role app, e.g. `?path=/doctor/rahimi`; the app's home stays underneath for Back */
export const START_PATH = params.get('path')?.startsWith('/') ? params.get('path') : null

type ShellState = {
  role: Role
  lang: Lang
  theme: Theme
  scenario: Scenario
  setRole: (role: Role) => void
  setLang: (lang: Lang) => void
  setTheme: (theme: Theme) => void
  /** Scenarios seed the whole store, so switching one restarts the prototype in that state */
  setScenario: (scenario: Scenario) => void
}

export const useShell = create<ShellState>()((set) => ({
  role: pick(params.get('role'), ROLES, 'patient'),
  lang: pick(params.get('lang'), LANGS, 'en'),
  theme: pick(params.get('theme'), THEMES, 'light'),
  scenario: pick(params.get('scenario'), SCENARIOS, 'default'),
  setRole: (role) => set({ role }),
  setLang: (lang) => set({ lang }),
  setTheme: (theme) => set({ theme }),
  setScenario: (scenario) => {
    const url = new URL(window.location.href)
    if (scenario === 'default') url.searchParams.delete('scenario')
    else url.searchParams.set('scenario', scenario)
    window.location.assign(url)
  },
}))

const systemDark = window.matchMedia('(prefers-color-scheme: dark)')

/** Mirror shell state into the URL and <html> so any view can be shared as a link. */
useShell.subscribe((s) => applyShell(s))
systemDark.addEventListener('change', () => applyShell(useShell.getState()))
applyShell(useShell.getState())

function applyShell({ role, lang, theme, scenario }: ShellState) {
  const root = document.documentElement
  root.dataset.theme = theme === 'auto' ? (systemDark.matches ? 'dark' : 'light') : theme
  root.lang = lang

  const url = new URL(window.location.href)
  url.searchParams.set('role', role)
  url.searchParams.set('lang', lang)
  url.searchParams.set('theme', theme)
  if (scenario !== 'default') url.searchParams.set('scenario', scenario)
  window.history.replaceState(null, '', url)
}
