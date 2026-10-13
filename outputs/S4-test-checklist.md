# S4 — ผลตรวจจริง
**Inventory layout ล่าสุด:** domain suite **74 passed**; browserเดิม13 + catalog14 + inventory4 = **31 scenariosผ่าน** รายละเอียด S4-inventory-layout.md และ S4-inventory-results.json ตัวกรองประเภทแยกสถานะต่อSKU ขายจนหมด/undo/รับเข้าทำสถานะถูกต้อง ช่องจำนวนfocusและปุ่มหมดdisabled ตรวจ mobile/desktop/zoomแล้ว

## ผลล่าสุดหลังขยายรูป/SKU และปรับสต๊อกกับบิล
คำสั่ง `npm.cmd test`: **71 tests ผ่าน** (stock/storage/catalog/migration/bill/deduction/receipt layout)
คำสั่ง `npm.cmd run test:browser`: **13 scenarios ผ่าน**
คำสั่ง `npm.cmd run test:catalog`: **14 scenarios ผ่าน**
รวม browser scenarios **27**; ไม่มี page runtime errors ในรายงานทั้งสองชุด
TypeScript และ production build ผ่าน โค้ดพิมพ์แยกโหลดเมื่อใช้เพื่อลดขนาดโหลดแรก

เพิ่มเติมที่ตรวจจริง: สร้างเฉพาะชุดสี/ไซซ์ที่เลือก, รูปหลัก/รูปเฉพาะและ fallback หลังรีโหลด, ปฏิเสธไฟล์เสีย/ชนิดผิด, รูปที่ยกเลิกถูกล้าง, ลบ SKU ขณะ upload ไม่ค้าง, ปิด SKU/ล็อก identity, ย้าย legacy draft พร้อมbackup, เขียนรูป/metadataล้มเหลวไม่ทับข้อมูลเดิม, ขายหน้าเดียวไม่สร้างร่างใหม่, manual deduction ไม่สร้างบิลและundoครั้งเดียว, shortageไม่ทำยอดติดลบ, undoไม่หายเมื่อรายการถัดไป/การบันทึกล้มเหลว

ตรวจ responsive 320/360/390/768/1280px แนวนอน ข้อความ200% ชื่อและจำนวนยาว ใน Chrome headless ผ่าน Playwright; ไม่ใช่มือถือจริง
บิลบนจอและ PNG ใช้ shared receipt layout ตรวจข้อความไม่ออกนอกภาพและชื่อร้านยาวไม่โดนหัวบิลทับ เปิดภาพตรวจแบบฟอร์มขาว–ดำเทียบ reference; ไม่ใช้กรอบโปสเตอร์
PDF ที่สร้างจากหน้าพิมพ์ตรวจด้วย Poppler: A5 **1 หน้า**; เปิดภาพ render ตรวจภาษาไทยและตาราง
axe A/AA ในหน้าที่ตรวจไม่พบ violations; detector ของ StockCards/simple-stock/CashReceipt/receipt-layout ไม่พบ findings ส่วน Arial warning ของ CSS เดิมยอมรับตามฟอนต์ fallback ที่ briefกำหนด

**ยังไม่ได้ตรวจ:** มือถือจริง/แป้นพิมพ์จริง/เครื่องพิมพ์จริง/ส่ง LINE จริง/ผู้ใช้ร้านและกลุ่ม40+/เวลาพูด25วินาที ไม่มีการรับรอง production, multi-device หรือเอกสารภาษี

ผลรอบแรกด้านล่างเก็บเป็นประวัติ ไม่ใช่จำนวนทดสอบล่าสุด และรายการ UI “ร่าง/ตรวจแยก” ถูกแทนด้วย flow ใหม่ตามคำขอ

วันที่ตรวจ: 13 ตุลาคม 2026 (Asia/Bangkok) เป็นวันทำงาน ไม่ใช่วันสัมภาษณ์

## Automated domain/storage — 36 passed
คำสั่ง: `npm.cmd test` / Vitest 5.0.4

| กลุ่ม | ผลที่ตรวจ | สถานะ |
|---|---|---|
| ยอดตั้งต้น | A 12 แพ็ก B 20 ชิ้น C 0 แพ็ก | ผ่าน |
| รับเข้า | +5 แพ็ก → 17; ID ซ้ำไม่เพิ่มซ้ำ | ผ่าน |
| ร่าง | คงเหลือ 12 ไม่จองหรือตัด | ผ่าน |
| ยืนยัน | ขาย 3 → 9; บิล 540 บาท | ผ่าน |
| ยืนยันซ้ำ | Serialize/reload แล้ว confirm ซ้ำยัง 9 | ผ่าน |
| แก้เพิ่ม/ลด | ขาย 3→4 เหลือ 8 บิล720; 3→2 เหลือ10 บิล360 | ผ่าน |
| เปลี่ยน SKU | คืนแพ็กเดิม ตัดชิ้นแยกกัน ไม่แปลงหน่วย | ผ่าน |
| ยกเลิก | คืนฉบับล่าสุด 4 แพ็ก; ยกเลิกซ้ำไม่คืนเพิ่ม | ผ่าน |
| สินค้าไม่พอ | ทั้งบิล/การแก้ล้มเหลวโดยไม่มี partial mutation | ผ่าน |
| Revision เก่า | ปฏิเสธ retry จากรุ่นที่เปลี่ยนแล้ว | ผ่าน |
| สถานะบิล | ไม่แก้ confirmed ผ่าน saveDraft; ไม่ revise cancelled | ผ่าน |
| จำนวน | ปฏิเสธ 0/ติดลบ/ทศนิยม/NaN/Infinity | ผ่าน |
| SKU ซ้ำ | รวมเมื่อราคาเดียวกัน; ปฏิเสธราคาขัดกัน | ผ่าน |
| เงิน | จำนวนเต็มสตางค์; หลาย SKU รวม661.75; parse ราคาและปฏิเสธรูปแบบผิด | ผ่าน |
| บันทึกล้มเหลว | Snapshot เดิมยังอยู่และไม่รายงานสำเร็จ | ผ่าน |
| ข้อมูลเสียหาย | ปฏิเสธ JSON ผิด/ยอดติดลบ/รับเข้าติดลบ/ตัดยอดไม่มีบิลต้นทาง | ผ่าน |
| แท็บเก่า | ไม่เขียนทับ snapshot ที่เปลี่ยนแล้ว | ผ่าน; ไม่ใช่การรับรอง multi-tab transaction |

## Browser — 13 scenarios passed
คำสั่ง: `npm.cmd run test:browser` / Chrome headless ผ่าน Playwright
รายละเอียดเวลาและผลจริง: S4-browser-results.json

ตรวจหน้าสินค้า ทำบิล ตรวจรายการ และบิลที่ยืนยันที่ 320/360/390/768/1280px ไม่มี horizontal page overflow; landscape 844×390; viewport เตี้ยจำลองพื้นที่แป้นพิมพ์; ข้อความ200%; ชื่อยาว; จำนวนมาก
ตรวจฟอนต์ไทยโหลดจาก local assets และสี Ink; ตรวจด้วย axe WCAG A/AA ในหน้าสินค้า editor review bill error และ dialog ไม่พบ violations ในรอบที่ตรวจ
ตรวจ draft→confirm→reload; แก้/ประวัติ/ยกเลิก; รับเข้าก่อน–หลังยืนยัน; ของไม่พอหลายSKU; error inline; quota failure; PNG failure/retry; corrupt data/reset confirmation
ดาวน์โหลด PNG จริงและตรวจ signature/ชื่อไฟล์ ตรวจว่าไม่เปลี่ยน storage ระหว่าง export
ไม่มี runtime page errors ใน 13 scenarios

## Visual inspection
เปิดดูภาพมือถือ390px คอมพิวเตอร์1280px บิลจริง และ S4 1600×900 ภาษาไทยอ่านครบ ภาพบิลมีจำนวน หน่วย ราคา ยอดรวม และข้อกำกับจำลอง
Mechanical design detector: ไม่พบ findings จาก App.tsx/styles.css

## ยังไม่ได้ตรวจ / ข้อจำกัด
- ไม่มีโทรศัพท์จริงให้ตรวจ; viewport/hasTouch ไม่เท่ากับ physical device
- แป้นพิมพ์มือถือจริงและ safe area บนอุปกรณ์จริงยังไม่ตรวจ; ตรวจเฉพาะ viewport จำลองและ CSS
- ยังไม่ส่งไฟล์เข้า LINE จริง ไม่มี LINE API
- ยังไม่จับเวลาคนพูดสคริปต์หรือสาธิตสด 25 วินาที
- ยังไม่ทดสอบกับร้าน จึงไม่ยืนยันใช้ง่าย/ลดเวลา/เพิ่มรายได้/การยอมจ่าย
- ไม่มีข้อมูลร้านจริง การสำรอง production หรือหลายผู้ใช้พร้อมกัน
- axe เป็นการตรวจอัตโนมัติ ไม่ใช่การรับรอง accessibility ทุกกรณี
