---
name: Royal Neon
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c5c5d3'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#8f909d'
  outline-variant: '#444651'
  surface-tint: '#b6c4ff'
  primary: '#b6c4ff'
  on-primary: '#05297a'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#4059aa'
  secondary: '#adc6ff'
  on-secondary: '#002e6a'
  secondary-container: '#0566d9'
  on-secondary-container: '#e6ecff'
  tertiary: '#ffb691'
  on-tertiary: '#552000'
  tertiary-container: '#6e2c00'
  on-tertiary-container: '#f39461'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#ffdbcb'
  tertiary-fixed-dim: '#ffb691'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#773205'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
  ludo-red: '#EF4444'
  ludo-blue: '#3B82F6'
  ludo-green: '#10B981'
  ludo-yellow: '#F59E0B'
  surface-glass: rgba(255, 255, 255, 0.05)
  neon-glow: rgba(59, 130, 246, 0.5)
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  title-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  stat-value:
    fontFamily: Montserrat
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 40px
---

## Brand & Style

This design system establishes a "Royal Neon" aesthetic tailored for a premium, high-stakes gaming environment. The brand personality is competitive yet sophisticated, blending the prestige of traditional tabletop games with the high-fidelity energy of modern esports. 

The visual style is a hybrid of **Glassmorphism** and **Soft Neomorphism**. It utilizes depth through semi-transparent, frosted surfaces and subtle inner shadows to create a tactile, premium feel. The interface should evoke a sense of "digital luxury"—where every interaction feels weighted and significant. Vibrant neon accents pierce through deep, atmospheric backgrounds to guide the player's focus toward critical game actions and rewards.

## Colors

The palette is anchored by **Deep Royal Blue**, serving as the foundation for the "Royal" narrative. The primary background uses a deep navy-to-black gradient to provide maximum contrast for the neon elements.

The secondary colors are derived from traditional Ludo quadrants but elevated with high-vibrancy "Electric" hues. These colors must be used as functional accents (e.g., player indicators, active tokens, and win states). 

In Dark Mode, surfaces utilize semi-transparent white overlays to create the glass effect. In Light Mode, the system shifts to a clean white base with high-quality soft grays (#F1F5F9), while maintaining the vibrant neon accents for consistency.

## Typography

The typography system prioritizes legibility during fast-paced gameplay while reinforcing the premium brand. **Montserrat** is used for high-level headings and numerical game stats, providing a geometric, bold character that feels modern and "sporty." 

**Inter** handles all body copy, settings, and secondary information. Its neutral, systematic nature balances the expressive headlines. For game stats like "Coins" or "Player XP," use the `stat-value` role to ensure numbers are prominent and easy to scan. All uppercase labels should have increased letter spacing to maintain clarity on smaller mobile screens.

## Layout & Spacing

This design system follows a **8px base rhythm**. All padding, margins, and component heights must be multiples of 8px to ensure a rigorous visual grid.

The layout is primarily **Fluid**, designed for mobile-first engagement. The Ludo board itself should remain centered with a fixed aspect ratio (1:1), while the surrounding UI (player profiles, chat, controls) adapts to the device height. Use "Safe Area" margins of 20px on mobile to prevent UI elements from clashing with hardware notches or rounded device corners.

## Elevation & Depth

Hierarchy is achieved through **Tonal Layers** combined with **Glassmorphism**. 

- **Level 0 (Background):** Deepest navy/black.
- **Level 1 (Cards/Containers):** `surface-glass` with a 1px inner border (white at 10% opacity) and a backdrop blur of 12px.
- **Level 2 (Active Elements/Modals):** Increased backdrop blur (20px) and a subtle `neon-glow` outer shadow to suggest the element is floating closer to the user.
- **Neumorphic Detail:** For interactive buttons, use a "Soft Neumorphism" approach: a subtle inner highlight on the top-left and an inner shadow on the bottom-right to create a pressed or extruded physical feel without the heavy clutter of traditional skeuomorphism.

## Shapes

The shape language is consistently "Rounded-XL." All primary cards, game boards, and buttons utilize a 1rem (16px) base radius. Player avatars and game tokens should be perfectly circular (Pill-shaped) to distinguish them from the structural UI containers. 

This roundedness softens the tech-heavy neon aesthetic, making the app feel more approachable and like a physical "toy" or premium board game.

## Components

### Buttons
- **Primary:** Gradient fill (Primary Blue to Secondary Blue) with a subtle outer glow. Text is white, Montserrat Bold.
- **Secondary (Glass):** Semi-transparent background with a 1.5px solid neon border in the corresponding player color (Red, Green, etc.).
- **Tactile State:** On press, buttons should "sink" using a slight scale reduction (98%) and an inner shadow.

### Cards (Glass)
- Used for player stats and game lobbies. Features a 12px backdrop blur, a light top-edge highlight, and a dark bottom-edge shadow to define the glass thickness.

### Input Fields
- Dark, recessed wells with an inner shadow. The border glows with the `secondary-color` when focused.

### Game Tokens
- High-fidelity 3D-effect circles. They feature a vibrant base color, a central highlight to imply a dome shape, and a "drop-glow" rather than a drop-shadow.

### Chips & Badges
- Small, pill-shaped indicators for "Online" status or "Bet Amount." Use high-contrast backgrounds (Neon Green for online) with Inter Bold 12px text.

### Progress Bars (XP)
- Dual-layer: A dark, recessed track with a glowing, gradient-filled foreground. The tip of the progress bar should have a localized "flare" effect.