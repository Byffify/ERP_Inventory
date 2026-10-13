import {installFixture} from './fixtures.mjs';
import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
async function navigate(page,name){const menu=page.getByRole('button',{name:'เปิดเมนูหลัก',exact:true});if(await menu.isVisible())await menu.click();await page.getByRole('navigation',{name:'เมนูหลัก'}).getByRole('button',{name,exact:true}).click();}

const base=process.env.DEMO_URL||'http://127.0.0.1:5173';
await fs.mkdir('outputs',{recursive:true});
const systemChrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
const hasSystemChrome=await fs.access(systemChrome).then(()=>true,()=>false);
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||(hasSystemChrome?systemChrome:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'),headless:true});
const results=[];const runtimeErrors=[];
async function run(name,fn){let context;try{context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,acceptDownloads:true});const page=await context.newPage();page.on('pageerror',e=>runtimeErrors.push(e.message));await installFixture(page);await page.goto(base);await page.evaluate(()=>document.fonts.ready);await fn(page,context);results.push({name,status:'passed'});console.log('PASS',name);}catch(e){results.push({name,status:'failed',error:String(e)});console.error('FAIL',name,String(e));}finally{await context?.close();}}
async function overflow(page){const measure=await page.evaluate(()=>({page:document.documentElement.scrollWidth,viewport:innerWidth}));expect(measure.page).toBeLessThanOrEqual(measure.viewport);}
async function a11y(page){const r=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);}
async function selectA(page,quantity='3'){await navigate(page,'ทำบิล');await page.getByRole('button',{name:'ใส่ตะกร้า DEMO-A',exact:true}).click();await page.getByRole('button',{name:'ดูสรุป',exact:true}).click();await page.getByLabel('จำนวน DEMO-A (แพ็ก)',{exact:true}).fill(quantity);}
async function confirmA(page){await selectA(page);await page.getByRole('button',{name:'ยืนยันและออกบิล',exact:true}).click();await expect(page.getByTestId('remaining-a')).toHaveText('9 แพ็ก');}
async function snapshot(page){return page.evaluate(()=>JSON.parse(localStorage.getItem('s4-demo-v1')));}
const qty=(s,id)=>s.movements.filter(m=>m.productId===id).reduce((n,m)=>n+m.quantity,0);

await run('responsive inventory: 320/360/390/768/1280 and landscape',async page=>{

 for(const width of [320,360,390,768,1280,844]){await page.setViewportSize({width,height:width===844?390:844});await overflow(page);await expect(page.getByTestId('stock-a')).toContainText('12');if([320,390,1280].includes(width))await page.screenshot({path:`outputs/S4-products-${width}.png`,fullPage:true});}
 await page.setViewportSize({width:390,height:844});await a11y(page);
 const styles=await page.evaluate(()=>({canvas:getComputedStyle(document.body).backgroundColor,font:getComputedStyle(document.body).fontFamily,ink:getComputedStyle(document.body).color}));expect(styles.ink).toBe('rgb(25, 25, 25)');expect(styles.font).toContain('Arial');expect(styles.font).toContain('Noto Sans Thai');
});
await run('select, issue, reload, authentic screenshot and PNG',async page=>{
 await selectA(page);expect(qty(await snapshot(page),'a')).toBe(12);await expect(page.getByRole('button',{name:'บันทึกร่าง',exact:true})).toHaveCount(0);await overflow(page);await a11y(page);
 await overflow(page);await a11y(page);await page.getByRole('button',{name:'ยืนยันและออกบิล',exact:true}).click();await expect(page.getByTestId('remaining-a')).toHaveText('9 แพ็ก');expect((await snapshot(page)).sales[0].total).toBe(54000);await overflow(page);await a11y(page);
 await page.screenshot({path:'outputs/S4-main-screen.png',fullPage:false});
 const before=JSON.stringify(await snapshot(page));const dl=page.waitForEvent('download');await page.getByRole('button',{name:'ดาวน์โหลดภาพบิล',exact:true}).click();const download=await dl;expect(download.suggestedFilename()).toBe('000001-v1.png');await download.saveAs('outputs/S4-sample-bill.png');const bytes=await fs.readFile('outputs/S4-sample-bill.png');expect(bytes.subarray(1,4).toString()).toBe('PNG');expect(JSON.stringify(await snapshot(page))).toBe(before);
 await page.reload();await expect(page.getByTestId('stock-a')).toContainText('9');await navigate(page,'รายการขาย');await page.getByRole('button',{name:/000001/}).click();await expect(page.getByTestId('remaining-a')).toHaveText('9 แพ็ก');
});
await run('mobile edit, history and cancellation return latest quantity',async page=>{
 await confirmA(page);await page.getByRole('button',{name:'แก้รายการ',exact:true}).click();await page.getByLabel('จำนวน DEMO-A (แพ็ก)',{exact:true}).fill('4');expect(qty(await snapshot(page),'a')).toBe(9);await page.getByRole('button',{name:'ยืนยันการแก้ไข',exact:true}).click();await expect(page.getByTestId('remaining-a')).toHaveText('8 แพ็ก');expect((await snapshot(page)).sales[0].total).toBe(72000);
 await page.getByText('ประวัติรุ่นก่อนหน้า',{exact:true}).click();await expect(page.getByText(/รุ่น 1 · ยืนยันแล้ว/)).toBeVisible();await page.getByRole('button',{name:'ยกเลิกบิล',exact:true}).click();await a11y(page);await page.getByRole('dialog').getByRole('button',{name:'ยืนยัน',exact:true}).click();expect(qty(await snapshot(page),'a')).toBe(12);expect((await snapshot(page)).sales[0].status).toBe('cancelled');
 const dl=page.waitForEvent('download');await page.getByRole('button',{name:'ดาวน์โหลดภาพบิล',exact:true}).click();const download=await dl;expect(download.suggestedFilename()).toContain('v2-cancelled');
});
await run('receipt preview adds five only on confirmation',async page=>{await navigate(page,'Stock management');await page.getByRole('button',{name:'รับเข้า DEMO-A',exact:true}).click();await page.getByLabel('จำนวนที่รับเข้า',{exact:true}).fill('5');expect(qty(await snapshot(page),'a')).toBe(12);await expect(page.locator('.operation-preview')).toContainText('17');await page.getByRole('button',{name:'บันทึกรับเข้า',exact:true}).click();await expect(page.getByTestId('stock-a')).toContainText('17');});
await run('mixed SKU shortage commits no partial sale',async page=>{
 await selectA(page);await page.getByRole('button',{name:'เลือกสินค้าเพิ่ม',exact:true}).click();await expect(page.getByRole('button',{name:'ใส่ตะกร้า DEMO-C',exact:true})).toBeDisabled();await page.getByRole('button',{name:'ใส่ตะกร้า DEMO-B',exact:true}).click();await page.getByRole('button',{name:'ดูสรุป',exact:true}).click();await page.getByLabel('จำนวน DEMO-B (ชิ้น)',{exact:true}).fill('21');await page.getByRole('button',{name:'ยืนยันและออกบิล',exact:true}).click();await expect(page.locator('#qe-1')).toContainText('20');const s=await snapshot(page);expect(qty(s,'a')).toBe(12);expect(qty(s,'b')).toBe(20);expect(s.sales).toHaveLength(0);
});
await run('invalid quantities and prices have inline recovery',async page=>{
 await selectA(page,'0');await page.locator('.line-price summary').click();await page.getByLabel('ราคา DEMO-A (บาท/แพ็ก)',{exact:true}).fill('1.001');await page.getByRole('button',{name:'ยืนยันและออกบิล',exact:true}).click();await expect(page.getByLabel('จำนวน DEMO-A (แพ็ก)',{exact:true})).toHaveAttribute('aria-invalid','true');await expect(page.getByLabel('ราคา DEMO-A (บาท/แพ็ก)',{exact:true})).toHaveAttribute('aria-invalid','true');expect(qty(await snapshot(page),'a')).toBe(12);await overflow(page);await a11y(page);
});
await run('quota failure preserves stock and reports no confirmation',async page=>{
 await selectA(page);await page.evaluate(()=>{Storage.prototype.setItem=function(){throw new DOMException('quota','QuotaExceededError');};});await page.getByRole('button',{name:'ยืนยันและออกบิล',exact:true}).click();await expect(page.getByRole('alert')).toContainText('บันทึกไม่สำเร็จ');const s=await snapshot(page);expect(s.sales).toHaveLength(0);expect(qty(s,'a')).toBe(12);
});
await run('PNG failure permits retry without changing stock',async page=>{
 await confirmA(page);const before=JSON.stringify(await snapshot(page));await page.evaluate(()=>{window.originalToBlob=HTMLCanvasElement.prototype.toBlob;HTMLCanvasElement.prototype.toBlob=function(callback){callback(null);};});await page.getByRole('button',{name:'ดาวน์โหลดภาพบิล',exact:true}).click();await expect(page.getByRole('alert')).toContainText('สร้างภาพบิลไม่สำเร็จ');expect(JSON.stringify(await snapshot(page))).toBe(before);await page.evaluate(()=>{HTMLCanvasElement.prototype.toBlob=window.originalToBlob;});const dl=page.waitForEvent('download');await page.getByRole('button',{name:'ดาวน์โหลดภาพบิล',exact:true}).click();await dl;expect(JSON.stringify(await snapshot(page))).toBe(before);
});
await run('corrupt data blocks transactions and reset requires confirmation',async page=>{
 await page.evaluate(()=>localStorage.setItem('s4-demo-v1','{broken'));await page.reload();await expect(page.getByRole('alert')).toContainText('เสียหาย');expect(await page.evaluate(()=>localStorage.getItem('s4-demo-v1'))).toBe('{broken');await page.getByRole('button',{name:'รีเซ็ตข้อมูล',exact:true}).first().click();await page.getByRole('dialog').getByRole('button',{name:'กลับ',exact:true}).click();expect(await page.evaluate(()=>localStorage.getItem('s4-demo-v1'))).toBe('{broken');await page.getByRole('button',{name:'รีเซ็ตข้อมูล',exact:true}).first().click();await page.getByRole('dialog').getByRole('button',{name:'ยืนยัน',exact:true}).click();await expect(page.getByRole('heading',{name:'ยังไม่มีสินค้า',exact:true})).toBeVisible();expect((await snapshot(page)).products).toEqual([]);
});
await run('narrow sale form, 200% text, landscape and reduced keyboard viewport',async page=>{
 await page.setViewportSize({width:320,height:640});await selectA(page);await overflow(page);await page.getByLabel('จำนวน DEMO-A (แพ็ก)',{exact:true}).focus();await page.setViewportSize({width:320,height:360});await overflow(page);await page.getByRole('button',{name:'ยืนยันและออกบิล',exact:true}).scrollIntoViewIfNeeded();await page.setViewportSize({width:844,height:390});await overflow(page);await page.getByRole('button',{name:'ยืนยันและออกบิล',exact:true}).click();await overflow(page);
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{const sizes=Array.from(document.querySelectorAll('h1,h2,p,span,strong,small,button,input,label,summary,td,th')).map(el=>[el,parseFloat(getComputedStyle(el).fontSize)]);for(const [el,size]of sizes)el.style.fontSize=`${size*2}px`;});await overflow(page);await page.screenshot({path:'outputs/S4-text-200.png',fullPage:true});
});
await run('long product names and very large stock remain readable at 320px',async page=>{
 await page.setViewportSize({width:320,height:844});await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('s4-demo-v1'));s.products[0].name='สินค้าจำลองชื่อยาวสำหรับตรวจการขึ้นบรรทัดและหน่วยขาย'.repeat(5);s.models.find(m=>m.id===s.products[0].modelId).name=s.products[0].name;s.movements[0].quantity=9007199254740991;localStorage.setItem('s4-demo-v1',JSON.stringify(s));});await page.reload();await overflow(page);await expect(page.getByTestId('stock-a')).toContainText('9007199254740991');await navigate(page,'ทำบิล');await page.getByRole('button',{name:'ใส่ตะกร้า DEMO-A',exact:true}).click();await page.getByRole('button',{name:'ดูสรุป',exact:true}).click();await overflow(page);
});
await run('editor and saved paper bill across all required breakpoints',async page=>{
 await selectA(page);
 for(const width of [320,360,390,768,1280]){await page.setViewportSize({width,height:844});await overflow(page);await expect(page.getByLabel('จำนวน DEMO-A (แพ็ก)',{exact:true})).toBeVisible();}

 for(const width of [320,360,390,768,1280]){await page.setViewportSize({width,height:844});await overflow(page);}
 await page.getByRole('button',{name:'ยืนยันและออกบิล',exact:true}).click();
 for(const width of [320,360,390,768,1280]){await page.setViewportSize({width,height:844});await overflow(page);await expect(page.getByTestId('remaining-a')).toHaveText('9 แพ็ก');}
 await page.setViewportSize({width:1280,height:844});await a11y(page);
});
await run('retired pitch route contains only the application',async page=>{await page.goto(base+'/pitch');await expect(page.locator('.pitch')).toHaveCount(0);await expect(page.getByRole('heading',{name:'ข้อมูลสินค้า',exact:true})).toBeVisible();});

await browser.close();
await fs.writeFile('outputs/S4-browser-results.json',JSON.stringify({timestamp:new Date().toISOString(),browser:'Chrome headless via Playwright',physicalDevice:false,results,runtimeErrors},null,2));
if(results.some(r=>r.status!=='passed')||runtimeErrors.length){process.exitCode=1;}else console.log(`All ${results.length} browser scenarios passed; no runtime errors.`);

