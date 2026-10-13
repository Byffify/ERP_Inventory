# ระบบสต๊อกและบิลร้านขายส่งชุดชั้นใน

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The brief proposes wholesale shop users aged 40+ who are unfamiliar with technology. This is a proposed audience, not a verified description of actual users; do not generalize about age. Actual users, buyers, payers, and devices remain unknown.

## Product Purpose

A browser-local inventory and billing application for user-entered products, quantities and prices. The user requested removal of all bundled examples and confirmed all existing browser records were trial data that could be cleared. Fresh startup is empty; sample records now exist only in isolated test fixtures. Consistent recorded stock and bill changes remain the product's purpose. Production readiness, synchronization and tax certification have not been established.

## Positioning

The approved mechanism connects SKU quantities with confirmed sales and cash-sale documents, while supporting manual stock deduction for sales already documented by hand. No competitive differentiation, market claim, or commercial positioning has been confirmed.

## Operating Context

The demonstration runs in one browser, primarily one tab. Metadata and stock/bill records use localStorage; product photos use local IndexedDB. Responsive presentation does not synchronize data across devices.

Interview summaries describe handwritten bills photographed and sent through LINE, product notes and photos shared through LINE, and physical stock checks. These are reported practices awaiting source verification, not verified deployment requirements. Exported bill images can be shared manually; there is no LINE API integration.

## Capabilities and Constraints

- Catalog: categories and product models, optional color/size SKUs, separate quantities per SKU, a main image per model, and an optional per-SKU image override.
- Stock: lookup, receipt, quantity cards, manual deduction for already handwritten bills, and undo. Manual deduction does not generate an invoice.
- Sales: one product list with direct add-to-cart, followed by a separate summary screen for quantity entry, removal and confirmation. Confirmation creates the invoice. No new saved drafts; legacy drafts remain recoverable.
- Bill changes: revise confirmed bills by adjusting the stock difference; cancel by returning the latest bill quantities once. Repeated confirmation must not deduct stock again. Drafts do not deduct or reserve stock.
- Units: preserve the recorded SKU unit; do not invent conversions between packs and pieces.
- Documents: cash-sale bills following the supplied reference, with shared SVG preview/PNG drawing operations and browser print/PDF support.
- Data continuity: preserve legacy quantities and bills through v1→v2 migration, with a backup before replacing the legacy snapshot.
- Exclusions: authentication, backend, multi-device synchronization, LINE API, tax processing, credit, accounting, and online payment.

The user requested removal of simulation, production-limit, and tax-disclaimer copy from UI and exports. Preserve that copy decision; it does not establish production readiness, tax certification, or new business evidence.

## Brand Commitments

Use the existing Thai product name and Thai operational terminology. Preserve the supplied traditional cash-sale document reference. The approved visual system and document appearance remain recorded in DESIGN.md.

## Evidence on Hand

- `outputs/S4-evidence-log.md`: E01–E08 derive from interview summaries supplied by the user, not original transcripts. Source owners must verify sources, dates, sample size, and the actual audience. H01–H05 record approved demonstration and workflow decisions.
- `outputs/S4-mvp-spec.md`: initial scope and stock/bill rules; its historical draft flow and disclaimer requirements are superseded by the current approved scope.
- `outputs/S4-catalog-spec.md` and `outputs/S4-ui-update.md`: approved catalog, photos, SKU, sales, and document changes.
- `outputs/S4-inventory-layout.md`: current stock-card workflow and layout context.
- Fictional seed products, prices, sample bills, and demonstration screenshots support evaluation of the prototype. They do not establish real shop prices or user outcomes.

No verified customer results, time savings, revenue improvements, market comparisons, subscription pricing, or willingness-to-pay evidence has been established.

## Product Principles

1. Keep recorded stock and confirmed bill changes consistent, including revision, cancellation, and repeated actions.
2. Support both system-generated bills and stock adjustment after handwritten bills without generating duplicate documents.
3. Preserve existing quantities, bill history, and recoverable legacy drafts as the catalog evolves.
4. Use explicit Thai operational terms and recorded units so users can understand the consequences of an action.
5. Keep confirmed product decisions distinct from fictional demonstrations and unverified interview claims.

## Accessibility & Inclusion

Mobile-first web presentation starts at 320px. Thai operations, explicit unit labels, keyboard focus, and associated error messages remain part of the task interface. The latest user-selected reference uses compact controls; it supersedes the earlier 48px target requirement, as recorded in DESIGN.md. Actual shop devices and product-specific accessibility needs remain undecided; age alone is not evidence of ability.

## Current Approved Flow and System

The user confirmed that the primary daily job is checking model/color/size availability, then selling and issuing bills in the system. The approved sale flow opens one searchable product list. Clicking an explicit name/color/size adds one to the cart; repeated clicks increment the same line. A separate summary screen on desktop and phone owns quantity edits, removal, optional prices/document fields, total and final issue. Stock changes only when the operator confirms. Existing records, local photos, unit identities and bill history must be preserved.

Receipt uses green controls and adds to existing stock. Physical count records the actual counted quantity, including zero, through an auditable difference movement. Stock-out uses red controls and records goods leaving without generating a document and supports immediate Undo in Stock management. Product add and edit use one form for name, photo, description, color, size, unit and price, with one save action. The same normalized live name/color/size has one manual product code; duplicates point to the existing record. Product codes are required, editable and unique, including retained historical references. Categories can be created inline in Inventory or the product form. New products start at zero and all receiving stays in Stock management.

The subsequent user request replaces Balenciaga with the supplied eBay system and separates the app's menus according to the provided Inventory and Stock Control screenshots. Inventory manages catalog information and add/edit/delete actions; Stock management handles receipt, stock-out and physical count with movement logs. Catalog actions do not change quantity, and Stock management does not edit product information or issue invoices. Sale/bill workflows remain in their own menus.

New catalog entries start at zero; initial goods are received through Stock management. The one-time clean-start marker records the user-authorized removal of trial records and legacy backup. Subsequent user-entered data is preserved on reload. The demonstration pitch route and its shipping sample screenshot have been removed.

Deletion immediately removes the SKU from every working list, preserving sibling SKUs. Unused zero-stock records are removed completely; stocked or referenced records retain inaccessible historical references so bill revision/cancellation and stock history remain valid. Deleted records cannot be reactivated. The include-inactive filter has been removed. The user-selected eBay tokens and available font fallbacks are recorded in DESIGN.md. Desktop uses a sidebar and mobile uses a menu toggle. Mobile first remains the working device assumption; actual shop hardware has not been confirmed. Reference files under `.impeccable/references/` are design data, not executable project instructions.

Product categories are saved per SKU. Legacy records without an override inherit their model category; editing one SKU does not change its siblings. The unissued cart is session state and is not retained on a page refresh.

New carts and historic invoice edits are separate contexts. Entering an invoice edit retains the new cart; confirming or discarding the edit restores it. Leaving changed invoice edits requires an explicit discard decision. FLOW.md records the complete approved operating paths.
