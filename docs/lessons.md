# Lessons Learned

<!-- Claude updates this file after every correction from the user. -->
<!-- This is the project's "memory" — patterns to remember and mistakes to avoid. -->
<!-- Claude reads this file at the start of each session. -->

## Format

Each entry follows this pattern:

```
### [Date] Short description
- **What happened**: What went wrong
- **Why**: Root cause
- **Rule**: What to do differently next time
```

## Lessons

_No lessons yet. When you correct Claude, it will record the pattern here to avoid repeating the mistake._

### 2026-09-30 Presentation shell must match the portfolio series
- **What happened**: Parlo's controls sat in a loud top bar that overflowed and competed with the phone; the phone could be cut off in short windows.
- **Why**: I designed the demo shell on its own instead of checking how the other portfolio prototypes present themselves (Chilicon Power uses a quiet left column).
- **Rule**: Before building a prototype shell, look at an existing portfolio prototype and reuse its layout. Keep controls small and quiet, the device is the hero. Verify every frame fits at a wide-and-short window, at 1440×900 and at 375 px.

## Icon sizes must come from one place
- **What happened:** leading icons in rows were 18px in lists and 20px on search/booking cards; the user had to ask for consistency.
- **Rule:** one role = one size, stored as a shared constant (`ROW_ICON_SIZE` in `List.tsx`, 22px in a 28px column, as in iOS Settings). Before adding an icon to a row, reuse the constant; never type a new number.

## Every component change lands in Storybook in the same step
- **What happened:** new variants (Chip onHero, Button plainDestructive, LanguageList without levels, AppointmentCard footer) were built in screens first; the user had to remind me to sync Storybook.
- **Rule:** when a component gains or loses a variant, prop or look, update its `*.stories.tsx` (and MDX if it exists) in the same change, then open the story to check it renders.
