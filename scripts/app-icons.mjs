// App icon files from the logo: `node scripts/app-icons.mjs` → public/icons/*.png.
// Green mark on white; iOS and Android round the corners themselves, so the PNGs are square.
import { readFile, mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'

const mark = await readFile('public/logo.svg', 'utf8')
/** [file, size, mark height as a share of the icon] — maskable icons keep the mark in the safe zone */
const ICONS = [
  ['apple-touch-icon', 180, 0.6],
  ['icon-192', 192, 0.6],
  ['icon-512', 512, 0.6],
  ['icon-maskable-512', 512, 0.46],
  ['icon-1024', 1024, 0.6],
]

await mkdir('public/icons', { recursive: true })
const browser = await chromium.launch()
for (const [file, size, share] of ICONS) {
  const page = await browser.newPage({ viewport: { width: size, height: size } })
  const h = Math.round(size * share)
  await page.setContent(`<body style="margin:0;width:${size}px;height:${size}px;background:#fff;display:flex;align-items:center;justify-content:center">
    <div style="height:${h}px;padding-top:${Math.round(size * 0.06)}px">${mark.replace('<svg ', `<svg height="${h}" width="${Math.round((h * 64) / 72)}" `)}</div></body>`)
  await page.screenshot({ path: `public/icons/${file}.png` })
  console.log('ok  ', file)
  await page.close()
}
await browser.close()
