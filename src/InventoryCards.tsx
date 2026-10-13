import {useEffect,useRef,useState} from 'react';
import {Plus,Minus,Search,SlidersHorizontal,Check,X,ChevronRight} from 'lucide-react';
import {stock,productName,dateTime,type DemoState,type Product} from './domain';
import {resolvedImage} from './catalog';
import {filterInventory,inventoryStatus,type Availability} from './inventory';
import {ProductPhoto} from './ProductPhoto';

type InventoryProps={state:DemoState;onOpen:(id:string)=>void;onCreate:()=>void;onReceive:(p:Product)=>void;onDeduct:(p:Product,q:number)=>boolean};
function InventoryCard({state,p,onOpen,onReceive,onDeduct,editing,onEdit}:{state:DemoState;p:Product;onOpen:InventoryProps['onOpen'];onReceive:InventoryProps['onReceive'];onDeduct:InventoryProps['onDeduct'];editing:boolean;onEdit:(id:string|null)=>void}){
 const [quantity,setQuantity]=useState('1'),[invalid,setInvalid]=useState(false);const input=useRef<HTMLInputElement>(null);
 const current=stock(state,p.id),empty=inventoryStatus(state,p)==='empty';
 const categoryId=state.models.find(m=>m.id===p.modelId)?.categoryId;
 const category=state.categories.find(c=>c.id===categoryId)?.name??'ยังไม่จัดประเภท';
 const variants=[p.color,p.size].filter(Boolean).join(' · ');
 useEffect(()=>{if(editing){input.current?.focus({preventScroll:true});}else{setQuantity('1');setInvalid(false);}},[editing]);
 function cancel(){setQuantity('1');setInvalid(false);onEdit(null);}
 function confirm(){if(onDeduct(p,Number(quantity))){cancel();}else setInvalid(true);}
 const errorText=!Number.isSafeInteger(Number(quantity))||Number(quantity)<=0?'จำนวนต้องเป็นจำนวนเต็มมากกว่า 0':Number(quantity)>current?`คงเหลือ ${current} ${p.unit} กรุณาลดไม่เกินยอดนี้`:'ยังไม่ได้ลดจำนวน กรุณาตรวจข้อความแจ้งเตือน';
 return <article className={`inventory-card${empty?' inventory-card-empty':''}`} aria-label={productName(p)}>
  <button className="inventory-identity" aria-label={`ดูตัวเลือก ${p.name}`} onClick={()=>onOpen(p.modelId)}>
   <ProductPhoto id={resolvedImage(state,p)} alt={`รูป ${p.code}`}/>
   <span className="inventory-identity-copy"><span className="inventory-code">{p.code}</span><span className="inventory-name">{p.name}<ChevronRight size={16} aria-hidden="true"/></span>{variants&&<span className="inventory-variant">{variants}</span>}<span className="inventory-type">{category}</span>{!p.active&&<span className="inventory-inactive">ปิดใช้งาน</span>}</span>
  </button>
  <div className="inventory-availability"><div className="inventory-quantity"><span className="inventory-stock-label">คงเหลือ</span><div data-testid={`stock-${p.id}`}><strong className={String(current).length>8?'long-number':''}>{current}</strong><span>{p.unit}</span></div></div><span className={`inventory-status${empty?' is-empty':''}`} data-testid={`status-${p.id}`}>{empty?'หมด':'มีสินค้า'}</span></div>
  {editing?<div className="inventory-deduction"><label htmlFor={`deduct-${p.id}`}>จำนวนที่จะลด ({p.unit})</label><div className="quantity-control"><button aria-label={`ลดจำนวนที่เลือก ${p.code}`} onClick={()=>{setQuantity(String(Math.max(1,(Number(quantity)||1)-1)));setInvalid(false);}}><Minus size={20} aria-hidden="true"/></button><input ref={input} id={`deduct-${p.id}`} aria-label={`จำนวนที่จะลด ${p.code}`} aria-invalid={invalid} aria-describedby={invalid?`deduct-error-${p.id}`:undefined} inputMode="numeric" value={quantity} onChange={e=>{setQuantity(e.target.value);setInvalid(false);}}/><button aria-label={`เพิ่มจำนวนที่เลือก ${p.code}`} onClick={()=>{setQuantity(String((Number(quantity)||0)+1));setInvalid(false);}}><Plus size={20} aria-hidden="true"/></button></div>{invalid&&<p className="field-error" id={`deduct-error-${p.id}`}>{errorText}</p>}<div className="inventory-actions"><button onClick={cancel}>กลับ</button><button className="primary" aria-label={`ลดสต๊อก ${p.code}`} onClick={confirm}><Check size={20} aria-hidden="true"/>ยืนยันลด</button></div></div>:<div className="inventory-actions"><button disabled={!p.active} onClick={()=>onReceive(p)} aria-label={`รับเข้า ${p.code}`}><Plus size={20} aria-hidden="true"/>รับเข้า</button><button className="primary" disabled={!p.active||empty} aria-label={`ลดสต๊อก ${p.code}`} onClick={()=>{setInvalid(false);onEdit(p.id);}}><Minus size={20} aria-hidden="true"/>{empty?'ลดไม่ได้':'ลดจำนวน'}</button></div>}
 </article>;
}

export default function InventoryCards({state,onOpen,onCreate,onReceive,onDeduct}:InventoryProps){
 const [search,setSearch]=useState(''),[category,setCategory]=useState(''),[inactive,setInactive]=useState(false),[availability,setAvailability]=useState<Availability>('all');
 const [filtersOpen,setFiltersOpen]=useState(false),[editing,setEditing]=useState<string|null>(null);
 const select=useRef<HTMLSelectElement>(null);
 useEffect(()=>{if(filtersOpen)select.current?.focus({preventScroll:true});},[filtersOpen]);
 const products=filterInventory(state,{search,category,availability,includeInactive:inactive});
 const total=state.products.filter(p=>inactive||p.active).length;
 const selectedCategory=state.categories.find(c=>c.id===category)?.name;
 function clear(){setSearch('');setCategory('');setAvailability('all');setEditing(null);}
 return <section className="inventory-list" aria-label="รายการสินค้าในสต๊อก">
  <div className="inventory-list-intro"><p className="inventory-count" aria-live="polite">{products.length===total?`ทั้งหมด ${total} รายการ`:`แสดง ${products.length} จาก ${total} รายการ`} · สี/ไซซ์แยกยอดกัน</p><button className="text-button inventory-create" onClick={onCreate}><Plus size={18} aria-hidden="true"/>เพิ่มสินค้า</button></div>
  <div className="inventory-search-row"><label className="search-field"><Search size={20} aria-hidden="true"/><span className="sr-only">ค้นหาสินค้าด้วยรหัสหรือชื่อ</span><input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="ค้นหาชื่อ รุ่น หรือรหัส"/></label><button className={`inventory-filter-button${category?' has-selection':''}`} aria-label="กรองประเภทสินค้า" aria-expanded={filtersOpen} aria-controls="inventory-type-filter" onClick={()=>setFiltersOpen(open=>!open)}><SlidersHorizontal size={20} aria-hidden="true"/><span>ประเภท</span></button></div>
  {filtersOpen&&<div className="inventory-filter-panel" id="inventory-type-filter"><label htmlFor="inventory-category">ประเภทสินค้า<select id="inventory-category" aria-label="ประเภทสินค้า" ref={select} value={category} onChange={e=>{setCategory(e.target.value);setEditing(null);}}><option value="">ทุกประเภท</option>{state.categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>{category&&<button className="text-button" onClick={()=>setCategory('')}><X size={16} aria-hidden="true"/>ล้างประเภท</button>}</div>}
  {selectedCategory&&<p className="inventory-category-context">ประเภท: {selectedCategory}</p>}
  <div className="inventory-status-filters" role="group" aria-label="สถานะสต๊อก">{([{id:'all',text:'ทั้งหมด',label:'ทั้งหมด'},{id:'available',text:'มีสินค้า',label:'มีสินค้า'},{id:'empty',text:'หมด',label:'สินค้าหมด'}] as const).map(option=><button key={option.id} aria-label={option.label} aria-pressed={availability===option.id} onClick={()=>{setAvailability(option.id);setEditing(null);}}>{option.text}</button>)}</div>
  <div className="inventory-grid">{products.map(p=><InventoryCard key={p.id} state={state} p={p} onOpen={onOpen} onReceive={onReceive} onDeduct={onDeduct} editing={editing===p.id} onEdit={setEditing}/>)}</div>
  {!products.length&&<div className="empty-state"><h2>ไม่พบสินค้าที่ตรงกับตัวกรอง</h2><p>ลองเปลี่ยนประเภท สถานะ หรือคำค้น</p><button onClick={clear}>ล้างตัวกรอง</button></div>}
  <details className="stock-more"><summary>ดูเพิ่มเติม</summary><label className="checkbox-row"><input type="checkbox" checked={inactive} onChange={e=>setInactive(e.target.checked)}/><span>แสดงรุ่นที่ปิดใช้งานด้วย</span></label><h2>ประวัติปรับจำนวน</h2>{state.movements.filter(m=>m.type==='deduction'||m.type==='deduction-undo').slice(-20).reverse().map(m=>{const p=state.products.find(p=>p.id===m.productId)!;return <p key={m.id}>{productName(p)} · {m.quantity>0?'+':''}{m.quantity} {p.unit}<small>{dateTime(m.createdAt)} · {m.type==='deduction'?'ลดจำนวน':'เลิกทำ'}</small></p>})}</details>
 </section>;
}

