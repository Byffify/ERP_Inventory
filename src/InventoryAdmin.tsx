import {useState} from 'react';
import {Search,Plus,Pencil,Trash2} from 'lucide-react';
import {money,stock,type DemoState} from './domain';
import {resolvedImage} from './catalog';
import {filterInventory} from './inventory';
import {ProductPhoto} from './ProductPhoto';
import CategoryAdder from './CategoryAdder';
export default function InventoryAdmin({state,onEdit,onDelete,onCreate,onOpen,onAddCategory}:{state:DemoState;onEdit:(id:string)=>void;onDelete:(id:string)=>void;onCreate:()=>void;onOpen:(id:string)=>void;onAddCategory:(name:string)=>string|null}){
 const [search,setSearch]=useState(''),[category,setCategory]=useState('');
 const products=filterInventory(state,{search,category,includeInactive:true});
 return <section className="inventory-admin" aria-label="จัดการข้อมูลสินค้า">
  <div className="catalog-admin-toolbar"><p className="intro">เพิ่ม แก้ข้อมูล หรือลบสินค้า · ยอดคงเหลือแสดงเพื่อดูข้อมูล</p><button className="primary" onClick={onCreate}><Plus size={18} aria-hidden="true"/>เพิ่มสินค้า</button></div>
  <div className="catalog-admin-filters"><label className="search-field"><Search size={18} aria-hidden="true"/><span className="sr-only">ค้นหาสินค้าด้วยรหัสหรือชื่อ</span><input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="ชื่อสินค้า / รหัส"/></label><label>ประเภทสินค้า<select aria-label="ประเภทสินค้า" value={category} onChange={e=>setCategory(e.target.value)}><option value="">ทุกประเภท</option>{state.categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><CategoryAdder onAdd={onAddCategory}/></div>
  <table className="catalog-admin-table" aria-label="ข้อมูลสินค้า"><thead><tr><th scope="col">ข้อมูลสินค้า</th><th scope="col">ประเภท</th><th scope="col">ราคา / หน่วย</th><th scope="col">คงเหลือ</th><th scope="col">จัดการข้อมูล</th></tr></thead><tbody>{products.map(p=>{const model=state.models.find(m=>m.id===p.modelId);return <tr key={p.id}><td data-label="ข้อมูลสินค้า"><div className="catalog-admin-identity"><ProductPhoto id={resolvedImage(state,p)} alt={`รูป ${p.code}`}/><div><button className="text-button" aria-label={`เปิดข้อมูล ${p.code}`} onClick={()=>onOpen(p.id)}>{p.name}</button><small>{p.code} · {[p.color,p.size].filter(Boolean).join(' / ')||'ไม่แยกสี / ไซซ์'}{!p.active?' · ปิดใช้งาน':''}</small></div></div></td><td data-label="ประเภท">{state.categories.find(c=>c.id===(p.categoryId??model?.categoryId))?.name??'ยังไม่จัดประเภท'}</td><td data-label="ราคา / หน่วย"><p><strong>{money(p.price)}</strong> บาท/{p.unit}</p></td><td data-label="คงเหลือ"><p data-testid={`stock-${p.id}`}><strong>{stock(state,p.id)}</strong> {p.unit}</p></td><td data-label="จัดการข้อมูล"><div className="actions"><button aria-label={`แก้ข้อมูล ${p.code}`} onClick={()=>onEdit(p.id)}><Pencil size={16} aria-hidden="true"/>แก้ข้อมูล</button><button aria-label={`ลบสินค้า ${p.code}`} onClick={()=>onDelete(p.id)}><Trash2 size={16} aria-hidden="true"/>ลบ</button></div></td></tr>;})}</tbody></table>
  {!products.length&&<div className="empty-state"><h2>{state.products.some(p=>!p.deleted)?'ไม่พบสินค้าที่ตรงกับตัวกรอง':'ยังไม่มีสินค้า'}</h2><p>เพิ่มสินค้าใหม่ หรือเปลี่ยนคำค้นและประเภท</p><button onClick={()=>{setSearch('');setCategory('');}}>ล้างตัวกรอง</button></div>}
 </section>;
}
