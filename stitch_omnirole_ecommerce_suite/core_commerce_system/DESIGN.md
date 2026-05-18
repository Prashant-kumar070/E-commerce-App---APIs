---
name: Core Commerce System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#424656'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737687'
  outline-variant: '#c2c6d9'
  surface-tint: '#0052dc'
  primary: '#004bca'
  on-primary: '#ffffff'
  primary-container: '#0061ff'
  on-primary-container: '#f1f2ff'
  inverse-primary: '#b4c5ff'
  secondary: '#006d43'
  on-secondary: '#ffffff'
  secondary-container: '#56fbab'
  on-secondary-container: '#007146'
  tertiary: '#7d4b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#9e6100'
  on-tertiary-container: '#fff1e5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#59fead'
  secondary-fixed-dim: '#31e193'
  on-secondary-fixed: '#002111'
  on-secondary-fixed-variant: '#005231'
  tertiary-fixed: '#ffddba'
  tertiary-fixed-dim: '#ffb866'
  on-tertiary-fixed: '#2b1700'
  on-tertiary-fixed-variant: '#673d00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  h1:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.55'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.02em
  code:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

The design system is engineered to bridge the gap between high-conversion consumer storefronts and high-efficiency administrative dashboards. The brand personality is professional, transparent, and frictionless. It prioritizes utility over decoration, using ample whitespace to reduce cognitive load during complex tasks. 

Drawing inspiration from modern fintech and commerce platforms, the system employs a "content-first" philosophy. The emotional response should be one of immediate trust and reliability. The aesthetic is strictly "Modern Corporate," characterized by sharp execution, subtle depth, and a mathematical approach to layout.

## Colors

The palette is anchored by "Trust Blue" (#0061FF), used strategically for primary actions and brand presence. Functional colors—Success Green and Warning Orange—are reserved for status indicators and feedback loops to maintain their semantic power. 

The neutral scale utilizes cool grays with a slight blue undertone to keep the interface feeling "crisp" and "airy" rather than "heavy" or "muddy." Use `surface-50` for large background areas and `surface-100` for inset elements like search bars or table headers to create subtle containment without heavy borders.

## Typography

This design system relies exclusively on **Inter** for all UI and marketing copy. The hierarchy is strictly enforced to ensure clarity in data-dense admin views. 

- **Headlines:** Use tighter letter-spacing and heavier weights to anchor pages.
- **Body:** Uses a generous line-height (1.5x+) to improve readability in long-form product descriptions or seller policies.
- **Labels:** Small labels use a medium or semi-bold weight and occasional uppercase styling to distinguish them from interactive text.
- **Data:** For SKU numbers or tracking IDs, use a monospaced font to ensure character alignment.

## Layout & Spacing

The layout follows a 12-column fluid grid for consumer-facing pages and a flexible, sidebar-driven "Dashboard" layout for admin interfaces. 

A 4px baseline grid governs all spatial relationships. 
- **Consumer Pages:** Use `xl` (32px) and `xxl` (48px) padding to create a luxurious, breathable feel.
- **Admin Interfaces:** Use `sm` (8px) and `md` (16px) spacing to maximize information density without sacrificing touch targets.
- **Margins:** Standard page margins are 24px on mobile and 48px+ on desktop.

## Elevation & Depth

Depth is used sparingly to signify interactivity and layering. This system avoids heavy "drop shadows" in favor of "ambient lifts."

1.  **Level 0 (Flat):** Used for the main background and primary layout sections.
2.  **Level 1 (Soft):** A very subtle 1px border (#E2E8F0) with no shadow. Used for table rows and input fields.
3.  **Level 2 (Raised):** A soft, diffused shadow: `0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)`. Used for product cards and secondary navigation.
4.  **Level 3 (Overlay):** High-diffusion shadow for modals and dropdowns: `0 20px 25px -5px rgba(0, 0, 0, 0.1)`.

Backdrop blurs (12px-16px) should be applied to fixed headers to maintain a sense of place while scrolling.

## Shapes

The shape language is "Rounded," striking a balance between the friendliness of a consumer app and the precision of a professional tool. 

- **Standard Elements:** Buttons, inputs, and small cards use a **8px** radius.
- **Large Containers:** Modals and large product feature sections use a **12px - 16px** radius.
- **Interactive Micro-elements:** Tags and badges use a fully rounded "Pill" shape to distinguish them from buttons.

## Components

### Buttons
- **Primary:** Trust Blue background, white text. 8px radius. Subtle scale-down (0.98x) on click.
- **Secondary:** Surface-100 background, Text-Primary. No border.
- **Ghost:** No background, Trust Blue text. Used for "Cancel" or less urgent actions.

### Input Fields
- **Default State:** 8px radius, 1px border (#E2E8F0), 16px horizontal padding.
- **Focus State:** 1px Trust Blue border with a 3px "halo" (soft blue shadow).
- **Validation:** Error states use a red border and small 12px helper text below.

### Data Tables (Admin)
- **Header:** Surface-50 background, uppercase 12px labels, 1px bottom border.
- **Rows:** 1px bottom border (#F1F5F9). On-hover, change background to Surface-50.
- **Actions:** Use "More" (triple dot) menus for row-level actions to keep the layout clean.

### Product Cards (Customer)
- **Structure:** Image (top), followed by a 16px padded content area. 
- **Typography:** H3 for title, Body-md for price.
- **Elevation:** Level 2 shadow on hover; flat with a 1px border in the default state.

### Chips/Badges
- Small 12px bold text. 
- Success Green chips use a 10% opacity background of the same color for high legibility.