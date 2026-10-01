import { useShell } from '../store/shell'
import { de } from './de'
import { en, type Dictionary } from './en'

export type Lang = 'en' | 'de'

const dictionaries: Record<Lang, Dictionary> = { en, de }

export const useT = (): Dictionary => dictionaries[useShell((s) => s.lang)]
