# Parlo — Clickable Prototype Brief

This brief is for Claude Code. Build a clickable MVP prototype of **Parlo**, a doctor booking platform for Germany with three connected roles: patient, doctor and practice staff. It exists to produce screenshots, a live demo and a Storybook for a portfolio case study. It is not a production app.

---

## 1. Context

**Product.** Parlo helps people in Germany find a doctor who speaks their language and accepts their insurance, and book the earliest real appointment. Practices manage their day and fill cancelled slots automatically.

**Origin.** Re-imagined from a doctor booking marketplace designed in 2019 for another market. Everything is redesigned for Germany in 2026: brand, flows, UI, data.

**Market facts that shape the design.**
- Two insurance systems: public (GKV, "gesetzlich") and private (PKV). Many practices offer different slots or services depending on insurance.
- Some specialists expect a referral (Überweisung) from a GP.
- Patients show their insurance card at reception on the first visit of the quarter.
- Health data is special-category data under GDPR: explicit consent per practice.
- Competitors already offer insurance filters and waitlists. Parlo's difference is **language**: find doctors who speak yours.

**Thesis.** The right doctor, in your language, at the earliest real slot. And for practices: no empty chair when someone cancels.

**Roles.**
- **Patient**: mobile app (primary) and web.
- **Doctor**: mobile app, "My day".
- **Practice staff** (MFA at reception, practice manager): web dashboard.

---

## 2. Scope

### In scope
- One prototype with a role switcher and shared state across roles.
- Patient (390 × 844): search, filters, results, doctor profile, booking, account creation during booking, consent, my appointments, reschedule, cancel, waitlist, reminder, check-in, running late, review, family members, privacy.
- Doctor (390 × 844): my day, patient brief, arrived / no-show, done and follow-up, running behind, block time.
- Practice staff (1440 × 900): today, needs attention, multi-doctor calendar, confirm requests, phone booking, conflicts, doctors and services, staff roles, insights, reviews.
- Onboarding: practice sign-up, verification, invite doctor, doctor profile checklist, go live.
- English and German UI.
- Mock data only. No backend, no real payments, no real maps (static map image with SVG pins).
- Storybook design system.
- Deterministic scenarios via URL, automated screenshots.

### Out of scope
- Video consultations (shown as a visit type only).
- Medical records, prescriptions, billing with insurers.

---

## 3. Tech stack
- Vite + React + TypeScript, Tailwind with tokens, React Router, Zustand (one store shared by all roles).
- i18n: `src/i18n/en.ts`, `src/i18n/de.ts`, `?lang=en|de`.
- Lucide icons.
- Storybook 8 (see the separate design-system prompt), Playwright for screenshots.
- Presentational components are props-driven, no store access.

---

## 4. Design direction

### Personality
Calm, human, precise. Not the default "medical blue". Warm enough to feel welcoming to someone new in the country, clear enough for a busy reception desk.

### Signature elements
1. **Language chips**: language codes in soft pills ("EN · TR · AR"), never flags. Flags are countries, not languages.
2. **Earliest slot**: every result leads with the real next available time ("Tomorrow 08:40"), not with ratings.
3. **"Needs attention"** strip on the practice dashboard: what staff must do now.

### Color tokens

| Token | Light | Dark | Use |
|---|---|---|---|
| `ink` | `#16211F` | `#EEF3F1` | Primary text |
| `muted` | `#56645F` | `#9BAAA5` | Secondary text (AA) |
| `canvas` | `#F4F6F4` | `#0E1412` | Background |
| `surface` | `#FFFFFF` | `#161E1B` | Cards, sheets |
| `line` | `#DCE3DF` | `#26312D` | Dividers |
| `brand` | `#0F6B5C` | `#3DB39E` | Primary actions, brand (deep green-teal) |
| `brand-soft` | `#E3F1EE` | `#17322C` | Selected states, chips |
| `accent` | `#E4704F` | `#F08E70` | Highlights, earliest-slot emphasis (sparingly) |
| `ok` | `#1E7F4B` | `#46C07E` | Confirmed, checked in |
| `warn` | `#B8740A` | `#E6A745` | Pending, running late |
| `error` | `#C4363A` | `#EF6B6F` | Cancelled, no-show, errors |
| `info` | `#2D62B8` | `#7AA4EC` | Waitlist offers, video visits |

Rules: status always with icon + text. Accent is for emphasis only, never for errors.

### Typography
- UI: `system-ui` (SF Pro on Apple, Segoe/Roboto elsewhere), fallback `"Inter", sans-serif`.
- Display (brand moments, large titles, landing hero): **Instrument Sans** 600–700 (Google Fonts).
- Mobile uses the iOS scale: largeTitle 34/41, title2 22/28, headline 17/22 600, body 17/22, subheadline 15/20, footnote 13/18, caption 12/16 600.
- Web dashboard scale: 28/34 page title, 20/28 section, 15/22 body, 13/18 meta, 12/16 labels.
- `tabular-nums` for times and prices.

### Platforms
- Patient and doctor mobile: Apple HIG (large titles, labeled tab bars, sheets with detents, 44 pt targets).
- Practice dashboard: desktop web, left navigation with labels (not icons only), content max width, keyboard shortcuts for the calendar.

### Formats
- Dates and times German style in both languages: "Thu, 12 Mar", 24-hour "08:40".
- Prices in € for private patients only ("€ 85 for private patients"); public patients see "Covered by public insurance".

---

## 5. Screens and flows

A role switcher and language/theme toggles sit outside the phone or browser frame.

### 5.1 Patient (tabs: Search · Appointments · Family · Profile)
1. **Search home**: "What do you need?" (specialty, symptom or doctor), location (current or neighborhood), quick chips: GP, Dentist, Gynecologist, Dermatologist, Pediatrician, ENT. Saved filters show "Speaks: English, Ukrainian · Public insurance".
2. **Filters sheet**: insurance (public / private), languages spoken (multi-select), earliest slot (today, this week), distance, visit type (in person, video), accepts new patients, step-free access.
3. **Results** (list / map toggle): each card leads with the earliest slot, then doctor, specialty, practice, distance, language chips, insurance badge, rating with review count. Three next slots inline, tap to book. Empty state: "No doctor matches all filters. Show doctors speaking English in 3 km?"
4. **Doctor profile**: languages (with "Native" or "Fluent"), specialties, visit types, services, insurance accepted, practice info, step-free, reviews with reason chips, calendar with next 7 days.
5. **Booking**: visit type (new patient, follow-up, video) → slot → referral note if needed ("Bring a referral from your GP") → sign in or quick sign-up (email or phone code, name, date of birth, insurance type and provider) → consent ("Share your booking details with Praxis Dr. Aydın") → optional reason for visit → confirm.
6. **Confirmation**: auto-confirmed ("Booked") or request ("Request sent. Practices usually answer within 2 hours."). Add to calendar, directions, "Bring your insurance card".
7. **Appointments**: upcoming, past; each with status. Actions: reschedule, cancel (free until 24 h before), **join waitlist for an earlier slot** (choose how early, which days).
8. **Waitlist offer**: push + in-app card "Earlier slot: Thu 09:00 with Dr. Aydın. Take it?" with a countdown (30 min). Accept releases the old slot.
9. **Reminder** the day before: confirm / cancel. **Running late**: "Tell the practice: 10 / 20 min".
10. **Check-in** on arrival (tap when at the practice).
11. **Review** after the visit: doctor and practice rated separately, reason chips ("Explained clearly", "Spoke my language", "Long wait", "Started late"), optional comment.
12. **Family**: add child or parent, book on their behalf; each has insurance and languages.
13. **Profile**: insurance, languages, notifications, privacy (practices with access, withdraw consent, download data, delete account).

### 5.2 Doctor (tabs: My day · Schedule · Patients · Profile)
1. **My day**: timeline of the day with appointments and gaps, checked-in badge, waitlist fills marked "Filled from waitlist".
2. **Next patient brief**: name, visit type, first visit or returning, reason, languages, insurance, "Running 10 min late" if sent.
3. Actions: start, done (+ book follow-up), no-show (after 15 min).
4. **Running behind**: "Notify waiting patients: about 20 min delay".
5. **Schedule**: working hours, block time, vacation; conflicts show "3 patients affected. Ask reception to move them."

### 5.3 Practice staff (web; nav: Today · Calendar · Patients · Doctors & services · Team · Insights · Reviews · Settings)
1. **Today**: "Needs attention" strip (requests to confirm, conflicts from blocked time, late patients, waitlist fills), KPIs for today (appointments, checked in, no-shows, free slots), and the calendar.
2. **Calendar**: doctors as columns, day / week, status per appointment (confirmed, pending, checked in, done, no-show, cancelled), drag to move, click a free slot to create a booking. Cancelled appointments leave the slot free (show as a thin ghost, not blocking).
3. **Request**: confirm or propose another time.
4. **Phone booking**: patient search or quick new patient (name, phone, insurance) + slot, three fields.
5. **Conflict resolution**: affected patients list, suggested new slots, notify all.
6. **Doctors & services**: languages, specialties, visit types, durations, private prices, insurance rules (e.g. "new public patients: Tue and Thu only").
7. **Team**: roles (Practice manager, Reception, Doctor) with permissions.
8. **Insights**: occupancy by doctor, no-show rate, slots filled from waitlist, average time to confirm, new patients by language, reviews summary with top reasons.
9. **Reviews**: list, reply publicly.

### 5.4 Onboarding (practice and doctor)
Practice sign-up → details (name, address, specialties, insurance accepted, languages at reception) → verification document → services → invite doctor → doctor accepts in app → profile (photo, languages with level, bio) → working hours → checklist → "Live in search".

### 5.5 Hero scenario (must work by clicking across roles)
1. **Patient Anna** (English, Russian; public insurance) has Thu 09:00 with Dr. Aydın (GP, speaks German, English, Turkish). She cancels.
2. **Practice staff**: calendar shows the slot freed; "Needs attention" shows "Offering Thu 09:00 to waitlist".
3. **Patient Omar** (English, Arabic; public insurance) is on the waitlist for Dr. Aydın. He gets the offer, accepts in one tap; his Monday slot is released.
4. **Practice staff**: slot now "Confirmed · Filled from waitlist". Monday slot freed.
5. **Doctor**: My day shows Omar at 09:00 with brief and "Filled from waitlist".
6. **Patient Omar**: reminder, check-in.
7. **Doctor**: marks done.
8. **Patient Omar**: review with "Spoke my language".
9. **Practice staff**: Insights show "Slots filled from waitlist this week: 7" and the new review.

---

## 6. States
Empty search, no match with suggestion, request pending, request declined with alternatives, waitlist offer expired, slot taken while booking ("Someone just booked this slot. Next: 09:20"), cancellation after deadline, offline banner, no-show, doctor running late, conflict after blocked time, verification pending, loading skeletons.

## 7. Mock data (invented, Berlin)
- Practices: Hausarztpraxis am Görlitzer Park (Kreuzberg), HNO Praxis Mitte, Kinderarztpraxis Neukölln, Hautarztpraxis Prenzlauer Berg, Frauenarztpraxis Charlottenburg.
- Doctors (8–10): e.g. Dr. Emre Aydın (GP; DE, EN, TR), Dr. Laura Weber (Dermatology; DE, EN, FR), Dr. Olena Marchenko (Pediatrics; DE, UK, RU, EN), Dr. Sami Haddad (ENT; DE, AR, EN), Dr. Julia Nowak (Gynecology; DE, PL, EN).
- Patients: Anna Petrova (EN, RU; public), Omar Khalil (EN, AR; public), Lukas Schmidt (DE; private), plus family member Mia (child of Anna).
- Staff: Sabine Koch (Practice manager), Deniz Yılmaz (Reception).
- Slots over the next 14 days with realistic density (GPs busy, earliest in 1–3 days; dermatology earliest in 2–3 weeks).
- All names and practices are fictional.

## 8. Copy rules
- English and German, sentence case, plain words, formal "Sie" in German.
- Lead with time and language: "Tomorrow 08:40 · Speaks English, Turkish".
- Buttons say what happens: "Book 08:40", "Take earlier slot", "Mark as no-show".
- Errors say what happened and what to do. No apologies.
- Never promise medical outcomes. No symptom checker advice.

## 9. Scenarios via URL
`?role=patient|doctor|staff&scenario=<name>&lang=en|de&theme=light|dark`
`default`, `hero-start`, `hero-offer`, `hero-filled`, `hero-done`, `no-match`, `request-pending`, `slot-taken`, `running-late`, `conflict`, `onboarding`, `empty`

## 10. Screenshot automation
`npm run shots` (Playwright; mobile 390 × 844 @3x, desktop 1440 × 900 @2x):
patient: 01-search, 02-filters, 03-results, 04-results-map, 05-doctor-profile, 06-booking-slot, 07-booking-consent, 08-confirmed, 09-appointments, 10-waitlist-join, 11-waitlist-offer, 12-running-late, 13-review, 14-family, 15-privacy, 16-results-de;
doctor: 17-my-day, 18-patient-brief, 19-running-behind, 20-schedule-conflict;
staff: 21-today, 22-calendar-day, 23-calendar-filled-from-waitlist, 24-phone-booking, 25-conflict, 26-doctors-services, 27-team-roles, 28-insights, 29-reviews, 30-onboarding-checklist.

## 11. Acceptance criteria
- The hero scenario (5.5) works by clicking across all three roles from a fresh load, with state shared.
- Tokens only; AA contrast in light and dark.
- Languages shown as codes/names, never flags.
- German renders without overflow on every screen.
- All screens in section 5 reachable.
- Storybook builds; `npm run shots` produces all 30 files.
- Deployable as a static site.

## 12. Working order
1. Tokens, i18n, theme, base components with stories.
2. Signature components: LanguageChips, EarliestSlot, DoctorResultCard, StatusBadge, NeedsAttention, CalendarGrid.
3. Patient search, results, profile, booking.
4. Appointments, waitlist, reminders, review.
5. Staff Today and Calendar.
6. Doctor My day.
7. Hero scenario wiring across roles.
8. Onboarding, remaining screens, states.
9. Screenshots, self-review against this brief.
