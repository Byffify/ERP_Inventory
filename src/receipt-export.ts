import type {Sale} from './domain';
import {receiptLayout,measureReceiptText} from './receipt-layout';
export async function exportBillImage(sale:Sale){
 await Promise.all([document.fonts.load('400 22px "Noto Sans Thai"','ข้อความ SALE 0123'),document.fonts.load('600 30px "Noto Sans Thai"','ข้อความ SALE 0123')]);await document.fonts.ready;
 const layout=receiptLayout(sale,measureReceiptText()),canvas=document.createElement('canvas');canvas.width=layout.width;canvas.height=layout.height;const ctx=canvas.getContext('2d');if(!ctx)throw new Error('สร้างภาพบิลไม่สำเร็จ กรุณาลองใหม่');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.textBaseline='top';
 for(const op of layout.ops){if(op.type==='text'){ctx.font=`${op.weight} ${op.size}px "${op.font}"`;ctx.textAlign=op.align;ctx.fillStyle=op.color;ctx.fillText(op.value,op.x,op.y);}else if(op.type==='line'){ctx.strokeStyle='#141413';ctx.lineWidth=1;ctx.setLineDash(op.dash?[4,4]:[]);ctx.beginPath();ctx.moveTo(op.x1,op.y1);ctx.lineTo(op.x2,op.y2);ctx.stroke();}else{ctx.setLineDash([]);ctx.beginPath();ctx.roundRect(op.x,op.y,op.width,op.height,op.radius??0);if(op.fill!=='none'){ctx.fillStyle=op.fill;ctx.fill();}if(op.stroke){ctx.strokeStyle=op.stroke;ctx.lineWidth=1;ctx.stroke();}}}
 const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('สร้างภาพบิลไม่สำเร็จ กรุณาลองใหม่')),'image/png'));
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${sale.code}-v${sale.revision}${sale.status==='cancelled'?'-cancelled':''}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
}
