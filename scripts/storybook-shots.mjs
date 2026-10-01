// Storybook canvases for the portfolio case: `node scripts/storybook-shots.mjs` (Storybook on :6010).
// Doc pages are shot as a 1440 × 900 page; single components are shot on their own at high density
// and centred on a 2880 × 1800 frame afterwards (scripts/frame-shots.py), so they read at case size.
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'

const BASE = process.env.SB_BASE ?? 'http://localhost:6010'
/** [file, story id, mode] — page: whole canvas; element: just the component */
const VIEWS = [
  ['01-colors', 'foundations--colors', 'page'],
  ['02-typography', 'foundations--typography', 'page'],
  ['03-buttons', 'components-button--variants', 'element'],
  ['04-doctor-result-card', 'patterns-doctorresultcard--default', 'element'],
  ['05-status-badges', 'patterns-statusbadge--all-statuses', 'element'],
  ['06-calendar-grid', 'patterns-calendargrid--day', 'element'],
  ['07-appointment-card', 'patterns-appointmentcard--day-before', 'element'],
]

await mkdir('shots/storybook/raw', { recursive: true })
const browser = await chromium.launch()
for (const [file, id, mode] of VIEWS) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: mode === 'page' ? 2 : 4 })
  await page.goto(`${BASE}/iframe.html?id=${id}&viewMode=story`)
  const root = page.locator('#storybook-root > *').first()
  await root.waitFor({ timeout: 30000 })
  await page.waitForTimeout(1500)
  if (mode === 'page') await page.screenshot({ path: `shots/storybook/${file}.png` })
  else await root.screenshot({ path: `shots/storybook/raw/${file}.png`, omitBackground: true })
  console.log('ok  ', file)
  await page.close()
}
await browser.close()
