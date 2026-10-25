---
name: Grandmaster Logic
colors:
  surface: '#151311'
  surface-dim: '#151311'
  surface-bright: '#3b3936'
  surface-container-lowest: '#0f0e0c'
  surface-container-low: '#1d1b19'
  surface-container: '#211f1d'
  surface-container-high: '#2c2a27'
  surface-container-highest: '#373431'
  on-surface: '#e7e2dd'
  on-surface-variant: '#d0c5b4'
  inverse-surface: '#e7e2dd'
  inverse-on-surface: '#32302d'
  outline: '#999080'
  outline-variant: '#4d4639'
  surface-tint: '#e4c37a'
  primary: '#eecc83'
  on-primary: '#3f2e00'
  primary-container: '#d1b16a'
  on-primary-container: '#594304'
  inverse-primary: '#745b1d'
  secondary: '#9fd668'
  on-secondary: '#1c3700'
  secondary-container: '#3b6a00'
  on-secondary-container: '#b1e978'
  tertiary: '#cad0de'
  on-tertiary: '#2a313b'
  tertiary-container: '#aeb5c2'
  on-tertiary-container: '#404752'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdf9b'
  primary-fixed-dim: '#e4c37a'
  on-primary-fixed: '#251a00'
  on-primary-fixed-variant: '#5a4304'
  secondary-fixed: '#baf381'
  secondary-fixed-dim: '#9fd668'
  on-secondary-fixed: '#0e2000'
  on-secondary-fixed-variant: '#2b5000'
  tertiary-fixed: '#dce3f1'
  tertiary-fixed-dim: '#c0c7d4'
  on-tertiary-fixed: '#151c26'
  on-tertiary-fixed-variant: '#404752'
  background: '#151311'
  on-background: '#e7e2dd'
  surface-variant: '#373431'
  board-dark: '#706659'
  board-light: '#EDEED1'
  surface-navy: '#11151C'
  text-muted: '#98A2B3'
  move-highlight: rgba(209, 177, 106, 0.4)
typography:
  display-clock:
    fontFamily: JetBrains Mono
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  notation-log:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '800'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 1440px
  gutter: 1rem
  panel-padding: 1.5rem
  board-size-desktop: min(80vh, 800px)
  sidebar-width: 360px
---

## Brand & Style

The design system is engineered for high-performance competitive play and deep analytical sessions. It targets serious enthusiasts and professional players who require a zero-distraction environment that remains visually prestigious. 

The aesthetic is **Corporate / Modern** with a **Minimalist** focus on data density. It draws from the modularity of professional developer tools—using clean lines, structured panels, and a high-contrast information hierarchy to ensure move logs, engine evaluations, and clocks are legible at a glance. The atmosphere is intellectual and sharp, evoking the feeling of a high-stakes tournament hall translated into a digital workspace.

## Colors

The palette is anchored in a sophisticated Dark Mode to reduce eye strain during long matches. 

- **Primary (Grandmaster Gold):** Used sparingly for high-prestige actions, active states, and winner celebrations.
- **Secondary (Success Green):** Reserved for positive move evaluations, "Online" status, and primary "Play" actions.
- **Tertiary (Deep Navy):** Provides the structural background for the board container and sidebar, differentiating the game area from the global navigation.
- **Neutral (Slate/Charcoal):** Derived from the core brand profile to handle the majority of the UI surface area, ensuring a professional, grounded feel.

The board itself uses a traditional but slightly desaturated wood/stone pairing to ensure the chromatic UI elements (gold and green) remain the focal points for interaction.

## Typography

Typography is treated as a functional tool. 

- **Headlines:** Uses **Hanken Grotesk** for a sharp, modern, and authoritative presence in menus and headings.
- **Body:** **Inter** is utilized for its exceptional legibility in dense lists and settings.
- **Data & Clocks:** **JetBrains Mono** is employed for all move notations (Algebraic notation) and game clocks. Its monospaced nature prevents "jumping" text during countdowns and ensures move columns in the notation log remain perfectly aligned for quick scanning.

All labels for secondary metadata (e.g., "ELO", "ACCURACY") should be set in uppercase with slight letter spacing to create a technical, dashboard-inspired look.

## Layout & Spacing

This design system uses a **Fixed Grid** logic within a flexible container. The primary layout consists of a three-column modular structure on desktop:
1.  **Global Navigation:** Slim collapsed rail on the far left.
2.  **Primary Stage:** The Chessboard, centered or slightly left-weighted, utilizing the maximum vertical height available.
3.  **Data Sidebar:** A fixed-width column on the right for Move Logs, Engine Evaluation, Chat, and Player Profiles.

**Breakpoints:**
- **Desktop (1280px+):** Full 3-column layout. Sidebar is always visible.
- **Tablet (768px - 1279px):** Move logs and evaluation move to a collapsible drawer or beneath the board. The board takes priority.
- **Mobile (<767px):** Single column stack. The board is top-aligned, with clocks and player info immediately above and below. Move logs are hidden behind a tab bar.

A consistent 4px/8px baseline grid ensures that technical data in the sidebar remains structured and dense without feeling cluttered.

## Elevation & Depth

To maintain a "High-Performance" feel, the design avoids heavy shadows in favor of **Tonal Layers**. 

- **Level 0 (Background):** Deep charcoal (`#302E2B`).
- **Level 1 (Panels):** Slightly lighter navy-slate surfaces with a 1px border (`#1B222C`) to define the boundaries of the board and logs.
- **Level 2 (Popovers/Tooltips):** Use soft ambient shadows (10% opacity black) and sharp borders to appear lifted above the game state.

Interactive elements like pieces on the board do not use shadows while being dragged; instead, they use a subtle scale-up effect and a high-contrast highlight on the destination square to maintain a flat, performant aesthetic.

## Shapes

The shape language is **Soft (0.25rem)**. While modern, the design avoids overly rounded "pill" shapes for primary UI to maintain a serious, professional tone. 

- **Buttons & Inputs:** Use the base 4px (0.25rem) radius.
- **Cards & Sidebar Panels:** Use the 8px (0.5rem) radius to create a distinct frame for the content.
- **The Board:** Should remain sharp (0px) to honor the geometric nature of the game, though the container housing the board may have a slight radius.

## Components

### Buttons
- **Primary:** Grandmaster Gold background with dark text. Sharp, high-contrast.
- **Secondary:** Transparent with a 1px Slate border.
- **Ghost:** No border or background until hover; used for engine controls (rewind, fast-forward).

### Move Log (Notation)
- Items should be alternate-row striped for readability.
- The "Current Move" should be highlighted with a Gold left-border accent and a subtle tint across the row.

### Clocks
- Housed in high-contrast blocks. When a player has less than 30 seconds, the background should transition to a subtle "Alert Red" or "Warning Orange" pulse.

### Inputs & Fields
- Low-profile, dark-filled backgrounds with bottom-only borders or very subtle 1px frames. Focus states should use a Gold glow or border.

### Chips & Badges
- Used for player titles (GM, IM, WFM). These are small, rectangular with 2px rounding, using high-contrast backgrounds (e.g., Red for GM) and white JetBrains Mono text.

### Modular Panels
- Containers for "Evaluation", "Opening Explorer", and "Chat" should be collapsible with clear, icon-based headers. Icons should be thin-stroke (1.5px) to match the sharp typography.