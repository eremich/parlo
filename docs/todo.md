# Task Plan

Style: impeccable (tokens from `docs/parlo-prototype-brief.md` §4)
Stack: Vite + React + TypeScript, Tailwind 4, Zustand, React Router, Storybook 10, Playwright
Source of truth: `docs/parlo-prototype-brief.md`

## Current Task — Parlo clickable prototype

### Stage 0 · Scaffold
- [x] git, Vite + React + TS, Tailwind 4 with brand tokens (light / dark)
- [x] i18n EN / DE (`src/i18n/en.ts`, `de.ts`), `?lang=`
- [x] Theme toggle, `?theme=`
- [x] Shell: role switcher, phone frame 390×844, browser frame 1440×900
- [x] Shell store synced to URL `?role=&lang=&theme=&scenario=` (domain store comes with mock data in stage 2–3)
- [x] Verify in browser: 1440 and 375, EN/DE, light/dark, all three roles; `npm run build` passes

### Stage 1 · Storybook foundations + base components
- [x] Storybook 10 (react-vite), a11y, docs + GFM tables, pseudo-states, theme toolbar; docs pages stay light
- [x] Introduction, Guidelines
- [x] Foundations read from token files: Colors (live AA contrast, all pass), Typography, Shape & motion
- [x] AA fix: added `-text` (accent, status) and `-soft` tokens — light accent/warn failed 4.5:1 as text
- [x] Components: Button (+ MDX), Chip, TextField, Switch, Checkbox, List, Avatar, Card, Banner, Sheet, Segmented, Skeleton, Navigation (TabBar, NavBar, LargeTitle)
- [x] Verify: Storybook renders light/dark, no a11y violations on Sheet, `build-storybook` + `build` pass
### Stage 2 · Signature components
- [x] Data types, fictional practices + 9 doctors (`src/data/`), date/time/price formatting (`src/lib/format.ts`)
- [x] LanguageChips + LanguageList (+ MDX), EarliestSlot, SlotChip, InsuranceBadge, Rating
- [x] DoctorResultCard (+ MDX), StatusBadge (12 statuses), NeedsAttention, CalendarGrid (+ MDX)
- [x] Verify: EN/DE card fits, a11y fix (rating label), calendar ghost + pending fixes, both builds pass
### Stage 3 · Patient: search, filters, results / map, profile, booking, confirmation
- [x] PRODUCT.md (impeccable context) from the brief
- [x] Data: patients, reviews, services, dentist added; frozen clock Wed 11 Mar 2026 09:30; deterministic 28-day availability; seed appointments (Anna Thu 09:00, Omar Mon 16 Mar)
- [x] One shared store (`src/store/app.ts`): filters, sign-in/up, consent, booking (auto-confirm vs request, slot taken)
- [x] Search (quick picks, saved filters, next appointment, suggestions by specialty/symptom/name)
- [x] Results list + drawn Berlin map with practice pins, active filter chips, no-match with relaxed suggestion
- [x] Filters sheet with live count
- [x] Doctor profile: earliest, 14-day picker, languages with levels, insurance/cost, services, practice + map, reviews with reason chips
- [x] Booking: type (+ for whom) → time (+ referral) → account (if signed out) → consent (if new practice) → details → confirm; slot-taken recovery
- [x] Confirmation: booked / request sent, add to calendar, directions, insurance-card reminder (first visit of the quarter)
- [x] Scenarios: `no-match`, `slot-taken`, `empty`
- [x] Verified EN/DE, light/dark: full GP booking, specialist request + consent, sign-up, both scenarios; fixed strip scroll shifting the screen, German date wrapping, untranslated statuses, dead buttons; build passes
### Stage 4 · Patient: appointments, waitlist, reminder, check-in, review, family, privacy
- [x] Movable prototype clock (Wed 08:30 → Thu 08:45 → Thu 09:40) in the toolbar; phone status bar follows it; background availability stays anchored
- [x] "Signed in as" in the toolbar (Anna / Omar / Lukas)
- [x] Store: cancel → freed slot offered to the waitlist (30 min), reschedule, join/leave waitlist, accept offer (old slot released, "Filled from waitlist"), decline/expire, reminder confirm, running late, check-in, review, family, consent withdraw
- [x] Appointments: offer card with live countdown + push notification, day-before reminder, declined request with alternatives, review prompt, waitlist badges
- [x] Appointment detail: check-in window, running late sheet, change time, waitlist sheet (how early, which days), cancel sheet (free until 24 h before / late warning)
- [x] Review (doctor and practice separately, reason chips), Family (add child/parent, co-insured, book for), Profile (languages, notifications, privacy, download, delete), Privacy (practices with access, withdraw)
- [x] Checklist fixes from ui-ux-pro-max: sheet scrim 40 %, 44 px targets on patient buttons, sentence-case list headers
- [x] Storybook: Waitlist offer + push, SlotPicker, BerlinMap, StarRating, TextArea
- [x] Verified: Anna cancels → Omar gets push + offer → takes it → Thu 08:45 running late + check-in → Anna reviews; German scan; builds pass
### Stage 5 · Staff: Today, calendar
- [x] Named background appointments for Hausarztpraxis am Görlitzer Park (same slots patients see as taken), statuses follow the clock
- [x] Blocked time in the schedule; seed conflict: Dr. Busch training Mon 16 Mar 14:00–16:00
- [x] Today: Needs attention (conflicts → late → waitlist with live countdown → requests), four day facts, day calendar
- [x] Calendar: day / week (per doctor), drag to move with snap + busy check, click a free slot → phone booking, cancelled ghost with "Offered to waitlist"
- [x] Panels: appointment (arrived, no-show after 15 min, move, cancel, confirm or propose up to 3 times), phone booking (find or 3-field new patient + slot), conflict (suggested slots, move and notify)
- [x] Keyboard: T, ← →, D, W, N; toast confirmations; signed-in staff in sidebar
- [x] Verified: Anna cancels → "Offering Thu 09:00 to the waitlist" + ghost label → Omar accepts → "Filled from waitlist" in calendar and Needs attention; confirm request, phone booking, conflict, drag, shortcuts; DE + dark; builds pass
### Stage 6 · Doctor: My day, brief, running behind, schedule
- [x] My day (Today / Tomorrow): next patient card, timeline with Now line, merged free ranges, blocked time, checked-in, filled from waitlist, running late
- [x] Patient brief: age, first visit / returning, reason, shared language ("You both speak English" or interpreter hint), insurance, history; Start → Done → follow-up suggestions (two weeks out); no-show after 15 min
- [x] Running behind (10/20/30 min): banner for the doctor, banner on the patient's appointment, item in reception's Needs attention
- [x] Schedule: working hours, block time sheet (day, from/to or whole day, reason, live "N patients affected"), block cards with conflict state → reception conflict
- [x] Patients (today) and Profile tabs
- [x] Translated "Filled from waitlist" everywhere (was an English default)
- [x] Verified: hero Anna → Omar → Thu 08:45 My day shows Omar at 09:00 with brief → start → done → follow-up → Omar's review prompt; delay and block reach reception; DE scan; builds pass
### Stage 7 · Hero scenario across roles
- [x] URL scenarios `hero-start`, `hero-offer`, `hero-filled`, `hero-done` replay the story and open each role on the right screen
- [x] Clock preset Thu 09:00 so Omar is the doctor's next patient
- [x] Practice Insights: filled from waitlist this week (6 + live = 7), no-show rate, time to confirm, occupancy by doctor, new patients by language (single-hue bars, direct labels), reviews with top reasons and the new review marked "New"
- [x] Demo guide in the toolbar: 9 steps, each sets role, person and time
- [x] Verified all four URLs across roles; Omar's review appears in Insights; build passes
### Stage 8 · Onboarding, remaining screens, states
- [x] Reception: Patients (search, languages, insurance, next/last visit, book), Doctors & services (languages with levels, visit types and durations, insurance rules, accepts new patients, service prices), Team (members, role permission matrix), Reviews (reply publicly, edit), Settings (reception languages, booking rules, link to onboarding)
- [x] Onboarding: reception checklist (details, verification pending → approve, services, invite doctor, doctor profile, working hours, go live) + doctor app invitation (accept, photo, languages with level, bio, hours); checklist updates live
- [x] States: offline banner (Search, Results, Appointments), result skeletons on load, verification pending
- [x] Scenarios: `onboarding`, `offline`, `request-pending`, `conflict`, `running-late`
- [x] Removed an inert "Invite member" button; singular rating labels on reviews
- [x] Verified all new screens and scenarios; German scan on reception screens; builds pass
### Stage 9 · Screenshots, portfolio case, deploy
Framing: in 2019 Ihor led design of a doctor-booking marketplace; Parlo re-imagines it for Germany, built with AI in 2026. No invented research results or statistics: research = desk research + what the 2019 work kept; success metrics = launch targets, labelled as such.
- [x] 9.1 Shot mode in the prototype: bare screen, deep link (`?shot=1&path=/doctor/rahimi`)
- [x] 9.2 Playwright + `npm run shots`: patient, doctor, staff, dark set (webp, 2x)
- [x] 9.3 Flows as Miro-style diagrams: hero scenario across 3 roles, patient booking, staff day, doctor day
- [x] 9.4 Storybook images: tokens, components, patterns
- [ ] 9.5 Deploy demo + /storybook (Vercel) — only with Ihor's go-ahead
- [x] 9.6 Portfolio case EN + DE in D:\Portfolio (content, body, registry, assets)
- [ ] 9.7 Verify the case page (desktop, mobile, dark, DE); commit only on request

## Completed

_Nothing yet._
