import {useState} from 'react';
import {Search,Plus,SlidersHorizontal,ChevronRight} from 'lucide-react';
import {dateTime,stock,productName,type DemoState} from './domain';
import {filterInventory,type Availability} from './inventory';
import {ProductPhoto} from './ProductPhoto';

export default function InventoryHome({state,onSelect,onOpen,onCreate,onReceive,onCount,saleOnly=false}:{state:DemoState;onSelect:(id:string)=>void;onOpen:(id:string)=>void;onCreate:()=>void;onReceive:()=>void;onCount:()=>void;saleOnly?:boolean}) {
 const [search,setSearch]=useState(''),[category,setCategory]=useState(''),[availability,setAvailability]=useState<Availability>('all'),[inactive,setInactive]=useState(false),[filterOpen,setFilterOpen]=useState(false);
 const products=filterInventory(state,{search,category,availability,includeInactive:inactive});
 const models=state.models.filter(m=>products.some(p=>p.modelId===m.id));
 function clear(){setSearch('');setCategory('');setAvailability('all');}
 return <section className="inventory-home" aria-label="สินค้าและยอดคงเหลือ">
  <div className="inventory-toolbar"><p className="intro">เช็กสี / ไซซ์ แล้วเลือกขายจากรุ่นที่ต้องการ</p>{!saleOnly&&<button onClick={onCreate}><Plus size={16} aria-hidden="true"/>เพิ่มสินค้า</button>}</div>
  <div className="inventory-search-row"><label className="search-field"><Search size={16} aria-hidden="true"/><span className="sr-only">ค้นหาสินค้าด้วยรหัสหรือชื่อ</span><input type="search" placeholder="ชื่อ / รหัส" value={search} onChange={e=>setSearch(e.target.value)}/></label><button aria-label="กรองประเภทสินค้า" aria-expanded={filterOpen} onClick={()=>setFilterOpen(v=>!v)}><SlidersHorizontal size={16} aria-hidden="true"/>ประเภท</button></div>
  {filterOpen&&<label className="inventory-category">ประเภทสินค้า<select aria-label="ประเภทสินค้า" value={category} onChange={e=>setCategory(e.target.value)}><option value="">ทุกประเภท</option>{state.categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>}
  <div className="inventory-status-filters" role="group" aria-label="สถานะสต๊อก">{([{id:'all',text:'ทั้งหมด'},{id:'available',text:'มีสินค้า'},{id:'empty',text:'หมด'}] as const).map(v=><button key={v.id} aria-pressed={availability===v.id} aria-label={v.id==='empty'?'สินค้าหมด':v.text} onClick={()=>setAvailability(v.id)}>{v.text}</button>)}</div>
  <p className="inventory-result-count" aria-live="polite">{models.length} รุ่น · {products.length} สี / ไซซ์</p>
  <div className="inventory-models">{models.map(model=>{
   const variants=products.filter(p=>p.modelId===model.id);
   return <article className="inventory-model" key={model.id} aria-label={model.name}>
    <div className="inventory-model-heading"><ProductPhoto id={model.imageId} alt={`รูป ${model.name}`}/><div><h2>{model.name}</h2><p className="muted">{state.categories.find(c=>c.id===model.categoryId)?.name}</p>{!saleOnly&&<button className="text-button" aria-label={`ดูตัวเลือก ${model.name}`} onClick={()=>onOpen(model.id)}>ข้อมูลสินค้า<ChevronRight size={14} aria-hidden="true"/></button>}</div></div>
    <div className="inventory-options" aria-label={`ยอดแยกสีไซซ์ ${model.name}`}>{variants.map(p=><div className="inventory-option" key={p.id}><span><strong>{[p.color,p.size].filter(Boolean).join(' · ')||'ไม่แยกสี / ไซซ์'}</strong><small>{p.code}{!p.active?' · ปิดใช้งาน':''}</small></span><span className="inventory-option-stock" data-testid={`stock-${p.id}`}><strong>{stock(state,p.id)}</strong> {p.unit}<small data-testid={`status-${p.id}`}>{stock(state,p.id)>0?'มีสินค้า':'หมด'}</small></span></div>)}</div>
    <div className="inventory-main-actions"><button className="primary" disabled={!variants.some(p=>p.active&&stock(state,p.id)>0)} aria-label={`ขาย ${model.name}`} onClick={()=>onSelect(model.id)}>เลือกขาย<ChevronRight size={16} aria-hidden="true"/></button></div>
   </article>;
  })}</div>
  {!models.length&&<div className="empty-state"><h2>ไม่พบสินค้าที่ตรงกับตัวกรอง</h2><p>ลองเปลี่ยนชื่อ ประเภท หรือสถานะ</p><button onClick={clear}>ล้างตัวกรอง</button></div>}
  {!saleOnly&&<section className="inventory-support" aria-label="งานจัดการสต๊อก"><h2>จัดการสต๊อก</h2><p className="muted">รับของเพิ่ม หรือแก้ยอดตามจำนวนที่นับได้จริง</p><div className="actions"><button onClick={onReceive}>รับสินค้าเข้า</button><button onClick={onCount}>ตรวจนับสินค้า</button></div></section>}
  {!saleOnly&&<><details className="stock-more"><summary>ประวัติรับเข้าและปรับสต๊อก</summary><p className="muted">20 รายการล่าสุด · รายการขายอยู่ในเมนูรายการขาย</p>{state.movements.filter(m=>['receipt','count','deduction','deduction-undo'].includes(m.type)).slice(-20).reverse().map(m=>{const p=state.products.find(p=>p.id===m.productId);return p&&<p key={m.id}>{productName(p)} · {m.quantity>0?'+':''}{m.quantity} {p.unit}<small>{dateTime(m.createdAt)} · {m.type==='receipt'?'รับเข้า':m.type==='count'?`ตรวจนับได้ ${m.countedQuantity} ${p.unit}`:m.type==='deduction'?'ขายจากบิลมือ':'เลิกทำ'}</small></p>;})}{!state.movements.some(m=>['receipt','count','deduction','deduction-undo'].includes(m.type))&&<p>ยังไม่มีรายการ</p>}</details><details className="stock-more"><summary>ดูเพิ่มเติม</summary><label className="checkbox-row"><input type="checkbox" checked={inactive} onChange={e=>setInactive(e.target.checked)}/><span>แสดงรุ่นที่ปิดใช้งานด้วย</span></label></details></>}
 </section>;
}
