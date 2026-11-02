# Testing & Quality Assurance Strategy

## 1. Testing Pyramid

```
                / \
               /   \      E2E User Journeys (Playwright / Browser Subagent)
              /-----\     - Launch -> Auth -> Activity -> Claim -> Shop -> Equips
             /       \    Integration Tests (Vitest / Supertest)
            /---------\   - API Endpoints, DB Transactions, OAuth2 Mocks
           /           \  Unit Tests (Vitest)
          /-------------\ - Level Formulas, XP Rate Clamps, Streaks, Anti-Cheat
```

---

## 2. Unit Testing Scope

### XP & Leveling Engine
- Test: `calculateLevel(xp)` correctly translates XP to Level across 100 levels.
- Test: `xpForNextLevel(currentLevel)` accurately produces expected logarithmic curve.
- Test: Rate limiting clamps excessive XP gain rates to server maximum.

### Daily Streak Logic
- Test: Claim within 20 hours is rejected with `COOLDOWN_ACTIVE`.
- Test: Claim between 20h and 48h increments streak and awards next tier rewards.
- Test: Claim after 48h resets streak back to 1.

### Shop & Transaction Logic
- Test: Insufficient balance rejects purchase without deducting coins.
- Test: Duplicate purchase of unique cosmetic item is rejected.
- Test: Successful purchase atomically grants inventory item and logs transaction.

---

## 3. Responsive QA Test Matrix
The responsive QA suite systematically evaluates the layout at 15 exact viewport resolutions:

| Viewport | Category | Critical Checks |
|---|---|---|
| `320 x 568` | iPhone SE (Compact Mobile) | Bottom nav active, zero overflow, buttons readable |
| `360 x 800` | Common Android | Single column cards, stat pills wrap gracefully |
| `375 x 667` | Standard Mobile | Header icons fit, streak banner fits without clipping |
| `390 x 844` | iPhone 12/13/14 | Touch targets >= 44px, safe area padding intact |
| `412 x 915` | Modern Android flagship | Fluid typography readable, modal fits screen |
| `768 x 1024` | iPad Portrait | Sidebar transitions to 72px rail, 2-col card grid |
| `820 x 1180` | iPad Air Portrait | Smooth drawer slide-over, leaderboard priority cols |
| `1024 x 768` | iPad Landscape | Sidebar expanded (240px), 3-col card grid |
| `1280 x 720` | HD Laptop / Small Desktop | Contextual widgets visible, full leaderboard table |
| `1366 x 768` | Mainstream Laptop | Smooth animations, zero horizontal scrollbar |
| `1440 x 900` | MacBook Pro Standard | Balanced margins, container centered max-w 1440px |
| `1536 x 864` | Windows Standard Laptop | High DPI scaling, crisp typography |
| `1920 x 1080` | Full HD Monitor | Optimal spacing, full data density |
| `2560 x 1440` | 2K QHD Gaming Monitor | Ambient background glow, no stretching of cards |
| `3440 x 1440` | Ultrawide Display | Centered layout with max-width container, no layout break |

---

## 4. Accessibility (a11y) Verification
- **Semantic HTML**: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<button>`.
- **Keyboard Navigation**: Full Tab/Shift+Tab navigation through all interactive elements; visible focus rings (`focus-visible`).
- **Color Contrast**: WCAG AA standard compliant (minimum 4.5:1 for body text, 3:1 for large display text).
- **Reduced Motion**: Respects `prefers-reduced-motion` to disable animations for sensitive users.
- **Screen Reader Labels**: `aria-label` on all icon buttons, badges, and progress bars.
