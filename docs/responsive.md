# Responsive Architecture & Viewport Strategy

## 1. Responsive Philosophy: Fluid First
The application is architected from the ground up to render flawlessly from **320px mobile screens** up to **3440px ultrawide displays**, as well as inside the constrained iframe of Discord on iOS, Android, and Desktop.

### Golden Rules
1. **Zero Horizontal Scroll**: The root container never triggers horizontal overflow under any viewport width.
2. **Dynamic Columns via CSS Grid**: No hardcoded widths (`width: 380px`). Use `grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr))`.
3. **Fluid Typography & Spacing**: Utilizing CSS `clamp()` to scale titles and padding harmoniously between viewports.
4. **Modern Viewport Units**: Utilizing `100dvh` (dynamic viewport height) and `env(safe-area-inset-bottom)` to account for mobile address bars and device notches.

---

## 2. Breakpoint Thresholds

| Identifier | Min Width | Target Devices | Layout Behavior |
|---|---|---|---|
| `xs` | `320px` | Small phones (iPhone SE, older Androids) | Single column, compact cards, bottom nav, full-width buttons |
| `sm` | `480px` | Standard & large smartphones | Single column with 16px margins, 2-column small stat grid |
| `md` | `768px` | Tablets portrait, Discord pop-out window | Collapsed icon-sidebar (72px), 2-column card grid, compact tables |
| `lg` | `1024px` | Tablets landscape, Small laptops | Expanded sidebar (240px), 3-column card grid, full leaderboard table |
| `xl` | `1440px` | Standard Desktop, Gaming monitors | Sidebar + 4-column cards + contextual right drawer / stats |
| `2xl` | `1920px+` | High-res & Ultrawide (up to 3440px) | Content container max-width: 1440px centered with atmospheric ambient glow |

---

## 3. Component Responsive Transformations

### Primary Navigation
- **Desktop (>= 1024px)**: Fixed vertical sidebar on the left with logo, navigation links, and guild status pill.
- **Tablet (768px - 1023px)**: Compact vertical rail with icon-only tooltips.
- **Mobile (< 768px)**: Bottom navigation bar for core 4 views + hamburger drawer trigger for remaining pages.

### Leaderboard Table
- **Desktop**: 6-column full data table: Rank, Member, Level, Activity Time, Achievements, Total XP.
- **Tablet**: 4-column priority table: Rank, Member, Level, Total XP.
- **Mobile**: Compact card list: Rank badge, avatar with level indicator, username, and highlighted XP badge. Zero horizontal table scrolling required.

### Shop & Rewards Grid
- `auto-fill` with `minmax(260px, 1fr)` automatically transitions from 4 columns on desktop, to 3 on laptop, 2 on tablet, and 1 clean column on mobile.

---

## 4. Extreme Cases & Safe Areas
- **Long Usernames**: Truncated with ellipsis (`text-overflow: ellipsis; overflow: hidden; white-space: nowrap`) paired with browser tooltips.
- **Large Numbers**: Automatic metric formatting (e.g., `124500` -> `124.5K XP` or formatted with commas `124,500`).
- **Safe Areas**: `padding-bottom: max(16px, env(safe-area-inset-bottom))` on mobile bottom bars.
