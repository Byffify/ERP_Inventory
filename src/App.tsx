import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Package,
  ReceiptText,
  ClipboardList,
  Search,
  Plus,
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  RotateCcw,
  Trash2,
  AlertCircle,
  PackagePlus,
  Pencil,
  ChevronRight,
  X,
  Menu,
  ArrowDownUp,
} from "lucide-react";
import {
  seed,
  stock,
  saveDraft,
  confirmSale,
  reviseSale,
  cancelSale,
  receiveStock,
  loadState,
  commit,
  parsePrice,
  money,
  dateTime,
  productName,
  STORAGE_KEY,
  type DemoState,
  type Sale,
  type Product,
  type InputLine,
} from "./domain";
import { exportBillImage } from "./bill-image";
import SimpleProductForm from "./SimpleProductForm";
import {saveSimpleProduct, canDeleteSimpleProduct, deleteSimpleProduct, archiveSimpleProduct, type SimpleProductInput} from "./simple-product";
import SaleProducts from "./SaleProducts";
import {addCartItem} from "./cart";
import { ModelDetail } from "./CatalogBrowser";
import {
  resolvedImage,
} from "./catalog";
import { ProductPhoto } from "./ProductPhoto";
import { clearImages, removeImage } from "./images";
import { openPrintBill } from "./PaperBill";
import {
  defaultDocument,
  issueSale,
  deductStock,
  undoDeduction,
  type BillDetails,
} from "./domain";

import InventoryAdmin from "./InventoryAdmin";
import StockManagement, {type StockMode} from "./StockManagement";

import StockOperation from "./StockOperation";

import BillPreview from "./BillPreview";
import { countStock } from "./domain";
import { initializeAppStorage } from "./startup";

type View =
  | "products"
  | "model"
  | "catalog"
  | "editor"
  | "sales"
  | "bill"
  | "receive"
  | "stocks"
  | "picker"
  | "operation";
type Entry = { productId: string; quantity: string; price: string };
type Editor = {
  id: string;
  revision?: number;
  lines: Entry[];
  document: BillDetails;
};
const uid = () => crypto.randomUUID();
const message = (e: unknown) =>
  e instanceof Error ? e.message : "ทำรายการไม่สำเร็จ กรุณาลองใหม่";
const statusText = (s: Sale["status"]) =>
  ({
    draft: "ร่าง · ยังไม่ตัดสต๊อก",
    confirmed: "ยืนยันแล้ว",
    cancelled: "ยกเลิกแล้ว",
  })[s];
function readInitial() {
  try {
    const initialized=initializeAppStorage(localStorage);
    if(initialized.cleared)void clearImages().catch(()=>{});
    return { state: initialized.state, error: "" };
  } catch (e) {
    return { state: null, error: message(e) };
  }
}

function ConfirmDialog({
  title,
  children,
  onConfirm,
  onClose,
  busy = false,
  closeLabel = "กลับ",
  confirmLabel = "ยืนยัน",
}: {
  title: string;
  children: ReactNode;
  onConfirm: () => void;
  onClose: () => void;
  busy?: boolean;
  closeLabel?: string;
  confirmLabel?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby="dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <h2 id="dialog-title">{title}</h2>
      <div className="dialog-copy">{children}</div>
      <div className="actions">
        <button onClick={onClose} disabled={busy} autoFocus>
          {closeLabel}
        </button>
        <button className="primary" onClick={onConfirm} disabled={busy}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}

export default function App() {
  const [initial] = useState(readInitial);
  const [state, setState] = useState<DemoState | null>(initial.state);
  const [error, setError] = useState(initial.error);
  const [notice, setNotice] = useState("");
  const [view, setView] = useState<View>("products");
  const [modelId, setModelId] = useState("");
  const [editor, setEditor] = useState<Editor>(() => ({
    id: uid(),
    lines: [],
    document: defaultDocument(initial.state?.shop),
  }));
  const [attempted, setAttempted] = useState(false);
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const [lastDeduction, setLastDeduction] = useState<string | null>(null);
  const [lastManualIds,setLastManualIds]=useState<string[]>([]);
  const [pendingProduct,setPendingProduct]=useState<string|null>(null);
  const [stockMode,setStockMode]=useState<StockMode>("receipt");
  const [operationProductId,setOperationProductId]=useState("");
  const [deleteModelId,setDeleteModelId]=useState<string|null>(null);
  const [menuOpen,setMenuOpen]=useState(false);
  const menuButton=useRef<HTMLButtonElement>(null),sidebar=useRef<HTMLElement>(null);
  const handwritten=false;
  const [receipt, setReceipt] = useState({
    id: uid(),
    productId: "a",
    quantity: "",
    review: false,
  });
  const [confirm, setConfirm] = useState<"reset" | "cancel" | null>(null);
  const [exporting, setExporting] = useState(false);
  const [catalogDirty, setCatalogDirty] = useState(false);
  const [pendingView, setPendingView] = useState<View | null>(null);
  const [historySearch, setHistorySearch] = useState("");
  const [historyStatus, setHistoryStatus] = useState("");
  function closeMenu(){setMenuOpen(false);requestAnimationFrame(()=>menuButton.current?.focus());}
  useEffect(()=>{
    if(!menuOpen)return;
    const panel=sidebar.current;
    panel?.querySelector<HTMLButtonElement>('button')?.focus();
    const keyboard=(e:KeyboardEvent)=>{if(e.key==='Escape'){closeMenu();}if(e.key==='Tab'&&panel){const buttons=Array.from(panel.querySelectorAll<HTMLButtonElement>('button'));const first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}};
    const resize=()=>{if(innerWidth>=768)setMenuOpen(false);};
    document.addEventListener('keydown',keyboard);window.addEventListener('resize',resize);
    return ()=>{document.removeEventListener('keydown',keyboard);window.removeEventListener('resize',resize);};
  },[menuOpen]);
  useEffect(() => {
    if (!catalogDirty || view !== "catalog") return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [catalogDirty, view]);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousView = useRef(view);
  useEffect(() => {
    if (previousView.current !== view) {
      window.scrollTo({ top: 0 });
      headingRef.current?.focus();
      previousView.current = view;
    }
  }, [view]);
  const sale = state?.sales.find((s) => s.id === selected);
  function go(next: View) {
    setMenuOpen(false);
    if (view === "catalog" && next !== "catalog" && catalogDirty) {
      setPendingView(next);
      return;
    }
    navigate(next);
  }
  function navigate(next: View) {
    setCatalogDirty(false);
    setError("");
    setNotice("");
    setLastDeduction(null);
    setLastManualIds([]);
    setAttempted(false);
    setView(next);
  }
  function transact(
    fn: (s: DemoState) => DemoState,
    after?: (s: DemoState) => void,
  ) {
    if (!state || inFlight.current) return false;
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      const next = commit(localStorage, state, fn(state));
      setState(next);
      setNotice("");
      setLastDeduction(null);
      setLastManualIds([]);
      after?.(next);
      return true;
    } catch (e) {
      setError(message(e));
      return false;
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }
  function entries(): InputLine[] {
    return editor.lines.map((l) => {
      if (
        !/^\d+$/.test(l.quantity) ||
        Number(l.quantity) <= 0 ||
        !Number.isSafeInteger(Number(l.quantity))
      )
        throw new Error("จำนวนต้องเป็นจำนวนเต็มมากกว่า 0");
      return {
        productId: l.productId,
        quantity: Number(l.quantity),
        price: parsePrice(l.price),
      };
    });
  }
  function addToCart(p:Product){
    try{const lines=addCartItem(editor.lines,p,saleAvailable(p.id));setEditor(current=>({...current,lines}));setError('');}catch(e){setError(message(e));}
  }
  function openStockOperation(mode: StockMode,p?:Product) {setStockMode(mode);setOperationProductId(p?.id??"");go("operation");}
  function saveStockOperation(p: Product,q: number,id: string) {
    return transact(s=>stockMode==="count"?countStock(s,id,p.id,q):stockMode==="out"?deductStock(s,`stock-out-${id}`,p.id,q):receiveStock(s,id,p.id,q),next=>{setView("stocks");if(stockMode==="out")setLastDeduction(`stock-out-${id}`);setNotice(`${stockMode==="count"?"บันทึกยอดที่นับได้":stockMode==="out"?"บันทึกจ่ายออกแล้ว":"รับสินค้าเข้าแล้ว"} · ${p.code} คงเหลือ ${stock(next,p.id)} ${p.unit}`);});
  }
  function fieldErrors(l: Entry) {
    let price = "";
    try {
      if(!handwritten)parsePrice(l.price);
    } catch (e) {
      price = message(e);
    }
    return {
      quantity:
        !/^\d+$/.test(l.quantity) ||
        Number(l.quantity) <= 0 ||
        !Number.isSafeInteger(Number(l.quantity))
          ? "จำนวนต้องเป็นจำนวนเต็มมากกว่า 0"
          : Number(l.quantity) > saleAvailable(l.productId)
            ? `ขายได้ไม่เกิน ${saleAvailable(l.productId)} ${state?.products.find(p => p.id === l.productId)?.unit ?? ""} กรุณาลดจำนวนหรือรับสินค้าเข้า`
            : "",
      price,
    };
  }
  function saleAvailable(productId: string) {
    if (!state) return 0;
    const original = editor.revision
      ? state.sales.find(s => s.id === editor.id && s.status === "confirmed")
      : undefined;
    const oldQuantity=original?.lines.find(l => l.productId === productId)?.quantity ?? 0;
    return state.products.find(p=>p.id===productId)?.active?stock(state, productId)+oldQuantity:oldQuantity;
  }
  const previewTotal = editor.lines.reduce((n, l) => {
    try {
      const q = Number(l.quantity);
      return Number.isSafeInteger(q) && q > 0 ? n + q * parsePrice(l.price) : n;
    } catch {
      return n;
    }
  }, 0);
  function confirmSaleAction() {
    setAttempted(true);
    try {
      if (editor.lines.some(l => { const errors = fieldErrors(l); return errors.quantity || errors.price; })) {
        setError("กรุณาแก้จำนวนหรือราคาตามข้อความใต้ช่องก่อนออกบิล");
        return;
      }
      const data = entries();
      transact(
        (s) =>
          editor.revision
            ? reviseSale(s, editor.id, editor.revision, data, editor.document)
            : issueSale(s, editor.id, data, editor.document),
        (next) => {
          setSelected(editor.id);
          setView("bill");
          setNotice(
            editor.revision
              ? "แก้บิลและปรับยอดตามผลต่างแล้ว"
              : "ออกบิลและตัดสต๊อกแล้ว",
          );
          setEditor({
            id: uid(),
            lines: [],
            document: defaultDocument(next.shop),
          });
        },
      );
    } catch (e) {
      setError(message(e));
    }
  }
  function createModel(){setModelId('');go("catalog");}
  function openModel(id:string){editModel(id);}
  function editModel(id:string){
    if(view==="catalog"&&catalogDirty&&id!==modelId){setPendingProduct(id);return;}
    setModelId(id);go("catalog");
  }
  function removeCatalogModel(){
    if(!state||!deleteModelId)return;
    const id=deleteModelId,deleting=canDeleteSimpleProduct(state,id);
    const oldImages=[...state.models.map(m=>m.imageId),...state.products.map(p=>p.imageId)];
    if(transact(s=>deleting?deleteSimpleProduct(s,id):archiveSimpleProduct(s,id),next=>{
      const used=new Set([...next.models.map(m=>m.imageId),...next.products.map(p=>p.imageId)]);
      for(const image of oldImages)if(image&&!used.has(image))void removeImage(image).catch(()=>{});
      setView("products");setNotice(deleting?"ลบสินค้าแล้ว":"ปิดใช้งานสินค้าแล้ว · เก็บยอดและประวัติไว้");
    }))setDeleteModelId(null);
  }
  function saveCatalog(input:SimpleProductInput){
    const oldImages=[...(state?.models.map(m=>m.imageId)??[]),...(state?.products.map(p=>p.imageId)??[])];
    return transact(s=>saveSimpleProduct(s,input),next=>{
      const used=new Set([...next.models.map(m=>m.imageId),...next.products.map(p=>p.imageId)]);
      for(const image of oldImages)if(image&&!used.has(image))void removeImage(image).catch(()=>{});
      setCatalogDirty(false);setView("products");setNotice("บันทึกข้อมูลสินค้าแล้ว");
    });
  }
  function undoLast() {
    if (lastDeduction)
      transact(
        (s) => (lastManualIds.length?lastManualIds:[lastDeduction]).reduce((next,id)=>undoDeduction(next,id),s),
        () => {
          setNotice("เลิกทำแล้ว คืนจำนวนสินค้าแล้ว");
        },
      );
  }
  async function printBill() {
    if (sale)
      try {
        await openPrintBill(sale);
      } catch (e) {
        setError(message(e));
      }
  }
  function editSale(s: Sale) {

    setEditor({
      id: s.id,
      revision: s.status === "confirmed" ? s.revision : undefined,
      lines: s.lines.map((l) => ({
        productId: l.productId,
        quantity: String(l.quantity),
        price: (l.price / 100).toFixed(2),
      })),
      document: s.document ?? defaultDocument(state?.shop),
    });
    go("editor");
  }
  function openReceipt(p: Product) {
    setReceipt({ id: uid(), productId: p.id, quantity: "", review: false });
    go("receive");
  }
  function reset() {
    try {
      const next = seed();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setState(next);
      setEditor({
        id: uid(),
        lines: [],
        document: defaultDocument(state?.shop),
      });
      setSelected("");
      setReceipt({ id: uid(), productId: "a", quantity: "", review: false });
      setView("products");
      setError("");
      setNotice("รีเซ็ตข้อมูลแล้ว");
      void clearImages().catch(() =>
        setError("รีเซ็ตยอดแล้ว แต่ล้างรูปไม่สำเร็จ กรุณาลองรีเซ็ตอีกครั้ง"),
      );
    } catch {
      setError("รีเซ็ตไม่สำเร็จ กรุณาตรวจพื้นที่จัดเก็บของเบราว์เซอร์");
    } finally {
      setConfirm(null);
    }
  }
  function reload() {
    try {
      setState(loadState(localStorage));
      setError("");
      setNotice("โหลดข้อมูลล่าสุดแล้ว");
    } catch (e) {
      setError(message(e));
    }
  }
  async function download() {
    if (!sale || exporting) return;
    setExporting(true);
    setError("");
    try {
      await exportBillImage(sale);
      setNotice("สร้างภาพบิลแล้ว เลือกส่งไฟล์ผ่าน LINE ด้วยตัวเอง");
    } catch (e) {
      setError(message(e));
    } finally {
      setExporting(false);
    }
  }
  const titles: Record<View, string> = {
    products: "ข้อมูลสินค้า",
    stocks: "จัดการสต๊อก",
    picker: "ทำบิลขาย",
    model:
      state?.models.find((m) => m.id === modelId)?.name ?? "ตัวเลือกสินค้า",
    catalog: state?.products.some((p) => p.id === modelId)
      ? "แก้ข้อมูลสินค้า"
      : "เพิ่มสินค้า",
    editor: editor.revision ? "แก้รายการขาย" : "สรุปรายการขาย",
    sales: "รายการขาย",
    bill: "บิลเงินสด",
    receive: "รับของเข้า",
    operation: stockMode==="count"?"ตรวจนับสินค้า":stockMode==="out"?"จ่ายสินค้าออก":"รับสินค้าเข้า",
  };
  const active = ["products", "model", "catalog"].includes(view)
    ? "products"
    : ["stocks","receive","operation"].includes(view)?"stocks"
    : view === "editor"||view==="picker"
      ? "editor"
      : "sales";
  const receiptProduct = state?.products.find(
    (p) => p.id === receipt.productId,
  );
  const receiptValid =
    /^\d+$/.test(receipt.quantity) &&
    Number(receipt.quantity) > 0 &&
    Number.isSafeInteger(Number(receipt.quantity));
  const nav = (
    <nav className="navigation" aria-label="เมนูหลัก">
      {(
        [
          { id: "products", label: "Inventory", Icon: Package },
          { id: "stocks", label: "Stock management", Icon: ArrowDownUp },
          { id: "editor", label: "ทำบิล", Icon: ReceiptText },
          { id: "sales", label: "รายการขาย", Icon: ClipboardList },
        ] as const
      ).map(({ id, label, Icon }) => (
        <button
          key={id}
          aria-label={label}
          onClick={() => go(id==="editor"?"picker":id)}
          aria-current={active === id ? "page" : undefined}
        >
          <Icon size={22} aria-hidden="true" />
          <span>{id==="products"?"สินค้า (Inventory)":id==="stocks"?"จัดการสต๊อก":label}</span>
          {id==="editor"&&editor.lines.length>0&&<small className="order-nav-count" aria-hidden="true">{editor.lines.length}</small>}
        </button>
      ))}
    </nav>
  );

  return (
    <>
      <a className="skip-link" href="#main">
        ข้ามไปเนื้อหา
      </a>
      <div className={`app-shell${menuOpen?' is-open':''}`}>
      <aside ref={sidebar} className="app-sidebar" id="main-sidebar" role={menuOpen?'dialog':undefined} aria-modal={menuOpen?true:undefined} aria-label="เมนูระบบ">
        <div className="brand"><Package size={28} aria-hidden="true"/><div>สต๊อกและบิล<small>ร้านขายส่งชุดชั้นใน</small></div></div>
        <button className="sidebar-close" aria-label="ปิดเมนูหลัก" onClick={closeMenu}><X size={20} aria-hidden="true"/></button>
        {nav}
      </aside>
      {menuOpen&&<button className="sidebar-backdrop" aria-label="ปิดเมนูหลัก" tabIndex={-1} onClick={closeMenu}/>}
      <div className="app-content" inert={menuOpen}>
      <header className="app-header">
        <div className="header-inner">
          <button ref={menuButton} className="mobile-menu-button" aria-label="เปิดเมนูหลัก" aria-expanded={menuOpen} aria-controls="main-sidebar" onClick={()=>setMenuOpen(true)}><Menu size={22} aria-hidden="true"/></button>
          <span className="project-name">
            ระบบสต๊อกและบิล
            <br className="mobile-break" />
            ร้านขายส่งชุดชั้นใน
          </span>
        </div>
      </header>
      <main id="main" className="container">
        <div className="page-heading">
          {!["products", "stocks", "sales", "editor"].includes(view) && (
            <button
              className="back-button"
              aria-label="กลับ"
              onClick={() =>
                go(
                  view === "model" || view === "catalog"
                    ? "products"
                    : view === "operation"
                      ? "stocks"
                    : view === "picker"
                      ? "editor"
                    : view === "receive"
                      ? "model"
                      : "sales",
                )
              }
            >
              <ArrowLeft size={22} aria-hidden="true" />
            </button>
          )}
          <h1 ref={headingRef} tabIndex={-1}>
            {titles[view]}
          </h1>
        </div>
        {error && (
          <div className="message error" role="alert">
            <AlertCircle size={22} aria-hidden="true" />
            <div>
              {error}
              {error.includes("แท็บ") && (
                <button className="text-button" onClick={reload}>
                  โหลดข้อมูลล่าสุด
                </button>
              )}
            </div>
          </div>
        )}
        {notice && (
          <div className="message" role="status">
            <Check size={22} aria-hidden="true" />
            <span>{notice}</span>
            {lastDeduction && <button onClick={undoLast}>เลิกทำ</button>}
          </div>
        )}
        {!state ? (
          <section className="empty-state">
            <p>หยุดทำรายการเพื่อรักษาข้อมูลเดิม</p>
            <button onClick={reload}>ลองโหลดข้อมูลอีกครั้ง</button>
            <button className="primary" onClick={() => setConfirm("reset")}>
              รีเซ็ตข้อมูล
            </button>
          </section>
        ) : (
          <>
            {view === "products" && (
              <InventoryAdmin state={state} onEdit={editModel} onDelete={setDeleteModelId} onCreate={createModel} onOpen={openModel}/>
            )}
            {view === "stocks"&&<StockManagement state={state} onOperation={openStockOperation}/>}
            {view === "picker" && <SaleProducts state={state} lines={editor.lines} total={previewTotal} available={saleAvailable} onAdd={addToCart} onSummary={()=>go("editor")} onInventory={()=>go("products")}/>}
            {view === "model" && (
              <ModelDetail
                state={state}
                modelId={modelId}
                onEdit={() => go("catalog")}
              />
            )}
            {view === "catalog" && <SimpleProductForm key={modelId||'new'} state={state} productId={modelId||undefined} onSave={saveCatalog} onDirtyChange={setCatalogDirty} onCancel={()=>go("products")} onExisting={editModel}/>}
            {view === "operation"&&<StockOperation key={`${stockMode}-${operationProductId}`} state={state} mode={stockMode} initialProductId={operationProductId} onSave={saveStockOperation} onCancel={()=>go("stocks")}/>}
            {view === "editor" && (
              <>
                <p className="intro">
                  {editor.revision
                    ? "บิลเดิมยังมีผลจนกว่าจะยืนยันการแก้ไข"
                    : handwritten
                    ? "เลือกสินค้าที่ขายตามบิลมือแล้ว ระบบจะลดสต๊อกโดยไม่ออกบิลใหม่"
                    : "เลือกสินค้าและจำนวน ตรวจยอดในหน้านี้ แล้วกดยืนยันและออกบิล"}
                </p>
                <button className="primary" onClick={()=>go("picker")}>เลือกสินค้าเพิ่ม</button>
                <div className="workspace sale-summary-workspace">

                  <section aria-label="รายการสินค้าในบิล">
                    {!editor.lines.length && (
                      <div className="empty-state">
                        <ReceiptText size={36} aria-hidden="true" />
                        <h2>เริ่มจากเลือกสินค้า</h2>
                        <p>กลับไปเลือกสินค้าใส่ตะกร้า แล้วตรวจจำนวนที่นี่</p>
                      </div>
                    )}
                    {editor.lines.map((line, i) => {
                      const p = state.products.find(
                        (p) => p.id === line.productId,
                      )!;
                      const errors = fieldErrors(line);
                      return (
                        <article className="editor-row" key={p.id}>
                          <div className="line-title">
                            <ProductPhoto
                              id={resolvedImage(state, p)}
                              alt={`รูป ${p.code}`}
                            />
                            <div>
                              <span className="product-code">{p.code}</span>
                              <h2>{productName(p)}</h2>
                              <p className="muted">
                                {editor.revision ? "ขายได้เมื่อแก้บิล" : "คงเหลือ"} {saleAvailable(p.id)} {p.unit}
                              </p>
                            </div>
                            <button
                              className="icon-button"
                              aria-label={`นำ ${p.code} ออกจากบิล`}
                              onClick={() =>
                                setEditor((e) => ({
                                  ...e,
                                  lines: e.lines.filter(
                                    (l) => l.productId !== p.id,
                                  ),
                                }))
                              }
                            >
                              <X size={22} aria-hidden="true" />
                            </button>
                          </div>
                          <div className="input-pair">
                            <label htmlFor={`q-${i}`}>
                              จำนวน ({p.unit})
                              <input
                                id={`q-${i}`}
                                aria-label={`จำนวน ${p.code} (${p.unit})`}
                                inputMode="numeric"
                                value={line.quantity}
                                aria-invalid={attempted && !!errors.quantity}
                                aria-describedby={
                                  attempted && errors.quantity
                                    ? `qe-${i}`
                                    : undefined
                                }
                                onChange={(e) =>
                                  setEditor((v) => ({
                                    ...v,
                                    lines: v.lines.map((l) =>
                                      l.productId === p.id
                                        ? { ...l, quantity: e.target.value }
                                        : l,
                                    ),
                                  }))
                                }
                              />
                              {attempted && errors.quantity && (
                                <span className="field-error" id={`qe-${i}`}>
                                  {errors.quantity}
                                </span>
                              )}
                            </label>
                            {!handwritten&&<details className="line-price" open={attempted&&!!errors.price?true:undefined}><summary>ราคา {line.price} บาท/{p.unit} · แก้ราคา</summary><label htmlFor={`p-${i}`}>
                              ราคา (บาท/{p.unit})
                              <input
                                id={`p-${i}`}
                                aria-label={`ราคา ${p.code} (บาท/${p.unit})`}
                                inputMode="decimal"
                                value={line.price}
                                aria-invalid={attempted && !!errors.price}
                                aria-describedby={
                                  attempted && errors.price
                                    ? `pe-${i}`
                                    : undefined
                                }
                                onChange={(e) =>
                                  setEditor((v) => ({
                                    ...v,
                                    lines: v.lines.map((l) =>
                                      l.productId === p.id
                                        ? { ...l, price: e.target.value }
                                        : l,
                                    ),
                                  }))
                                }
                              />
                              {attempted && errors.price && (
                                <span className="field-error" id={`pe-${i}`}>
                                  {errors.price}
                                </span>
                              )}
                            </label></details>}
                          </div>
                        </article>
                      );
                    })}
                    {!handwritten&&<details className="bill-data-fields">
                      <summary>ข้อมูลบนบิล (ไม่บังคับ)</summary>
                      <div className="form-fields">
                        {(
                          [
                            { key: "sellerName", label: "ชื่อร้าน" },
                            { key: "sellerAddress", label: "ที่อยู่ร้าน" },
                            {
                              key: "sellerTaxId",
                              label: "เลขผู้เสียภาษีร้าน (ไม่บังคับ)",
                            },
                            { key: "buyerName", label: "ชื่อลูกค้า" },
                            { key: "buyerAddress", label: "ที่อยู่ลูกค้า" },
                            {
                              key: "buyerTaxId",
                              label: "เลขผู้เสียภาษีลูกค้า (ไม่บังคับ)",
                            },
                            {
                              key: "buyerRegistration",
                              label: "ทะเบียนการค้าลูกค้า (ไม่บังคับ)",
                            },
                            { key: "bookNumber", label: "เล่มที่" },
                            {
                              key: "receiverName",
                              label: "ชื่อผู้รับเงิน (ไม่บังคับ)",
                            },
                          ] as const
                        ).map(({ key, label }) => (
                          <label key={key}>
                            {label}
                            <input
                              value={editor.document[key] ?? ""}
                              maxLength={1000}
                              onChange={(e) =>
                                setEditor((current) => ({
                                  ...current,
                                  document: {
                                    ...current.document,
                                    [key]: e.target.value,
                                  },
                                }))
                              }
                            />
                          </label>
                        ))}
                      </div>
                    </details>}
                  </section>
                  <aside className="order-summary">
                    <h2>สรุปรายการ</h2>
                    <p>{editor.lines.length} รายการ</p>
                    <div className="summary-total" hidden={handwritten}>
                      <span>ยอดรวม</span>
                      <strong>{money(previewTotal)} บาท</strong>
                    </div>
                    <button
                      className="primary full-width"
                      disabled={busy || !editor.lines.length}
                      onClick={confirmSaleAction}
                    >
                      <Check size={20} aria-hidden="true" />
                      {editor.revision ? "ยืนยันการแก้ไข" : handwritten?"บันทึกขายจากบิลมือ":"ยืนยันและออกบิล"}
                    </button>
                    <p className="muted">
                      {editor.revision
                        ? "ยอดจะปรับเมื่อยืนยันการแก้ไข"
                        : handwritten?"ลดสต๊อกอย่างเดียว · ไม่สร้างบิลใหม่":"กดยืนยันแล้วจึงตัดสต๊อก"}
                    </p>
                  </aside>
                </div>
              </>
            )}
            {view === "receive" && receiptProduct && (
              <section className="receive-form">
                <p className="intro">
                  บันทึกสินค้าที่รับจริง เพื่อเพิ่มยอดคงเหลือ
                </p>
                <span className="product-code">{receiptProduct.code}</span>
                <h2>{productName(receiptProduct)}</h2>
                <p className="muted">
                  คงเหลือ {stock(state, receiptProduct.id)}{" "}
                  {receiptProduct.unit}
                </p>
                {!receipt.review ? (
                  <>
                    <label htmlFor="receive-q">
                      จำนวนรับเข้า ({receiptProduct.unit})
                      <input
                        id="receive-q"
                        aria-label={`จำนวนรับเข้า (${receiptProduct.unit})`}
                        value={receipt.quantity}
                        inputMode="numeric"
                        aria-invalid={attempted && !receiptValid}
                        aria-describedby={
                          attempted && !receiptValid
                            ? "receive-error"
                            : undefined
                        }
                        onChange={(e) =>
                          setReceipt((r) => ({
                            ...r,
                            quantity: e.target.value,
                          }))
                        }
                      />
                      {attempted && !receiptValid && (
                        <span id="receive-error" className="field-error">
                          จำนวนต้องเป็นจำนวนเต็มมากกว่า 0
                        </span>
                      )}
                    </label>
                    <button
                      className="primary full-width"
                      onClick={() => {
                        setAttempted(true);
                        if (receiptValid) {
                          setError("");
                          setReceipt((r) => ({ ...r, review: true }));
                        }
                      }}
                    >
                      ตรวจรายการรับเข้า
                      <ArrowRight size={20} aria-hidden="true" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="receipt-preview">
                      <p>
                        รับเข้า {receipt.quantity} {receiptProduct.unit}
                      </p>
                      <strong>
                        ยอดหลังรับเข้า{" "}
                        {stock(state, receiptProduct.id) +
                          Number(receipt.quantity)}{" "}
                        {receiptProduct.unit}
                      </strong>
                    </div>
                    <div className="actions">
                      <button
                        onClick={() =>
                          setReceipt((r) => ({ ...r, review: false }))
                        }
                      >
                        กลับไปแก้ไข
                      </button>
                      <button
                        className="primary"
                        disabled={busy}
                        onClick={() =>
                          transact(
                            (s) =>
                              receiveStock(
                                s,
                                receipt.id,
                                receipt.productId,
                                Number(receipt.quantity),
                              ),
                            () => {
                              setView("products");
                              setNotice(
                                `รับเข้า ${receipt.quantity} ${receiptProduct.unit} แล้ว`,
                              );
                            },
                          )
                        }
                      >
                        ยืนยันรับเข้า
                      </button>
                    </div>
                  </>
                )}
              </section>
            )}
            {view === "sales" && (
              <>
                <p className="intro">เปิดบิล ดูสถานะ และตรวจประวัติการแก้ไข</p>
                {!!state.sales.length&&<div className="history-filters"><label className="search-field"><Search size={20} aria-hidden="true"/><span className="sr-only">ค้นหาบิล</span><input type="search" placeholder="เลขบิล / ลูกค้า" value={historySearch} onChange={e=>setHistorySearch(e.target.value)}/></label><label>สถานะบิล<select value={historyStatus} onChange={e=>setHistoryStatus(e.target.value)}><option value="">ทุกสถานะ</option><option value="confirmed">ยืนยันแล้ว</option><option value="cancelled">ยกเลิกแล้ว</option><option value="draft">ร่างเดิม</option></select></label></div>}
                {!state.sales.length ? (
                  <div className="empty-state">
                    <ClipboardList size={36} aria-hidden="true" />
                    <h2>ยังไม่มีรายการขาย</h2>
                    <p>เลือกสินค้าที่ต้องการขายเพื่อเริ่มทำบิล</p>
                    <button className="primary" onClick={() => go("picker")}>
                      ทำบิลขาย
                    </button>
                  </div>
                ) : (
                  <div className="sales-list">{!state.sales.some(s=>(!historyStatus||s.status===historyStatus)&&[s.code,s.document?.buyerName??"",...s.lines.map(l=>l.name)].join(" ").toLocaleLowerCase('th').includes(historySearch.trim().toLocaleLowerCase('th')))&&<div className="empty-state"><p>ไม่พบบิลที่ตรงกับตัวกรอง</p><button onClick={()=>{setHistorySearch("");setHistoryStatus("");}}>ล้างตัวกรองบิล</button></div>}
                    {[...state.sales].reverse().filter(s=>(!historyStatus||s.status===historyStatus)&&[s.code,s.document?.buyerName??"",...s.lines.map(l=>l.name)].join(" ").toLocaleLowerCase('th').includes(historySearch.trim().toLocaleLowerCase('th'))).map((s) => (
                      <button
                        className="sale-row"
                        key={s.id}
                        onClick={() => {
                          setSelected(s.id);
                          go("bill");
                        }}
                      >
                        <span>
                          <strong>{s.code}</strong>
                          <small>
                            {statusText(s.status)} · รุ่น {s.revision}
                          </small>
                          <small>{dateTime(s.updatedAt)}</small>
                        </span>
                        <span className="sale-amount">
                          {money(s.total)} บาท
                          <ChevronRight size={22} aria-hidden="true" />
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                <button className="text-button" onClick={()=>go("stocks")}>ดูประวัติใน Stock management<ChevronRight size={20} aria-hidden="true"/></button>
              </>
            )}
            {view === "bill" && sale && (
              <>
                {sale.status === "confirmed" && (
                  <section
                    className="remaining-summary"
                    aria-label="ยอดคงเหลือหลังขาย"
                  >
                    <h2>ยอดคงเหลือตอนนี้</h2>
                    {sale.lines.map((l) => (
                      <p key={l.productId}>
                        <span>
                          {
                            state.products.find((p) => p.id === l.productId)
                              ?.code
                          }
                        </span>
                        <strong data-testid={`remaining-${l.productId}`}>
                          {stock(state, l.productId)} {l.unit}
                        </strong>
                      </p>
                    ))}
                  </section>
                )}
                <div className="workspace bill-workspace">
                  <BillPreview sale={sale} />
                  <aside className="bill-actions">
                    {sale.status !== "draft" ? (
                      <>
                        <button
                          className="primary full-width"
                          disabled={exporting}
                          onClick={download}
                        >
                          <Download size={20} aria-hidden="true" />
                          {exporting ? "กำลังสร้างภาพ…" : "ดาวน์โหลดภาพบิล"}
                        </button>
                        <button className="full-width" onClick={printBill}>
                          พิมพ์ / บันทึก PDF
                        </button>
                        <p className="muted small">
                          เลือกส่งไฟล์ผ่าน LINE ด้วยตัวเอง
                          <br />
                          ภาพที่ส่งแล้วจะไม่อัปเดตอัตโนมัติ
                        </p>
                      </>
                    ) : (
                      <button
                        className="primary full-width"
                        onClick={() => editSale(sale)}
                      >
                        เปิดร่างเพื่อตรวจรายการ
                      </button>
                    )}
                    {sale.status === "confirmed" && (
                      <div className="actions">
                        <button onClick={() => editSale(sale)}>
                          <Pencil size={20} aria-hidden="true" />
                          แก้รายการ
                        </button>
                        <button onClick={() => setConfirm("cancel")}>
                          <Trash2 size={20} aria-hidden="true" />
                          ยกเลิกบิล
                        </button>
                      </div>
                    )}
                    <button
                      className="full-width"
                      onClick={() => {
                        setEditor({
                          id: uid(),
                          lines: [],
                          document: defaultDocument(state?.shop),
                        });

                        go("picker");
                      }}
                    >
                      ทำบิลใหม่
                      <Plus size={20} aria-hidden="true" />
                    </button>
                    {!!state.history.filter((h) => h.id === sale.id).length && (
                      <details className="movement-history">
                        <summary>ประวัติรุ่นก่อนหน้า</summary>
                        {state.history
                          .filter((h) => h.id === sale.id)
                          .map((h, i) => (
                            <div key={i}>
                              <p>
                                <strong>
                                  รุ่น {h.revision} · {statusText(h.status)}
                                </strong>
                                <br />
                                {money(h.total)} บาท
                              </p>
                              {h.lines.map((l) => (
                                <p className="small" key={l.productId}>
                                  {l.name}: {l.quantity} {l.unit} ×{" "}
                                  {money(l.price)} บาท/{l.unit}
                                </p>
                              ))}
                            </div>
                          ))}
                      </details>
                    )}
                  </aside>
                </div>
              </>
            )}
          </>
        )}
      </main>
      </div></div>
      {state&&deleteModelId&&<ConfirmDialog title={canDeleteSimpleProduct(state,deleteModelId)?"ลบสินค้านี้?":"สินค้านี้มียอดหรือประวัติ"} confirmLabel={canDeleteSimpleProduct(state,deleteModelId)?"ลบสินค้า":"ปิดใช้งานสินค้า"} onClose={()=>setDeleteModelId(null)} onConfirm={removeCatalogModel}><p>{productName(state.products.find(p=>p.id===deleteModelId)!)} · {state.products.find(p=>p.id===deleteModelId)?.code}</p><p>{canDeleteSimpleProduct(state,deleteModelId)?"ลบเฉพาะสินค้ารหัสนี้ ซึ่งยังไม่มีประวัติและยอดเป็นศูนย์":"ปิดใช้งานเพื่อไม่ให้เลือกขายใหม่ โดยเก็บยอดและประวัติไว้ เปิดใช้งานกลับจากหน้าแก้ข้อมูลได้"}</p></ConfirmDialog>}
      {pendingProduct&&<ConfirmDialog title="ออกจากหน้าที่ยังไม่ได้บันทึก?" closeLabel="อยู่ต่อ" confirmLabel="ออกโดยไม่บันทึก" onClose={()=>setPendingProduct(null)} onConfirm={()=>{setModelId(pendingProduct);setCatalogDirty(false);setPendingProduct(null);}}><p>ข้อมูลและรูปที่แก้ไว้จะไม่ถูกบันทึก</p></ConfirmDialog>}
      {pendingView && <ConfirmDialog title="ออกจากหน้าที่ยังไม่ได้บันทึก?" closeLabel="อยู่ต่อ" confirmLabel="ออกโดยไม่บันทึก" onClose={() => setPendingView(null)} onConfirm={() => {navigate(pendingView);setPendingView(null);}}><p>ข้อมูลสินค้า ตัวเลือก และรูปที่แก้ไว้จะไม่ถูกบันทึก</p><p>เลือกอยู่ต่อเพื่อกลับไปตรวจและบันทึกข้อมูล</p></ConfirmDialog>}
      {confirm === "reset" && (
        <ConfirmDialog
          title="รีเซ็ตข้อมูล?"
          onClose={() => setConfirm(null)}
          onConfirm={reset}
        >
          <p>
            บิล รายการรับเข้า และรูปสินค้าในเบราว์เซอร์นี้จะถูกล้าง
            แล้วเริ่มใหม่โดยไม่มีสินค้าและบิล
          </p>
        </ConfirmDialog>
      )}
      {confirm === "cancel" && sale && (
        <ConfirmDialog
          title={`ยกเลิกบิล ${sale.code}?`}
          onClose={() => setConfirm(null)}
          onConfirm={() => {
            transact(
              (s) => cancelSale(s, sale.id),
              () => {
                setNotice("ยกเลิกบิลและคืนสต๊อกแล้ว");
              },
            );
            setConfirm(null);
          }}
        >
          <p>คืนสินค้าตามบิลรุ่น {sale.revision}:</p>
          {sale.lines.map((l) => (
            <p key={l.productId}>
              {l.name}
              <br />
              <strong>
                คืน {l.quantity} {l.unit}
              </strong>
            </p>
          ))}
          <p>เก็บบิลไว้ในประวัติ ภาพที่ส่งแล้วจะไม่เปลี่ยนเอง</p>
        </ConfirmDialog>
      )}
    </>
  );
}

