# Inventory and stock management separation

Primary target: src/App.tsx. Mode: Operate. Platform: web, mobile first.

Confirmed latest request: Inventory manages product information (add/edit/delete); Stock management handles goods in/out and counts, with logs. These menus must not overlap. User selected Downloads/ebay.design.md for the replacement design system and the two supplied screenshots for sidebar/work-area organization. Existing sale/bill flow, quantities, units, prices, bill history, local photos and migrations remain authoritative. Paper-bill SVG/PNG/print layout remains intact.

## Direction contract

THESIS: Separate catalog administration from quantity operations. Inventory has edit/delete actions and read-only stock values; Stock management has receipt/deduction/count controls and no catalog editing. Selling remains its own menu.

OWN-WORLD: eBay graphite #191919 on white, cobalt #0968f6 primary actions, grey hairlines, 16px panels/photos, pill controls, 16px body/14px labels/24px headings. Market Sans assets were not supplied: use the reference Helvetica/Arial fallback stacks plus Thai support. No eBay wordmark or unrelated screenshot roles are added.

STORY: Choose a clearly named sidebar menu, find a product, then perform only that menu's job. Receipt adds quantities; stock-out subtracts without creating a bill; count records the actual total. Product deletion is confirmed; deleted products leave every working list immediately while inaccessible references keep history and bill cancellation valid.

FIRST VIEWPORT: White desktop sidebar with Inventory, Stock management, sale and bill history. Inventory work area has a heading/Add product, filter row and product table. Stock management has search, quantities and receipt/stock-out/count actions, plus transaction log column. Phone uses a menu toggle and stacked labeled rows, preserving all actions without page overflow.

FORM: User-pinned eBay system and screenshot-based menu separation; no seed selection replaces the pinned direction. Code-first for this Operate surface.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Implementation and verification

1. Test safe product deletion/deactivation and persistence before implementing.
2. Split catalog Inventory, quantity-only Stock management and sale product selection views; wire sidebar/mobile navigation and contextual operations.
3. Implement direct stock-out without invoice and keep logs/Undo and bill effects consistent.
4. Replace Balenciaga styles with eBay tokens and screenshot-based responsive layout.
5. Verify menu separation, deletion/history, stock operations and sale/export regressions; inspect phone/desktop together, independent finish review, document the final system.

## Approved cart and editing simplification — 2026-10-13

One sale product list with direct +1 actions, visible cart count/total and one summary route. Summary is a separate screen on all devices, with quantity/removal and explicit issue. No staging dialog, embedded second picker, or handwritten sale mode; standalone stock-out remains in Stock management. One-page product add/edit with a required manual code, duplicate name/color/size detection, zero opening stock, locked recorded identities, staged photo cleanup and unsaved-work protection. Inventory edits/deletes individual SKUs rather than whole models. eBay visual authority remains.

Final review: independent cart/edit review returned fix for shared category mutation. The per-SKU override and legacy fallback correction was verified with three unit regressions and a save/reload/filter browser scenario; verdict pass returned ship for that finding. Total verification:117 unit tests and32 browser scenarios, production build passed. See outputs/simple-flow-implementation.md.

Latest approved changes: inline category creation from Inventory/form, remove include-inactive checkbox, editable manual SKU codes, green receipt/red stock-out, immediate deletion from all working lists. Audit corrections separate new-cart and historic-edit contexts, guard discarding changed revisions, preserve new carts across confirmation/cancel, exclude deleted records from duplicate identity checks and improve empty-state routes. FLOW.md is the canonical operating journey.
