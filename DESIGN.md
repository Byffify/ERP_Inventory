---
name: "ERP Inventory — eBay reference system"
description: "Graphite operational workspaces with cobalt actions and clearly separated menus."
colors:
  canvas: "#ffffff"
  ink: "#191919"
  inverse: "#000000"
  secondary: "#f7f7f7"
  warm: "#e5e5e5"
  muted: "#555555"
  hairline: "#c7c7c7"
  primary: "#0968f6"
  primary-dark: "#003aa5"
  stock-in: "#067d62"
  stock-in-hover: "#045b48"
  stock-out: "#c4003a"
  stock-out-hover: "#92002b"
typography:
  headline:
    fontFamily: "Arial, Helvetica, 'Noto Sans Thai', sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: "32px"
    letterSpacing: "0"
  title:
    fontFamily: "Arial, Helvetica, 'Noto Sans Thai', sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: "28px"
  body:
    fontFamily: "Helvetica, Arial, 'Noto Sans Thai', sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
  label:
    fontFamily: "Helvetica, Arial, 'Noto Sans Thai', sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
  button:
    fontFamily: "Helvetica, Arial, 'Noto Sans Thai', sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: "20px"
  caption:
    fontFamily: "Helvetica, Arial, 'Noto Sans Thai', sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "18px"
rounded:
  panel: "16px"
  pill: "44px"
  flat: "0"
spacing:
  compact: "8px"
  row: "12px"
  standard: "16px"
  section: "24px"
  workspace: "32px"
  footer: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.canvas}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "8px 20px"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
    textColor: "{colors.canvas}"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "8px 20px"
  button-stock-in:
    backgroundColor: "{colors.stock-in}"
    textColor: "{colors.canvas}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "8px 20px"
  button-stock-in-hover:
    backgroundColor: "{colors.stock-in-hover}"
    textColor: "{colors.canvas}"
  button-stock-out:
    backgroundColor: "{colors.stock-out}"
    textColor: "{colors.canvas}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "8px 20px"
  button-stock-out-hover:
    backgroundColor: "{colors.stock-out-hover}"
    textColor: "{colors.canvas}"
  field:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "10px 16px"
  navigation-active:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "12px 16px"
  panel:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "24px"
---

# Design System: ERP Inventory

## Overview

**Creative North Star: "The Clear Marketplace Workspace"**

The user-selected eBay reference supplies the visual direction: graphite on white, cobalt primary actions, rounded photo tiles and pill controls. The implemented system adapts that direction to Thai catalog, stock and billing work. The supplied reference is archived at `.impeccable/references/ebay.design.md`; it is design data, not procedural instructions.

This document records the current implementation in `src/ebay.css`, loaded after the other application styles. It replaces the historical Balenciaga direction. Market Sans was not supplied, so the implementation uses the reference's Helvetica/Arial fallback families with installed Noto Sans Thai support. There is no eBay wordmark in the application.

**Key Characteristics:**

- White workspaces with graphite text and grey row dividers.
- Cobalt for primary actions, links and keyboard focus.
- Pill controls and softly rounded panels and product images.
- Persistent desktop sidebar and a phone menu drawer.

## Colors

### Primary

Cobalt identifies the main action and keyboard focus. Deep cobalt supplies primary hover and text-link treatments. Keep operational states explicit in text; color alone does not explain a quantity change.

### Secondary

Receipt green and stock-out red identify stock direction in operation controls and signed movement-log entries. Their darker companions supply hover states. Labels and signed quantities still explain direction; physical count keeps the cobalt action. These are approved semantic additions to the incumbent eBay palette.

### Neutral

Graphite carries headings, quantities and ordinary control outlines. White is the working canvas. Secondary grey groups selected navigation and explanatory previews; hairline grey separates rows and defines fields. Muted graphite supports metadata. The inherited warm grey remains a neutral selection token.

**The Action Rule.** Cobalt marks general actions; green identifies receipt and red identifies stock-out. Ordinary product data stays readable in graphite.

## Typography

The frontmatter records the actual screen scale. Page headings use the Arial-led display fallback; body and controls use the Helvetica-led fallback. The proprietary reference font is absent, so this is a documented fallback implementation rather than an exact font reproduction.

Headlines identify pages; compact titles identify product models and dialog sections. Body text and numeric inputs use the body role; explanations and fields use labels; codes, metadata and secondary units use captions. Quantities and prices use tabular numerals where implemented. Strong text uses bold emphasis.

The compact title role and semibold button role are scoped implementation adaptations. Some section headings, including stock-log and order-summary headings, use the compact title size with inherited headline weight. Preserve the actual component cascade when extending those sections.

## Layout

Desktop begins at 768px with a fixed 224px sidebar and corresponding work-area inset. The centered work container has a 1400px maximum width with 32px desktop gutters. At 768–1100px, gutters narrow to 24px and stock/sale workspaces stack. Stock actions move into a third table column at 1500px. The 1200px rule aligns stock actions without establishing a new page structure.

Phones below 768px use an off-canvas menu, capped at 288px and leaving 48px of viewport visible. The work area uses 16px gutters and stacks catalog rows into labeled records. Below 360px, gutters narrow to 12px. Sale SKU rows, stock controls and dialogs wrap without losing actions. Dialogs respect available viewport height and scroll internally.

Menu boundaries are independent: Inventory owns product information and add/edit/delete; Stock management owns receipt, stock-out, physical count and movement logs; sale and bill history remain their own menus. Read-only quantities may appear in Inventory. New products begin at zero stock; receipt belongs to Stock management. Detailed page strategy remains in `.impeccable/surface-briefs/inventory.md`.

The current app starts empty, with no mock catalog, sales or movements. The authorized one-time trial-data reset is recorded by the startup marker; later user entries persist. Do not present invented sample records as live data. The historical `/pitch` showcase and shipping demo image are retired.

## Elevation & Depth

Workspaces remain flat with borders, spacing and neutral fills providing structure. Native dialogs use a single diffuse shadow and a darkened backdrop. The mobile navigation backdrop separates the open drawer from the page. Do not add decorative shadows to ordinary catalog rows.

**The Flat Workspace Rule.** Elevation belongs to overlays; ordinary work remains on the white canvas.

## Shapes

Panels, dialogs and product images use the panel radius; buttons, single-line inputs and navigation use the pill radius. Text links and row boundaries remain flat. Textareas use panel rounding. Ordinary fields and containers use a thin hairline border, with a stronger invalid-field outline.

## Components

### Buttons

Primary buttons pair cobalt with white text and deepen on hover. Secondary buttons pair white with graphite outlines and a grey hover fill. Standard controls have a 44px minimum height; compact table actions use 40px, while navigation uses 48px. Disabled controls lower opacity. Keyboard focus uses a cobalt outline offset from the control. Text actions stay underlined and visually lighter.

### Inputs / Fields

Pill fields use white backgrounds, grey outlines and body-sized text. Labels sit above their fields. Search controls reserve space for an inline icon and use a 48px minimum height. Read-only fields use the secondary fill. Invalid fields combine a graphite outline with associated explanatory text.

### Navigation

The desktop sidebar separates four main jobs. Selected entries use a secondary fill, hairline outline and bold text. Phone navigation opens from the menu button and provides a close action and backdrop. The drawer's short slide transition is removed when reduced motion is requested.

### Cards / Containers

Stock logs, order summaries and operation previews use rounded bounded surfaces. Desktop panels use 24px padding, with 20px mobile padding for the principal summaries. Catalog and sale listings use divided rows instead of enclosing every record in a card. Product photos retain a neutral placeholder when absent or unavailable.

### Sale List and Summary

A single searchable SKU list adds one unit directly to the cart. Each row shows the product identity, code, available quantity, price and an explicit add action; out-of-stock and fully selected products disable that action with explanatory text. The list uses compact local headings (18px/26px), 64px photos on desktop and 56px photos on phones. Selected quantities appear beside the product information.

A fixed cart footer shows distinct line count, total and the summary action, inset beside the desktop sidebar and spanning the phone viewport. Summary is a separate screen on every device. It contains quantity/removal controls, optional bill information and the explicit confirmation action; a return action opens the same product list. The phone summary keeps its total and confirmation control fixed at the bottom, with content clearance. Only confirmation changes stock. There is no staging selection dialog or second product picker embedded in summary.

### Product Add / Edit

Required fields have visible Thai cues. Submission errors are associated with the individual field using aria-invalid and aria-describedby; focus and scrolling reveal the first invalid field while preserving entered work. Unexpected save failures reveal the alert. Temporary sale-cart recovery uses the incumbent status message surface and does not add a saved-draft step.

The one-page form reuses the incumbent fields, photo control and ordinary action row. Name, optional color/size, unit, price, category and details stay together. The SKU code is required, entered manually and editable; current quantity remains read-only. Codes are checked for uniqueness against live and retained historical product records. A duplicate name/color/size identity presents the existing SKU code and an action to open it, retaining entered work. Recorded color, size and unit become read-only with a nearby explanation. Category is an individual SKU override; changing it does not recategorize sibling SKUs. Inline category creation is available in Inventory and the product form; a category created within the form becomes selected without clearing entered fields.

Inventory edit/delete actions target the individual SKU. Deletion requires confirmation and immediately removes the SKU from all working lists and live actions. Stocked or referenced SKUs retain inaccessible internal references for old bills and movements; there is no deactivation alternative or reactivation of deleted products. The include-inactive checkbox is absent. New entries start at zero and quantities change through Stock management. Upload-busy controls and unsaved-work protection preserve the form during navigation.

### Stock Operations

Receipt controls use stock-in green with the corresponding darker hover; stock-out controls use stock-out red with its darker hover. Labels, icons and preview quantities explain the operation alongside color. Signed positive and negative log headings use the same semantic colors. Stock-operation previews explain receipt, outflow or count consequences before saving. Standalone outflow remains in Stock management; the ordinary sale list does not offer a handwritten-sale mode.

### Bill Editing Context

Historical bill edits and new sales use isolated contexts. Editing labels identify the current bill and provide an explicit cancel-edit action from its product list and summary. Leaving changed revisions asks for an explicit discard decision. Confirming or discarding a revision restores the original new-sale cart; the original bill remains authoritative until revision confirmation. FLOW.md records the operating journey.

### Paper Bills

The traditional cash-sale document is an independent visual surface. Screen-only eBay rules do not restyle its drawing operations. SVG preview and PNG export share the 1000px-wide receipt layout with content-driven height. Print preserves the same composition; keep its dimensions, fonts, linework and wrapping intact. Do not turn the paper bill into an eBay panel.

## Do's and Don'ts

### Do:

- **Do** use the documented fallback families until a supplied Market Sans asset is available.
- **Do** preserve independent Inventory, Stock management, sale and bill-history menus.
- **Do** use explicit Thai operational labels and recorded units.
- **Do** keep focus visible and allow long product names and quantities to wrap.
- **Do** preserve the shared paper-bill SVG, PNG and print composition.

### Don't:

- **Don't** restore Balenciaga condensed fonts, tracked uppercase controls or the retired showcase.
- **Don't** add eBay branding or multicolor logo decoration to the shop interface.
- **Don't** change stock through catalog add/edit actions.
- **Don't** add mock products, prices, bills or movement logs to an empty workspace.
- **Don't** document future critique proposals as implemented behavior.
