# Cart and product editing simplification

Implemented the approved follow-up to `.impeccable/critique/2026-10-13T07-35-19Z__src-app-tsx.md`.

- One sale list adds an explicit name/color/size to the cart with one click. Repeated clicks increment the same line. The intermediate selection dialog and duplicate in-editor picker are no longer used by App.
- Desktop and phone use a separate summary screen for quantities, removal, optional prices/document details, total and confirmation. Phone keeps the total and confirmation accessible at the bottom.
- Product add/edit use one form and one save action. Normalized name/color/size identifies one code; duplicate submissions point to the existing product. New stock starts at zero.
- Inventory edits, archives or deletes one SKU at a time, preserving sibling records, stock and invoice history. Stock management owns all quantity operations.
- Each SKU stores its own category override, with shared-model fallback for legacy records; saving one SKU does not reclassify siblings.
- Production startup remains empty. The existing one-time trial-data reset marker is unchanged; subsequently entered data survives reload. Test fixtures exist only in isolated browser contexts.

Validation: 117 unit tests, production build, 13 transaction/export browser scenarios, 10 menu/stock scenarios, 8 cart/form scenarios and one empty-startup persistence scenario passed. Browser checks include phone/desktop overflow and axe on the changed surfaces. Detector target App returned no findings. Evidence: `S4-browser-results.json`, `menu-separation-results.json`, `simple-flow-results.json`, `empty-startup-results.json`.

Independent finish review approved the visual workflow. One material finding—category changes affecting siblings—was corrected; the reviewer scored this finding resolved and returned `disposition: ship`. This verdict applies to the reviewed cart/product surfaces and the category correction, not a fresh whole-app heuristic score. The original critique score is historical.

The app still stores records locally in one browser origin; no backend or multi-device synchronization was introduced. The draft cart stays in the current session until issue; refreshing an unissued cart does not persist it.
