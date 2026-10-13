import {useEffect,useRef,useState,type FormEvent} from 'react';
import {parsePrice,stock,type DemoState} from './domain';
import {skuLocked} from './catalog';
import {findProductIdentity,saveSimpleProduct,type SimpleProductInput} from './simple-product';
import {PhotoField} from './ProductPhoto';
import {removeImage} from './images';
import CategoryAdder from './CategoryAdder';

export interface SimpleProductFormProps {state:DemoState;productId?:string;onSave:(input:SimpleProductInput)=>boolean;onCancel:()=>void;onDirtyChange:(dirty:boolean)=>void;onExisting:(id:string)=>void;onAddCategory:(name:string)=>string|null}
export default function SimpleProductForm({state,productId,onSave,onCancel,onDirtyChange,onExisting,onAddCategory}:SimpleProductFormProps){
 const existing=state.products.find(p=>p.id===productId),model=state.models.find(m=>m.id===existing?.modelId);
 const id=useRef(existing?.id??crypto.randomUUID());
 const [code,setCode]=useState(existing?.code??'');
 const [name,setName]=useState(existing?.name??''),[description,setDescription]=useState((existing as {description?:string}|undefined)?.description??model?.description??'');
 const [color,setColor]=useState(existing?.color??''),[size,setSize]=useState(existing?.size??''),[unit,setUnit]=useState(existing?.unit??'ชิ้น');
 const [price,setPrice]=useState(existing?(existing.price/100).toFixed(2):'0.00'),[imageId,setImageId]=useState(existing?.imageId);
 const [categoryId,setCategoryId]=useState(existing?.categoryId??model?.categoryId??state.categories[0]?.id??'uncategorized'),[active,setActive]=useState(existing?.active??true);
 const [error,setError]=useState(''),[uploads,setUploads]=useState(0),[attempted,setAttempted]=useState(false);
 const formRef=useRef<HTMLFormElement>(null),generalError=useRef<HTMLParagraphElement>(null);
 const mounted=useRef(true),staged=useRef(new Set<string>()),retained=useRef(new Set<string>());
 const fields=JSON.stringify({code,name,description,color,size,unit,price,imageId,categoryId,active}),initial=useRef(fields);
 const dirtyCallback=useRef(onDirtyChange);dirtyCallback.current=onDirtyChange;
 useEffect(()=>{onDirtyChange(fields!==initial.current||uploads>0);},[fields,uploads,onDirtyChange]);
 useEffect(()=>{mounted.current=true;return ()=>{mounted.current=false;for(const image of staged.current)if(!retained.current.has(image))void removeImage(image).catch(()=>{});dirtyCallback.current(false);};},[]);
 const locked=!!existing&&skuLocked(state,existing.id),duplicate=findProductIdentity(state,name,color,size,existing?.id);
 const validation:Partial<Record<'code'|'name'|'unit'|'price'|'categoryId',string>>={};
 if(!code.trim()||code.trim().length>64)validation.code='กรุณาระบุรหัสสินค้า ไม่เกิน 64 ตัวอักษร';
 else if(state.products.some(p=>p.id!==existing?.id&&p.code.trim().toLocaleLowerCase('th')===code.trim().toLocaleLowerCase('th')))validation.code='รหัสสินค้าซ้ำกับสินค้าอื่น กรุณาระบุรหัสใหม่';
 if(!name.trim()||name.trim().length>120)validation.name='กรุณาระบุชื่อสินค้า ไม่เกิน 120 ตัวอักษร';
 if(!unit.trim()||unit.trim().length>32)validation.unit='กรุณาระบุหน่วยขาย ไม่เกิน 32 ตัวอักษร';
 try{parsePrice(price);}catch(e){validation.price=e instanceof Error?e.message:'กรุณาระบุราคาขายเป็นตัวเลข';}
 if(!state.categories.some(c=>c.id===categoryId))validation.categoryId='กรุณาเลือกประเภทสินค้า';
 const errors=attempted?validation:{};
 function inputState(field:keyof typeof validation){return {name:field,'aria-invalid':!!errors[field],'aria-describedby':errors[field]?`product-${field}-error`:undefined};}
 function fieldError(field:keyof typeof validation){return errors[field]?<span className="field-error" id={`product-${field}-error`}>{errors[field]}</span>:null;}
 function focusField(field:string){requestAnimationFrame(()=>{const input=formRef.current?.querySelector<HTMLElement>(`[name="${field}"]`);input?.focus({preventScroll:true});input?.scrollIntoView({block:'center'});});}
 function save(event:FormEvent){event.preventDefault();if(uploads>0)return;setError('');setAttempted(true);
  const first=Object.keys(validation)[0];if(first){focusField(first);return;}
  try{
  const input:SimpleProductInput={id:id.current,code,name,description,color:color||undefined,size:size||undefined,unit,price:parsePrice(price),imageId,active,categoryId};
  saveSimpleProduct(state,input); // Local validation keeps entered work on the same page.
  if(onSave(input)){if(imageId)retained.current.add(imageId);initial.current=fields;onDirtyChange(false);}
  else requestAnimationFrame(()=>{const alert=document.getElementById('app-error');alert?.focus({preventScroll:true});alert?.scrollIntoView({block:'center'});});
 }catch(e){setError(e instanceof Error?e.message:'บันทึกสินค้าไม่สำเร็จ');requestAnimationFrame(()=>{generalError.current?.focus({preventScroll:true});generalError.current?.scrollIntoView({block:'center'});});}}
 return <form ref={formRef} className="catalog-form simple-product-form" onSubmit={save} noValidate>
  <h2>{existing?'แก้ไขสินค้า':'เพิ่มสินค้า'}</h2>
  {error&&<p ref={generalError} className="message error" role="alert" tabIndex={-1}>{error}</p>}
  <div className="catalog-info-grid"><div className="form-fields">
   <label><span>รหัสสินค้า <small aria-hidden="true">(จำเป็น)</small></span><input aria-label="รหัสสินค้า" required {...inputState('code')} value={code} maxLength={64} onChange={e=>setCode(e.target.value)} placeholder="กรอกรหัส เช่น SHIRT-BLK-M"/>{fieldError('code')}</label>
   <label><span>ชื่อสินค้า <small aria-hidden="true">(จำเป็น)</small></span><input aria-label="ชื่อสินค้า" required {...inputState('name')} value={name} maxLength={120} onChange={e=>setName(e.target.value)} placeholder="ระบุชื่อสินค้า"/>{fieldError('name')}</label>
   <label>รายละเอียดสินค้า<textarea aria-label="รายละเอียดสินค้า" value={description} maxLength={1000} rows={3} onChange={e=>setDescription(e.target.value)} placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)"/></label>
   <div className="input-pair"><label>สี<input value={color} readOnly={locked} maxLength={120} onChange={e=>setColor(e.target.value)} placeholder="ไม่แยกสี เว้นว่างได้" aria-describedby={locked?'simple-product-lock':undefined}/></label><label>ไซซ์<input value={size} readOnly={locked} maxLength={120} onChange={e=>setSize(e.target.value)} placeholder="ไม่แยกไซซ์ เว้นว่างได้" aria-describedby={locked?'simple-product-lock':undefined}/></label></div>
   <div className="input-pair"><label><span>หน่วยขาย <small aria-hidden="true">(จำเป็น)</small></span><input aria-label="หน่วยขาย" required {...inputState('unit')} value={unit} readOnly={locked} maxLength={32} onChange={e=>setUnit(e.target.value)} aria-describedby={[errors.unit?'product-unit-error':'',locked?'simple-product-lock':''].filter(Boolean).join(' ')||undefined}/>{fieldError('unit')}</label><label><span>ราคาขาย (บาท) <small aria-hidden="true">(จำเป็น)</small></span><input aria-label="ราคาขาย (บาท)" required {...inputState('price')} value={price} inputMode="decimal" onChange={e=>setPrice(e.target.value)}/>{fieldError('price')}</label></div>
   {locked&&<p className="small muted" id="simple-product-lock">สินค้านี้มีสต็อกหรือประวัติรายการแล้ว จึงแก้สี ไซซ์ และหน่วยขายไม่ได้</p>}
   <label>ประเภทสินค้า<select aria-label="ประเภทสินค้า" {...inputState('categoryId')} value={categoryId} onChange={e=>setCategoryId(e.target.value)}>{state.categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>{fieldError('categoryId')}</label>
   <CategoryAdder onAdd={onAddCategory} onAdded={setCategoryId}/>
   {existing&&<label className="checkbox-row"><input type="checkbox" checked={active} onChange={e=>setActive(e.target.checked)}/><span>เปิดใช้งานสินค้า</span></label>}
   <p className="current-stock">คงเหลือ {existing?stock(state,existing.id):0} {unit}<small>รับเข้าและปรับจำนวนที่ Stock management</small></p>
  </div><PhotoField id={imageId} fallback={model?.imageId} label="รูปสินค้า" onChange={setImageId} onStaged={image=>{staged.current.add(image);}} onBusy={amount=>{if(mounted.current)setUploads(n=>Math.max(0,n+amount));}}/></div>
  {duplicate&&<div className="message error" role="alert"><p>มีสินค้าชื่อ สี และไซซ์นี้แล้ว · {duplicate.code}</p><button type="button" disabled={uploads>0} onClick={()=>onExisting(duplicate.id)}>เปิดสินค้าที่มีแล้ว</button></div>}
  <div className="catalog-form-actions"><button type="button" disabled={uploads>0} onClick={onCancel}>ยกเลิก</button><button type="submit" className="primary" disabled={uploads>0||!!duplicate}>{uploads>0?'กำลังเก็บรูป…':existing?'บันทึกการแก้ไข':'เพิ่มสินค้า'}</button></div>
 </form>;
}
