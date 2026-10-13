# Inventory redesign — 13 October 2026

User approved the supplied Balenciaga design system directly and product-first inventory lookup/sale flow. Reference archived at `.impeccable/references/balenciaga.design.md`.

## Shipped flow

- One model groups its color/size quantities. Search and category/availability filtering scope the variants shown; no repeated model cards for each SKU.
- Select a model, enter variant quantities in one native dialog, see the remaining stock, and add the selection to the current order. Stock changes only at confirmation.
- Existing order remains accessible from the navigation and sticky order banner while looking up additional models.
- Receiving adds a quantity. Physical count sets the counted total (zero allowed) through an auditable difference movement. Both preview the resulting stock.
- Handwritten-sale mode deducts all selected goods together without issuing a duplicate invoice; Undo reverses the whole batch.
- New products without variants can be saved on one page. Advanced variant setup and optional document information remain available. Dirty catalog protection and staged photos/categories remain intact.
- Existing bill revision/cancellation and SVG/PNG/print layout remain supported. Local stock records, photos and migration keys were preserved.

## Design

White operational surfaces and black ink, compact typography and controls, 0–4px corners, flat model rows, grey elevation only for dialogs. Values follow the user's supplied reference. BB proprietary font assets were not supplied; its documented Helvetica/Arial fallbacks plus the available Thai fallback are used. This is a reference-inspired system implementation, not a supplied proprietary font reproduction.

## Validation

- 80 unit tests passed across 7 files, including counted-stock idempotency, zero, validation and reload integrity.
- 44 browser scenarios passed: redesign9, bill lifecycle13, catalog/photos/export14, prior critique protections8.
- Checked 320/390/768/1280px, plus existing 360px, landscape and 200% text cases. No overflow or runtime errors in completed suites.
- PNG/PDF export, photo persistence/cleanup, legacy-draft migration, failed storage writes and Undo retry passed.
- Independent finish review found an order-banner sticky-position issue; corrected and retested at320/1280. Reviewer marked it resolved and returned ship for the reviewed scope.
- Browser tests used isolated profiles and fictional records. No real-user usability test or physical-device test was performed.

Screenshots: `redesign-stock-320.png`, `redesign-stock-1280.png`, `redesign-selection-320.png`, `redesign-order-320.png`, `redesign-order-banner-320.png`, `redesign-bill-320.png`.

Run with the local server active: `npm.cmd run test:redesign`, `npm.cmd run test:browser`, `npm.cmd run test:catalog`, `npm.cmd run test:critique`.
