---
name: Kinetic Courier Enterprise
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
  on-surface-variant: '#5a4046'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#8e6f76'
  outline-variant: '#e2bdc5'
  surface-tint: '#ba005c'
  primary: '#a40050'
  on-primary: '#ffffff'
  primary-container: '#d10068'
  on-primary-container: '#ffe6ea'
  inverse-primary: '#ffb1c5'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#005785'
  on-tertiary: '#ffffff'
  tertiary-container: '#0070aa'
  on-tertiary-container: '#deedff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd9e1'
  primary-fixed-dim: '#ffb1c5'
  on-primary-fixed: '#3f001b'
  on-primary-fixed-variant: '#8f0045'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#cce5ff'
  tertiary-fixed-dim: '#93ccff'
  on-tertiary-fixed: '#001d31'
  on-tertiary-fixed-variant: '#004b73'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: DM Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  display-md:
    fontFamily: DM Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: DM Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: DM Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.005em
  headline-sm:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  title-md:
    fontFamily: DM Sans
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: DM Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: DM Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
  code-sm:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-compact: 1rem
  margin: 2rem
  margin-compact: 1.5rem
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system is tailored for mission-critical enterprise logistics operations, fleet management, and supply chain telemetry. The brand aesthetic merges the high-velocity energy of express parcel transit with the structural authority and clarity demanded by enterprise command centers. 

The aesthetic philosophy is **Modern Corporate Utility with High-Energy Accentuation**:
- **Operational Precision**: Clean, architectural alignment prioritizing dense data legibility, real-time status visibility, and minimal cognitive friction.
- **Dynamic Energy**: The signature energetic magenta acts as a laser-targeted focal point, guiding dispatchers and logistics managers through complex routing states, high-priority exceptions, and primary actions without visual clutter.
- **Tactile Modernism**: Subdued structural frames, crisp light-slate canvases, and subtle layered depth provide an intuitive workspace engineered specifically for sustained viewing on high-resolution desktop and laptop monitors.

## Colors

The color palette is engineered for rapid information retrieval, distinct operational status recognition, and visual hierarchy:

- **Primary (`#D10068`)**: The signature high-velocity magenta. Reserved strictly for primary operational triggers (e.g., "Dispatch Order", "Batch Assign"), focused states, and key real-time telemetry markers.
- **Secondary (`#0F172A`)**: Deep Obsidian Slate. Establishes commanding authority for dense header typography, high-contrast navigation sidebars, and structural anchors.
- **Tertiary (`#0284C7`)**: Precision Waypoint Blue. Used for secondary analytics, live tracking links, geo-location overlays, and data points that require differentiation from standard status tags.
- **Neutral Base (`#64748B`)**: Modern Slate. Scales down to `#F8FAFC` for background canvases, `#E2E8F0` for structural hair-line separators, and scales up to `#334155` for high-density secondary data labels.

### Operational Status Palette (Functional)
- **In Transit / Active**: Slate-tinted Teal (`#0D9488` with `#F0FDFA` container).
- **Out for Delivery / Express**: Bright Magenta (`#D10068` with `#FDF2F8` container).
- **Delivered / Cleared**: Emerald Green (`#059669` with `#ECFDF5` container).
- **Exception / Delayed / Critical**: Crimson Coral (`#E11D48` with `#FFF1F2` container).
- **Pending / Staged**: Amber Gold (`#D97706` with `#FFFBEB` container).

## Typography

DM Sans drives the typographic rhythm across all layers, chosen for its sharp geometric legibility, wide open counters, and high performance in complex data grids.

- **Tabular Figures & Identifiers**: Waybill numbers, tracking codes, time manifests, and dimensional weights should enforce tabular figure alignment (`font-variant-numeric: tabular-nums`) to ensure zero visual jitter across real-time updating sorting feeds.
- **Hierarchy Structure**: Display and headline scales use heavier weights (`700` and `600`) with tight negative tracking to maintain punchy, architectural authority. Labels and micro-copy leverage uppercase tracking (`0.02em` to `0.04em`) to delineate metadata from core descriptive tracking notes.

## Layout & Spacing

The layout is built around a rigorous 12-column desktop grid tailored for 1440px and 1920px viewports with a 240px or 280px fixed operational sidebar navigation.

- **Grid Dynamics**: The primary operational canvas utilizes a responsive fluid grid with fixed outer bounds (`max-width: 1720px`). Large monitors leverage a standard `1.5rem` (24px) column gutter, allowing continuous placement of telemetry widgets, split-screen live maps, and density-driven tabular lists.
- **Card-Level Spacing Rhythm**: Standard operational cards employ `1.5rem` (24px) internal padding, scaling down to `1rem` (16px) inside dense data inspection drawers and side-docked parcel manifests.
- **Stacking Logic**: Vertical stacking uses `space-md` (16px) between cohesive elements within cards, and `space-xl` (32px) between major operational control sections.

## Elevation & Depth

Visual hierarchy uses crisp boundary containment instead of heavy shadows, keeping the dashboard sharp and free of visual mud:

- **Surface Layering**: 
  - **Base Canvas**: Light Slate (`#F8FAFC`), providing an easy-on-the-eyes backdrop for long shifts.
  - **Surface Card**: Pure White (`#FFFFFF`), elevating content through contrast against the light slate base.
  - **Elevated Floating Drawers & Overlays**: Crisp White with directional utility shadows.
- **Low-Contrast Outlines (1px Borders)**: Every card, table container, and form element is outlined with an exacting 1px border (`#E2E8F0`). This creates clear boundaries between high-density operational metrics.
- **Elevation Levels**:
  - **Level 0 (Flat)**: Background and base structural panels. Outlined with `#E2E8F0`.
  - **Level 1 (Card Baseline)**: `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)`. Used for all standard operational cards and data tiles.
  - **Level 2 (Hover / Active Cards)**: `0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`.
  - **Level 3 (Dropdowns & Popovers)**: `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03)`.
  - **Level 4 (Modals & Route Flyouts)**: `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`.

## Shapes

The interface balances precision engineering with modern approachability using refined, subtle radii:

- **Base Radius (`0.5rem` / 8px)**: Applied to interactive controls, including text inputs, dropdown triggers, action buttons, and segmented pickers.
- **Large Radius (`rounded-lg` / `1rem` / 16px)**: Applied to operational dashboard cards, route-monitoring modules, floating analytics panels, and table containers.
- **Pill Shapes (`9999px`)**: Reserved strictly for high-visibility operational status tags, tracking pills, count badges, and small telemetry indicators to ensure they stand out against rectangular data tables.

## Components

### Primary & Secondary Buttons
- **Primary**: Solid signature magenta (`#D10068`) with white DM Sans 600 text, `0.5rem` radius, and horizontal padding of `1.25rem`. On hover, darken to `#B50059` with subtle vertical scale feedback. Focused states present a 2px offset ring in `#D10068`.
- **Secondary / Outline**: Crisp white surface with `#E2E8F0` 1px border and `#0F172A` text. On hover, background shifts to `#F8FAFC` and border deepens to `#CBD5E1`.
- **Destructive**: Deep crimson border with soft red tint background (`#FFF1F2`), transitioning to solid `#E11D48` on intent confirmation.

### Operational Status Chips & Badges
- Pill-shaped (`rounded-full`) with a structural 1px border tinted to match the status hue.
- Height fixed at `24px` for data table inclusion; `label-sm` font weight (`700`), uppercase with letter spacing.
- Includes a leading 6px solid ping/dot indicator for live statuses (e.g., "ON DELIVERY", "AIR TRANSIT").

### Data Tables & Manifest Lists
- Header cells: `#F8FAFC` background, 1px bottom border in `#E2E8F0`, DM Sans 12px uppercase semibold in `#64748B`.
- Row cells: `#FFFFFF` background, 48px row height, soft hover transition to `#FDF2F8` (5% brand tint) when tracking numbers or shipments are active.
- Tracking numbers styled in DM Sans Semibold (`#0F172A`) with direct-access copy actions on hover.

### Form Inputs & Search Fields
- Inset height: 40px for standard enterprise data velocity; background is crisp white (`#FFFFFF`) with a 1px border in `#CBD5E1`.
- Focus ring: Border transitions directly to primary magenta (`#D10068`) with an ambient 3px box-shadow at 15% opacity (`rgba(209, 0, 104, 0.15)`).

### Dashboard Cards
- Pure white surfaces resting over `#F8FAFC`.
- Enclosed with a uniform 1px `#E2E8F0` border and `1rem` (16px) corner rounding (`rounded-lg`).
- Card headers feature clean divider rules (`border-b border-slate-100`) separating title metadata from core metrics and data visualizations.