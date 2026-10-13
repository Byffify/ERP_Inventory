import {chromium,expect} from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();
try{
 await page.goto(process.env.DEMO_URL||'http://127.0.0.1:5173');await expect(page.getByRole('heading',{name:'ยังไม่มีสินค้า',exact:true})).toBeVisible();await expect(page.locator('main')).not.toContainText('DEMO-');
 const initial=await page.evaluate(()=>JSON.parse(localStorage.getItem('s4-demo-v1')));expect(initial.products).toEqual([]);expect(initial.sales).toEqual([]);await page.screenshot({path:'outputs/empty-system.png',fullPage:true});
 await page.getByRole('button',{name:'เพิ่มสินค้า',exact:true}).click();await page.getByLabel('รหัสสินค้า',{exact:true}).fill('MY-001');await page.getByLabel('ชื่อสินค้า',{exact:true}).fill('สินค้าที่บันทึกเอง');await page.getByLabel('หน่วยขาย',{exact:true}).fill('ชิ้น');await page.getByLabel('ราคาขาย (บาท)',{exact:true}).fill('85');await page.getByRole('button',{name:'เพิ่มสินค้า',exact:true}).click();await page.reload();
 await expect(page.getByText('สินค้าที่บันทึกเอง',{exact:true})).toBeVisible();const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('s4-demo-v1')));expect(after.products).toHaveLength(1);expect(after.products[0].price).toBe(8500);
 await fs.writeFile('outputs/empty-startup-results.json',JSON.stringify({status:'passed',emptyInitial:true,recordsPreservedAfterReload:true},null,2));console.log('PASS empty startup and user-entered records preserved after reload');
}finally{await browser.close();}
