import {useEffect,useRef,useState} from 'react';
import {Plus,Minus,X} from 'lucide-react';
import {money,type DemoState,type Product} from './domain';
import {ProductPhoto} from './ProductPhoto';
type SelectionLine={productId:string;quantity:string;price:string};

export default function SaleSelection({state,modelId,lines,available,onApply,onClose}:{state:DemoState;modelId:string;lines:SelectionLine[];available:(p:Product)=>number;onApply:(lines:SelectionLine[],modelId:string)=>void;onClose:()=>void}) {
 const dialog=useRef<HTMLDialogElement>(null),previous=useRef(document.activeElement as HTMLElement|null);
 const model=state.models.find(m=>m.id===modelId)!;
 const variants=state.products.filter(p=>p.modelId===modelId&&(p.active||lines.some(l=>l.productId===p.id)));
 const [quantities,setQuantities]=useState<Record<string,string>>(()=>Object.fromEntries(variants.map(p=>[p.id,lines.find(l=>l.productId===p.id)?.quantity??'0'])));
 const [attempted,setAttempted]=useState(false),[error,setError]=useState('');
 useEffect(()=>{const el=dialog.current;el?.showModal();return ()=>{el?.close();};},[]);
 function close(){onClose();requestAnimationFrame(()=>previous.current?.focus({preventScroll:true}));}
 const selected=variants.filter(p=>Number(quantities[p.id])>0);
 function issue(p:Product){const value=quantities[p.id];return !/^\d+$/.test(value)||!Number.isSafeInteger(Number(value))?'จำนวนต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป':Number(value)>available(p)?`ขายได้ไม่เกิน ${available(p)} ${p.unit}`:'';}
 function apply(){setAttempted(true);const invalid=variants.find(p=>issue(p));if(invalid){setError(`${invalid.code}: ${issue(invalid)}`);return;}if(!selected.length){setError('เลือกจำนวนอย่างน้อยหนึ่งรายการ');return;}onApply(selected.map(p=>({productId:p.id,quantity:quantities[p.id],price:lines.find(l=>l.productId===p.id)?.price??(p.price/100).toFixed(2)})),modelId);}
 function change(p:Product,value:string){setQuantities(q=>({...q,[p.id]:value}));setError('');}
 return <dialog ref={dialog} className="selection-dialog" aria-labelledby="selection-title" onCancel={e=>{e.preventDefault();close();}}>
  <div className="selection-heading"><h2 id="selection-title">เลือกสินค้าและจำนวน</h2><button className="icon-button" aria-label="ปิดตัวเลือกสินค้า" onClick={close}><X size={16} aria-hidden="true"/></button></div>
  <div className="inventory-model-heading"><ProductPhoto id={model.imageId} alt={`รูป ${model.name}`}/><div><h3>{model.name}</h3><p className="muted">เลือกจำนวนจากแต่ละสี / ไซซ์ · ยังไม่ตัดสต๊อก</p></div></div>
  {error&&<p className="message error" role="alert">{error}</p>}
  <div className="selection-options">{variants.map(p=><div className="selection-row" key={p.id}><div><strong>{[p.color,p.size].filter(Boolean).join(' · ')||'ไม่แยกสี / ไซซ์'}</strong><p>{p.code} · {money(p.price)} บาท/{p.unit}</p><p className="muted">ขายได้ {available(p)} {p.unit}{available(p)===0?' · หมด':''}</p></div><div><label htmlFor={`selection-${p.id}`}>จำนวน ({p.unit})</label><div className="selection-quantity"><button aria-label={`ลดจำนวน ${p.code}`} disabled={Number(quantities[p.id])<=0} onClick={()=>change(p,String(Math.max(0,Number(quantities[p.id])-1)))}><Minus size={14} aria-hidden="true"/></button><input id={`selection-${p.id}`} aria-label={`จำนวน ${p.code}`} inputMode="numeric" value={quantities[p.id]} disabled={available(p)===0} aria-invalid={attempted&&!!issue(p)} aria-describedby={attempted&&issue(p)?`selection-error-${p.id}`:undefined} onChange={e=>change(p,e.target.value)}/><button aria-label={`เพิ่มจำนวน ${p.code}`} disabled={Number(quantities[p.id])>=available(p)} onClick={()=>change(p,String((Number(quantities[p.id])||0)+1))}><Plus size={14} aria-hidden="true"/></button></div>{attempted&&issue(p)&&<p className="field-error" id={`selection-error-${p.id}`}>{issue(p)}</p>}{Number(quantities[p.id])>0&&!issue(p)&&<p className="selection-after">ขาย {quantities[p.id]} → เหลือ {available(p)-Number(quantities[p.id])} {p.unit}</p>}</div></div>)}</div>
  <div className="selection-footer"><p>{selected.length} รายการที่เลือก</p><div className="actions"><button onClick={close}>กลับ</button><button className="primary" onClick={apply}>เพิ่มในบิล</button></div></div>
 </dialog>;
}
