---
version: alpha
name: "Balenciaga"
website: "https://www.balenciaga.com"
description: >-
  A Spanish luxury house under Demna whose digital system runs BB-Regular and BB-CondBold — both proprietary typefaces named after the house — against a pure ink-black canvas, with white as the single bright surface and a mid-grey shadow tone for elevation. Every interface label is set in tracked uppercase at 12px; every product headline in condensed bold at 22px. The typography doesn't whisper authority: it broadcasts it at full compression. Where most luxury e-commerce sites use generous whitespace, Balenciaga densifies — the product grid packs tightly, the navigation runs edge-to-edge, and the only breathing room is the photography itself.

seo:
  title: "Balenciaga Design System for React — ink black canvas, BB-Regular, BB-CondBold, 17 components"
  metaDescription: "Balenciaga's design system as a DESIGN.md file. BB-Regular and BB-CondBold on a pure-black canvas, tracked uppercase navigation, 3 colors, 17 components. For React, Next.js, and AI tools."
  highlights:
    - "House typefaces as brand identity — BB-Regular and BB-CondBold are proprietary fonts named after the house, carrying the visual authority that other brands assign to a brand accent color"
    - "Compression as aesthetic — BB-CondBold at 22px with 1.1px tracking and uppercase transforms every product name into a structural typographic block"
    - "Three-color system — pure black, pure white, and a single mid-grey shadow form the entire visual vocabulary; the system achieves distinction without any chromatic element"
    - "Shadow as the only elevation — grey shadow tones (not raised surfaces) create the depth hierarchy across 1082 total color occurrences for black alone"
    - "Bounce easing as signature motion — the CSS custom property --ease-bounce: cubic-bezier(.65,-.55,.25,1.5) appears alongside standard easing curves, signaling that Balenciaga's UI has a deliberate snap-back character"
  tags:
    - "E-commerce & Retail"
  lastUpdated: "2026-05-19"
  author:
    name: "Dov Azencot"
    url: "https://x.com/dovazencot"
  opening: |
    Balenciaga's digital system is the one luxury fashion site that looks like it was designed to discomfort before it was designed to sell. The navigation bar runs "FALL 26" in 12px tracked uppercase with zero visual hierarchy between product categories and seasonal identifiers — everything sits at the same compressed weight and size. The product grid densifies to the edge of the viewport. The canvas is pure black. There is no warm ivory, no gentle blush, no brand gold: the system runs three tones (black, white, and a mid-grey shadow) and trusts the house typefaces — BB-Regular and BB-CondBold, both named after Cristóbal Balenciaga — to carry the full identity load.

    The DESIGN.md file captures 12 color tokens from the extraction's three-tone palette, 11 typography tokens spanning BB-Regular at 12–14px for UI chrome and BB-CondBold at 12–22px for product headings and category labels, 4 radius tokens (the system's dominant radius is 4px), 8 spacing tokens anchored to a 12px base, and 17 component definitions covering the primary button, the tracked-uppercase nav link, the product card, the shadow-elevated modal surface, and the cookie-consent banner. The extraction also captured five CSS easing custom properties — including the distinctive --ease-bounce (cubic-bezier .65,-.55,.25,1.5) — confirming that motion is a considered part of the system.

    Feed this file to Claude or Cursor and it will reproduce Balenciaga's specific moves: black canvas instead of white, BB-CondBold at 22px tracked uppercase for every product label, 4px radius on interactive surfaces, and shadow-based rather than tonal elevation. The one move worth borrowing carefully: the compressed uppercase treatment works because it applies to everything — if you use it selectively on some labels but not others, the system reads as a pastiche rather than a commitment.
  related:
    - href: "/design"
      title: "Browse all design systems"
      description: "The full directory of DESIGN.md files on shadcn.io, with live mockups for each."
    - href: "https://www.balenciaga.com"
      title: "Balenciaga — official site"
      description: "Balenciaga's public marketing site — the source of truth for the live tokens captured in this file."
    - href: "https://github.com/google-labs-code/design.md"
      title: "The DESIGN.md specification"
      description: "Google Labs' open spec for machine-readable design system files — the format this page is built on."
  questions:
    - id: "primary-color"
      title: "What is Balenciaga's primary brand color?"
      answer: "Balenciaga has no brand accent color. The extraction scanned 1984 elements and found exactly three tones in use: pure black (#000000) with 1082 total occurrences across text, background, border, and shadow uses; pure white (#ffffff, with #f6f5f3 merged) with 33 occurrences; and a mid-grey (#aaaaac) used exclusively as a shadow tone with 106 of its 107 occurrences appearing as shadows. The system achieves brand distinction entirely through typographic identity — BB-Regular and BB-CondBold — rather than through chromatic voltage. Attempting to add a color accent would directly contradict the brand's monochromatic philosophy."
    - id: "typography"
      title: "What typefaces does Balenciaga use, and what should I substitute?"
      answer: "Balenciaga runs two proprietary house typefaces: BB-Regular (a geometric sans at regular weight) for interface chrome, body text, and navigation at 12–14px; and BB-CondBold (a condensed bold variant) for product names, category headings, and campaign labels at 12–22px. Both fallback to Helvetica Neue, Helvetica, Arial, sans-serif. For open-source substitutes: Barlow Condensed Bold approximates BB-CondBold's compressed proportions and uppercase character; for BB-Regular, Helvetica Neue at the same weights is the intended fallback. Avoid Inter and Geist — their optical looseness reads against the compression that defines the brand."
    - id: "canvas-color"
      title: "Why does Balenciaga use a black canvas when most luxury brands use white?"
      answer: "Balenciaga's black canvas inverts the luxury e-commerce convention that runs from Chanel's white to Dior's white to Hermès' cream. The inversion is a direct expression of the Demna era's attitude — the brand treats commercial convention as material for critique rather than convention to inherit. Digitally, the black canvas means product photography is the only bright surface above the fold; the UI chrome recedes, and the garments and accessories read as objects in a dark studio rather than products on a shelf. Chanel and Dior present; Balenciaga stages."
    - id: "motion"
      title: "What easing curves does Balenciaga use?"
      answer: "The extraction captured five CSS custom properties for animation: --ease (cubic-bezier(.4,0,.2,1) — standard Material ease), --ease-out-quint (cubic-bezier(.22,1,.36,1) — fast exit, soft land), --ease-fade (cubic-bezier(.19,1,.22,1) — very fast exit, extremely soft landing for opacity), --ease-transform (cubic-bezier(.22,1,.36,1) — same as ease-out-quint, dedicated to transforms), and --ease-bounce (cubic-bezier(.65,-.55,.25,1.5) — slight overshoot with snap-back). The bounce curve is the distinctive signal: it gives UI interactions like drawer opens, menu expansions, and hover states a physical snap quality that reads different from the smooth deceleration most luxury sites use."
    - id: "use-in-project"
      title: "Can I use this DESIGN.md to build a luxury fashion React storefront?"
      answer: "Yes — feed this file to Claude, Cursor, or any AI tool that reads structured design tokens and it will reproduce Balenciaga's moves: black canvas, BB-CondBold compressed uppercase labels at 22px for product headings, 4px radius on interactive elements, shadow-based elevation rather than tonal surface lift, and the bounce easing curve for UI interactions. The key constraint: the monochrome system only works if the commitment is total. Adding a brand accent (a red sale tag, a golden membership badge) immediately breaks the discipline. For a white-canvas luxury storefront with more chromatic flexibility, look to Chanel's approach instead."

mockups:
  - "marketing-hero"
  - "media-grid"

colors:
  ink: "#000000"
  canvas: "#ffffff"
  canvas-warm: "#f6f5f3"
  shadow: "#aaaaac"
  ink-on-dark: "#ffffff"
  surface-elevated: "#ffffff"
  hairline-light: "#ffffff"
  hairline-dark: "#000000"

typography:
  display-xl:
    fontFamily: "BB-CondBold, \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: 22px
    fontWeight: 700
    lineHeight: 24px
    letterSpacing: "1.1px"
  display-lg:
    fontFamily: "BB-CondBold, \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: 22px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: "1.1px"
  heading-md:
    fontFamily: "BB-CondBold, \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: "0.42px"
  heading-sm:
    fontFamily: "BB-CondBold, \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: 12px
    fontWeight: 700
    lineHeight: 14px
    letterSpacing: 0
  body-md:
    fontFamily: "BB-Regular, \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0
  body-sm:
    fontFamily: "BB-Regular, \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: "0.12px"
  label-tracked:
    fontFamily: "BB-Regular, \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: "0.36px"
  caption:
    fontFamily: "BB-Regular, \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0
  button-md:
    fontFamily: "BB-Regular, \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: "0.36px"
  nav-link:
    fontFamily: "BB-Regular, \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: "0.36px"
  nav-link-category:
    fontFamily: "BB-Regular, \"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: "0.12px"

rounded:
  none: "0px"
  xs: "2px"
  sm: "4px"
  full: "9999px"

spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  base: "16px"
  lg: "20px"
  xl: "40px"
  2xl: "64px"
  3xl: "100px"

components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.canvas}"
    typography: "{typography.button-md}"
    rounded: "{rounded.sm}"
    padding: "0px 16px"
    height: "40px"
    border: "0"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.canvas}"
    typography: "{typography.button-md}"
    rounded: "{rounded.sm}"
    padding: "0px 16px"
    height: "40px"
    opacity: "0.85"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.sm}"
    padding: "0px 16px"
    height: "40px"
    borderColor: "{colors.ink}"
  top-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    rounded: "{rounded.none}"
    padding: "0px 16px"
    height: "44px"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    rounded: "{rounded.sm}"
    padding: "0px 8px"
    height: "28px"
    borderColor: "{colors.canvas}"
  hero-heading:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.display-xl}"
    padding: "0"
  product-label:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.display-xl}"
    padding: "0"
  section-heading:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.display-xl}"
  body-paragraph:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
  card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: "8px 12px 0px"
  product-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.heading-sm}"
    rounded: "{rounded.none}"
    padding: "16px 12px 0px"
  modal:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: "20px"
  cookie-banner:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.xs}"
    padding: "12px"
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: "1px 6px"
    height: "28px"
    borderColor: "{colors.ink}"
  price-label:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label-tracked}"
  category-header:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.heading-md}"
  footer:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    padding: "40px 16px"
---

## Overview

Balenciaga's digital system is the counterargument to luxury-brand convention. **Compressed authority.** Where Chanel uses white canvas, generous spacing, and proprietary italic script for emotional warmth, and where Dior trusts Futura's geometry against white to signal history, Balenciaga densifies everything: pure black canvas, proprietary condensed bold type, uniform 12px uppercase across every navigation element, and a product grid that packs tight to the viewport edge. The system's authority doesn't come from space — it comes from compression.

The two house typefaces — BB-Regular and BB-CondBold — are named after Cristóbal Balenciaga himself. The choice to name the fonts after the house is a claim that type is the brand: not a logo lock-up, not a palette, not a photographic style. BB-CondBold at 22px with 1.1px tracking and forced uppercase takes every product name ("RODEO BAGS," "JET SNEAKER") and turns it into structural typography rather than descriptive commerce. This is the inverse of how direct-to-consumer brands use type — those brands keep labels small and neutral so photography takes center stage. Balenciaga makes the label as visually heavy as the photograph.

The extraction confirms the commitment to monochrome: 1984 elements scanned, three tones found. Black at 1082 total occurrences. White at 33. A mid-grey shadow tone at 107, used almost exclusively for shadow rather than text or fill.

**Key Characteristics:**
- Pure black canvas (`{colors.ink}` — #000000): 1082 total occurrences including 532 as text and 523 as border. The overwhelming dominant tone.
- BB-CondBold at 22px, 1.1px tracking, uppercase — applied to product names, campaign headers, and section labels. Compressed authority as the brand's typographic voice.
- Three-tone palette: ink, white, grey shadow. No accent, no warm tone, no structural color.
- 4px radius (`{rounded.sm}`) as the system's default rounding for buttons, nav chips, and modal surfaces. Modest, not zero, not pill.
- Shadow-based elevation: the `{colors.shadow}` mid-grey (#aaaaac) appears 106 times as shadow and once as a background fill — the entire elevation system runs through shadow opacity rather than tonal surface lift.
- Five CSS easing custom properties captured, including the bounce curve `cubic-bezier(.65,-.55,.25,1.5)` — a physical snap quality on UI interactions.
- Product grid with 12px internal card padding and a dense pack density.

## Colors

### Structural

- **Ink** (`{colors.ink}` — #000000): frequency 1082. Used as text (532), border (523), background (2), shadow (25). The canvas itself, the text, the borders, and the primary button fill — black is every layer simultaneously. This is not black as accent or as contrast; it is black as the entire system.
- **Canvas** (`{colors.canvas}` — #ffffff): frequency 33. Used as background (18), border (12), text (3). The inversion surface — appears where product photography needs a light ground, on modal backgrounds, on button-secondary fills, and as the nav link border signal.
- **Canvas Warm** (`{colors.canvas-warm}` — #f6f5f3): merged into the canvas cluster at extraction. A fractionally off-white that appears on some surface fills where absolute white would feel clinical.

### Shadow

- **Shadow** (`{colors.shadow}` — #aaaaac): frequency 107. Used as shadow (106), background (1). The elevation medium. Not used for text, not used for borders — exclusively for casting depth on modal surfaces, card hover states, and the cookie-consent panel. The blue-grey cast is barely perceptible; it reads almost as a neutral mid-grey.

## Typography

### Font Families

The system runs **BB-Regular** for interface chrome, body, and navigation, and **BB-CondBold** for product names, category identifiers, and campaign headlines. Both share the same fallback stack: Helvetica Neue, Helvetica, Arial, sans-serif. The two-weight split is the system's entire typographic range — there is no intermediate weight, no serif accent, no monospace. The compression in BB-CondBold is the system's one expressive variable.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-xl}` | 22px | 700 | 24px | 1.1px | Product names, campaign labels, section headers (BB-CondBold) |
| `{typography.display-lg}` | 22px | 400 | 24px | 1.1px | Body-weight condensed spans — section dek (BB-CondBold) |
| `{typography.heading-md}` | 14px | 400 | 16px | 0.42px | Sub-section labels and category headers (BB-CondBold uppercase) |
| `{typography.heading-sm}` | 12px | 700 | 14px | 0 | h2 product names in condensed bold (BB-CondBold) |
| `{typography.body-md}` | 14px | 400 | 20px | 0 | Body paragraphs, product descriptions (BB-Regular) |
| `{typography.body-sm}` | 12px | 400 | 16px | 0.12px | Navigation labels, price labels, inline spans (BB-Regular) |
| `{typography.label-tracked}` | 12px | 400 | 16px | 0.36px | Tracked navigation items and form labels (BB-Regular) |
| `{typography.button-md}` | 12px | 400 | 16px | 0.36px | Button text (BB-Regular tracked) |
| `{typography.nav-link}` | 12px | 400 | 16px | 0.36px | Primary nav links (BB-Regular) |
| `{typography.nav-link-category}` | 12px | 400 | 16px | 0.12px | Secondary nav links (BB-Regular lighter track) |
| `{typography.caption}` | 12px | 400 | 16px | 0 | Captions and metadata |

### Principles

The weight range is minimal: 400 and 700, both at 12px, with size and condensation doing the work that most type systems assign to the weight axis. BB-CondBold at 22px is the loudest moment; everything else sits at 12–14px in either regular or condensed variants. The absence of a mid-weight (500, 600) is unusual — Balenciaga forces a binary between regular and compressed-bold rather than offering a gradient of emphasis.

### Note on Font Substitutes

BB-Regular and BB-CondBold are proprietary house fonts. For open-source substitutes: **Barlow Condensed Bold** approximates BB-CondBold's character at display sizes; **Barlow Regular** covers the BB-Regular register. For a tighter match, **Helvetica Neue Condensed** is the intended fallback's condensed variant. Avoid anything that isn't geometrically neutral — the Balenciaga type identity is specifically not warm, not humanist, not friendly.

## Layout

### Spacing System

- **Base unit:** 12px (the dominant padding value at 33 occurrences).
- **Tokens:** `{spacing.xs}` 4px · `{spacing.sm}` 8px · `{spacing.md}` 12px · `{spacing.base}` 16px · `{spacing.lg}` 20px · `{spacing.xl}` 40px · `{spacing.2xl}` 64px · `{spacing.3xl}` 100px.
- **Nav height:** 44px (--topsearchheight captured as a CSS custom property).
- **Product card padding:** 8x12 at the top, zero horizontal padding for image tiles.
- **Section padding:** 40px horizontal and 100px vertical separating major campaign sections.

### Grid & Container

- **Product grid:** tight n-column layout. 12px gutters, images bleeding to card edge.
- **Campaign sections:** full-bleed photography with centered text overlay at constrained max-width.
- **Navigation:** edge-to-edge horizontal strip, 44px tall, labels at 12px tracked uppercase.

### Rhythm

The page is dense by design. Campaign hero images bleed edge-to-edge and are immediately followed by the product grid with minimal vertical separation. There is no generous whitespace section between them — the transition from editorial to commercial is abrupt and intentional.

## Elevation

Balenciaga's elevation system runs exclusively through shadow. The `{colors.shadow}` mid-grey (#aaaaac) appears 106 times as shadow. The modal panel (cookie consent, the service-exploration overlay) uses this shadow to lift above the canvas without changing its background color.

- **Flat (no shadow):** product grid cards, editorial photography sections, footer.
- **Shadow-elevated:** modal surfaces, notification panels, cookie-consent banners.
- No tonal surface lift — the system never uses a lighter or darker background fill to indicate elevation, only `rgba({colors.shadow}, *)` shadows.

## Shapes

The radius philosophy is **minimal-practical**. The dominant radius is `{rounded.sm}` (4px), which appears 30 times in the extraction. A 2px radius appears 24 times for smaller surfaces. Buttons, nav chips, modals, and interactive containers all round to 4px. This is the minimum that contemporary web-UI convention requires — below 4px, interactive surfaces begin to read as sharp-cornered structural elements rather than pressable targets.

The system never approaches a pill (50%+ radius) or the generous 8–16px rounding that direct-to-consumer brands use. The edge is meant to be perceived as slightly sharp — consistent with the brand's anti-softness stance.

## Components

**`button-primary`** — Ink `{colors.ink}` fill, white text, BB-Regular tracked at `{typography.button-md}`, `{rounded.sm}` 4px radius, 0x16 padding, 40px height. The canonical instance captured is "Go to international version."

**`button-secondary`** — White fill, ink text, 1px ink border, 4px radius. Used for locale selectors and service navigation.

**`top-nav`** — White canvas, 44px height (matching the --topsearchheight CSS variable). Navigation links in 12px tracked uppercase. The nav sits on white rather than black — an inversion of the page canvas.

**`nav-link`** — Transparent background, ink text, `{typography.nav-link}` 12px tracked, 4px radius, 0x8 padding, 28px height, white border. The active-state nav item (e.g. "FALL 26") renders with a white outline rather than a filled state.

**`product-label`** — The BB-CondBold uppercase product name treatment. Transparent background, ink text, 22px/700/1.1px tracking. Applied to every product heading across the grid.

**`card`** — White canvas, zero radius, 8x12 top padding, zero horizontal. Product photography fills the card edge-to-edge; the label appears beneath.

**`product-card`** — The full product tile. White canvas, zero radius, 16px top padding. Holds the product image, BB-CondBold product name, and price label in tracked regular.

**`modal`** — White canvas, `{colors.shadow}` box-shadow elevation, `{rounded.sm}` 4px radius, 20px padding. Used for the country/region selector and service overlay.

**`cookie-banner`** — White fill, `{rounded.xs}` 2px radius, 12px padding. An ink-text body in BB-Regular with two ink-fill buttons.

**`text-input`** — White canvas, ink text, 1px ink border, `{rounded.sm}` 4px radius, 1x6 padding, 28px height. Compact — the input height is 28px, not the 40px most web-UI systems use.

**`price-label`** — Transparent, ink text, `{typography.label-tracked}` 12px with 0.36px tracking. Price always appears as tracked regular, never bold.

**`footer`** — White canvas, ink text, 48px top padding, 40px horizontal, compact tracked regular.

## Do's and Don'ts

**Do** set every product name in BB-CondBold uppercase with 1.1px letter-spacing at 22px. The product label is the system's primary expressive element — it is the brand mark at the item level. Using sentence-case, mixed case, or a different weight collapses the compressed authority the system is built around.

**Do** use `{spacing.md}` (12px) as the base card padding. The product grid density is intentional — 12px internal card padding, not 16px or 24px. The tighter gap reinforces the system's anti-generous spatial philosophy.

**Do** apply the `--ease-bounce` curve (cubic-bezier .65,-.55,.25,1.5) to UI interactions like drawer open/close, menu expansion, and hover-state reveals. It is a CSS custom property captured from the live site — the snap-back quality is a deliberate part of the system's interaction personality.

**Do** invert nav-link state signals using white borders rather than filled backgrounds. The captured nav link uses a white 1px border as its active-state indicator on a white background — the border IS the signal. Switching to a filled state or an underline loses the system's specific interaction language.

**Don't** apply the 22px BB-CondBold tracked uppercase to body paragraphs or editorial descriptions. The `{typography.display-xl}` treatment is product-name-only. Using it on body text — even one sentence — destroys the contrast between product identity and descriptive content. Use `{typography.body-md}` (BB-Regular 14px / 400) instead.

**Don't** round any element above `{rounded.sm}` (4px). The system has no 8px, 12px, or pill radius. Adding a pill button or a rounded card creates a consumer-softness that directly contradicts the brand's anti-softness stance.

**Don't** use `{colors.shadow}` (#aaaaac) as a text color or background fill. In the extraction it appears 106 times as shadow and once as a background — it is an elevation medium, not a palette tone. For secondary text, use `{colors.ink}` at reduced opacity in CSS.

**Don't** increase the button height above 40px. The compact 40px button height is part of the dense pack philosophy — the brand does not prioritize large tap targets or accessibility-friendly button sizing at the expense of information density.

## Known Gaps

- **Full hover and focus state matrix:** only the nav-link active state and a button opacity-fade hover were captured. Focus rings, keyboard navigation indicators, and disabled states are not documented.
- **Dark-canvas sections:** the product grid and navigation run on a white surface despite the marketing canvas being ink black. Dark-canvas component variants (white-fill cards on black, white-text forms) for campaign sections are not captured.
- **Product interaction states:** size selectors, add-to-cart confirmation states, wishlist toggles, and checkout form validation are not represented.
- **Animation timing:** the CSS easing curves are captured but duration values for transitions are not. The bounce and fade easing curves require duration context to implement correctly.
- **Sub-brand and collaboration typography:** limited-edition and collaboration pages use display type treatments that may differ from the core system.
- **Accessibility states:** the system's high-contrast approach (black on white) provides WCAG AA compliance at most sizes, but focus-ring design and screen-reader semantics are not captured.
