import {useState} from 'react';
import {Search} from 'lucide-react';
import {stock,productName,type DemoState,type Product} from './domain';
import {filterInventory} from './inventory';
export default function StockOperation({state,mode,initialProductId='',onSave,onCancel}:{state:DemoState;mode:'receipt'|'count'|'out';initialProductId?:string;onSave:(p:Product,q:number,id:string)=>boolean;onCancel:()=>void}) {
 const [search,setSearch]=useState(''),[productId,setProductId]=useState(initialProductId),[quantity,setQuantity]=useState(''),[attempted,setAttempted]=useState(false),[operationId]=useState(()=>crypto.randomUUID());
 const p=state.products.find(p=>p.id===productId),current=p?stock(state,p.id):0;
 const valid=/^\d+$/.test(quantity)&&Number.isSafeInteger(Number(quantity))&&Number(quantity)>=(mode==='count'?0:1)&&(mode!=='out'||Number(quantity)<=current);
 const after=mode==='count'?Number(quantity):mode==='out'?current-Number(quantity):current+Number(quantity);
 function save(){setAttempted(true);if(p&&valid)onSave(p,Number(quantity),operationId);}
 return <section className="stock-operation"><p className="intro">{mode==='count'?'ใส่จำนวนที่นับได้จริง ระบบจะคำนวณส่วนต่างให้':mode==='out'?'ใส่จำนวนที่จ่ายออก · ลดสต๊อกโดยไม่สร้างบิล หากต้องการออกบิลให้ใช้เมนูทำบิล':'ใส่จำนวนที่รับเพิ่ม ระบบจะบวกเข้ากับยอดเดิม'}</p>
  {!p?<><label className="search-field"><Search size={16} aria-hidden="true"/><span className="sr-only">ค้นหาสินค้าเพื่อจัดการสต๊อก</span><input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="ชื่อ / รหัส"/></label><div className="operation-products">{filterInventory(state,{search}).map(p=><button key={p.id} aria-label={`เลือก ${p.code}`} onClick={()=>{setProductId(p.id);setAttempted(false);}}><span><strong>{productName(p)}</strong><small>{p.code} · คงเหลือ {stock(state,p.id)} {p.unit}</small></span><span>เลือก</span></button>)}</div>{!filterInventory(state,{search}).length&&<div className="empty-state"><p>ไม่พบสินค้า</p><button onClick={()=>setSearch('')}>ล้างคำค้น</button></div>}<button onClick={onCancel}>กลับไปสินค้า</button></>:<>
   <h2>{productName(p)}</h2><p>{p.code} · คงเหลือ {current} {p.unit}</p><button className="text-button" onClick={()=>{setProductId('');setQuantity('');setAttempted(false);}}>เปลี่ยนสินค้า</button>
   <label>{mode==='count'?'จำนวนที่นับได้จริง':mode==='out'?'จำนวนที่จ่ายออก':'จำนวนที่รับเข้า'}<input inputMode="numeric" value={quantity} onChange={e=>setQuantity(e.target.value)} aria-invalid={attempted&&!valid} aria-describedby={attempted&&!valid?'operation-error':undefined}/></label>
   {attempted&&!valid&&<p className="field-error" id="operation-error">{mode==='out'&&Number(quantity)>current?`จ่ายออกได้ไม่เกิน ${current} ${p.unit}`:mode==='count'?'จำนวนต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป':'จำนวนต้องเป็นจำนวนเต็มมากกว่า 0'}</p>}
   {valid&&<div className="operation-preview"><p>ยอดเดิม {current} {p.unit}</p><p>{mode==='count'?`นับได้จริง ${quantity}`:mode==='out'?`จ่ายออก ${quantity}`:`รับเพิ่ม ${quantity}`} {p.unit}</p><strong>ยอดหลังบันทึก {after} {p.unit}</strong>{mode==='count'&&<p>ปรับส่วนต่าง {after-current>0?'+':''}{after-current} {p.unit} · ไม่สร้างบิลขาย</p>}</div>}
   <div className="actions"><button onClick={onCancel}>ยกเลิก</button><button className="primary" onClick={save}>{mode==='count'?'บันทึกยอดที่นับได้':mode==='out'?'บันทึกจ่ายออก':'บันทึกรับเข้า'}</button></div>
  </>}
 </section>;
}
