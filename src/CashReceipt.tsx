import {useEffect,useState} from 'react';
import {money,type Sale} from './domain';
import {receiptLayout,measureReceiptText} from './receipt-layout';
export function PaperBill({sale}:{sale:Sale}){
 const [,refresh]=useState(0);useEffect(()=>{let alive=true;void document.fonts.ready.then(()=>{if(alive)refresh(n=>n+1);});return ()=>{alive=false;};},[]);
 const layout=receiptLayout(sale,measureReceiptText());
 return <section className="receipt-paper" aria-label="บิลแบบกระดาษ"><svg className="receipt-graphic" viewBox={`0 0 ${layout.width} ${layout.height}`} xmlns="http://www.w3.org/2000/svg" role="img" aria-label={`บิลเงินสด ${sale.code}`}><rect width={layout.width} height={layout.height} fill="#fff"/>{layout.ops.map((op,i)=>op.type==='text'?<text key={i} x={op.x} y={op.y} fontSize={op.size} fontWeight={op.weight} fontFamily={op.font} fill={op.color} dominantBaseline="text-before-edge" textAnchor={op.align==='center'?'middle':op.align==='right'?'end':'start'}>{op.value}</text>:op.type==='line'?<line key={i} x1={op.x1} y1={op.y1} x2={op.x2} y2={op.y2} stroke="#141413" strokeWidth={1} strokeDasharray={op.dash?'4 4':undefined}/>:<rect key={i} x={op.x} y={op.y} width={op.width} height={op.height} fill={op.fill} stroke={op.stroke} strokeWidth={1} rx={op.radius}/>)}</svg><table className="sr-only" aria-label="รายการสินค้าในบิล"><thead><tr><th scope="col">จำนวน</th><th scope="col">รายการ</th><th scope="col">หน่วยละ</th><th scope="col">จำนวนเงิน</th></tr></thead><tbody>{sale.lines.map(l=><tr key={l.productId}><td>{l.quantity} {l.unit}</td><td>{l.name}</td><td>{money(l.price)}</td><td>{money(l.quantity*l.price)}</td></tr>)}</tbody><tfoot><tr><td colSpan={4}>รวมเงิน {money(sale.total)} บาท</td></tr></tfoot></table></section>;
}
export async function openPrintBill(sale:Sale){
 const popup=window.open('','_blank');if(!popup)throw new Error('เปิดหน้าพิมพ์ไม่ได้ กรุณาอนุญาตหน้าต่างใหม่แล้วลองอีกครั้ง');
 const {renderToStaticMarkup}=await import('react-dom/server');
 const styles=Array.from(document.head.querySelectorAll('style,link[rel="stylesheet"]')).map(el=>el.outerHTML).join('');
 popup.document.write(`<!doctype html><html lang="th"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><base href="${location.origin}/"><title>บิลเงินสด</title>${styles}<style>body{background:#fff}.print-sheet{max-width:640px;margin:24px auto;padding:16px}.print-tools{padding:16px;text-align:center}@media print{.print-tools{display:none}.print-sheet{margin:0;padding:0;max-width:none}}</style></head><body><div class="print-tools"><button onclick="window.print()">พิมพ์ / บันทึก PDF</button></div><main class="print-sheet">${renderToStaticMarkup(<PaperBill sale={sale}/>)}</main></body></html>`);popup.document.close();return popup;
}
