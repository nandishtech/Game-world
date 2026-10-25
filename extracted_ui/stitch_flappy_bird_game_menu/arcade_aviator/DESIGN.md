---
name: Arcade Aviator
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e4e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#4c4732'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0f0'
  outline: '#7e775f'
  outline-variant: '#cfc6ab'
  surface-tint: '#6f5d00'
  primary: '#6f5d00'
  on-primary: '#ffffff'
  primary-container: '#f7d308'
  on-primary-container: '#6c5b00'
  inverse-primary: '#e7c500'
  secondary: '#006971'
  on-secondary: '#ffffff'
  secondary-container: '#9bf0f9'
  on-secondary-container: '#006f78'
  tertiary: '#376b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#9aea55'
  on-tertiary-container: '#366800'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffe262'
  primary-fixed-dim: '#e7c500'
  on-primary-fixed: '#221b00'
  on-primary-fixed-variant: '#534600'
  secondary-fixed: '#9bf0f9'
  secondary-fixed-dim: '#7fd4dd'
  on-secondary-fixed: '#002022'
  on-secondary-fixed-variant: '#004f55'
  tertiary-fixed: '#a7f862'
  tertiary-fixed-dim: '#8cdb48'
  on-tertiary-fixed: '#0d2000'
  on-tertiary-fixed-variant: '#285000'
  background: '#fcf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e1'
typography:
  display-arcade:
    fontFamily: Bricolage Grotesque
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Bricolage Grotesque
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Bricolage Grotesque
    fontSize: 28px
    fontWeight: '800'
    lineHeight: '1.2'
  body-bold:
    fontFamily: Rubik
    fontSize: 18px
    fontWeight: '700'
    lineHeight: '1.5'
  body-md:
    fontFamily: Rubik
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-mono:
    fontFamily: Space Mono
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 20px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is built on a "Neo-Retro Arcade" aesthetic. It captures the frantic energy of 8-bit classics while applying modern usability standards. The target audience is casual mobile gamers seeking instant-gratification and nostalgic charm. 

The visual style is a blend of **Brutalism** (heavy borders, high contrast) and **Tactile** design (chunky, "pressable" buttons). Every element should feel physical, as if it belongs on a plastic cabinet in a 1990s arcade. The emotional response is high-energy, fun, and slightly competitive.

## Colors

The palette is driven by high-saturation "Game Boy Color" logic. 

- **Primary (Flappy Yellow):** Used for the main character, primary action buttons, and high-score highlights.
- **Secondary (Sky Blue):** The foundational background color for gameplay and UI backdrops.
- **Tertiary (Pipe Green):** Used for obstacles, success states, and "Go" buttons.
- **Neutral (Carbon):** A near-black used for heavy 4px borders and primary text to ensure maximum readability against vibrant backgrounds.

Use white (#FFFFFF) sparingly for "shine" effects on buttons and cloud-like UI containers.

## Typography

This design system uses a three-tier type system:

1.  **Bricolage Grotesque (Headlines):** Its quirky, expressive terminals provide the "pixel-adjacent" personality required for big scores and titles without sacrificing legibility. Use with thick black text-shadows for a 3D effect.
2.  **Rubik (Body):** A friendly, rounded sans-serif that complements the bubbly nature of the game. Used for instructions and settings.
3.  **Space Mono (Labels):** Used for "technical" data like FPS counters, version numbers, or bit-style UI labels to evoke a developer/arcade terminal feel.

## Layout & Spacing

The layout follows a **fluid vertical stack** optimized for one-handed mobile play. 

- **Grid:** A simple 4-column mobile grid with 16px gutters.
- **Rhythm:** All spacing must be multiples of 4px to maintain a "pixel-perfect" alignment.
- **Safe Zones:** UI overlays (Score, Pause) must maintain a 24px margin from the screen edge to avoid camera notches and rounded device corners.
- **Centering:** Primary UI menus should be center-aligned to maintain the focus of the player's gaze.

## Elevation & Depth

Depth is achieved through **hard shadows** and **heavy outlines** rather than blurs or gradients.

- **Outlines:** Every interactive element and container must have a 3px or 4px solid black (#2D2D2D) border.
- **Shadows:** Use "Block Shadows" (drop shadows with 0 blur). 
    - *Resting state:* 4px offset (bottom-right).
    - *Active/Pressed state:* 1px offset (simulating the button being physically pushed into the screen).
- **Layering:** Use high-contrast color blocks to separate tiers. A Pipe Green button sits on a White container, which sits on a Sky Blue background.

## Shapes

The shape language is "Chunky and Rounded." 

- **Standard Elements:** Use `rounded-lg` (16px) for main buttons and scorecards to keep the aesthetic friendly and safe.
- **Game Objects:** Environmental elements (pipes, birds) should follow a similar rounded logic to ensure the UI and the game world feel cohesive.
- **Icons:** Enclose icons within circular containers with the same heavy 4px border used on buttons.

## Components

### Buttons
Primary buttons use **Flappy Yellow** with a 4px black border and a 4px hard bottom-shadow. On `hover` or `press`, the shadow disappears and the button shifts 3px down and 3px right to simulate a tactile click. Text inside buttons must be uppercase **Bricolage Grotesque**.

### Scorecards
Floating cards use a white background, 4px black border, and 8px hard black shadow. Use **Pipe Green** for "New Best" labels to create high-visibility excitement.

### Input Fields / Toggles
Settings toggles should look like physical switches. Use **Pipe Green** for the 'On' state and **Accent Danger (Red)** for 'Off'. All inputs must maintain the 3px black border.

### Progress Bars (Stamina/Loading)
Use a "segmented" look. A thick black container with a Pipe Green fill that increases in 10% chunky blocks, mimicking old loading screens.

### Chips / Badges
Small labels (e.g., "Hard Mode", "Daily") should use **Space Mono** and be pill-shaped with a 2px border, placed at a slight 5-degree tilt for added playfulness.