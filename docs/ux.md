# UX Architecture & Interaction Guidelines

## 1. Core UX Philosophy
> **"Every user must know at any instant: where they are, what is happening, what value they earned, and what action is next."**

No dead ends, no cryptic spinners, no jarring layout shifts, and no hover-dependent critical actions.

---

## 2. Information Architecture & Navigation

### Desktop (> 1024px)
- **Persistent Left Navigation Rail**: Collapsible from 260px wide to 72px compact icon-rail.
- **Top Bar**: Persistent breadcrumbs, server context selector, live connection status, wallet pill (Coins & Streak), notification popover, profile trigger.
- **Content Area**: Fluid container capped at 1440px with balanced gutters.
- **Contextual Right Drawer**: Appears on demand for filters, activity participants, or item previews.

### Tablet (768px - 1023px)
- Compact icon sidebar (72px) with tooltips.
- Secondary panels collapse into overlay bottom sheets or slide-over drawers.

### Mobile (< 768px)
- **Top Bar**: Streamlined header with logo, server icon, coin pill, and hamburger menu toggle.
- **Primary Navigation**: Fixed ergonomic Bottom Navigation bar with key destinations (Home, Activity, Rewards, Leaderboard, More).
- **Secondary Navigation**: "More" sheet slides up revealing Profile, Achievements, Shop, Events, and Settings.
- **Touch Targets**: Minimum 44x44px for every interactive element.
- **Thumb Zone Optimization**: Primary actions placed in lower 50% of the screen.

---

## 3. The 6 Mandatory UX States for Every View & Component

Each screen and widget must explicitly handle all six states:

1. **Default State**: Clean, balanced presentation of live data with clear visual hierarchy.
2. **Loading State**: Content-shaped shimmer skeletons matching exact dimensions to prevent Layout Shift (CLS = 0).
3. **Empty State**: Friendly illustration/icon, descriptive title, explanation why it's empty, and a prominent call-to-action button (e.g., "No achievements yet — Complete your first Lounge Session!").
4. **Error State**: Non-technical user-friendly explanation, failure reason (network, permission, rate limit), and a single-click "Retry" action.
5. **Success / Celebration State**: Micro-celebration (confetti/glow trigger, XP tick animation, badge toast) that confirms completion without blocking interaction.
6. **Disabled / Cooldown State**: Clear disabled styling (reduced opacity, cursor not-allowed), accompanied by a tooltip or timer countdown indicating when it unlocks.

---

## 4. Onboarding & First-Time User Experience (FTUE)
- **Discord First Handshake**: Instant zero-click profile import (Discord avatar, username, discriminator/handle, server roles).
- **Welcome Quest**: An intuitive 3-step checklist on the Home page:
  1. *Join your first Activity session* (+100 XP)
  2. *Claim your Day 1 reward* (+50 Coins)
  3. *Equip a profile frame in the Shop* (+50 XP)
- Completion unlocks the "Newcomer" badge immediately.

---

## 5. Microcopy & Tone of Voice
- **Tone**: Energizing, friendly, gaming-focused, concise, and respectful.
- **Action-Oriented Buttons**:
  - ❌ Avoid: "Submit", "Click Here", "OK", "Process"
  - ✅ Use: "Start Lounge Session", "Claim 250 XP", "Equip Frame", "Unlock Tier 2"
- **Clear Dialog Confirmations**:
  - ❌ Avoid: "Are you sure?"
  - ✅ Use: "Purchase Neon Frame for 1,200 Coins?" (with balance before/after clearly shown)

---

## 6. Feedback & Sound / Haptics Design
- Visual feedback on every interaction within 100ms.
- Tactile CSS `:active` scale reduction (`transform: scale(0.97)`) on buttons.
- Optional subtle UI sound effects (toggleable in Settings) for XP ticks, level-ups, and coin purchases.
