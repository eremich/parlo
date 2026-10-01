// Screenshots for the portfolio case: `npm run shots` (needs `npm run dev` on :5180).
// Each shot opens one bare screen in shot mode (?shot=1), optionally clicks through a few steps,
// and saves PNG at 2x. Phone 390 × 844 → 780 × 1688, web 1440 × 900 → 2880 × 1800.
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'

const BASE = process.env.SHOTS_BASE ?? 'http://localhost:5180'
const OUT = 'shots'
const PHONE = { width: 390, height: 844 }
const WEB = { width: 1440, height: 900 }
const SETTLE_MS = 700

const click = (name) => async (page) => {
  await page.getByRole('button', { name }).filter({ visible: true }).first().click()
  await page.waitForTimeout(SETTLE_MS)
}
// Booking: visit type → time → (consent, only for a practice new to the patient) → details → book
const toDetails = [click(/New patient/), click(/^Continue/)]
const toBooked = [...toDetails, click(/^Book /)]
const toConsent = [click(/New patient/), click(/^Continue/)]

/** [folder, file, role, query, steps] */
const SHOTS = [
  ['patient', '01-search', 'patient', ''],
  ['patient', '02-results', 'patient', '', [click(/^GP$/)]],
  ['patient', '03-filters', 'patient', '', [click(/^GP$/), click('Filters')]],
  ['patient', '04-results-map', 'patient', '', [click(/^GP$/), click(/^Map$/)]],
  ['patient', '05-doctor-profile', 'patient', 'path=/doctor/aydin'],
  ['patient', '06-booking-who', 'patient', 'path=/book/aydin'],
  ['patient', '07-booking-for-family', 'patient', 'path=/book/aydin', [click(/Anna Petrova/)]],
  ['patient', '08-booking-details', 'patient', 'path=/book/aydin', toDetails],
  ['patient', '08b-booking-consent', 'patient', 'path=/book/rahimi', toConsent],
  ['patient', '09-booked', 'patient', 'path=/book/aydin', toBooked],
  ['patient', '10-appointments', 'patient', 'path=/appointments'],
  ['patient', '11-appointment', 'patient', 'path=/appointment/a-anna-aydin'],
  ['patient', '12-waitlist-offer', 'patient', 'scenario=hero-offer'],
  ['patient', '13-review', 'patient', 'scenario=hero-done'],
  ['patient', '14-family', 'patient', 'path=/family'],
  ['patient', '15-profile', 'patient', 'path=/profile'],
  ['patient', '16-privacy', 'patient', 'path=/privacy'],
  ['patient', '17-no-match', 'patient', 'scenario=no-match'],
  ['patient', '19-offline', 'patient', 'scenario=offline'],
  ['patient', '20-search-de', 'patient', 'lang=de'],
  ['patient', '21-results-de', 'patient', 'lang=de', [click(/^Hausarzt$/)]],

  ['doctor', '01-my-day', 'doctor', ''],
  ['doctor', '02-patient-brief', 'doctor', 'scenario=hero-done'],
  ['doctor', '03-running-late', 'doctor', 'scenario=running-late&path=/day'],
  ['doctor', '04-schedule-conflict', 'doctor', 'scenario=conflict'],
  ['doctor', '05-invite', 'doctor', 'scenario=onboarding'],

  ['staff', '01-today', 'staff', ''],
  ['staff', '02-calendar-filled', 'staff', 'scenario=hero-filled'],
  ['staff', '03-phone-booking', 'staff', '', [click(/New booking/)]],
  ['staff', '04-conflict', 'staff', 'scenario=conflict', [click(/Move patients/)]],
  ['staff', '05-patients', 'staff', 'path=/patients'],
  ['staff', '06-doctors-services', 'staff', 'path=/doctors'],
  ['staff', '07-team', 'staff', 'path=/team'],
  ['staff', '08-insights', 'staff', 'scenario=hero-done'],
  ['staff', '09-reviews', 'staff', 'path=/reviews'],
  ['staff', '10-onboarding', 'staff', 'scenario=onboarding'],

  ['dark', '01-search', 'patient', 'theme=dark'],
  ['dark', '02-results', 'patient', 'theme=dark', [click(/^GP$/)]],
  ['dark', '05-doctor-profile', 'patient', 'theme=dark&path=/doctor/aydin'],
  ['dark', '10-appointments', 'patient', 'theme=dark&path=/appointments'],
  ['dark', 'doctor-01-my-day', 'doctor', 'theme=dark'],
  ['dark', 'staff-01-today', 'staff', 'theme=dark'],
]

const only = process.argv[2]
const browser = await chromium.launch()
let failed = 0

for (const [folder, file, role, query, steps = []] of SHOTS) {
  if (only && !`${folder}/${file}`.includes(only)) continue
  const viewport = role === 'staff' ? WEB : PHONE
  const page = await browser.newPage({ viewport, deviceScaleFactor: 2, reducedMotion: 'reduce' })
  const params = new URLSearchParams(`shot=1&role=${role}&lang=en&theme=light`)
  for (const [k, v] of new URLSearchParams(query)) params.set(k, v)
  try {
    await page.goto(`${BASE}/?${params}`)
    await page.locator('[data-shot]').waitFor()
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(SETTLE_MS)
    for (const step of steps) await step(page)
    await mkdir(`${OUT}/${folder}`, { recursive: true })
    await page.locator('[data-shot]').screenshot({ path: `${OUT}/${folder}/${file}.png` })
    console.log('ok  ', `${folder}/${file}`)
  } catch (error) {
    failed++
    console.log('FAIL', `${folder}/${file}`, error.message.split('\n')[0])
  }
  await page.close()
}

await browser.close()
process.exit(failed ? 1 : 0)
