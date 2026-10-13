# Assessment B — independent detector and browser evidence

Target: src/App.tsx and src markup tree; current localhost app http://127.0.0.1:5173/. Read PRODUCT.md, DESIGN.md and FLOW.md. No Assessment A findings read. Ignore file absent (parent confirmed). Fresh native IAB tab created and closed. No source edits, data saves or record deletions.

## Deterministic scan
Ran bundled C:/Users/Fiatk/.agents/skills/impeccable/scripts/impeccable.cmd detect --json src. Full parseable output retained at outputs/current-critique-detector.json. Target is the src markup directory, not CSS-only. 43 findings: 3 warning, 40 advisory; six rules. Pipeline completed and emitted valid JSON; shell pipeline exit 0 reflects final output command, native detector exit was not separately recorded.

Rules: design-system-font-size 26; design-system-radius 13; bounce-easing 1; design-system-color 1; design-system-font 1; overused-font 1.
Files: balenciaga.css 18; catalog.css 6; critique.css 4; ebay.css 1; inventory.css 4; simple-stock.css 4; styles.css 6.

False-positive/context adjudication:
- All 18 balenciaga.css hits are historical unused surface signals, not current visible defects. src/main.tsx imports styles, catalog, simple-stock, inventory, critique, ebay; does not import balenciaga. No bounce observed in browser.
- overused-font at catalog.css:4 flags Arial. Arial/Helvetica with Noto Sans Thai are explicitly approved eBay fallback families. Do not recommend font replacement.
- design-system-font at styles.css:6 is Noto Serif Thai within retired .pitch h1. /pitch showcase is retired. Not current UI drift.
- Many base CSS radius/size hits are overridden by ebay.css, which loads last. Raw count is NOT a count of visible defects; do not flatten it into 43 user-facing problems.
- ebay.css:19 18px sale row title is an intentional scoped size recorded in DESIGN.md prose (Sale List and Summary). Frontmatter lacks the 18px step. Treat as machine-readable design documentation mismatch, not visual defect.
- catalog.css:6 tiny print-specific typography belongs to the independently preserved paper-bill surface; do not restyle to eBay solely to clear detector.

## Native browser coverage
1280x720 desktop: Inventory empty, Stock management empty and movement history, sale picker empty/cart footer, bill history empty, add-product form.
320x740 mobile: same four menu surfaces, add-product full form including bottom submit area, inline category creation (opened/cancelled), menu drawer. Confirmed clean Thai text, no observed horizontal overflow, drawer auto-closes and focuses page heading on navigation, category field receives focus, meaningful stock/sale empty-state navigation. Product form and stock mobile DOM measured document width 305px within viewport320px. No console warnings/errors returned by tab.dev.logs at end.

Most important reproducible browser issue: P1/P2 validation recovery in new product form (src/SimpleProductForm.tsx:24-34). At 320x740, clicked เพิ่มสินค้า with form blank. Error กรุณาระบุชื่อสินค้า ไม่เกิน 120 ตัวอักษร appeared at top while viewport remained scrolled to bottom submit actions. Read-only DOM evidence: scrollY=780; alert rect top=-591; focused element text เพิ่มสินค้า; zero elements with aria-invalid=true. User sees no visible reason for failure unless scrolling back up. role=alert supports announcement but does not solve visual recovery or identify invalid fields. Recommend focus/scroll to invalid input, aria-invalid and associated per-field error, plus required markers. This is live verified without saving data.

Other browser findings:
- P2 Inventory empty state says เพิ่มสินค้าใหม่ หรือเปลี่ยนคำค้นและประเภท and its local CTA is ล้างตัวกรอง even on a truly empty catalog. Primary add exists above, but bottom CTA has no effect for first-run user. Stock and Sale use useful ไป Inventory CTAs; Inventory should use เพิ่มสินค้า when truly empty. src/InventoryAdmin.tsx:15.
- P3 add-product h1 and h2 both เพิ่มสินค้า appear consecutively, consuming mobile space before the first field. src/App.tsx:572 and SimpleProductForm.tsx:29.
- P2/P3 menu names vary across instructions/visible labels/accessibility. Visible nav จัดการสต๊อก has accessible name Stock management, and instructions send users to Stock management although that exact visible label is absent. Inventory visible สินค้า (Inventory) is closer. Source App nav aria-label and Stock/Sale copy confirm mismatch. This increases recognition effort and is relevant to label-in-name accessibility. Preserve separated menus but use consistent Thai visible names and accessible names.

## Source-only observations and coverage limits
Populated SKU detail/edit/delete, stock receipt/out/count, populated sale summary, issued bill preview/zoom, revision/cancellation and export were NOT exercised in B native browser. No false claim of full browser workflow coverage. Native browser exposes read-only evaluate and no isolated-context/fixture API; therefore no localStorage seeding or existing user records changed. Parent separately assigned populated fixture coverage to A; its results must remain separate until synthesis. Source inspected these reachable surfaces via App, SimpleProductForm, StockOperation, SaleProducts, InventoryAdmin, StockManagement, CategoryAdder.

Source-only candidate: SimpleProductForm.tsx:40 still renders เปิดใช้งานสินค้า checkbox on edit and saves active. This contradicts current PRODUCT/DESIGN removal of deactivation alternative; can hide an SKU from stock/sale without deleting it. InventoryAdmin includes inactive records and labels them ปิดใช้งาน. Treat as source-proven current branch presence but not B browser-reproduced populated flow.

Source-only strengths: StockOperation differentiates receipt/out/count in text and signed preview with associated invalid error; SaleProducts shows depleted/full selection reason and aria-live cart totals; bill history has search/status filtering; bill preview offers image/print, revision history and warns manually sent images do not update. Paper appearance preserved independent of screen eBay styling.

## Overlay and cleanup
Native API documentation says evaluate is read-only. Mutable title/script preflight unavailable by contract; no unsupported injection attempted. Consequently no live detector server started, no browser overlay or console detector claims, and no [Human] presentation. Fallback signal = CLI scan plus native screenshots/AX and read-only DOM evidence. Browser remained hidden. Browser viewport override reset, fresh B tab closed. Parent-owned preexisting Vite5173 untouched. No temporary browser script or fixture file created. Retain report and detector JSON as requested artifacts; no test/source files modified.

## Complete detector location ledger

- balenciaga.css:20 | bounce-easing | cubic-bezier(.65, -.55, .25, 1.5)
- balenciaga.css:34 | design-system-radius | border-radius: 4px is outside the DESIGN.md rounded scale
- balenciaga.css:52 | design-system-radius | border-radius: 4px is outside the DESIGN.md rounded scale
- balenciaga.css:69 | design-system-font-size | font-size: 22px is off the DESIGN.md type ramp
- balenciaga.css:98 | design-system-radius | border-radius: 4px is outside the DESIGN.md rounded scale
- balenciaga.css:144 | design-system-radius | border-radius: 4px is outside the DESIGN.md rounded scale
- balenciaga.css:150 | design-system-radius | border-radius: 4px is outside the DESIGN.md rounded scale
- balenciaga.css:154 | design-system-radius | border-radius: 2px is outside the DESIGN.md rounded scale
- balenciaga.css:155 | design-system-font-size | font-size: 22px is off the DESIGN.md type ramp
- balenciaga.css:165 | design-system-radius | border-radius: 4px is outside the DESIGN.md rounded scale
- balenciaga.css:166 | design-system-color | Undocumented color rgb(170 170 172 / .5) is outside DESIGN.md colors
- balenciaga.css:173 | design-system-font-size | font-size: 22px is off the DESIGN.md type ramp
- balenciaga.css:219 | design-system-radius | border-radius: 4px is outside the DESIGN.md rounded scale
- balenciaga.css:223 | design-system-font-size | font-size: 22px is off the DESIGN.md type ramp
- balenciaga.css:233 | design-system-font-size | font-size: 22px is off the DESIGN.md type ramp
- balenciaga.css:234 | design-system-radius | border-radius: 4px is outside the DESIGN.md rounded scale
- balenciaga.css:262 | design-system-font-size | font-size: 22px is off the DESIGN.md type ramp
- balenciaga.css:275 | design-system-radius | border-radius: 4px is outside the DESIGN.md rounded scale
- catalog.css:4 | overused-font | font-family:Arial
- catalog.css:1 | design-system-radius | border-radius: 8px is outside the DESIGN.md rounded scale
- catalog.css:1 | design-system-font-size | font-size: 18px is off the DESIGN.md type ramp
- catalog.css:5 | design-system-font-size | font-size: 18px is off the DESIGN.md type ramp
- catalog.css:6 | design-system-font-size | font-size: 10px is off the DESIGN.md type ramp
- catalog.css:6 | design-system-font-size | font-size: 9px is off the DESIGN.md type ramp
- critique.css:1 | design-system-font-size | font-size: 18px is off the DESIGN.md type ramp
- critique.css:6 | design-system-font-size | font-size: 18px is off the DESIGN.md type ramp
- critique.css:9 | design-system-font-size | font-size: 18px is off the DESIGN.md type ramp
- critique.css:22 | design-system-font-size | font-size: 18px is off the DESIGN.md type ramp
- ebay.css:19 | design-system-font-size | font-size: 18px is off the DESIGN.md type ramp
- inventory.css:1 | design-system-font-size | font-size: 18px is off the DESIGN.md type ramp
- inventory.css:2 | design-system-radius | border-radius: 8px is outside the DESIGN.md rounded scale
- inventory.css:2 | design-system-font-size | font-size: 32px is off the DESIGN.md type ramp
- inventory.css:5 | design-system-font-size | font-size: 18px is off the DESIGN.md type ramp
- simple-stock.css:1 | design-system-font-size | font-size: 18px is off the DESIGN.md type ramp
- simple-stock.css:1 | design-system-font-size | font-size: 48px is off the DESIGN.md type ramp
- simple-stock.css:1 | design-system-font-size | font-size: 32px is off the DESIGN.md type ramp
- simple-stock.css:1 | design-system-font-size | font-size: 22px is off the DESIGN.md type ramp
- styles.css:1 | design-system-font-size | font-size: 18px is off the DESIGN.md type ramp
- styles.css:3 | design-system-font-size | font-size: 32px is off the DESIGN.md type ramp
- styles.css:4 | design-system-radius | border-radius: 8px is outside the DESIGN.md rounded scale
- styles.css:4 | design-system-font-size | font-size: 18px is off the DESIGN.md type ramp
- styles.css:6 | design-system-font | font-family: Noto Serif Thai is not declared in DESIGN.md typography
- styles.css:7 | design-system-font-size | font-size: 18px is off the DESIGN.md type ramp
