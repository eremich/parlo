import type { LanguageCode } from './types'

/**
 * Mock history for the practice's Insights page (everything before the prototype's clock started).
 * Live activity from the store is added on top, so the hero scenario moves these numbers.
 */
export const INSIGHTS_BASELINE = {
  /** Slots refilled from the waitlist earlier this week, before the demo starts */
  filledThisWeek: 6,
  /** Average minutes from cancellation to a waitlist patient taking the slot */
  refillMinutes: 14,
  /** Last 30 days */
  noShowRate: 3.9,
  noShowRateBefore: 6.2,
  /** Average time reception takes to confirm a request, in minutes */
  confirmMinutes: 72,
  /** New patients this month by their first non-German language */
  newPatientsByLanguage: { EN: 18, TR: 11, AR: 9, RU: 7, UK: 6, PL: 3, FA: 2, ES: 2 } as Partial<Record<LanguageCode, number>>,
  newPatientsGermanOnly: 14,
}
