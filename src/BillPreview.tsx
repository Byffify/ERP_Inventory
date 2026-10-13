import {useEffect,useRef,useState} from 'react';
import {ZoomIn,X} from 'lucide-react';
import {money,type Sale} from './domain';
import {PaperBill} from './PaperBill';

function ExpandedBill({sale,onClose}:{sale:Sale;onClose:()=>void}) {
  const dialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{
    const element=dialog.current;
    element?.showModal();
    return ()=>element?.close();
  },[]);
  return <dialog ref={dialog} className="bill-zoom-dialog" aria-labelledby="bill-zoom-title" onCancel={e=>{e.preventDefault();onClose();}}>
    <div className="bill-zoom-heading"><h2 id="bill-zoom-title">ขยายบิลเงินสด</h2><button onClick={onClose} autoFocus><X size={20} aria-hidden="true"/>ปิด</button></div>
    <p className="muted">เลื่อนซ้าย–ขวาเพื่อดูบิลทั้งหน้า</p>
    <div className="bill-zoom-scroll" tabIndex={0} role="region" aria-label="บิลขนาดอ่านเต็ม"><PaperBill sale={sale}/></div>
  </dialog>;
}

export default function BillPreview({sale}:{sale:Sale}) {
  const [expanded,setExpanded]=useState(false);
  const zoomButton=useRef<HTMLButtonElement>(null);
  function close(){setExpanded(false);requestAnimationFrame(()=>zoomButton.current?.focus({preventScroll:true}));}
  return <div className="bill-preview">
    <section className="bill-readable-summary" aria-label="สรุปบิลที่ออกแล้ว">
      <h2>รายการในบิล {sale.code}</h2>
      <p className="muted">{sale.status==='cancelled'?'ยกเลิกแล้ว · คืนสต๊อกแล้ว':sale.status==='draft'?'ร่าง · ยังไม่ตัดสต๊อก':'ยืนยันแล้ว'} · รุ่น {sale.revision}</p>
      <ul>{sale.lines.map(line=><li key={line.productId}><strong>{line.name}</strong><p>{line.quantity} {line.unit} × {money(line.price)} บาท/{line.unit}</p><p>เป็นเงิน {money(line.quantity*line.price)} บาท</p></li>)}</ul>
      <p className="bill-readable-total"><span>รวมเงิน</span><strong>{money(sale.total)} บาท</strong></p>
    </section>
    <div className="bill-preview-heading"><h2>ภาพบิลสำหรับส่งหรือพิมพ์</h2><button ref={zoomButton} onClick={()=>setExpanded(true)}><ZoomIn size={20} aria-hidden="true"/>ขยายบิล</button></div>
    <PaperBill sale={sale}/>
    {expanded&&<ExpandedBill sale={sale} onClose={close}/>}
  </div>;
}
