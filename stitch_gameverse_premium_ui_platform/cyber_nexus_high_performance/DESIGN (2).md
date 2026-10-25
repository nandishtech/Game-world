---
name: Cyber-Nexus High Performance
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#d0bcff'
  on-secondary: '#3c0091'
  secondary-container: '#571bc1'
  on-secondary-container: '#c4abff'
  tertiary: '#4cd7f6'
  on-tertiary: '#003640'
  tertiary-container: '#009eb9'
  on-tertiary-container: '#002f38'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#acedff'
  tertiary-fixed-dim: '#4cd7f6'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style
The design system embodies a "Cyber-Nexus" aesthetic—a premium, high-fidelity environment designed for the next generation of AAA gaming. It prioritizes immersion and performance, utilizing a dark-mode-first approach that reduces cognitive load while highlighting vibrant content. 

The style is a refined blend of **Futuristic Minimalism** and **Glassmorphism**. It avoids the cluttered "greeble" often seen in sci-fi, opting instead for clean lines, expansive whitespace (despite the dark theme), and depth created through varying levels of transparency and background blurs. The goal is to evoke the feeling of a high-end command deck: precise, responsive, and powerful.

## Colors
The palette is rooted in a deep, "Void Black" (#050505) to ensure maximum contrast for neon accents. 

- **Primary (Neon Blue):** Used for primary actions and "active" states.
- **Secondary (Neon Purple):** Used for rare achievements, high-tier membership highlights, and accent gradients.
- **Tertiary (Cyan):** Used for informational elements, status indicators, and secondary navigation highlights.
- **Surface:** Components sit on a slightly elevated grey-black to distinguish them from the background before glass effects are applied.

Gradients should be used sparingly but impactfully, typically moving from Primary to Secondary at a 45-degree angle to simulate energy flow.

## Typography
The system uses **Space Grotesk** (as a high-performance alternative to Orbitron) for headings to provide a technical, geometric edge without sacrificing legibility. Titles should leverage tighter letter-spacing to feel "locked-in."

**Inter** handles all body and UI text. It provides a neutral, highly readable counterpoint to the aggressive headlines. Use uppercase labels with increased letter-spacing for metadata and small utility headers to maintain the "military-spec" tech aesthetic.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a 12-column structure on desktop. 

- **Vertical Rhythm:** Built on a 4px baseline. All components and spacing increments must be multiples of 4 (4, 8, 12, 16, 24, 32, 48, 64).
- **Margins:** Desktop views utilize generous 48px margins to allow the "floating" UI elements to breathe.
- **Glass Padding:** Internal padding for glassmorphic cards should be a minimum of 24px to prevent content from feeling cramped against the blurred edges.
- **Breakpoints:** Mobile (<768px), Tablet (768px - 1024px), Desktop (>1024px). On mobile, the grid collapses to 4 columns with 16px margins.

## Elevation & Depth
Depth is not achieved through traditional drop shadows, but through **Tonal Stacking and Diffusion**.

1.  **Level 0 (Background):** Solid #050505.
2.  **Level 1 (Sub-surface):** Solid #121212 with a 1px #FFFFFF10 (10% white) border.
3.  **Level 2 (Floating Glass):** Background blur (24px), 40% opacity surface, and a "Soft Glow" border—a 1px stroke using a gradient of White to Primary color at low opacity.
4.  **Level 3 (Interactive/Active):** An outer "Neon Bloom" effect. This is a highly diffused shadow (30px-50px blur) using the Primary or Secondary color at 20-30% opacity, simulating light emitting from the component onto the surface below.

## Shapes
The "Rounded" (0.5rem base) setting is scaled up for this design system to achieve the requested 20px feel.

- **Standard Components (Buttons, Inputs):** 8px (rounded-md)
- **Cards/Containers:** 20px (rounded-xl)
- **Featured Banners:** 24px (rounded-2xl)

Interactive elements use a "squircle" approach where possible to maintain a premium hardware-like feel. Avoid sharp 0px corners entirely to keep the UI feeling modern and approachable.

## Components
- **Buttons:** Primary buttons use a solid-to-gradient fill with a subtle inner-glow. Secondary buttons are "Ghost" style with a glass background and a 1px neon border. All buttons scale by 5% on hover with a brightness increase.
- **Cards:** Utilize `backdrop-filter: blur(20px)`. Include a top-down linear gradient stroke (White at 20% to Transparent) to simulate "rim lighting" from an overhead source.
- **Input Fields:** Dark base (#000000) with a 1px border that glows Primary Blue when focused. Labels sit above the field in `label-md` style.
- **Chips/Badges:** Small, pill-shaped elements with 10% opacity fills of the category color (e.g., a green tint for "Online") and high-contrast text.
- **Lists:** Items separated by low-opacity "scanning lines" (0.5px wide dividers at 5% white).
- **Progress Bars:** Use a dual-layered approach: a dark track and a glowing neon fill that has a subtle "pulse" animation.
- **Icons:** Use Lucide icons with a `stroke-width` of 1.5px. Icons in active states should adopt the Neon Blue color and a tiny glow effect.