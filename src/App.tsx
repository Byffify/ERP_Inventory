import {useEffect,useRef,useState,type ReactNode} from 'react';
import {Package,ReceiptText,ClipboardList,Search,Plus,ArrowLeft,ArrowRight,Check,Download,RotateCcw,Trash2,AlertCircle,PackagePlus,Pencil,ChevronRight,X} from 'lucide-react';
import {seed,stock,saveDraft,confirmSale,reviseSale,cancelSale,receiveStock,loadState,commit,parsePrice,money,dateTime,productName,STORAGE_KEY,type DemoState,type Sale,type Product,type InputLine} from './domain';
import {exportBillImage} from './bill-image';
import CatalogForm from './CatalogForm';
import {ModelDetail} from './CatalogBrowser';
import {addCategory,saveModel,resolvedImage,type ModelInput} from './catalog';
import {ProductPhoto} from './ProductPhoto';
import {clearImages,removeImage} from './images';
import {PaperBill,openPrintBill} from './PaperBill';
import {defaultDocument,issueSale,deductStock,undoDeduction,type BillDetails} from './domain';
import StockCards from './StockCards';

type View='products'|'model'|'catalog'|'editor'|'sales'|'bill'|'receive';
type Entry={productId:string;quantity:string;price:string};
type Editor={id:string;revision?:number;lines:Entry[];document:BillDetails};
const uid=()=>crypto.randomUUID();
const message=(e:unknown)=>e instanceof Error?e.message:'ทำรายการไม่สำเร็จ กรุณาลองใหม่';
const statusText=(s:Sale['status'])=>({draft:'ร่าง · ยังไม่ตัดสต๊อก',confirmed:'ยืนยันแล้ว',cancelled:'ยกเลิกแล้ว'}[s]);
function readInitial(){try{return {state:loadState(localStorage),error:''};}catch(e){return {state:null,error:message(e)};}}

function ConfirmDialog({title,children,onConfirm,onClose,busy=false}:{title:string;children:ReactNode;onConfirm:()=>void;onClose:()=>void;busy?:boolean}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{ref.current?.showModal();},[]);
 return <dialog ref={ref} className="dialog" aria-labelledby="dialog-title" onCancel={e=>{e.preventDefault();onClose();}}>
  <h2 id="dialog-title">{title}</h2><div className="dialog-copy">{children}</div><div className="actions"><button onClick={onClose} disabled={busy} autoFocus>กลับ</button><button className="primary" onClick={onConfirm} disabled={busy}>ยืนยัน</button></div>
 </dialog>;
}

export default function App(){
 const [initial]=useState(readInitial);const [state,setState]=useState<DemoState|null>(initial.state);
 const [error,setError]=useState(initial.error);const [notice,setNotice]=useState('');const [view,setView]=useState<View>('products');
 const [modelId,setModelId]=useState('');const [editor,setEditor]=useState<Editor>(()=>({id:uid(),lines:[],document:defaultDocument(initial.state?.shop)}));
 const [attempted,setAttempted]=useState(false);const [selected,setSelected]=useState('');const [busy,setBusy]=useState(false);const inFlight=useRef(false);
 const [lastDeduction,setLastDeduction]=useState<string|null>(null);
 const [receipt,setReceipt]=useState({id:uid(),productId:'a',quantity:'',review:false});
 const [confirm,setConfirm]=useState<'reset'|'cancel'|null>(null);const [exporting,setExporting]=useState(false);
 const headingRef=useRef<HTMLHeadingElement>(null);const previousView=useRef(view);
 useEffect(()=>{if(previousView.current!==view){window.scrollTo({top:0});headingRef.current?.focus();previousView.current=view;}},[view]);
 const sale=state?.sales.find(s=>s.id===selected);
 function go(next:View){setError('');setNotice('');setLastDeduction(null);setAttempted(false);setView(next);}
 function transact(fn:(s:DemoState)=>DemoState,after?:(s:DemoState)=>void){
  if(!state||inFlight.current)return false;inFlight.current=true;setBusy(true);setError('');
  try{const next=commit(localStorage,state,fn(state));setState(next);setNotice('');setLastDeduction(null);after?.(next);return true;}catch(e){setError(message(e));return false;}finally{inFlight.current=false;setBusy(false);}
 }
 function add(p:Product){
  setEditor(e=>{const found=e.lines.find(l=>l.productId===p.id);return {...e,lines:found?e.lines.map(l=>l.productId===p.id?{...l,quantity:String((Number(l.quantity)||0)+1)}:l):[...e.lines,{productId:p.id,quantity:'1',price:(p.price/100).toFixed(2)}]};});
  setError('');setAttempted(false);
 }
 function entries():InputLine[]{return editor.lines.map(l=>{if(!/^\d+$/.test(l.quantity)||Number(l.quantity)<=0||!Number.isSafeInteger(Number(l.quantity)))throw new Error('จำนวนต้องเป็นจำนวนเต็มมากกว่า 0');return {productId:l.productId,quantity:Number(l.quantity),price:parsePrice(l.price)};});}
 function fieldErrors(l:Entry){let price='';try{parsePrice(l.price);}catch(e){price=message(e);}return {quantity:!/^\d+$/.test(l.quantity)||Number(l.quantity)<=0||!Number.isSafeInteger(Number(l.quantity))?'จำนวนต้องเป็นจำนวนเต็มมากกว่า 0':'',price};}
 const previewTotal=editor.lines.reduce((n,l)=>{try{const q=Number(l.quantity);return Number.isSafeInteger(q)&&q>0?n+q*parsePrice(l.price):n;}catch{return n;}},0);
 function confirmSaleAction(){setAttempted(true);try{const data=entries();transact(s=>editor.revision?reviseSale(s,editor.id,editor.revision,data,editor.document):issueSale(s,editor.id,data,editor.document),(next)=>{setSelected(editor.id);setView('bill');setNotice(editor.revision?'แก้บิลและปรับยอดตามผลต่างแล้ว':'ออกบิลและตัดสต๊อกแล้ว');setEditor({id:uid(),lines:[],document:defaultDocument(next.shop)});});}catch(e){setError(message(e));}}
 function createModel(){setModelId(uid());go('catalog');}
 function openModel(id:string){setModelId(id);go('model');}
 function saveCatalog(input:ModelInput){return transact(s=>saveModel(s,input),(next)=>{const used=new Set([...next.models.map(m=>m.imageId),...next.products.map(p=>p.imageId)]);for(const id of [state?.models.find(m=>m.id===input.id)?.imageId,...(state?.products.filter(p=>p.modelId===input.id).map(p=>p.imageId)??[])])if(id&&!used.has(id))void removeImage(id).catch(()=>{});setModelId(input.id);setView('model');setNotice('บันทึกข้อมูลสินค้าและ SKU แล้ว');});}
 function createCategory(name:string){const id=uid();return transact(s=>addCategory(s,id,name))?id:undefined;}
 function reduceStock(p:Product,q:number){const id=uid();return transact(s=>deductStock(s,id,p.id,q),(next)=>{setLastDeduction(id);setNotice(`ลด ${q} ${p.unit} แล้ว · คงเหลือ ${stock(next,p.id)} ${p.unit}`);});}
 function undoLast(){if(lastDeduction)transact(s=>undoDeduction(s,lastDeduction),()=>{setNotice('เลิกทำแล้ว คืนจำนวนสินค้าแล้ว');});}
 async function printBill(){if(sale)try{await openPrintBill(sale);}catch(e){setError(message(e));}}
 function editSale(s:Sale){setEditor({id:s.id,revision:s.status==='confirmed'?s.revision:undefined,lines:s.lines.map(l=>({productId:l.productId,quantity:String(l.quantity),price:(l.price/100).toFixed(2)})),document:s.document??defaultDocument(state?.shop)});go('editor');}
 function openReceipt(p:Product){setReceipt({id:uid(),productId:p.id,quantity:'',review:false});go('receive');}
 function reset(){try{const next=seed();localStorage.setItem(STORAGE_KEY,JSON.stringify(next));setState(next);setEditor({id:uid(),lines:[],document:defaultDocument(state?.shop)});setSelected('');setReceipt({id:uid(),productId:'a',quantity:'',review:false});setView('products');setError('');setNotice('รีเซ็ตข้อมูลแล้ว');void clearImages().catch(()=>setError('รีเซ็ตยอดแล้ว แต่ล้างรูปไม่สำเร็จ กรุณาลองรีเซ็ตอีกครั้ง'));}catch{setError('รีเซ็ตไม่สำเร็จ กรุณาตรวจพื้นที่จัดเก็บของเบราว์เซอร์');}finally{setConfirm(null);}}
 function reload(){try{setState(loadState(localStorage));setError('');setNotice('โหลดข้อมูลล่าสุดแล้ว');}catch(e){setError(message(e));}}
 async function download(){if(!sale||exporting)return;setExporting(true);setError('');try{await exportBillImage(sale);setNotice('สร้างภาพบิลแล้ว เลือกส่งไฟล์ผ่าน LINE ด้วยตัวเอง');}catch(e){setError(message(e));}finally{setExporting(false);}}
 const titles:Record<View,string>={products:'รายการสินค้า',model:state?.models.find(m=>m.id===modelId)?.name??'ตัวเลือกสินค้า',catalog:state?.models.some(m=>m.id===modelId)?'แก้ข้อมูลสินค้า':'เพิ่มสินค้า',editor:editor.revision?'แก้รายการขาย':'ทำบิลขาย',sales:'รายการขาย',bill:'บิลเงินสด',receive:'รับของเข้า'};
 const active=['products','model','catalog','receive'].includes(view)?'products':view==='editor'?'editor':'sales';
 const receiptProduct=state?.products.find(p=>p.id===receipt.productId);
 const receiptValid=/^\d+$/.test(receipt.quantity)&&Number(receipt.quantity)>0&&Number.isSafeInteger(Number(receipt.quantity));
 const nav=<nav className="navigation" aria-label="เมนูหลัก">{([{id:'products',label:'สต๊อก',Icon:Package},{id:'editor',label:'ทำบิล',Icon:ReceiptText},{id:'sales',label:'รายการขาย',Icon:ClipboardList}] as const).map(({id,label,Icon})=><button key={id} onClick={()=>go(id)} aria-current={active===id?'page':undefined}><Icon size={22} aria-hidden="true"/><span>{label}</span></button>)}</nav>;
 if(location.pathname==='/pitch')return <Pitch/>;
 return <>
  <a className="skip-link" href="#main">ข้ามไปเนื้อหา</a>
  <header className="app-header"><div className="header-inner"><span className="project-name">ระบบสต๊อกและบิล<br className="mobile-break"/>ร้านขายส่งชุดชั้นใน</span></div></header>
  <div className="nav-wrap">{nav}</div>
  <main id="main" className="container">
   <div className="page-heading">{!['products','sales','editor'].includes(view)&&<button className="back-button" aria-label="กลับ" onClick={()=>go(view==='model'||view==='catalog'?'products':view==='receive'?'model':'sales')}><ArrowLeft size={22} aria-hidden="true"/></button>}<h1 ref={headingRef} tabIndex={-1}>{titles[view]}</h1></div>
   {error&&<div className="message error" role="alert"><AlertCircle size={22} aria-hidden="true"/><div>{error}{error.includes('แท็บ')&&<button className="text-button" onClick={reload}>โหลดข้อมูลล่าสุด</button>}</div></div>}
   {notice&&<div className="message" role="status"><Check size={22} aria-hidden="true"/><span>{notice}</span>{lastDeduction&&<button onClick={undoLast}>เลิกทำ</button>}</div>}
   {!state?<section className="empty-state"><p>หยุดทำรายการเพื่อรักษาข้อมูลเดิม</p><button onClick={reload}>ลองโหลดข้อมูลอีกครั้ง</button><button className="primary" onClick={()=>setConfirm('reset')}>รีเซ็ตข้อมูล</button></section>:<>
   {view==='products'&&<StockCards state={state} onOpen={openModel} onCreate={createModel} onReceive={p=>{setModelId(p.modelId);openReceipt(p);}} onDeduct={reduceStock}/>}
   {view==='model'&&<ModelDetail state={state} modelId={modelId} onEdit={()=>go('catalog')} onSell={p=>{add(p);go('editor');}} onReceive={openReceipt}/>}
   {view==='catalog'&&<CatalogForm key={modelId} state={state} modelId={modelId} onSave={saveCatalog} onCategory={createCategory} onCancel={()=>go(state.models.some(m=>m.id===modelId)?'model':'products')}/>}
   {view==='editor'&&<>
    <p className="intro">{editor.revision?'บิลเดิมยังมีผลจนกว่าจะยืนยันการแก้ไข':'เลือกสินค้าและจำนวน ตรวจยอดในหน้านี้ แล้วกดยืนยันและออกบิล'}</p>
    <div className="workspace"><section aria-label="รายการสินค้าในบิล">
     {!editor.lines.length&&<div className="empty-state"><ReceiptText size={36} aria-hidden="true"/><h2>เริ่มจากเลือกสินค้า</h2><p>เลือกจากรายการด้านล่าง แล้วระบุจำนวนขาย</p></div>}
     {editor.lines.map((line,i)=>{const p=state.products.find(p=>p.id===line.productId)!;const errors=fieldErrors(line);return <article className="editor-row" key={p.id}>
      <div className="line-title"><ProductPhoto id={resolvedImage(state,p)} alt={`รูป ${p.code}`}/><div><span className="product-code">{p.code}</span><h2>{productName(p)}</h2><p className="muted">คงเหลือ {stock(state,p.id)} {p.unit}</p></div><button className="icon-button" aria-label={`นำ ${p.code} ออกจากบิล`} onClick={()=>setEditor(e=>({...e,lines:e.lines.filter(l=>l.productId!==p.id)}))}><X size={22} aria-hidden="true"/></button></div>
      <div className="input-pair"><label htmlFor={`q-${i}`}>จำนวน ({p.unit})<input id={`q-${i}`} aria-label={`จำนวน (${p.unit})`} inputMode="numeric" value={line.quantity} aria-invalid={attempted&&!!errors.quantity} aria-describedby={attempted&&errors.quantity?`qe-${i}`:undefined} onChange={e=>setEditor(v=>({...v,lines:v.lines.map(l=>l.productId===p.id?{...l,quantity:e.target.value}:l)}))}/>{attempted&&errors.quantity&&<span className="field-error" id={`qe-${i}`}>{errors.quantity}</span>}</label>
      <label htmlFor={`p-${i}`}>ราคา (บาท/{p.unit})<input id={`p-${i}`} aria-label={`ราคา (บาท/${p.unit})`} inputMode="decimal" value={line.price} aria-invalid={attempted&&!!errors.price} aria-describedby={attempted&&errors.price?`pe-${i}`:undefined} onChange={e=>setEditor(v=>({...v,lines:v.lines.map(l=>l.productId===p.id?{...l,price:e.target.value}:l)}))}/>{attempted&&errors.price&&<span className="field-error" id={`pe-${i}`}>{errors.price}</span>}</label></div>
     </article>;})}
     <details className="bill-data-fields"><summary>ข้อมูลบนบิล (ไม่บังคับ)</summary><div className="form-fields">{([{key:'sellerName',label:'ชื่อร้าน'},{key:'sellerAddress',label:'ที่อยู่ร้าน'},{key:'sellerTaxId',label:'เลขผู้เสียภาษีร้าน (ไม่บังคับ)'},{key:'buyerName',label:'ชื่อลูกค้า'},{key:'buyerAddress',label:'ที่อยู่ลูกค้า'},{key:'buyerTaxId',label:'เลขผู้เสียภาษีลูกค้า (ไม่บังคับ)'},{key:'buyerRegistration',label:'ทะเบียนการค้าลูกค้า (ไม่บังคับ)'},{key:'bookNumber',label:'เล่มที่'},{key:'receiverName',label:'ชื่อผู้รับเงิน (ไม่บังคับ)'}] as const).map(({key,label})=><label key={key}>{label}<input value={editor.document[key]??''} maxLength={1000} onChange={e=>setEditor(current=>({...current,document:{...current.document,[key]:e.target.value}}))}/></label>)}</div></details><details className="product-picker" open={!editor.lines.length}><summary>เพิ่มสินค้าในบิล</summary><div className="add-products">{state.products.filter(p=>p.active).map(p=><button key={p.id} onClick={()=>add(p)} aria-label={`เพิ่ม ${p.code} ในบิล`}><span>{productName(p)}<small>{p.code} · {p.unit} · คงเหลือ {stock(state,p.id)}</small></span><Plus size={22} aria-hidden="true"/></button>)}</div></details>
    </section><aside className="order-summary"><h2>สรุปรายการ</h2><p>{editor.lines.length} รายการ</p><div className="summary-total"><span>ยอดรวม</span><strong>{money(previewTotal)} บาท</strong></div><button className="primary full-width" disabled={busy||!editor.lines.length} onClick={confirmSaleAction}><Check size={20} aria-hidden="true"/>{editor.revision?'ยืนยันการแก้ไข':'ยืนยันและออกบิล'}</button><p className="muted">{editor.revision?'ยอดจะปรับเมื่อยืนยันการแก้ไข':'กดยืนยันแล้วจึงตัดสต๊อก'}</p></aside></div>

   </>}
   {view==='receive'&&receiptProduct&&<section className="receive-form"><p className="intro">บันทึกสินค้าที่รับจริง เพื่อเพิ่มยอดคงเหลือ</p><span className="product-code">{receiptProduct.code}</span><h2>{productName(receiptProduct)}</h2><p className="muted">คงเหลือ {stock(state,receiptProduct.id)} {receiptProduct.unit}</p>
    {!receipt.review?<><label htmlFor="receive-q">จำนวนรับเข้า ({receiptProduct.unit})<input id="receive-q" aria-label={`จำนวนรับเข้า (${receiptProduct.unit})`} value={receipt.quantity} inputMode="numeric" aria-invalid={attempted&&!receiptValid} aria-describedby={attempted&&!receiptValid?'receive-error':undefined} onChange={e=>setReceipt(r=>({...r,quantity:e.target.value}))}/>{attempted&&!receiptValid&&<span id="receive-error" className="field-error">จำนวนต้องเป็นจำนวนเต็มมากกว่า 0</span>}</label><button className="primary full-width" onClick={()=>{setAttempted(true);if(receiptValid){setError('');setReceipt(r=>({...r,review:true}));}}}>ตรวจรายการรับเข้า<ArrowRight size={20} aria-hidden="true"/></button></>:<><div className="receipt-preview"><p>รับเข้า {receipt.quantity} {receiptProduct.unit}</p><strong>ยอดหลังรับเข้า {stock(state,receiptProduct.id)+Number(receipt.quantity)} {receiptProduct.unit}</strong></div><div className="actions"><button onClick={()=>setReceipt(r=>({...r,review:false}))}>กลับไปแก้ไข</button><button className="primary" disabled={busy} onClick={()=>transact(s=>receiveStock(s,receipt.id,receipt.productId,Number(receipt.quantity)),()=>{setView('products');setNotice(`รับเข้า ${receipt.quantity} ${receiptProduct.unit} แล้ว`);})}>ยืนยันรับเข้า</button></div></>}
   </section>}
   {view==='sales'&&<>
    <p className="intro">เปิดบิล ดูสถานะ และตรวจประวัติการแก้ไข</p>
    {!state.sales.length?<div className="empty-state"><ClipboardList size={36} aria-hidden="true"/><h2>ยังไม่มีรายการขาย</h2><p>เลือกสินค้าที่ต้องการขายเพื่อเริ่มทำบิล</p><button className="primary" onClick={()=>go('editor')}>ทำบิลขาย</button></div>:<div className="sales-list">{[...state.sales].reverse().map(s=><button className="sale-row" key={s.id} onClick={()=>{setSelected(s.id);go('bill');}}><span><strong>{s.code}</strong><small>{statusText(s.status)} · รุ่น {s.revision}</small><small>{dateTime(s.updatedAt)}</small></span><span className="sale-amount">{money(s.total)} บาท<ChevronRight size={22} aria-hidden="true"/></span></button>)}</div>}
    <details className="movement-history"><summary>ประวัติการรับของเข้า</summary>{state.movements.filter(m=>m.type==='receipt').length?state.movements.filter(m=>m.type==='receipt').reverse().map(m=>{const p=state.products.find(p=>p.id===m.productId)!;return <p key={m.id}>{p.code} · +{m.quantity} {p.unit}<br/><small>{dateTime(m.createdAt)} · {m.reference}</small></p>;}):<p>ยังไม่มีรายการรับเข้า</p>}</details>
   </>}
   {view==='bill'&&sale&&<>
    {sale.status==='confirmed'&&<section className="remaining-summary" aria-label="ยอดคงเหลือหลังขาย"><h2>ยอดคงเหลือตอนนี้</h2>{sale.lines.map(l=><p key={l.productId}><span>{state.products.find(p=>p.id===l.productId)?.code}</span><strong data-testid={`remaining-${l.productId}`}>{stock(state,l.productId)} {l.unit}</strong></p>)}</section>}
    <div className="workspace bill-workspace"><PaperBill sale={sale}/><aside className="bill-actions">{sale.status!=='draft'?<><button className="primary full-width" disabled={exporting} onClick={download}><Download size={20} aria-hidden="true"/>{exporting?'กำลังสร้างภาพ…':'ดาวน์โหลดภาพบิล'}</button><button className="full-width" onClick={printBill}>พิมพ์ / บันทึก PDF</button><p className="muted small">เลือกส่งไฟล์ผ่าน LINE ด้วยตัวเอง<br/>ภาพที่ส่งแล้วจะไม่อัปเดตอัตโนมัติ</p></>:<button className="primary full-width" onClick={()=>editSale(sale)}>เปิดร่างเพื่อตรวจรายการ</button>}
     {sale.status==='confirmed'&&<div className="actions"><button onClick={()=>editSale(sale)}><Pencil size={20} aria-hidden="true"/>แก้รายการ</button><button onClick={()=>setConfirm('cancel')}><Trash2 size={20} aria-hidden="true"/>ยกเลิกบิล</button></div>}
     <button className="full-width" onClick={()=>{setEditor({id:uid(),lines:[],document:defaultDocument(state?.shop)});go('products');}}>ทำบิลใหม่<Plus size={20} aria-hidden="true"/></button>
     {!!state.history.filter(h=>h.id===sale.id).length&&<details className="movement-history"><summary>ประวัติรุ่นก่อนหน้า</summary>{state.history.filter(h=>h.id===sale.id).map((h,i)=><div key={i}><p><strong>รุ่น {h.revision} · {statusText(h.status)}</strong><br/>{money(h.total)} บาท</p>{h.lines.map(l=><p className="small" key={l.productId}>{l.name}: {l.quantity} {l.unit} × {money(l.price)} บาท/{l.unit}</p>)}</div>)}</details>}
    </aside></div>
   </>}
   </>}

  </main>
  {confirm==='reset'&&<ConfirmDialog title="รีเซ็ตข้อมูล?" onClose={()=>setConfirm(null)} onConfirm={reset}><p>บิล รายการรับเข้า และรูปสินค้าในเบราว์เซอร์นี้จะถูกล้าง แล้วกลับเป็นยอดเริ่มต้น</p></ConfirmDialog>}
  {confirm==='cancel'&&sale&&<ConfirmDialog title={`ยกเลิกบิล ${sale.code}?`} onClose={()=>setConfirm(null)} onConfirm={()=>{transact(s=>cancelSale(s,sale.id),()=>{setNotice('ยกเลิกบิลและคืนสต๊อกแล้ว');});setConfirm(null);}}><p>คืนสินค้าตามบิลรุ่น {sale.revision}:</p>{sale.lines.map(l=><p key={l.productId}>{l.name}<br/><strong>คืน {l.quantity} {l.unit}</strong></p>)}<p>เก็บบิลไว้ในประวัติ ภาพที่ส่งแล้วจะไม่เปลี่ยนเอง</p></ConfirmDialog>}
 </>;
}

function Pitch(){return <main className="pitch"><div className="pitch-copy"><h1>ตรวจยอด ทำบิล<br/>ยืนยันแล้วตัดสต๊อก</h1><p className="pitch-flow">เลือกสินค้า → สรุปยอด → ออกบิล</p><p className="pitch-example">12 แพ็ก − ขาย 3 แพ็ก<br/>= คงเหลือ 9 แพ็ก</p><p className="pitch-note">ยอดขึ้นกับการบันทึกเข้า–ออกครบ</p></div><img src="/outputs/S4-main-screen.png" alt="หน้าจอหลังออกบิล 3 แพ็ก ยอดคงเหลือ 9 แพ็ก บิล 540 บาท"/></main>;}





