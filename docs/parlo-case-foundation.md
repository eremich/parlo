# Parlo — Case Study Foundation

Working material for the portfolio case. Goals, hypotheses and metrics are plans, not invented results. Fill the placeholders in [brackets].

---

## One-liner
The right doctor, in your language, at the earliest real slot: a three-sided booking platform for patients, doctors and practices in Germany.

## Origin (say this in the case, in one line)
Re-imagined from a doctor booking marketplace I designed in [2019] for another market: patients, doctors and clinics on one platform. For this case I took the core ideas and rebuilt everything for Germany in 2026: brand, flows, interface and design system.

## Overview
- **Product:** Doctor search and booking for patients, "My day" for doctors, a dashboard for practice staff.
- **My role:** [Original: e.g. product designer for all three sides. Redesign: concept, flows, design system, prototype.]
- **Timeline:** Original [year]; redesign and working prototype 2026.
- **Deliverables:** User flows for three roles, service blueprint of the hero scenario, design system in Storybook, clickable prototype.

## What I kept from the original
- Time slots right in the search results, so patients book without opening a profile.
- Two separate ratings after a visit, for the doctor and for the practice, with reason chips instead of stars only.
- A calendar with all doctors side by side and status per appointment.
- Staff roles and permissions.

## What changed and why
- **New market, new problem.** Germany has two insurance systems, referrals, strict health-data rules and a large international population.
- **Mobile first for patients.** The original was desktop first.
- **A practice dashboard that tells you what to do,** not a grid of links.
- **Language as a first-class filter** and a visible attribute of every doctor.

## Context
Booking a doctor online is common in Germany, and the leading platforms already filter by insurance and offer waitlists for earlier slots. What they don't solve well: finding a doctor who speaks your language. For hundreds of thousands of people in Berlin alone who don't speak German fluently, that decides whether a visit is useful at all.

[If you use a number for the international population, take it from an official source such as the Berlin statistics office and cite it.]

## The problem
**For patients**
- Hard to find a doctor who speaks their language and accepts their insurance.
- The earliest available slot is buried behind profiles and phone calls.
- A cancelled slot somewhere is invisible to someone waiting weeks.

**For practices**
- Phones ring all day for bookings, moves and cancellations.
- Cancelled appointments leave empty chairs.
- No-shows and late patients break the day.

**For doctors**
- Little context about the next patient until they walk in.
- Schedule changes ripple through the day without a clear way to handle them.

## Users
Working personas based on the domain. Not interview results.

- **Anna, 32, moved to Berlin two years ago.** Public insurance. Speaks English and Russian, basic German. Needs a GP who can explain things in English.
- **Omar, 41, engineer.** Public insurance. English and Arabic. Waiting three weeks for a specialist and would take any earlier slot.
- **Sabine, practice manager (MFA).** Runs reception for three doctors. Lives in the calendar and on the phone.
- **Dr. Emre Aydın, GP.** Speaks German, English and Turkish. Wants to know who's next and why before the door opens.

## Competitive landscape
- Leading booking platforms offer insurance filters, reminders and waitlists. These are table stakes, and Parlo does them well.
- The national appointment service (116117) helps public patients get a slot but without free choice of doctor.
- **Gap:** language as a primary, reliable search dimension with verified levels ("native", "fluent"), shown on every result.

[Before publishing, re-check competitor features you mention so the comparison is fair and current.]

## Goals
**Patients**
1. Find a doctor who speaks my language and takes my insurance in under a minute.
2. Get the earliest real slot, and an earlier one if it frees up.

**Practices**
1. Fewer phone calls for booking and moving appointments.
2. Fewer empty slots after cancellations.
3. Fewer no-shows.

**Doctors**
1. Know who's next and why, at a glance.

## How we'd measure success
Metrics to track after launch (targets to be set with pilot practices):
- Time from search to booked appointment.
- Share of bookings made with a language filter; review mentions of "spoke my language".
- Cancelled slots refilled from the waitlist, and time to refill.
- No-show rate before and after reminders and check-in.
- Share of bookings that did not need a phone call.

## Design principles
1. **Earliest real slot first.** Time beats ratings in a results list.
2. **Language is visible everywhere,** as words and codes, never flags.
3. **Tell staff what to do now.** The dashboard starts with "Needs attention".
4. **One schedule, three views.** Every change is instantly true for the patient, the doctor and reception.
5. **Consent is explicit and reversible.** Patients see which practices have their data.

## Key decisions
1. **Result cards lead with the earliest slot** and three bookable times inline.
2. **Language chips with levels** on every doctor, and saved as a default filter.
3. **Booking without a separate sign-up step:** the account is created inside the booking.
4. **Waitlist with a 30-minute offer window,** matched by doctor, insurance and language.
5. **Cancelled appointments don't block the calendar;** the freed slot goes to the waitlist automatically.
6. **"Needs attention" strip** for staff: requests, conflicts, late patients, waitlist fills.
7. **Patient brief for doctors** with language, reason and first visit flag.
8. **Reviews with reason chips** that feed practice insights.

## Hero scenario (the story of the case)
Anna cancels Thursday 09:00 → Omar on the waitlist gets the offer and accepts in one tap → reception sees "Filled from waitlist" without a phone call → Dr. Aydın sees Omar in his day with a brief → visit → Omar's review mentions "Spoke my language" → practice insights count one more slot saved.

## What is not done
- No research or testing with real patients or practices yet. Next step: 5 interviews with internationals in Berlin, 2 with practice managers, a usability test of search and booking.
- Insurance billing, medical records and video consultations are out of scope.
- Name and brand are a working concept.
