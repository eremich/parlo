import type { Lang } from '../i18n'
import type { LanguageCode } from './types'

/** Language names in the UI language. Shown as codes in chips and as names in text; never as flags. */
export const LANGUAGE_NAMES: Record<Lang, Record<LanguageCode, string>> = {
  en: {
    DE: 'German',
    EN: 'English',
    TR: 'Turkish',
    AR: 'Arabic',
    RU: 'Russian',
    UK: 'Ukrainian',
    PL: 'Polish',
    FR: 'French',
    ES: 'Spanish',
    FA: 'Persian',
  },
  de: {
    DE: 'Deutsch',
    EN: 'Englisch',
    TR: 'Türkisch',
    AR: 'Arabisch',
    RU: 'Russisch',
    UK: 'Ukrainisch',
    PL: 'Polnisch',
    FR: 'Französisch',
    ES: 'Spanisch',
    FA: 'Persisch',
  },
}
