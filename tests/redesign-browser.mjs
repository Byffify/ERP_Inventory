import {installFixture} from './fixtures.mjs';
import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
async function navigate(page,name){const menu=page.getByRole('button',{name:'เปิดเมนูหลัก',exact:true});if(await menu.isVisible())await menu.click();await page.getByRole('navigation',{name:'เมนูหลัก'}).getByRole('button',{name,exact:true}).click();}

const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const results=[],errors=[];
async function run(name,fn){const context=await browser.newContext({viewport:{width:390,height:844}});const page=await context.newPage();page.setDefaultTimeout(3000);page.on('pageerror',e=>errors.push(e.message));try{await installFixture(page);await page.goto(process.env.DEMO_URL||'http://127.0.0.1:5173');await fn(page);results.push({name,status:'passed'});console.log('PASS',name);}catch(e){results.push({name,status:'failed',error:String(e)});console.error('FAIL',name,String(e));}finally{await context.close();}}
const snapshot=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('s4-demo-v1')));
const quantity=(s,id)=>s.movements.filter(m=>m.productId===id).reduce((n,m)=>n+m.quantity,0);
async function chooseA(page,q='3'){if(!await page.locator('.inventory-home').count()){await navigate(page,'ทำบิล');await page.getByRole('button',{name:'เลือกสินค้า',exact:true}).click();}await page.getByRole('button',{name:'ขาย ชุดชั้นในรุ่น A',exact:true}).click();await page.getByRole('dialog').getByLabel('จำนวน DEMO-A',{exact:true}).fill(q);await page.getByRole('button',{name:'เพิ่มในบิล',exact:true}).click();}
async function overflow(page){expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(()=>innerWidth));}
await run('one model groups variant quantities without duplicate product cards',async page=>{
 await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('s4-demo-v1'));s.products.push({...s.products[0],id:'a-l',code:'DEMO-AL',size:'L'});s.movements.push({id:'opening-al',productId:'a-l',quantity:8,type:'opening',reference:'opening',createdAt:'2026-10-13T00:00:00+07:00'});localStorage.setItem('s4-demo-v1',JSON.stringify(s));});await page.reload();await navigate(page,'ทำบิล');await page.getByRole('button',{name:'เลือกสินค้า',exact:true}).click();
 await expect(page.locator('.inventory-model')).toHaveCount(3);
 const row=page.locator('.inventory-model').first();await expect(row.getByTestId('stock-a')).toContainText('12');await expect(row.getByTestId('stock-a-l')).toContainText('8');
});
await run('select variants in context then issue once from the order summary',async page=>{
 await chooseA(page);expect(quantity(await snapshot(page),'a')).toBe(12);await expect(page.locator('#q-0')).toHaveValue('3');
 await page.getByRole('button',{name:'ยืนยันและออกบิล',exact:true}).click();const s=await snapshot(page);expect(quantity(s,'a')).toBe(9);expect(s.sales).toHaveLength(1);expect(s.sales[0].total).toBe(54000);
 await page.getByRole('button',{name:'แก้รายการ',exact:true}).click();await page.locator('#q-0').fill('4');await page.getByRole('button',{name:'ยืนยันการแก้ไข',exact:true}).click();expect(quantity(await snapshot(page),'a')).toBe(8);
 await page.getByRole('button',{name:'ยกเลิกบิล',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'ยืนยัน',exact:true}).click();expect(quantity(await snapshot(page),'a')).toBe(12);
});
await run('handwritten sale deducts without issuing a bill and undo restores stock',async page=>{
 await navigate(page,'ทำบิล');await page.getByRole('button',{name:'มีบิลมือแล้ว',exact:true}).click();
 await page.getByRole('button',{name:'เลือกสินค้า',exact:true}).click();await chooseA(page,'2');
 await page.getByRole('button',{name:'บันทึกขายจากบิลมือ',exact:true}).click();let s=await snapshot(page);expect(quantity(s,'a')).toBe(10);expect(s.sales).toHaveLength(0);
 await page.getByRole('button',{name:'เลิกทำ',exact:true}).click();expect(quantity(await snapshot(page),'a')).toBe(12);
});
await run('physical count uses the actual counted total including zero and survives reload',async page=>{
 await navigate(page,'Stock management');await page.getByRole('button',{name:'ตรวจนับ DEMO-A',exact:true}).click();
 await page.getByLabel('จำนวนที่นับได้จริง',{exact:true}).fill('0');await expect(page.locator('.operation-preview')).toContainText('12');await page.getByRole('button',{name:'บันทึกยอดที่นับได้',exact:true}).click();
 expect(quantity(await snapshot(page),'a')).toBe(0);expect((await snapshot(page)).sales).toHaveLength(0);await page.reload();await expect(page.getByTestId('stock-a')).toContainText('0');
});
await run('receiving adds quantities rather than replacing stock',async page=>{
 await navigate(page,'Stock management');await page.getByRole('button',{name:'รับเข้า DEMO-A',exact:true}).click();await page.getByLabel('จำนวนที่รับเข้า',{exact:true}).fill('5');
 await expect(page.locator('.operation-preview')).toContainText('17');await page.getByRole('button',{name:'บันทึกรับเข้า',exact:true}).click();expect(quantity(await snapshot(page),'a')).toBe(17);
});
await run('simple product creation needs no SKU generator or multi-step review',async page=>{
 await page.getByRole('button',{name:'เพิ่มสินค้า',exact:true}).click();await page.getByLabel('ชื่อรุ่นสินค้า',{exact:true}).fill('สินค้าไม่แยกตัวเลือก');await page.getByLabel('หน่วยขาย',{exact:true}).fill('ชิ้น');await page.getByLabel('ราคาขาย (บาท)',{exact:true}).fill('75');await page.getByRole('button',{name:'บันทึกสินค้า',exact:true}).click();const s=await snapshot(page),model=s.models.find(m=>m.name==='สินค้าไม่แยกตัวเลือก'),p=s.products.find(p=>p.modelId===model.id);expect(p.price).toBe(7500);expect(quantity(s,p.id)).toBe(0);
});
await run('selection rejects overselling without stock changes and keyboard exit restores focus',async page=>{
 await navigate(page,'ทำบิล');await page.getByRole('button',{name:'เลือกสินค้า',exact:true}).click();const sell=page.getByRole('button',{name:'ขาย ชุดชั้นในรุ่น A',exact:true});await sell.click();await page.getByRole('dialog').getByLabel('จำนวน DEMO-A',{exact:true}).fill('13');await page.getByRole('button',{name:'เพิ่มในบิล',exact:true}).click();await expect(page.getByRole('dialog').getByRole('alert')).toContainText('12');expect(quantity(await snapshot(page),'a')).toBe(12);
 for(const width of [320,1280]){await page.setViewportSize({width,height:900});await overflow(page);await page.screenshot({path:`outputs/redesign-selection-${width}.png`,fullPage:true});}
 await page.keyboard.press('Escape');await expect(sell).toBeFocused();
});
await run('order banner remains visible while browsing further products',async page=>{
 await chooseA(page);await page.getByRole('button',{name:'เลือกสินค้า',exact:true}).click();
 for(const width of [320,1280]){await page.setViewportSize({width,height:640});await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));await expect(page.locator('.order-banner')).toBeInViewport();await page.screenshot({path:`outputs/redesign-order-banner-${width}.png`,fullPage:true});}
 await page.getByRole('button',{name:'ดูรายการขาย',exact:true}).click();await expect(page.locator('#q-0')).toHaveValue('3');
});
await run('product-first interface and bill remain usable at required sizes',async page=>{
 for(const width of [320,390,768,1280]){await page.setViewportSize({width,height:900});await overflow(page);await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:`outputs/redesign-stock-${width}.png`,fullPage:true});}
 await chooseA(page);for(const width of [320,1280]){await page.setViewportSize({width,height:900});await overflow(page);await page.screenshot({path:`outputs/redesign-order-${width}.png`,fullPage:true});}
 const a11y=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(a11y.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
 await page.getByRole('button',{name:'ยืนยันและออกบิล',exact:true}).click();await page.setViewportSize({width:320,height:900});await overflow(page);await page.screenshot({path:'outputs/redesign-bill-320.png',fullPage:true});
});
await browser.close();await fs.writeFile('outputs/redesign-browser-results.json',JSON.stringify({results,errors},null,2));if(results.some(r=>r.status==='failed')||errors.length)process.exitCode=1;
