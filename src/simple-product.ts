import {stock,type DemoState,type Product,type ProductModel} from './domain';
import {resolvedImage,skuLocked} from './catalog';

export interface SimpleProductInput {id:string;code:string;name:string;description:string;color?:string;size?:string;unit:string;price:number;imageId?:string;active:boolean;categoryId:string}
const clean=(value:string)=>value.trim().replace(/\s+/g,' ');
const key=(value:string)=>clean(value).toLocaleLowerCase('th');
const optional=(value?:string)=>value?.trim()?clean(value):undefined;
const required=(value:string,label:string,max=120)=>{if(typeof value!=='string'||!clean(value)||clean(value).length>max)throw new Error(`กรุณาระบุ${label} ไม่เกิน ${max} ตัวอักษร`);return clean(value);};
export function findProductIdentity(s:DemoState,name:string,color?:string,size?:string,excludeId?:string):Product|undefined {
 return s.products.find(p=>!p.deleted&&p.id!==excludeId&&key(p.name)===key(name)&&key(p.color??'')===key(color??'')&&key(p.size??'')===key(size??''));
}
export function canDeleteSimpleProduct(s:DemoState,id:string):boolean {
 return s.products.some(p=>p.id===id&&!p.deleted);
}
export function deleteSimpleProduct(s:DemoState,id:string):DemoState {
 const product=s.products.find(p=>p.id===id);
 if(!product)throw new Error('ไม่พบสินค้า');
 if(product.deleted)return s;
 const next=structuredClone(s);
 if(stock(s,id)!==0||skuLocked(s,id)){const retained=next.products.find(p=>p.id===id)!;retained.deleted=true;retained.active=false;return next;}
 next.products=next.products.filter(p=>p.id!==id);
 next.movements=next.movements.filter(m=>m.productId!==id);
 if(!next.products.some(p=>p.modelId===product.modelId))next.models=next.models.filter(m=>m.id!==product.modelId);
 return next;
}
export function archiveSimpleProduct(s:DemoState,id:string):DemoState {
 if(!s.products.some(p=>p.id===id))throw new Error('ไม่พบสินค้า');
 const next=structuredClone(s);next.products.find(p=>p.id===id)!.active=false;return next;
}
export function saveSimpleProduct(s:DemoState,input:SimpleProductInput):DemoState {
 const id=required(input.id,'รหัสภายในสินค้า'),name=required(input.name,'ชื่อสินค้า'),unit=required(input.unit,'หน่วยขาย',32);
 if(typeof input.code!=='string'||!input.code.trim()||input.code.trim().length>64)throw new Error('กรุณาระบุรหัสสินค้า ไม่เกิน 64 ตัวอักษร');
 const code=input.code.trim();
 const color=optional(input.color),size=optional(input.size),imageId=optional(input.imageId);
 if((color?.length??0)>120||(size?.length??0)>120)throw new Error('สีและไซซ์ต้องไม่เกิน 120 ตัวอักษร');
 if(typeof input.description!=='string'||input.description.length>1000)throw new Error('รายละเอียดสินค้าต้องไม่เกิน 1000 ตัวอักษร');
 if(!Number.isSafeInteger(input.price)||input.price<0)throw new Error('ราคาขายต้องไม่ติดลบและมีทศนิยมไม่เกิน 2 ตำแหน่ง');
 if(typeof input.active!=='boolean')throw new Error('กรุณาระบุสถานะสินค้า');
 if(!s.categories.some(c=>c.id===input.categoryId))throw new Error('กรุณาเลือกประเภทสินค้า');
 const previous=s.products.find(p=>p.id===id),duplicate=findProductIdentity(s,name,color,size,id);
 if(previous?.deleted)throw new Error('สินค้านี้ถูกลบแล้ว ไม่สามารถแก้ไขหรือเปิดใช้งานได้');
 if(s.products.some(p=>p.id!==id&&p.code.trim().toLocaleLowerCase('th')===code.toLocaleLowerCase('th')))throw new Error('รหัสสินค้าซ้ำกับสินค้าอื่น กรุณาระบุรหัสใหม่');
 if(duplicate)throw new Error(`มีสินค้าชื่อ สี และไซซ์นี้แล้ว (${duplicate.code}) กรุณาเปิดสินค้าที่มีแล้ว`);
 const locked=!!previous&&skuLocked(s,id);
 if(previous&&locked&&(key(previous.color??'')!==key(color??'')||key(previous.size??'')!==key(size??'')||key(previous.unit)!==key(unit)))throw new Error(`${previous.code} มีรายการแล้ว ไม่สามารถเปลี่ยนสี ไซซ์ หรือหน่วยขายได้`);
 const next=structuredClone(s),oldModel=previous?s.models.find(m=>m.id===previous.modelId):undefined;
 // The existing kind remains canonical for case/spacing-only edits.
 let model=next.models.find(m=>key(m.name)===key(name));
 if(!model){
  let modelId=`model-${id}`,suffix=1;while(next.models.some(m=>m.id===modelId))modelId=`model-${id}-${suffix++}`;
  model={id:modelId,name,description:input.description.trim(),categoryId:input.categoryId,imageId:oldModel?.imageId} satisfies ProductModel;
  next.models.push(model);
 }
 // If a rename joins another kind, retain the old effective photo as this SKU's override.
 const retainedImage=imageId??(previous&&previous.modelId!==model.id&&oldModel?.imageId!==model.imageId?resolvedImage(s,{...previous,imageId:undefined}):undefined);
 const product:Product & {description:string;categoryId:string}={...previous,id,modelId:model.id,name:model.name,code,color:locked?previous!.color:color,size:locked?previous!.size:size,unit:locked?previous!.unit:unit,price:input.price,active:input.active,imageId:retainedImage,description:input.description.trim(),categoryId:input.categoryId};
 const index=next.products.findIndex(p=>p.id===id);
 if(index<0){next.products.push(product);next.movements.push({id:`opening-${id}`,productId:id,quantity:0,type:'opening',reference:`catalog-${model.id}`,createdAt:new Date().toISOString()});}else next.products[index]=product;
 if(previous&&previous.modelId!==model.id&&!next.products.some(p=>p.modelId===previous.modelId))next.models=next.models.filter(m=>m.id!==previous.modelId);
 return next;
}
