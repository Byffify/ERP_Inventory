# Menu separation and empty startup — 13 October 2026

Completed from the user's eBay reference and two sidebar examples:

- Inventory adds/edits/removes product information. Quantities are read-only. New products start at0; receiving is exclusively Stock management.
- Stock management receives, deducts without invoice, and records actual counts. Every change appears in logs; stock-out supports Undo.
- Sale and bill history remain separate menus. The sale/edit simplification requested in the later critique is recommended in `.impeccable/critique/2026-10-13T07-35-19Z__src-app-tsx.md`, not implemented in this report.
- Unused zero-stock models can be permanently removed after confirmation; used/stocked models explicitly offer deactivation, preserving invoice/quantity history.
- Desktop sidebar and mobile focused drawer match the requested organization. System tokens and sidecar now document eBay rather than Balenciaga.
- User confirmed all browser data was disposable trial data. One-time reset removes old snapshot/backup and clears old photos; next startup is empty. Future user data persists. No example records, retired pitch screen, or demonstration PNG ship in the application; fictional fixtures remain in isolated tests.

Verification: 87 unit tests across9files; catalog14, bill13, prior critique8, product-first9, menu separation10 browser cases passed. Fresh empty-start browser test also passed and confirms new user entries survive reload. Total55browsercases. Build and type checking passed. No backend/multi-device synchronization was added.

Independent menu finish review returned ship after table/stock-column and closed-mobile-sidebar corrections. The later critique reviewed cart/edit complexity independently and records5priority recommendations; it is not a whole-app shipping verdict.

Proof of empty production startup: outputs/empty-system.png and live native browser confirmed no product rows. Populated QA screenshots come from test-only browser profiles.
