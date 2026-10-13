# Product administration and complete operating-flow review

Implemented the user's category/manual-code/color/delete request on 2026-10-13.

- Inline category creation in Inventory and the product form. Explicit save/cancel, duplicate-name validation, automatic selection of a newly created category in the form, and retained product inputs.
- Removed the include-inactive checkbox. Manual product codes are required, editable, trimmed and unique against other current or retained deleted records. Former code aliases after an edit are not separately reserved.
- Receipt actions are green `#067d62`; stock-out actions are red `#c4003a`. Hover colors, labels/icons and directional log text accompany the colors.
- Delete confirms the selected identity and quantity, then removes it from Inventory, stock operations and sale selection. Unused zero-stock records are removed completely. Stocked/referenced records retain inaccessible internal references so old bills, revisions, cancellations and stock history remain coherent. Deletion is not an alternative deactivation action; deleted IDs cannot reopen or reactivate.
- Full flow review found and corrected new-cart/historic-edit context mixing. Invoice editing retains the current new cart; confirmation or cancel restores it. Changed invoice edits prompt before discard. All sale-entry actions use the same new-cart route. Removed pending-cart items are also pruned from the retained new cart.
- Deleted identities do not block adding a new live SKU with a different manual code. All-deleted or empty sale/stock lists provide an Inventory entry action; filtered results provide clear-filter actions.

Canonical operating flow and exceptions are recorded in `FLOW.md`. Invoice sales deduct stock on issue; standalone stock-out must not be used again for the same invoiced sale.

Validation: 128 unit tests; 13 invoice/storage/export browser scenarios; eight cart/form scenarios; ten menu/stock scenarios; one empty-startup persistence scenario; seven new administration/context scenarios; production build passed. Screenshots use isolated fixtures and do not add production mock data. Evidence: `admin-flow-results.json`, `simple-flow-results.json`, `S4-browser-results.json`, `menu-separation-results.json`, `empty-startup-results.json`.

Independent finish reviewer returned `disposition: ship` for the changed surfaces and flow corrections. Six administration/stock/form captures and four sale captures at 320px/1280px were reviewed. The review was read-only source/image review supported by reported browser regressions, not measured real-shop usability research.

One bounded detector pass found 47 advisory findings and two warnings. The warnings concern the incumbent Arial receipt fallback and Noto Serif Thai paper-bill typography; the supplied eBay screen system and separate paper-document surface explain these differences. No unrelated typography replacement was made. DESIGN.md and its sidecar now document the approved semantic colors and behaviors.

Product and confirmed-bill data remain local to the browser origin. The unissued cart persists between routes in the session, not across a page refresh. No backend or multi-device synchronization was added.
