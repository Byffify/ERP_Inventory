export interface Category { id:string; name:string }
export interface ProductModel { id:string; name:string; description:string; categoryId:string; imageId?:string }
export interface Product { id:string; modelId:string; active:boolean; deleted?:boolean; imageId?:string; description?:string; categoryId?:string; code:string; name:string; color?:string; size?:string; unit:string; price:number }
export interface SaleLine { productId:string; name:string; unit:string; quantity:number; price:number }
export interface InputLine { productId:string; quantity:number; price:number }
export interface BillDetails {sellerName:string;sellerAddress:string;sellerTaxId:string;buyerName:string;buyerAddress:string;buyerTaxId:string;buyerRegistration?:string;bookNumber:string;receiverName:string}
export interface Shop {name:string;address:string;taxId:string}
export interface Sale { id:string; code:string; status:'draft'|'confirmed'|'cancelled'; revision:number; lines:SaleLine[]; total:number; createdAt:string; updatedAt:string; document?:BillDetails }
export interface StockMovement { id:string; productId:string; quantity:number; type:'opening'|'receipt'|'sale'|'revision'|'cancel'|'deduction'|'deduction-undo'|'count'; reference:string; createdAt:string; countedQuantity?:number }
export interface DemoState { version:2; categories:Category[]; models:ProductModel[]; products:Product[]; sales:Sale[]; movements:StockMovement[]; history:Sale[]; shop?:Shop }
export interface StoragePort { getItem(key:string):string|null; setItem(key:string,value:string):void }
export const STORAGE_KEY='s4-demo-v1';
export function countStock(s:DemoState,id:string,productId:string,countedQuantity:number):DemoState {
 const p=s.products.find(p=>p.id===productId);
 if(!p)throw new Error('ไม่พบสินค้า');
 if(!Number.isSafeInteger(countedQuantity)||countedQuantity<0)throw new Error('จำนวนที่นับได้ต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป');
 const previous=s.movements.find(m=>m.type==='count'&&m.reference===id);
 if(previous){if(previous.productId!==productId||previous.countedQuantity!==countedQuantity)throw new Error('รหัสตรวจนับนี้มีข้อมูลอื่นแล้ว');return s;}
 if(!p.active)throw new Error('สินค้านี้ปิดใช้งานแล้ว');
 const next=structuredClone(s);
 next.movements.push({id:`count-${id}-${productId}`,productId,quantity:countedQuantity-stock(s,productId),countedQuantity,type:'count',reference:id,createdAt:new Date().toISOString()});
 return next;
}
export function deductStock(s:DemoState,id:string,productId:string,quantity:number):DemoState{
 const p=s.products.find(p=>p.id===productId);if(!p)throw new Error('ไม่พบสินค้า');if(!Number.isSafeInteger(quantity)||quantity<=0)throw new Error('จำนวนต้องเป็นจำนวนเต็มมากกว่า 0');
 const previous=s.movements.find(m=>m.type==='deduction'&&m.reference===id);if(previous){if(previous.productId!==productId||previous.quantity!==-quantity)throw new Error('รหัสรายการนี้มีข้อมูลอื่นแล้ว');return s;}
 if(!p.active)throw new Error('สินค้านี้ปิดใช้งานแล้ว');return applyDeltas(s,new Map([[productId,-quantity]]),id,'deduction',`deduct-${id}`);
}
export function undoDeduction(s:DemoState,id:string):DemoState{
 const original=s.movements.find(m=>m.type==='deduction'&&m.reference===id);if(!original)throw new Error('ไม่พบรายการลดจำนวน');if(s.movements.some(m=>m.type==='deduction-undo'&&m.reference===id))return s;
 return applyDeltas(s,new Map([[original.productId,-original.quantity]]),id,'deduction-undo',`undo-${id}`);
}
export const defaultDocument=(shop?:Shop):BillDetails=>({sellerName:shop?.name??'',sellerAddress:shop?.address??'',sellerTaxId:shop?.taxId??'',buyerName:'',buyerAddress:'',buyerTaxId:'',buyerRegistration:'',bookNumber:'',receiverName:''});
export function issueSale(s:DemoState,id:string,lines:InputLine[],document:BillDetails):DemoState{
 const existing=s.sales.find(sale=>sale.id===id);if(existing?.status==='confirmed')return s;
 const next=confirmSale(saveDraft(s,id,lines),id);const details=cleanDocument(document);findSale(next,id).document=details;next.shop={name:details.sellerName,address:details.sellerAddress,taxId:details.sellerTaxId};return next;
}
export function cleanDocument(details:BillDetails):BillDetails{
 const result=defaultDocument();for(const field of Object.keys(result) as (keyof BillDetails)[]){const value=field==='buyerRegistration'?(details[field]??''):details[field];if(typeof value!=='string'||value.length>1000)throw new Error('ข้อมูลบิลต้องเป็นข้อความไม่เกิน 1000 ตัวอักษรต่อช่อง');result[field]=value.trim();}return result;
}
const now=()=>new Date().toISOString();
const copy=(s:DemoState):DemoState=>structuredClone(s);
const safe=(n:number)=>Number.isSafeInteger(n);
export const productName=(p:Product)=>[p.name,p.color,p.size].filter(Boolean).join(' / ');
export function seed():DemoState {return {version:2,categories:[{id:'uncategorized',name:'ยังไม่จัดประเภท'}],models:[],products:[],sales:[],history:[],movements:[]};}
export function stock(s:DemoState,id:string):number { return s.movements.filter(m=>m.productId===id).reduce((n,m)=>n+m.quantity,0); }
const total=(lines:SaleLine[])=>lines.reduce((n,l)=>n+l.quantity*l.price,0);
function normalize(s:DemoState,inputs:InputLine[],allowedInactive=new Map<string,number>()):SaleLine[] {
 if(!inputs.length) throw new Error('กรุณาเลือกสินค้าอย่างน้อยหนึ่งรายการ');
 const result:SaleLine[]=[];
 for(const input of inputs){
  const p=s.products.find(p=>p.id===input.productId);
  if(!p) throw new Error('ไม่พบสินค้า กรุณาเลือกสินค้าใหม่');
  if(!p.active&&(allowedInactive.get(p.id)??0)<input.quantity)throw new Error(`${p.code} ปิดใช้งานแล้ว ไม่สามารถเพิ่มยอดขายได้`);
  if(!safe(input.quantity)||input.quantity<=0) throw new Error('จำนวนต้องเป็นจำนวนเต็มมากกว่า 0');
  if(!safe(input.price)||input.price<0) throw new Error('ราคาต้องไม่ติดลบ และมีทศนิยมไม่เกิน 2 ตำแหน่ง');
  const existing=result.find(l=>l.productId===p.id);
  if(existing){if(existing.price!==input.price)throw new Error('สินค้าเดียวกันต้องใช้ราคาเดียวกันในบิล');existing.quantity+=input.quantity;}
  else result.push({...input,name:productName(p),unit:p.unit});
 }
 if(result.some(l=>!s.products.find(p=>p.id===l.productId)?.active&&(allowedInactive.get(l.productId)??0)<l.quantity))throw new Error('สินค้าปิดใช้งานแล้ว ไม่สามารถเพิ่มยอดขายได้');
 if(result.some(l=>!safe(l.quantity)||!safe(l.quantity*l.price)) || !safe(total(result)))throw new Error('จำนวนหรือยอดเงินสูงเกินขอบเขตที่บันทึกได้');
 return result;
}
function findSale(s:DemoState,id:string){const sale=s.sales.find(v=>v.id===id);if(!sale)throw new Error('ไม่พบรายการขาย');return sale;}
export function saveDraft(s:DemoState,id:string,inputs:InputLine[],at=now()):DemoState {
 const previous=s.sales.find(v=>v.id===id);
 if(previous&&previous.status!=='draft')throw new Error('บิลนี้ยืนยันแล้ว กรุณาใช้แก้รายการ');
 const lines=normalize(s,inputs);const next=copy(s);
 const sale:Sale={id,code:previous?.code??String(s.sales.length+1).padStart(6,'0'),status:'draft',revision:1,lines,total:total(lines),createdAt:previous?.createdAt??at,updatedAt:at};
 const index=next.sales.findIndex(v=>v.id===id);if(index<0)next.sales.push(sale);else next.sales[index]=sale;
 return next;
}
function applyDeltas(s:DemoState,deltas:Map<string,number>,reference:string,type:StockMovement['type'],operation:string):DemoState{
 for(const [id,delta] of deltas){const p=s.products.find(p=>p.id===id)!;const amount=stock(s,id);if(!safe(amount+delta))throw new Error('จำนวนสูงเกินขอบเขตที่บันทึกได้');if(amount+delta<0)throw new Error(`${p.code}: คงเหลือ ${amount} ${p.unit} แต่ต้องตัดเพิ่ม ${-delta} ${p.unit} กรุณาแก้จำนวน`);}
 const next=copy(s);
 for(const [id,quantity] of deltas)if(quantity!==0)next.movements.push({id:`${operation}-${id}`,productId:id,quantity,type,reference,createdAt:now()});
 return next;
}
export function confirmSale(s:DemoState,id:string):DemoState {
 const sale=findSale(s,id);if(sale.status==='confirmed')return s;if(sale.status!=='draft')throw new Error('บิลนี้ยกเลิกแล้ว');
 if(sale.lines.some(l=>!s.products.find(p=>p.id===l.productId)?.active))throw new Error('มีสินค้าในบิลปิดใช้งานแล้ว กรุณานำสินค้านั้นออกก่อนยืนยัน');
 const next=applyDeltas(s,new Map(sale.lines.map(l=>[l.productId,-l.quantity])),id,'sale',`confirm-${id}`);
 const updated=findSale(next,id);updated.status='confirmed';updated.updatedAt=now();return next;
}
export function reviseSale(s:DemoState,id:string,expectedRevision:number,inputs:InputLine[],document?:BillDetails):DemoState {
 const previous=findSale(s,id);if(previous.status!=='confirmed')throw new Error('แก้ได้เฉพาะบิลที่ยืนยันแล้ว');
 if(previous.revision!==expectedRevision)throw new Error('บิลเปลี่ยนไปแล้ว กรุณาเปิดรายการล่าสุดก่อนแก้ไข');
 const lines=normalize(s,inputs,new Map(previous.lines.map(l=>[l.productId,l.quantity])));const deltas=new Map<string,number>();
 for(const l of previous.lines)deltas.set(l.productId,l.quantity);
 for(const l of lines)deltas.set(l.productId,(deltas.get(l.productId)??0)-l.quantity);
 const next=applyDeltas(s,deltas,id,'revision',`revise-${id}-${expectedRevision+1}`);
 next.history.push(structuredClone(previous));const updated=findSale(next,id);updated.lines=lines;updated.total=total(lines);updated.revision++;updated.updatedAt=now();if(document)updated.document=cleanDocument(document);return next;
}
export function cancelSale(s:DemoState,id:string):DemoState {
 const sale=findSale(s,id);if(sale.status==='cancelled')return s;if(sale.status!=='confirmed')throw new Error('ร่างยังไม่ตัดสต๊อก กรุณากลับไปแก้รายการ');
 const next=applyDeltas(s,new Map(sale.lines.map(l=>[l.productId,l.quantity])),id,'cancel',`cancel-${id}`);
 next.history.push(structuredClone(sale));const updated=findSale(next,id);updated.status='cancelled';updated.updatedAt=now();return next;
}
export function receiveStock(s:DemoState,id:string,productId:string,quantity:number):DemoState {
 if(!s.products.some(p=>p.id===productId))throw new Error('ไม่พบสินค้า');
 if(!safe(quantity)||quantity<=0)throw new Error('จำนวนต้องเป็นจำนวนเต็มมากกว่า 0');
 const previous=s.movements.find(m=>m.reference===id&&m.type==='receipt');
 if(previous){if(previous.productId!==productId||previous.quantity!==quantity)throw new Error('รหัสรับเข้านี้บันทึกด้วยข้อมูลอื่นแล้ว');return s;}
 if(!s.products.find(p=>p.id===productId)?.active)throw new Error('สินค้านี้ปิดใช้งานแล้ว กรุณาเปิดใช้งานก่อนรับเข้า');
 return applyDeltas(s,new Map([[productId,quantity]]),id,'receipt',`receipt-${id}`);
}
export function parsePrice(text:string):number {
 if(!/^\d+(\.\d{1,2})?$/.test(text.trim()))throw new Error('ราคาต้องไม่ติดลบ และมีทศนิยมไม่เกิน 2 ตำแหน่ง');
 const [baht,decimal='']=text.trim().split('.');const value=Number(baht)*100+Number(decimal.padEnd(2,'0'));
 if(!safe(value))throw new Error('ราคาสูงเกินขอบเขตที่บันทึกได้');return value;
}
export const money=(satang:number)=>new Intl.NumberFormat('th-TH',{minimumFractionDigits:2,maximumFractionDigits:2}).format(satang/100);
export const dateTime=(value:string)=>new Intl.DateTimeFormat('th-TH',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Bangkok'}).format(new Date(value));
function validState(value:unknown,legacy=false):value is DemoState {
 if(!value||typeof value!=='object')return false;
 const s=value as DemoState;
 if((legacy?(value as {version:number}).version!==1:s.version!==2)||!Array.isArray(s.products)||!Array.isArray(s.sales)||!Array.isArray(s.history)||!Array.isArray(s.movements))return false;
 const text=(v:unknown)=>typeof v==='string'&&v.length>0;
 const date=(v:unknown)=>text(v)&&Number.isFinite(Date.parse(v as string));
 const unique=(values:string[])=>new Set(values).size===values.length;
 if(!s.products.every(p=>p&&text(p.id)&&text(p.code)&&text(p.name)&&text(p.unit)&&safe(p.price)&&p.price>=0&&(p.color===undefined||text(p.color))&&(p.size===undefined||text(p.size)))||!unique(s.products.map(p=>p.id))||!unique(s.products.map(p=>p.code)))return false;
 if(!legacy){
  if(!Array.isArray(s.categories)||!s.categories.length||!s.categories.every(c=>c&&text(c.id)&&text(c.name))||!unique(s.categories.map(c=>c.id))||!unique(s.categories.map(c=>c.name.trim().toLocaleLowerCase('th'))))return false;
  if(!Array.isArray(s.models)||!s.models.every(m=>m&&text(m.id)&&text(m.name)&&typeof m.description==='string'&&s.categories.some(c=>c.id===m.categoryId)&&(m.imageId===undefined||text(m.imageId)))||!unique(s.models.map(m=>m.id)))return false;
  if(!s.products.every(p=>typeof p.active==='boolean'&&s.models.some(m=>m.id===p.modelId&&m.name===p.name)&&(p.imageId===undefined||text(p.imageId)))||!unique(s.products.map(p=>p.code.trim().toLocaleLowerCase('th'))))return false;
  if(!unique(s.products.filter(p=>!p.deleted).map(p=>JSON.stringify([p.modelId,(p.color??'').trim().toLocaleLowerCase('th'),(p.size??'').trim().toLocaleLowerCase('th')]))))return false;
 }
 if(!s.products.every(p=>(p.description===undefined||(typeof p.description==='string'&&p.description.length<=1000))&&(p.categoryId===undefined||s.categories.some(c=>c.id===p.categoryId))))return false;
 if(!s.products.every(p=>(p.deleted===undefined||typeof p.deleted==='boolean')&&(!p.deleted||p.active===false)))return false;
 const ids=new Set(s.products.map(p=>p.id));
 if(!s.movements.every(m=>m&&text(m.id)&&ids.has(m.productId)&&safe(m.quantity)&&['opening','receipt','sale','revision','cancel','deduction','deduction-undo','count'].includes(m.type)&&text(m.reference)&&date(m.createdAt)&&(m.type!=='opening'||m.quantity>=0))||!unique(s.movements.map(m=>m.id)))return false;
 if(s.movements.some(m=>m.type==='count'&&(!safe(m.countedQuantity as number)||(m.countedQuantity as number)<0))||!unique(s.movements.filter(m=>m.type==='count').map(m=>m.reference)))return false;
 const running=new Map<string,number>();for(const movement of s.movements){const after=(running.get(movement.productId)??0)+movement.quantity;if(movement.type==='count'&&after!==movement.countedQuantity)return false;running.set(movement.productId,after);}
 if(s.movements.some(m=>(m.type==='receipt'&&m.quantity<=0)||(['sale','revision','cancel'].includes(m.type)&&!s.sales.some(sale=>sale?.id===m.reference))))return false;
 if(s.movements.some(m=>(m.type==='deduction'&&m.quantity>=0)||(m.type==='deduction-undo'&&!s.movements.some(original=>original.type==='deduction'&&original.reference===m.reference&&original.productId===m.productId&&original.quantity===-m.quantity))))return false;
 if(!unique(s.movements.filter(m=>m.type==='deduction').map(m=>m.reference))||!unique(s.movements.filter(m=>m.type==='deduction-undo').map(m=>m.reference)))return false;
 if(s.products.some(p=>!safe(stock(s,p.id))||stock(s,p.id)<0))return false;
 const validSale=(sale:Sale)=>sale&&text(sale.id)&&text(sale.code)&&['draft','confirmed','cancelled'].includes(sale.status)&&safe(sale.revision)&&sale.revision>0&&date(sale.createdAt)&&date(sale.updatedAt)&&Array.isArray(sale.lines)&&sale.lines.length>0&&sale.lines.every(l=>l&&ids.has(l.productId)&&text(l.name)&&l.unit===s.products.find(p=>p.id===l.productId)?.unit&&safe(l.quantity)&&l.quantity>0&&safe(l.price)&&l.price>=0&&safe(l.quantity*l.price))&&unique(sale.lines.map(l=>l.productId))&&safe(sale.total)&&sale.total===total(sale.lines);
 if(!s.sales.every(validSale)||!s.history.every(validSale)||!unique(s.sales.map(v=>v.id)))return false;
 if([...s.sales,...s.history].some(sale=>sale.document&&Object.keys(defaultDocument()).some(k=>{const value=sale.document?.[k as keyof BillDetails];return k==='buyerRegistration'&&value===undefined?false:typeof value!=='string'||value.length>1000;})))return false;
 if(s.shop&&[s.shop.name,s.shop.address,s.shop.taxId].some(v=>typeof v!=='string'||v.length>1000))return false;
 for(const sale of s.sales)for(const p of s.products){const net=s.movements.filter(m=>m.reference===sale.id&&m.productId===p.id&&['sale','revision','cancel'].includes(m.type)).reduce((n,m)=>n+m.quantity,0);const expected=sale.status==='confirmed'?-(sale.lines.find(l=>l.productId===p.id)?.quantity??0):0;if(net!==expected)return false;}
 return true;
}
export function loadState(storage:StoragePort):DemoState {
 let raw:string|null;try{raw=storage.getItem(STORAGE_KEY);}catch{throw new Error('อ่านข้อมูลไม่ได้ กรุณาตรวจการอนุญาตพื้นที่จัดเก็บของเบราว์เซอร์');}
 if(raw===null){const initial=seed();try{storage.setItem(STORAGE_KEY,JSON.stringify(initial));}catch{throw new Error('บันทึกข้อมูลเริ่มต้นไม่สำเร็จ กรุณาเปิดพื้นที่จัดเก็บของเบราว์เซอร์');}return initial;}
 let state:unknown;try{state=JSON.parse(raw);}catch{throw new Error('ข้อมูลเสียหาย หยุดทำรายการ กรุณารีเซ็ตข้อมูลเพื่อเริ่มใหม่');}
 if((state as {version?:number})?.version===1){
  if(!validState(state,true))throw new Error('ข้อมูลเสียหาย หยุดทำรายการ กรุณาตรวจข้อมูลเดิมก่อนย้าย');
  const migrated:DemoState={...state,version:2,categories:[{id:'uncategorized',name:'ยังไม่จัดประเภท'}],models:state.products.map(p=>({id:`model-${p.id}`,name:p.name,description:'',categoryId:'uncategorized'})),products:state.products.map(p=>({...p,modelId:`model-${p.id}`,active:true}))};
  if(!validState(migrated))throw new Error('ข้อมูลเสียหาย ไม่สามารถย้ายโครงสร้างได้');
  try{if(storage.getItem('s4-demo-v1-backup')===null)storage.setItem('s4-demo-v1-backup',raw);storage.setItem(STORAGE_KEY,JSON.stringify(migrated));}catch{throw new Error('บันทึกการย้ายข้อมูลไม่สำเร็จ ข้อมูลเดิมยังไม่ถูกแทนที่ กรุณาตรวจพื้นที่จัดเก็บ');}
  return migrated;
 }
 if(!validState(state))throw new Error('ข้อมูลเสียหาย หยุดทำรายการ กรุณารีเซ็ตข้อมูลเพื่อเริ่มใหม่');return state;
}
export function commit(storage:StoragePort,previous:DemoState,next:DemoState):DemoState {
 try{if(storage.getItem(STORAGE_KEY)!==JSON.stringify(previous))throw new Error('ข้อมูลเปลี่ยนจากแท็บอื่น กรุณาโหลดข้อมูลล่าสุดก่อนทำรายการ');
  storage.setItem(STORAGE_KEY,JSON.stringify(next));return next;
 }catch(error){if(error instanceof Error&&error.message.includes('แท็บ'))throw error;throw new Error('บันทึกไม่สำเร็จ รายการยังไม่ถูกยืนยัน กรุณาตรวจพื้นที่จัดเก็บแล้วลองใหม่');}
}

