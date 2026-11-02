# UI Design System & Visual Specification

## 1. Visual Identity & Design Direction
The interface embraces a **dark-first, futuristic cyberpunk lounge aesthetic**. It feels native inside Discord's client while exceeding standard Discord UI in elegance, depth, micro-interactions, and visual craftsmanship.

### Key Visual Pillars
- **Depth through Surface Elevation**: Not flat monotone black. We use 4 tiers of tinted neutral slate surfaces with subtle inner borders and radial atmospheric glows.
- **Vibrant Accent Neon**: Cyber Indigo (`#5865F2`), Electric Violet (`#8B5CF6`), Emerald Gold (`#10B981` & `#F59E0B`), and Coral Flame (`#EF4444`).
- **Glassmorphism & Frosted Layers**: Backdrop-filter blur (`16px`) on elevated modals, sticky headers, and toolbars with 1px translucent border highlight (`rgba(255, 255, 255, 0.08)`).
- **Smooth Micro-Transitions**: 150ms-250ms cubic-bezier easing curves on all hover, active, and modal transitions.

---

## 2. Design Tokens & Color Palette

### Base Surfaces
```css
--bg-root: #0B0E14;             /* Deepest canvas */
--surface-1: #111622;           /* Primary card / sidebar base */
--surface-2: #182030;           /* Elevated panels & inputs */
--surface-3: #222C42;           /* Floating dropdowns, hover states */
--surface-hover: #2B3752;       /* Active hover highlight */
--surface-glass: rgba(17, 22, 34, 0.75); /* Frosted glass */
```

### Borders & Dividers
```css
--border-subtle: rgba(255, 255, 255, 0.06);
--border-default: rgba(255, 255, 255, 0.12);
--border-focus: rgba(99, 102, 241, 0.5);
--border-active: #6366F1;
```

### Foreground & Typography
```css
--text-primary: #F8FAFC;         /* 100% High emphasis */
--text-secondary: #94A3B8;       /* Medium emphasis, labels */
--text-muted: #64748B;           /* Disabled, timestamps, hints */
--text-inverse: #0B0E14;         /* Text on high-contrast accents */
```

### Brand & Functional Accents
```css
--accent-discord: #5865F2;       /* Discord brand indigo */
--accent-indigo: #6366F1;        /* Primary action */
--accent-purple: #8B5CF6;        /* Secondary / Level-up accent */
--accent-streak: #F97316;        /* Fire streak glow */
--accent-gold: #FBBF24;          /* Currency / Gold medal */
--accent-success: #10B981;       /* Completed, claim ready */
--accent-warning: #F59E0B;       /* Caution, pending */
--accent-danger: #EF4444;        /* Error, destructive */
```

---

## 3. Typography Scale

Using modern geometric sans-serif (`Inter`, system fallback `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`) with tabular numerals for timers and XP counters.

| Token | Size | Line Height | Weight | Letter Spacing | Usage |
|---|---|---|---|---|---|
| `font-display` | `clamp(2rem, 4vw, 2.75rem)` | 1.15 | 800 | -0.03em | Hero headlines, Level up |
| `font-h1` | `clamp(1.5rem, 3vw, 1.875rem)` | 1.25 | 700 | -0.02em | Page titles |
| `font-h2` | `1.375rem` (22px) | 1.3 | 600 | -0.01em | Section headers |
| `font-h3` | `1.125rem` (18px) | 1.4 | 600 | 0 | Card titles |
| `font-body` | `0.9375rem` (15px) | 1.5 | 400/500 | 0 | Primary text content |
| `font-sm` | `0.8125rem` (13px) | 1.4 | 500 | +0.01em | Badges, secondary meta |
| `font-xs` | `0.75rem` (12px) | 1.4 | 600 | +0.02em | Tooltips, captions, tags |
| `font-mono` | `0.875rem` (14px) | 1.4 | 600 | 0 | XP counters, timers, codes |

---

## 4. Spacing & Radius System

### Spacing Scale (4px base)
- `space-1`: 4px
- `space-2`: 8px
- `space-3`: 12px
- `space-4`: 16px
- `space-5`: 20px
- `space-6`: 24px
- `space-8`: 32px
- `space-10`: 40px
- `space-12`: 48px
- `space-16`: 64px
- `space-20`: 80px

### Border Radius Scale
- `radius-sm`: 6px (Badges, tags, small inputs)
- `radius-md`: 10px (Buttons, standard inputs, items)
- `radius-lg`: 14px (Cards, section containers)
- `radius-xl`: 20px (Modals, hero banners)
- `radius-full`: 9999px (Pills, user avatars)

---

## 5. Motion System & Micro-Animations
- **Hover Lift**: `transform: translateY(-2px)` with smooth box-shadow amplification.
- **XP Bar Fill**: Smooth linear fill with pulsing gradient highlight at the leading edge.
- **Confetti & Particle Burst**: Lightweight CSS keyframe bursts upon claim / level up.
- **Accessibility**: `@media (prefers-reduced-motion: reduce)` disables scale transforms and parallax animations, retaining instant state changes.
