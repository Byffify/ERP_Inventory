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
 const [error,setError]=useState(''),[uploads,setUploads]=useState(0);
 const mounted=useRef(true),staged=useRef(new Set<string>()),retained=useRef(new Set<string>());
 const fields=JSON.stringify({code,name,description,color,size,unit,price,imageId,categoryId,active}),initial=useRef(fields);
 const dirtyCallback=useRef(onDirtyChange);dirtyCallback.current=onDirtyChange;
 useEffect(()=>{onDirtyChange(fields!==initial.current||uploads>0);},[fields,uploads,onDirtyChange]);
 useEffect(()=>{mounted.current=true;return ()=>{mounted.current=false;for(const image of staged.current)if(!retained.current.has(image))void removeImage(image).catch(()=>{});dirtyCallback.current(false);};},[]);
 const locked=!!existing&&skuLocked(state,existing.id),duplicate=findProductIdentity(state,name,color,size,existing?.id);
 function save(event:FormEvent){event.preventDefault();if(uploads>0)return;setError('');try{
  const input:SimpleProductInput={id:id.current,code,name,description,color:color||undefined,size:size||undefined,unit,price:parsePrice(price),imageId,active,categoryId};
  saveSimpleProduct(state,input); // Local validation keeps entered work on the same page.
  if(onSave(input)){if(imageId)retained.current.add(imageId);initial.current=fields;onDirtyChange(false);}
 }catch(e){setError(e instanceof Error?e.message:'บันทึกสินค้าไม่สำเร็จ');}}
 return <form className="catalog-form simple-product-form" onSubmit={save}>
  <h2>{existing?'แก้ไขสินค้า':'เพิ่มสินค้า'}</h2>
  {error&&<p className="message error" role="alert">{error}</p>}
  <div className="catalog-info-grid"><div className="form-fields">
   <label>รหัสสินค้า<input value={code} maxLength={64} onChange={e=>setCode(e.target.value)} placeholder="กรอกรหัส เช่น SHIRT-BLK-M"/></label>
   <label>ชื่อสินค้า<input value={name} maxLength={120} onChange={e=>setName(e.target.value)} placeholder="ระบุชื่อสินค้า"/></label>
   <label>รายละเอียดสินค้า<textarea aria-label="รายละเอียดสินค้า" value={description} maxLength={1000} rows={3} onChange={e=>setDescription(e.target.value)} placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)"/></label>
   <div className="input-pair"><label>สี<input value={color} readOnly={locked} maxLength={120} onChange={e=>setColor(e.target.value)} placeholder="ไม่แยกสี เว้นว่างได้" aria-describedby={locked?'simple-product-lock':undefined}/></label><label>ไซซ์<input value={size} readOnly={locked} maxLength={120} onChange={e=>setSize(e.target.value)} placeholder="ไม่แยกไซซ์ เว้นว่างได้" aria-describedby={locked?'simple-product-lock':undefined}/></label></div>
   <div className="input-pair"><label>หน่วยขาย<input value={unit} readOnly={locked} maxLength={32} onChange={e=>setUnit(e.target.value)} aria-describedby={locked?'simple-product-lock':undefined}/></label><label>ราคาขาย (บาท)<input value={price} inputMode="decimal" onChange={e=>setPrice(e.target.value)}/></label></div>
   {locked&&<p className="small muted" id="simple-product-lock">สินค้านี้มีสต็อกหรือประวัติรายการแล้ว จึงแก้สี ไซซ์ และหน่วยขายไม่ได้</p>}
   <label>ประเภทสินค้า<select aria-label="ประเภทสินค้า" value={categoryId} onChange={e=>setCategoryId(e.target.value)}>{state.categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
   <CategoryAdder onAdd={onAddCategory} onAdded={setCategoryId}/>
   {existing&&<label className="checkbox-row"><input type="checkbox" checked={active} onChange={e=>setActive(e.target.checked)}/><span>เปิดใช้งานสินค้า</span></label>}
   <p className="current-stock">คงเหลือ {existing?stock(state,existing.id):0} {unit}<small>รับเข้าและปรับจำนวนที่ Stock management</small></p>
  </div><PhotoField id={imageId} fallback={model?.imageId} label="รูปสินค้า" onChange={setImageId} onStaged={image=>{staged.current.add(image);}} onBusy={amount=>{if(mounted.current)setUploads(n=>Math.max(0,n+amount));}}/></div>
  {duplicate&&<div className="message error" role="alert"><p>มีสินค้าชื่อ สี และไซซ์นี้แล้ว · {duplicate.code}</p><button type="button" disabled={uploads>0} onClick={()=>onExisting(duplicate.id)}>เปิดสินค้าที่มีแล้ว</button></div>}
  <div className="catalog-form-actions"><button type="button" disabled={uploads>0} onClick={onCancel}>ยกเลิก</button><button type="submit" className="primary" disabled={uploads>0||!!duplicate}>{uploads>0?'กำลังเก็บรูป…':existing?'บันทึกการแก้ไข':'เพิ่มสินค้า'}</button></div>
 </form>;
}
