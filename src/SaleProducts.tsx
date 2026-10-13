import {useState} from 'react';
import {Search,Plus} from 'lucide-react';
import {money,productName,type DemoState,type Product} from './domain';
import {resolvedImage} from './catalog';
import {ProductPhoto} from './ProductPhoto';
import {type CartLine} from './cart';
export default function SaleProducts({state,lines,total,available,onAdd,onSummary,onInventory}:{state:DemoState;lines:CartLine[];total:number;available:(id:string)=>number;onAdd:(p:Product)=>void;onSummary:()=>void;onInventory:()=>void}){
 const [search,setSearch]=useState(''),[category,setCategory]=useState('');
 const hasProducts=state.products.some(p=>p.active&&!p.deleted);
 const products=state.products.filter(p=>p.active&&!p.deleted&&(!category||(p.categoryId??state.models.find(m=>m.id===p.modelId)?.categoryId)===category)&&`${productName(p)} ${p.code}`.toLocaleLowerCase('th').includes(search.trim().toLocaleLowerCase('th')));

 return <section className="sale-products" aria-label="เลือกสินค้าใส่ตะกร้า">
 <p className="intro">ค้นหาสินค้า แล้วกดใส่ตะกร้า · ปรับจำนวนและตรวจยอดในหน้าสรุป</p>
 <div className="sale-product-filters"><label className="search-field"><Search size={20} aria-hidden="true"/><span className="sr-only">ค้นหาสินค้าขาย</span><input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="ชื่อ / รหัส / สี / ไซซ์"/></label><label>ประเภทสินค้า<select aria-label="ประเภทสินค้า" value={category} onChange={e=>setCategory(e.target.value)}><option value="">ทุกประเภท</option>{state.categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label></div>
 <div className="sale-product-list">{products.map(p=>{const selected=Number(lines.find(l=>l.productId===p.id)?.quantity??0),remaining=available(p.id);return <article className="sale-product-row" key={p.id}><ProductPhoto id={resolvedImage(state,p)} alt={`รูป ${p.code}`}/><div className="sale-product-info"><h2>{productName(p)}</h2><small>{p.code}</small><p>คงเหลือ {remaining} {p.unit}</p>{selected>0&&<span className="sale-in-cart">ในตะกร้า {selected} {p.unit}</span>}</div><strong className="sale-product-price">{money(p.price)} บาท</strong><button className="primary" aria-label={`ใส่ตะกร้า ${p.code}`} disabled={remaining<=0||selected>=remaining||!Number.isSafeInteger(selected)} onClick={()=>onAdd(p)}><Plus size={18} aria-hidden="true"/>{remaining<=0?'สินค้าหมด':selected>=remaining?'ครบจำนวนแล้ว':'ใส่ตะกร้า'}</button></article>;})}</div>
 {!products.length&&<div className="empty-state"><h2>{hasProducts?'ไม่พบสินค้า':'ยังไม่มีสินค้า'}</h2><p>{hasProducts?'ลองค้นหาด้วยชื่อ รหัส สี หรือไซซ์อื่น':'เพิ่มสินค้าใน Inventory แล้วรับของเข้าใน Stock management'}</p>{hasProducts?<button onClick={()=>{setSearch('');setCategory('');}}>ล้างตัวกรอง</button>:<button onClick={onInventory}>ไป Inventory</button>}</div>}
 <div className="cart-footer"><div role="status" aria-live="polite"><strong>ตะกร้า {lines.length} รายการ</strong><span>{money(total)} บาท</span></div><button className="primary" disabled={!lines.length} onClick={onSummary}>ดูสรุป</button></div>
 </section>;
}
