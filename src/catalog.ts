import {stock,type DemoState,type Product,type ProductModel} from './domain';
export interface VariantInput {id:string;code:string;color?:string;size?:string;unit:string;price:number;openingQuantity:number;active:boolean;imageId?:string}
export interface ModelInput extends ProductModel {variants:VariantInput[]}
const key=(value:string)=>value.trim().toLocaleLowerCase('th');
const required=(value:string,label:string,max=120)=>{if(typeof value!=='string'||!value.trim()||value.trim().length>max)throw new Error(`กรุณาระบุ${label} ไม่เกิน ${max} ตัวอักษร`);return value.trim();};
const optional=(value?:string)=>value?.trim()||undefined;
export function skuLocked(s:DemoState,id:string){return s.movements.some(m=>m.productId===id&&(m.type!=='opening'||m.quantity>0))||[...s.sales,...s.history].some(sale=>sale.lines.some(l=>l.productId===id));}
export function resolvedImage(s:DemoState,p:Product){return p.imageId??s.models.find(m=>m.id===p.modelId)?.imageId;}
export function canDeleteModel(s:DemoState,id:string){return s.models.some(m=>m.id===id)&&s.products.filter(p=>p.modelId===id).every(p=>stock(s,p.id)===0&&!skuLocked(s,p.id));}
export function deleteModel(s:DemoState,id:string):DemoState{
 if(!s.models.some(m=>m.id===id))throw new Error('ไม่พบรุ่นสินค้า');
 if(!canDeleteModel(s,id))throw new Error('สินค้านี้มียอดหรือประวัติ ไม่สามารถลบถาวรได้ กรุณาปิดใช้งานแทน');
 const next=structuredClone(s),ids=new Set(s.products.filter(p=>p.modelId===id).map(p=>p.id));
 next.models=next.models.filter(m=>m.id!==id);next.products=next.products.filter(p=>!ids.has(p.id));next.movements=next.movements.filter(m=>!ids.has(m.productId));return next;
}
export function archiveModel(s:DemoState,id:string):DemoState{
 if(!s.models.some(m=>m.id===id))throw new Error('ไม่พบรุ่นสินค้า');
 const next=structuredClone(s);next.products.filter(p=>p.modelId===id).forEach(p=>p.active=false);return next;
}
export function addCategory(s:DemoState,id:string,name:string):DemoState{
 name=required(name,'ชื่อประเภท');
 if(s.categories.some(c=>c.id===id||key(c.name)===key(name)))throw new Error('ชื่อประเภทหรือรหัสประเภทซ้ำ กรุณาเลือกประเภทเดิม');
 const next=structuredClone(s);next.categories.push({id:required(id,'รหัสประเภท'),name});return next;
}
export function optionCombinations(colors:string[],sizes:string[]):{color?:string;size?:string}[]{
 const unique=(values:string[])=>[...new Map(values.map(v=>[key(v),v.trim()] as const).filter(([,v])=>v)).values()];
 const c=unique(colors),z=unique(sizes);if(Math.max(c.length,1)*Math.max(z.length,1)>100)throw new Error('มีชุดตัวเลือกเกิน 100 ชุด กรุณาแบ่งเพิ่มทีละกลุ่ม');
 return (c.length?c:[undefined]).flatMap(color=>(z.length?z:[undefined]).map(size=>({color,size})));
}
export function saveModel(s:DemoState,input:ModelInput):DemoState{
 const id=required(input.id,'รหัสรุ่น');const name=required(input.name,'ชื่อรุ่น');
 if(typeof input.description!=='string'||input.description.length>1000)throw new Error('รายละเอียดต้องไม่เกิน 1000 ตัวอักษร');
 if(!s.categories.some(c=>c.id===input.categoryId))throw new Error('กรุณาเลือกประเภทสินค้า');
 if(!input.variants.length)throw new Error('กรุณาเพิ่ม SKU อย่างน้อยหนึ่งรายการ');
 const identities=new Set<string>(),codes=new Set<string>(),ids=new Set<string>();
 const old=s.products.filter(p=>p.modelId===id);const next=structuredClone(s);
 for(const v of input.variants){
  const code=required(v.code,'รหัส SKU',64),unit=required(v.unit,'หน่วยขาย',32),color=optional(v.color),size=optional(v.size);
  const variantId=required(v.id,'รหัสภายใน SKU');const identity=JSON.stringify([key(color??''),key(size??'')]);
  if(identities.has(identity)||codes.has(key(code))||ids.has(variantId))throw new Error('ชุดสี/ไซซ์หรือรหัส SKU ซ้ำในรุ่นนี้');identities.add(identity);codes.add(key(code));ids.add(variantId);
  if(!Number.isSafeInteger(v.price)||v.price<0)throw new Error('ราคา SKU ต้องไม่ติดลบและมีทศนิยมไม่เกิน 2 ตำแหน่ง');
  if(!Number.isSafeInteger(v.openingQuantity)||v.openingQuantity<0)throw new Error('ยอดตั้งต้นต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป');
  if(typeof v.active!=='boolean')throw new Error('กรุณาระบุสถานะ SKU');
  const previous=s.products.find(p=>p.id===variantId);
  if(previous&&previous.modelId!==id)throw new Error('SKU นี้อยู่ในรุ่นอื่น ไม่สามารถย้ายรุ่นได้');
  if(s.products.some(p=>p.id!==variantId&&p.modelId!==id&&key(p.code)===key(code)))throw new Error('รหัส SKU ซ้ำกับสินค้าอื่น');
  if(previous){
   if(v.openingQuantity!==0)throw new Error('แก้ยอดตั้งต้นของ SKU เดิมไม่ได้ กรุณาใช้รับของเข้า');
   if(skuLocked(s,variantId)&&(previous.code!==code||previous.unit!==unit||previous.color!==color||previous.size!==size))throw new Error(`${previous.code} มีรายการแล้ว ไม่สามารถเปลี่ยนรหัส สี ไซซ์ หรือหน่วยได้`);
  }
  const p:Product={id:variantId,modelId:id,active:v.active,code,name,color,size,unit,price:v.price,imageId:optional(v.imageId)};
  const index=next.products.findIndex(p=>p.id===variantId);if(index<0){next.products.push(p);next.movements.push({id:`opening-${variantId}`,productId:variantId,quantity:v.openingQuantity,type:'opening',reference:`catalog-${id}`,createdAt:new Date().toISOString()});}else next.products[index]=p;
 }
 if(old.some(p=>!ids.has(p.id)))throw new Error('ไม่สามารถลบ SKU เดิมได้ กรุณาปิดใช้งานแทน');
 const model:ProductModel={id,name,description:input.description.trim(),categoryId:input.categoryId,imageId:optional(input.imageId)};
 const index=next.models.findIndex(m=>m.id===id);if(index<0)next.models.push(model);else next.models[index]=model;
 return next;
}
