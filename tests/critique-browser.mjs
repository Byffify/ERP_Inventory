import {installFixture} from './fixtures.mjs';
import {chromium, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
async function navigate(page,name){const menu=page.getByRole('button',{name:'เปิดเมนูหลัก',exact:true});if(await menu.isVisible())await menu.click();await page.getByRole('navigation',{name:'เมนูหลัก'}).getByRole('button',{name,exact:true}).click();}


const browser = await chromium.launch({executablePath:process.env.CHROME_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const results = [], errors = [];
async function run(name, fn) {
  const context = await browser.newContext({viewport:{width:390,height:844}});
  const page = await context.newPage();
  page.setDefaultTimeout(4000);
  page.on('pageerror', e => errors.push(e.message));
  try {
    await installFixture(page);await page.goto(process.env.DEMO_URL || 'http://127.0.0.1:5173');
    await page.evaluate(() => document.fonts.ready);
    await fn(page);
    results.push({name,status:'passed'}); console.log('PASS', name);
  } catch (e) {
    results.push({name,status:'failed',error:String(e)}); console.error('FAIL', name, String(e));
  } finally { await context.close(); }
}
const snapshot = page => page.evaluate(() => JSON.parse(localStorage.getItem('s4-demo-v1')));
async function selectForOrder(page,code='A'){await page.getByRole('button',{name:'ขาย ชุดชั้นในรุ่น '+code,exact:true}).click();await page.getByRole('dialog').getByLabel('จำนวน DEMO-'+code,{exact:true}).fill('1');await page.getByRole('button',{name:'เพิ่มในบิล',exact:true}).click();}
async function editModel(page) {
  await page.getByRole('button',{name:'ดูตัวเลือก ชุดชั้นในรุ่น A',exact:true}).click();
  await page.getByRole('button',{name:'แก้ข้อมูลสินค้า',exact:true}).click();
}
async function issue(page, quantity='3') {
  await navigate(page,'ทำบิล');
  await selectForOrder(page,'A');
  await page.locator('#q-0').fill(quantity);
  await page.getByRole('button',{name:'ยืนยันและออกบิล',exact:true}).click();
}
async function noOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => innerWidth));
}
async function accessible(page) {
  const report = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(report.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}))).toEqual([]);
}

await run('dirty catalog navigation offers stay and discard without losing input while staying', async page => {
  await editModel(page);
  await page.getByLabel('ชื่อรุ่นสินค้า',{exact:true}).fill('ชื่อที่แก้ค้าง');
  await navigate(page,'ทำบิล');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button',{name:'อยู่ต่อ',exact:true}).click();
  await expect(page.getByLabel('ชื่อรุ่นสินค้า',{exact:true})).toHaveValue('ชื่อที่แก้ค้าง');
  await navigate(page,'รายการขาย');
  await page.getByRole('button',{name:'ออกโดยไม่บันทึก',exact:true}).click();
  await expect(page.getByRole('heading',{name:'รายการขาย',exact:true})).toBeVisible();
  expect((await snapshot(page)).models[0].name).toBe('ชุดชั้นในรุ่น A');
});
await run('category stays staged with catalog and is discarded with unfinished model', async page => {
  await page.getByRole('button',{name:'เพิ่มสินค้า',exact:true}).click();
  await page.getByLabel('ชื่อประเภทใหม่',{exact:true}).fill('ประเภทชั่วคราว');
  await page.getByRole('button',{name:'เพิ่มประเภท',exact:true}).click();
  expect((await snapshot(page)).categories.some(c=>c.name==='ประเภทชั่วคราว')).toBe(false);
  await page.getByRole('button',{name:'ยกเลิก',exact:true}).click();
  await page.getByRole('button',{name:'ออกโดยไม่บันทึก',exact:true}).click();
  expect((await snapshot(page)).categories.some(c=>c.name==='ประเภทชั่วคราว')).toBe(false);
});
await run('simple existing price edit skips variant generation and saves without review wizard', async page => {
  await editModel(page);
  await page.getByRole('button',{name:'แก้ราคา รูป และสถานะ',exact:true}).click();
  await expect(page.getByLabel('สี (ไม่บังคับ)',{exact:true})).not.toBeVisible();
  await page.getByLabel('ราคา SKU ดำ / M',{exact:true}).fill('195');
  await page.getByRole('button',{name:'บันทึกการแก้ไข',exact:true}).click();
  expect((await snapshot(page)).products.find(p=>p.id==='a').price).toBe(19500);
  await expect(page.getByRole('button',{name:'แก้ข้อมูลสินค้า',exact:true})).toBeVisible();
});
await run('sale search and category filters find products and empty stock cannot be added', async page => {
  await navigate(page,'ทำบิล');
  await expect(page.getByRole('button',{name:'ขาย ชุดชั้นในรุ่น C',exact:true})).toBeDisabled();
  await page.getByLabel('ค้นหาสินค้าในบิล',{exact:true}).fill('DEMO-B');
  await expect(page.getByRole('button',{name:'ขาย ชุดชั้นในรุ่น A',exact:true})).toHaveCount(0);
  await selectForOrder(page,'B');
  await expect(page.locator('#q-0')).toHaveValue('1');
  await page.locator('.product-picker summary').click();
  await page.getByLabel('ค้นหาสินค้าในบิล',{exact:true}).fill('หาไม่เจอ');
  await page.getByRole('button',{name:'ล้างตัวกรองสินค้าในบิล',exact:true}).click();
  await expect(page.getByRole('button',{name:'ขาย ชุดชั้นในรุ่น A',exact:true})).toBeVisible();
  await accessible(page);
});
await run('oversell is tied to product quantity; revision can reuse stock already on that bill', async page => {
  await navigate(page,'ทำบิล');
  await selectForOrder(page,'A');
  await page.locator('#q-0').fill('13');
  await page.getByRole('button',{name:'ยืนยันและออกบิล',exact:true}).click();
  await expect(page.locator('#q-0')).toHaveAttribute('aria-invalid','true');
  await expect(page.locator('#qe-0')).toContainText('12');
  await expect(page.locator('#q-0')).toHaveAccessibleName(/DEMO-A/);
  expect((await snapshot(page)).sales).toHaveLength(0);
  await page.locator('#q-0').fill('12');
  await page.getByRole('button',{name:'ยืนยันและออกบิล',exact:true}).click();
  await page.getByRole('button',{name:'แก้รายการ',exact:true}).click();
  await page.getByRole('button',{name:'ยืนยันการแก้ไข',exact:true}).click();
  expect((await snapshot(page)).sales[0].revision).toBe(2);
});
await run('bill summary and zoom remain readable; new bill opens clean editor', async page => {
  await issue(page);
  const summary = page.getByRole('region',{name:'สรุปบิลที่ออกแล้ว',exact:true});
  await expect(summary).toContainText('540.00');
  await expect(summary).toContainText('3 แพ็ก');
  await page.getByRole('button',{name:'ขยายบิล',exact:true}).click();
  await expect(page.getByRole('dialog',{name:'ขยายบิลเงินสด',exact:true})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:'ขยายบิล',exact:true})).toBeFocused();
  for(const width of [320,390,1280]) {
    await page.setViewportSize({width,height:900}); await noOverflow(page);
    await page.evaluate(()=>{document.activeElement?.blur();window.scrollTo(0,0);});
    await page.mouse.move(0,0);
    await page.screenshot({path:`outputs/critique-bill-${width}.png`,fullPage:true});
  }
  await accessible(page);
  await page.getByRole('button',{name:'ทำบิลใหม่',exact:true}).click();
  await expect(page.getByRole('heading',{name:'ทำบิลขาย',exact:true})).toBeVisible();
  await expect(page.locator('.editor-row')).toHaveCount(0);
});
await run('sale selection exit restores focus and handwritten stock history stays in stock',async page=>{await navigate(page,'ทำบิล');await page.getByRole('button',{name:'เลือกสินค้า',exact:true}).click();const action=page.getByRole('button',{name:'ขาย ชุดชั้นในรุ่น A',exact:true});await action.click();await page.keyboard.press('Escape');await expect(action).toBeFocused();await navigate(page,'ทำบิล');await page.getByRole('button',{name:'มีบิลมือแล้ว',exact:true}).click();await selectForOrder(page);await page.locator('#q-0').fill('2');await page.getByRole('button',{name:'บันทึกขายจากบิลมือ',exact:true}).click();await page.getByRole('button',{name:'เลิกทำ',exact:true}).click();await expect(page.getByRole('region',{name:'ประวัติการเคลื่อนไหวสต๊อก'})).toContainText('เลิกทำ');});
await run('retired pitch route contains no demonstration content',async page=>{await page.goto((process.env.DEMO_URL||'http://127.0.0.1:5173')+'/pitch');await expect(page.locator('.pitch')).toHaveCount(0);await expect(page.getByRole('heading',{name:'ข้อมูลสินค้า',exact:true})).toBeVisible();});
await browser.close();
await fs.writeFile('outputs/critique-browser-results.json',JSON.stringify({results,errors},null,2));
if(results.some(r=>r.status==='failed') || errors.length) process.exitCode=1;
