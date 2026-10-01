import type { Lang } from '../i18n'
import type { Specialty } from './types'

/** What each kind of practice offers, as shown on the doctor profile. */
export const SERVICES: Record<Lang, Record<Specialty, string[]>> = {
  en: {
    gp: ['Check-ups', 'Blood tests', 'Vaccinations', 'Sick notes', 'Referrals to specialists'],
    dentist: ['Check-ups', 'Cleaning', 'Fillings', 'Emergency appointments'],
    gynecology: ['Preventive check-ups', 'Pregnancy care', 'Contraception advice', 'Ultrasound'],
    dermatology: ['Skin cancer screening', 'Mole checks', 'Acne treatment', 'Allergy tests'],
    pediatrics: ['U check-ups', 'Vaccinations', 'Sick children', 'Development advice'],
    ent: ['Hearing tests', 'Allergy tests', 'Sinus problems', 'Tonsils'],
  },
  de: {
    gp: ['Check-ups', 'Blutuntersuchungen', 'Impfungen', 'Krankschreibungen', 'Überweisungen'],
    dentist: ['Kontrolle', 'Zahnreinigung', 'Füllungen', 'Notfalltermine'],
    gynecology: ['Vorsorge', 'Schwangerschaftsbetreuung', 'Verhütungsberatung', 'Ultraschall'],
    dermatology: ['Hautkrebs-Screening', 'Muttermal-Kontrolle', 'Aknebehandlung', 'Allergietests'],
    pediatrics: ['U-Untersuchungen', 'Impfungen', 'Kranke Kinder', 'Entwicklungsberatung'],
    ent: ['Hörtests', 'Allergietests', 'Nasennebenhöhlen', 'Mandeln'],
  },
}
