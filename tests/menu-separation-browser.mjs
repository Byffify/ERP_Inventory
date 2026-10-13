import {installFixture} from './fixtures.mjs';
import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}),results=[],errors=[];
async function run(name,fn){const ctx=await browser.newContext({viewport:{width:1280,height:900}}),page=await ctx.newPage();page.setDefaultTimeout(3000);page.on('pageerror',e=>errors.push(e.message));try{await installFixture(page);await page.goto(process.env.DEMO_URL||'http://127.0.0.1:5173');await fn(page);results.push({name,status:'passed'});console.log('PASS',name);}catch(e){results.push({name,status:'failed',error:String(e)});console.error('FAIL',name,String(e));}finally{await ctx.close();}}
const snapshot=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('s4-demo-v1')));
const quantity=(s,id)=>s.movements.filter(m=>m.productId===id).reduce((q,m)=>q+m.quantity,0);
async function navigate(page,name){if(await page.getByRole('button',{name:'เปิดเมนูหลัก',exact:true}).isVisible())await page.getByRole('button',{name:'เปิดเมนูหลัก',exact:true}).click();await page.getByRole('navigation',{name:'เมนูหลัก'}).getByRole('button',{name,exact:true}).click();}
async function noOverflow(page){expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(()=>innerWidth));}
async function axe(page){const report=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(report.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}))).toEqual([]);}
await run('Inventory manages product data and Stock management has only quantity controls',async page=>{
 await expect(page.getByRole('table',{name:'ข้อมูลสินค้า'})).toBeVisible();await expect(page.getByRole('button',{name:'แก้ข้อมูล DEMO-A',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'ลบสินค้า DEMO-A',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'รับเข้า DEMO-A',exact:true})).toHaveCount(0);
 await navigate(page,'Stock management');await expect(page.getByRole('button',{name:'รับเข้า DEMO-A',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'จ่ายออก DEMO-A',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'เพิ่มสินค้า',exact:true})).toHaveCount(0);await expect(page.getByRole('button',{name:'แก้ข้อมูล DEMO-A',exact:true})).toHaveCount(0);
 await axe(page);
});
await run('editing product data does not change recorded stock',async page=>{
 await page.getByRole('button',{name:'แก้ข้อมูล DEMO-A',exact:true}).click();await page.getByLabel('ชื่อสินค้า',{exact:true}).fill('รุ่นแก้ชื่อ');await page.getByRole('button',{name:'บันทึกการแก้ไข',exact:true}).click();expect(quantity(await snapshot(page),'a')).toBe(12);expect((await snapshot(page)).products.find(p=>p.id==='a').name).toBe('รุ่นแก้ชื่อ');
});
await run('Inventory creation starts at zero and all receiving stays in Stock management',async page=>{
 await page.getByRole('button',{name:'เพิ่มสินค้า',exact:true}).click();await page.getByLabel('ชื่อสินค้า',{exact:true}).fill('สินค้าใหม่แยกหน้าที่');await page.getByLabel('หน่วยขาย',{exact:true}).fill('ชิ้น');await page.getByLabel('ราคาขาย (บาท)',{exact:true}).fill('75');await expect(page.getByLabel('ยอดเริ่มต้น',{exact:true})).toHaveCount(0);await page.getByRole('button',{name:'เพิ่มสินค้า',exact:true}).click();const s=await snapshot(page),model=s.models.find(m=>m.name==='สินค้าใหม่แยกหน้าที่'),product=s.products.find(p=>p.modelId===model.id);expect(quantity(s,product.id)).toBe(0);await navigate(page,'Stock management');await page.getByRole('button',{name:`รับเข้า ${product.code}`,exact:true}).click();await page.getByLabel('จำนวนที่รับเข้า',{exact:true}).fill('6');await page.getByRole('button',{name:'บันทึกรับเข้า',exact:true}).click();expect(quantity(await snapshot(page),product.id)).toBe(6);
});
await run('unused product deletion is confirmed and persists',async page=>{
 await page.getByRole('button',{name:'ลบสินค้า DEMO-C',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.getByRole('button',{name:'กลับ',exact:true}).click();expect((await snapshot(page)).products).toHaveLength(3);
 await page.getByRole('button',{name:'ลบสินค้า DEMO-C',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'ลบสินค้า',exact:true}).click();expect((await snapshot(page)).products).toHaveLength(2);await page.reload();await expect(page.getByRole('button',{name:'ลบสินค้า DEMO-C',exact:true})).toHaveCount(0);
});
await run('referenced products offer deactivation while retaining stock history',async page=>{
 await page.getByRole('button',{name:'ลบสินค้า DEMO-A',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('ปิดใช้งาน');await page.getByRole('dialog').getByRole('button',{name:'ปิดใช้งานสินค้า',exact:true}).click();const s=await snapshot(page);expect(s.products.find(p=>p.id==='a').active).toBe(false);expect(quantity(s,'a')).toBe(12);expect(s.movements.some(m=>m.productId==='a')).toBe(true);
});
await run('stock receipt and stock-out alter quantities without creating invoices and appear in logs',async page=>{
 await navigate(page,'Stock management');await page.getByRole('button',{name:'รับเข้า DEMO-A',exact:true}).click();await page.getByLabel('จำนวนที่รับเข้า',{exact:true}).fill('5');await page.getByRole('button',{name:'บันทึกรับเข้า',exact:true}).click();expect(quantity(await snapshot(page),'a')).toBe(17);
 await page.getByRole('button',{name:'จ่ายออก DEMO-A',exact:true}).click();await page.getByLabel('จำนวนที่จ่ายออก',{exact:true}).fill('2');await page.getByRole('button',{name:'บันทึกจ่ายออก',exact:true}).click();expect(quantity(await snapshot(page),'a')).toBe(15);expect((await snapshot(page)).sales).toHaveLength(0);await expect(page.getByRole('region',{name:'ประวัติการเคลื่อนไหวสต๊อก'})).toContainText('จ่ายออก');
 await page.getByRole('button',{name:'เลิกทำ',exact:true}).click();expect(quantity(await snapshot(page),'a')).toBe(17);
});
await run('physical count is distinct from incoming and outgoing quantities',async page=>{
 await navigate(page,'Stock management');await page.getByRole('button',{name:'ตรวจนับ DEMO-A',exact:true}).click();await page.getByLabel('จำนวนที่นับได้จริง',{exact:true}).fill('10');await page.getByRole('button',{name:'บันทึกยอดที่นับได้',exact:true}).click();expect(quantity(await snapshot(page),'a')).toBe(10);await page.reload();await navigate(page,'Stock management');await expect(page.getByTestId('stock-a')).toContainText('10');
});
await run('sale menu still selects variants and issues exactly one bill',async page=>{
 await navigate(page,'ทำบิล');await page.getByRole('button',{name:'ใส่ตะกร้า DEMO-A',exact:true}).click();await page.getByRole('button',{name:'ดูสรุป',exact:true}).click();await page.getByLabel('จำนวน DEMO-A (แพ็ก)',{exact:true}).fill('3');await page.getByRole('button',{name:'ยืนยันและออกบิล',exact:true}).click();const s=await snapshot(page);expect(quantity(s,'a')).toBe(9);expect(s.sales).toHaveLength(1);expect(s.sales[0].total).toBe(54000);
});
await run('desktop sidebar and mobile menu preserve independent pages without overflow',async page=>{
 for(const width of [320,390,768,1280]){await page.setViewportSize({width,height:900});await navigate(page,'Inventory');await noOverflow(page);await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:`outputs/ebay-inventory-${width}.png`,fullPage:true});await navigate(page,'Stock management');await noOverflow(page);await page.screenshot({path:`outputs/ebay-stocks-${width}.png`,fullPage:true});}
 await axe(page);
});
await run('mobile menu supports Escape and restores focus',async page=>{
 await page.setViewportSize({width:320,height:900});const open=page.getByRole('button',{name:'เปิดเมนูหลัก',exact:true});await open.click();await expect(page.getByRole('dialog',{name:'เมนูระบบ'})).toBeVisible();await page.keyboard.press('Escape');await expect(open).toBeFocused();await expect(page.getByRole('dialog',{name:'เมนูระบบ'})).toHaveCount(0);await axe(page);
});
await browser.close();await fs.writeFile('outputs/menu-separation-results.json',JSON.stringify({results,errors},null,2));if(results.some(r=>r.status==='failed')||errors.length)process.exitCode=1;
