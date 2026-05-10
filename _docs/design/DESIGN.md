---
name: Smart Pocket Design System
colors:
  surface: '#0a1420'
  surface-dim: '#0a1420'
  surface-bright: '#303a47'
  surface-container-lowest: '#050f1a'
  surface-container-low: '#121c28'
  surface-container: '#16202d'
  surface-container-high: '#212b37'
  surface-container-highest: '#2c3542'
  on-surface: '#d9e3f4'
  on-surface-variant: '#c4c5d5'
  inverse-surface: '#d9e3f4'
  inverse-on-surface: '#27313e'
  outline: '#8e909f'
  outline-variant: '#444653'
  surface-tint: '#b8c4ff'
  primary: '#b8c4ff'
  on-primary: '#002584'
  primary-container: '#1e40af'
  on-primary-container: '#a8b8ff'
  inverse-primary: '#3755c3'
  secondary: '#d0bcff'
  on-secondary: '#3c0091'
  secondary-container: '#571bc1'
  on-secondary-container: '#c4abff'
  tertiary: '#ffb59a'
  on-tertiary: '#5a1b00'
  tertiary-container: '#872d00'
  on-tertiary-container: '#ffa583'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c4ff'
  on-primary-fixed: '#001453'
  on-primary-fixed-variant: '#173bab'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#ffdbce'
  tertiary-fixed-dim: '#ffb59a'
  on-tertiary-fixed: '#380d00'
  on-tertiary-fixed-variant: '#802a00'
  background: '#0a1420'
  on-background: '#d9e3f4'
  surface-variant: '#2c3542'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  h1:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  h2:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  h3:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
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
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.02em
  label-xs:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 0.5rem
  sm: 0.75rem
  md: 1rem
  lg: 1.5rem
  xl: 2.5rem
  gutter: 1rem
  margin-safe: 1.25rem
---

## Brand & Style
This design system is built to evoke a sense of digital security, clarity, and forward-thinking financial management. The brand personality is professional yet accessible, utilizing a high-fidelity aesthetic that balances the seriousness of personal finance with the lightness of modern interface trends.

The visual style is a hybrid of **Minimalism** and **Glassmorphism**. By employing translucent surfaces and subtle background blurs, the interface creates a sense of depth and hierarchy without relying on heavy textures. The primary goal is to provide a "clean architecture" feel where data is the hero, supported by a sophisticated, layered environment that feels premium and reliable.

## Colors
The palette is centered on a deep, dark foundation to reduce eye strain and provide a canvas for vibrant accents. 

- **Primary (sp-blue):** Used for core branding, primary actions, and elements representing trust and stability.
- **Accent (sp-purple):** Reserved for innovative features, highlights, and secondary interactions that require a modern edge.
- **Success (Emerald):** Specifically mapped to income streams, positive balances, and completed goals.
- **Danger (Red):** Exclusively used for expenses, debt, alerts, and critical deletions.
- **Neutrals (Slate):** A scale of slate grays provides the structural borders and text hierarchy, ensuring the interface remains grounded and legible.

The default mode is dark, utilizing a deep navy-slate base to allow the glass effects and colorful accents to pop with high contrast.

## Typography
The typography system relies exclusively on **Inter** to achieve a utilitarian and corporate feel that remains highly readable at small sizes—essential for financial data and tables. 

Headline weights are kept semi-bold to bold to establish a clear information hierarchy. Body text uses a generous line height to ensure clarity in dense information layouts. Label styles are frequently used for metadata, status chips, and table headers, often employing slightly increased letter spacing or uppercase transformations for better scannability.

## Layout & Spacing
This design system utilizes a **fluid grid** model optimized for a mobile-first experience. The spacing rhythm is built on an 8px base unit (0.5rem), ensuring all elements align to a consistent mathematical grid.

Layouts should prioritize a single-column view on mobile devices, transitioning to a 12-column grid on desktop. Large financial dashboards should use the `lg` and `xl` spacing for container margins to maintain a clean, airy feel, while internal card padding should remain at `md` or `lg` to keep data density functional but professional.

## Elevation & Depth
Depth is communicated through **Glassmorphism** rather than traditional drop shadows. Surfaces are layered using varying levels of transparency and backdrop blurs.

- **Level 1 (Base):** The dark slate background.
- **Level 2 (Cards):** Semi-transparent slate (`bg-slate-800/60`) with a `backdrop-blur-sm` (4px to 8px) and a subtle 1px border (`border-slate-700/50`).
- **Level 3 (Modals/Popovers):** Higher opacity background with a more significant blur and a thin, light-colored top border to simulate a light source hitting the glass edge.

Shadows, if used, should be extremely diffused and low-opacity, serving only to lift active components like primary buttons or dragged cards from the glass surface.

## Shapes
The shape language is consistently **Rounded**. All main containers, cards, and input fields utilize a 0.5rem (8px) corner radius to soften the technical nature of the application. 

Buttons and interactive chips may use a higher roundedness (`rounded-lg` or `rounded-xl`) to distinguish them from structural containers. This creates a tactile, approachable interface that feels friendly while maintaining its professional posture.

## Components

### Glass Cards
The signature component of this design system. They must feature a semi-transparent background, backdrop blur, and a subtle border. Content inside cards should have consistent internal padding (`spacing.lg`).

### Buttons
- **Primary:** Solid `sp-blue` with white text. High contrast.
- **Secondary/Glass:** A more transparent version of the card style with a `sp-purple` border or text color to denote action.
- **Destructive:** Solid `red` for final expense confirmations or deletions.

### Form Inputs
Inputs should appear "recessed" into the glass surface. Use a darker background than the card surface, a 1px border that brightens on focus, and clear labels using the `label-md` typographic style.

### Progress & Status
- **Income Progress:** Use `emerald` for progress bars tracking savings or earnings.
- **Expense Progress:** Use `red` for budget caps or spending trackers.

### Charts & Data
Visualizations should use a refined line weight (2px) and leverage the primary blue and accent purple. Fill areas under lines should use a gradient that fades into the glass background transparency.