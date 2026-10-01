// User-flow diagrams for the portfolio case: `node scripts/flows.mjs` → shots/flows/*.png.
// Source: the Miro board "Doctor booking platform, Germany: user flows"
// (https://miro.com/app/board/uXjVHgy3KfM=/). Same steps and colours as on the board, laid out left to right.
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'

const CLASSES = `
    classDef general fill:#FFE86D,stroke:#A28E26,color:#574900
    classDef decision fill:#9CE6FF,stroke:#2C97BB,color:#1C4657
    classDef terminator fill:#B3E65F,stroke:#6E9A24,color:#2F440B`

const FLOWS = {
  // Linear version of the board's hero scenario: roles named in each step, so no crossing lanes
  e2e: `flowchart LR${CLASSES}
    a1([Patient A cancels Thursday 9:00]):::terminator --> s1[Platform: slot freed, calendar updates for everyone]:::general
    s1 --> s2{{Anyone on the waitlist?}}:::decision
    s2 -->|No| s6([Slot back to public search]):::terminator
    s2 -->|Yes| s3[Offer to first match: same doctor, insurance, language]:::general
    s3 --> b1[Patient B gets a push: earlier slot, 30 min to take it]:::general
    b1 --> s4{{Accepted within 30 min?}}:::decision
    s4 -->|No| s5[Offer to next on waitlist]:::general
    s5 --> s2
    s4 -->|Yes| b2[Patient B: booked in one tap, old slot released]:::general
    b2 --> c1[Clinic admin: Filled from waitlist, no phone call]:::general
    b2 --> d1[Doctor: new patient in My day, with brief]:::general
    d1 --> d2[Visit done]:::general
    d2 --> b4[Patient B reviews: Spoke my language]:::general
    b4 --> c2([Insights: one more empty slot filled]):::terminator
    c1 --> c2`,

  'patient-book': `flowchart LR${CLASSES}
    p1([Open app or site, German or English]):::terminator
    p2[Search: specialty, symptom or doctor name]:::general
    p3[Filters: insurance public or private, language, earliest slot, distance, video visit, step-free]:::general
    p4[Results: earliest real slot per doctor, languages, insurance badge]:::general
    p5[Doctor profile: languages, services, reviews with reasons, address]:::general
    p6[Pick visit type: new patient, follow-up, video]:::general
    p7[Pick slot]:::general
    p8{{Referral needed?}}:::decision
    p9[Info: bring referral, or upload photo]:::general
    p10{{Has account?}}:::decision
    p11[Quick sign-up: email or phone code, name, insurance type]:::general
    p12[Consent: share booking data with this practice, GDPR]:::general
    p13[Confirm: reason for visit optional]:::general
    p14{{Practice confirms automatically?}}:::decision
    p15[Status: request sent, answer usually within 2 h]:::general
    p16([Booked: add to calendar, directions, reminder set]):::terminator
    p1 --> p2 --> p3 --> p4 --> p5 --> p6 --> p7 --> p8
    p8 -->|Yes| p9 --> p10
    p8 -->|No| p10
    p10 -->|No| p11 --> p12
    p10 -->|Yes| p12
    p12 --> p13 --> p14
    p14 -->|Yes| p16
    p14 -->|No| p15 --> p16`,

  'patient-manage': `flowchart LR${CLASSES}
    m1([My appointments]):::terminator
    m2{{What to do?}}:::decision
    m3[Reschedule: pick new slot, old one released]:::general
    m4[Cancel: free until 24 h before, reason optional]:::general
    m5[Join waitlist for an earlier slot]:::general
    m6[Offer arrives: accept or skip]:::general
    m7[Reminder the day before: confirm or cancel]:::general
    m8[Arrival: check in with the app or at reception]:::general
    m9{{Running late?}}:::decision
    m10[Tell the practice: 10 min late]:::general
    m11[After visit: rate doctor and practice, reasons as chips]:::general
    m12([Book follow-up]):::terminator
    m1 --> m2
    m2 -->|Reschedule| m3 --> m7
    m2 -->|Cancel| m4
    m2 -->|Earlier slot| m5 --> m6 --> m7
    m7 --> m9
    m9 -->|Yes| m10 --> m8
    m9 -->|No| m8
    m8 --> m11 --> m12`,

  doctor: `flowchart LR${CLASSES}
    d1([Open My day]):::terminator
    d2[Timeline: appointments, gaps, checked-in patients]:::general
    d3[Next patient brief: reason, visit type, language, insurance, first visit or not]:::general
    d4{{Patient arrived?}}:::decision
    d5[Start visit]:::general
    d6[Mark no-show after 15 min]:::general
    d7[Mark done, book follow-up for the patient]:::general
    d8{{Running behind?}}:::decision
    d9[Notify waiting patients: delay 20 min]:::general
    d10[Schedule: working hours, block time, vacation]:::general
    d11{{Block conflicts with bookings?}}:::decision
    d12[Clinic admin asked to move affected patients]:::general
    d13([Day closed]):::terminator
    d1 --> d2 --> d3 --> d4
    d4 -->|Yes| d5 --> d8
    d4 -->|No| d6 --> d2
    d8 -->|Yes| d9 --> d7
    d8 -->|No| d7
    d7 --> d13
    d1 --> d10 --> d11
    d11 -->|Yes| d12
    d11 -->|No| d13`,

  staff: `flowchart LR${CLASSES}
    c1([Open Today]):::terminator
    c2[Needs attention: requests to confirm, conflicts, late patients]:::general
    c3[Calendar: all doctors side by side, status per slot]:::general
    c4{{Request type?}}:::decision
    c5[Confirm or suggest another time]:::general
    c6[Phone or walk-in: create booking in 3 fields]:::general
    c7[Doctor blocked time: move affected patients]:::general
    c8[Patient checked in: tell doctor]:::general
    c9[Doctors and services: prices, durations, languages, insurance]:::general
    c10[Staff and roles: admin, reception, doctor]:::general
    c11[Insights: occupancy, no-shows, empty slots filled by waitlist, reviews]:::general
    c12([Day closed]):::terminator
    c1 --> c2 --> c4
    c4 -->|New request| c5 --> c3
    c4 -->|Phone or walk-in| c6 --> c3
    c4 -->|Conflict| c7 --> c3
    c3 --> c8 --> c12
    c1 --> c9
    c1 --> c10
    c1 --> c11`,

  onboarding: `flowchart LR${CLASSES}
    o1([Clinic signs up]):::terminator
    o2[Practice details: name, address, specialties, insurance accepted]:::general
    o3[Verification: practice license document]:::general
    o4{{Verified?}}:::decision
    o5[Fix and resubmit, reason shown]:::general
    o6[Add services: name, duration, price for private patients]:::general
    o7[Invite doctors by email]:::general
    o8[Doctor accepts invite in app]:::general
    o9[Doctor profile: photo, languages, specialties, bio]:::general
    o10[Working hours and visit types]:::general
    o11{{Profile complete?}}:::decision
    o12[Checklist shows what is missing]:::general
    o13([Live in search]):::terminator
    o1 --> o2 --> o3 --> o4
    o4 -->|No| o5 --> o3
    o4 -->|Yes| o6 --> o7 --> o8 --> o9 --> o10 --> o11
    o11 -->|No| o12 --> o9
    o11 -->|Yes| o13`,

  account: `flowchart LR${CLASSES}
    a1([Profile]):::terminator
    a2[Insurance: public with provider, or private]:::general
    a3[Family: add child or parent, book for them]:::general
    a4[Languages I speak, saved as default filter]:::general
    a5[Notifications: reminders, waitlist offers, practice messages]:::general
    a6[Privacy: which practices see my data, withdraw consent]:::general
    a7[Download my data]:::general
    a8[Delete account]:::general
    a1 --> a2
    a1 --> a3
    a1 --> a4
    a1 --> a5
    a1 --> a6 --> a7
    a6 --> a8`,
}

const html = (code) => `<!doctype html><html><head><meta charset="utf-8">
<style>body{margin:0;background:#fff;font-family:Inter,system-ui,sans-serif}#c{display:inline-block;padding:24px}</style>
</head><body><div id="c"><pre class="mermaid">${code}</pre></div></body></html>`

await mkdir('shots/flows', { recursive: true })
const browser = await chromium.launch()
for (const [name, code] of Object.entries(FLOWS)) {
  const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 4000, height: 2400 } })
  await page.setContent(html(code))
  await page.addScriptTag({ path: 'node_modules/mermaid/dist/mermaid.min.js' })
  await page.evaluate(async () => {
    window.mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      flowchart: { curve: 'basis', padding: 16, useMaxWidth: false, wrappingWidth: 240 },
      themeVariables: { fontSize: '16px', lineColor: '#777', clusterBkg: '#f7f7f5', clusterBorder: '#d6d6d0' },
    })
    await window.mermaid.run()
  })
  await page.locator('#c').screenshot({ path: `shots/flows/${name}.png` })
  console.log('ok  ', name)
  await page.close()
}
await browser.close()
