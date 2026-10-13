# Design authority — supplied brief
Mode: Operate. Preserve supplied editorial monochrome system; no new brand.
Canvas #faf9f5; ink #141413; inverse #000000; secondary #f0eee6; warm #e3dacc; muted #5e5d59; hairline #d1cfc5.
No shadows, gradients, glow, 3D, chromatic accents or Anthropic wordmark.
Noto Sans Thai for operations, 18px body and 24px page headings. Noto Serif Thai regular for S4 editorial heading; Georgia English serif, Arial English sans, JetBrains Mono only short English metadata. Self-host through fontsource dependencies.
Spacing 4/8/12/16/24/32/48/96px. Buttons 16px radius, inputs 8px, surfaces 16px. Minimum interactive target 48px.
Mobile single column below 768px, two columns from 768px, content maximum 1152px from 1024px. Horizontal gutters 16/24/32px. No page overflow at 320px. Rows separated by hairlines, no card grid.
S4: 16:9 true-black background, ivory text; 40pt heading, 26pt body, 16pt note; one authentic mobile screenshot, no device frame.

Latest user override: Stock uses cards for each SKU, with clearly visible quantity, image, unit, direct receipt/deduction controls and Undo. This explicitly overrides the earlier row-only stock composition. Maintain cream surfaces, warm hairline borders, radius16, no shadows/gradients, Thai18px operations and 48px+ targets.
Latest cash-bill reference: paper white, slate/black ink, grey form blocks, book/number corners, central shop block, CASH SALE band, bilingual form labels, 4-column grid with12 baseline rows, total and collector. Shared drawing operations power SVG preview and PNG; no promotional image frame. Arial is the brief's pinned English sans fallback, so the detector's overused-font warning is intentionally accepted.
Sale confirmation stays in the order summary. Remove the bottom total/action bar and simulation/limit footer banners as explicitly requested.

Inventory layout refinement from supplied reference: compact recognition block (photo/code/name/optional color-size/type), quantity+availability, then receipt/manual-deduction actions. Optional quantity editor replaces actions when invoked, preserving focus order and48px targets. SKU status is available/empty from recorded quantity; category/type filter is separate. Status badges use monochrome/neutral surfaces and text, never red/yellow/green semantics. No low-stock threshold or location is invented. Mobile1column, tablet2columns, wide3columns;16px mobile card padding and24px wide padding;32px quantity,20px title,18px units/actions.
