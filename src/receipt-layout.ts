import {defaultDocument,money,type Sale} from './domain';
import {bahtWords} from './bill-document';
export type ReceiptPaint={type:'text';value:string;x:number;y:number;size:number;weight:number;color:string;align:'left'|'center'|'right';font:string}|{type:'line';x1:number;y1:number;x2:number;y2:number;dash?:boolean}|{type:'rect';x:number;y:number;width:number;height:number;fill:string;stroke?:string;radius?:number};
export type TextMeasure=(text:string,size:number,weight:number,font:string)=>number;
export function receiptLayout(sale:Sale,measure:TextMeasure){
 const ops:ReceiptPaint[]=[],ink='#141413',secondary='#f0eee6',font='Noto Sans Thai';
 const text=(value:string,x:number,y:number,size=22,weight=400,align:'left'|'center'|'right'='left',color=ink,family=font)=>ops.push({type:'text',value,x,y,size,weight,align,color,font:family});
 const wrap=(value:string,max:number,size:number,weight=400)=>{const lines:string[]=[];for(const paragraph of value.split('\n')){let line='';for(const {segment} of new Intl.Segmenter('th',{granularity:'grapheme'}).segment(paragraph)){if(line&&measure(line+segment,size,weight,font)>max){lines.push(line);line=segment;}else line+=segment;}lines.push(line);}return lines;};
 const block=(value:string,x:number,y:number,max:number,size=22,step=32,weight=400)=>{const rows=wrap(value,max,size,weight);rows.forEach((row,i)=>text(row,x,y+i*step,size,weight));return y+rows.length*step;};
 const line=(x1:number,y1:number,x2:number,y2:number,dash=false)=>ops.push({type:'line',x1,y1,x2,y2,dash});
 const d=sale.document??defaultDocument();
 const merchantHeight=(d.sellerName?wrap(d.sellerName,660,30,600).length*40:0)+(d.sellerAddress?4+wrap(d.sellerAddress,660,22).length*32:0)+(d.sellerTaxId?4+wrap(`เลขผู้เสียภาษี ${d.sellerTaxId}`,660,22).length*32:0);
 const book=wrap(d.bookNumber,100,22),number=wrap(sale.code,100,22);
 const headerBottom=Math.max(256,76+merchantHeight+24,124+Math.max(book.length,number.length)*32+24);
 ops.push({type:'rect',x:150,y:56,width:700,height:headerBottom-80,fill:secondary,radius:8});
 let merchantY=76;if(d.sellerName)merchantY=block(d.sellerName,170,merchantY,660,30,40,600);if(d.sellerAddress)merchantY=block(d.sellerAddress,170,merchantY+4,660);if(d.sellerTaxId)block(`เลขผู้เสียภาษี ${d.sellerTaxId}`,170,merchantY+4,660);
 text('เล่มที่',28,64,22);text('เลขที่',884,64,22);book.forEach((v,i)=>text(v,28,124+i*32));number.forEach((v,i)=>text(v,872,124+i*32));
 line(28,headerBottom-12,128,headerBottom-12);line(128,headerBottom-80,128,headerBottom-12);line(872,headerBottom-80,872,headerBottom-12);line(872,headerBottom-12,972,headerBottom-12);
 let y=headerBottom;ops.push({type:'rect',x:0,y,width:1000,height:80,fill:ink});text('บิลเงินสด',500,y+8,32,600,'center','#faf9f5');text('CASH SALE',500,y+48,18,400,'center','#faf9f5','Arial');y+=96;
 if(sale.status==='cancelled')y=block('ยกเลิกแล้ว — คืนสต๊อกแล้ว',28,y,944,24,36,600)+12;
 text('นาม',28,y,22);text('Name',28,y+26,18,400,'left',ink,'Arial');text('วันที่',640,y,22);text('Date',640,y+26,18,400,'left',ink,'Arial');
 const date=new Intl.DateTimeFormat('th-TH',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:'Asia/Bangkok'}).format(new Date(sale.updatedAt));text(date,744,y+8,22);
 const buyerEnd=d.buyerName?block(d.buyerName,160,y+8,460):y+44;if(!d.buyerName)line(160,y+40,608,y+40,true);line(744,y+40,972,y+40,true);y=Math.max(y+56,buyerEnd+12);
 text('ที่อยู่',28,y,22);text('Address',28,y+26,18,400,'left',ink,'Arial');text('ทะเบียนการค้า',640,y,20);text('Commlicence',640,y+26,16,400,'left',ink,'Arial');
 const addressEnd=d.buyerAddress?block(d.buyerAddress,160,y+8,460):y+44;const registrationEnd=d.buyerRegistration?block(d.buyerRegistration,848,y+8,124,20,28):y+44;
 if(!d.buyerAddress)line(160,y+40,608,y+40,true);if(!d.buyerRegistration)line(848,y+40,972,y+40,true);y=Math.max(y+60,addressEnd+12,registrationEnd+12);
 if(d.buyerTaxId)y=block(`เลขผู้เสียภาษี ${d.buyerTaxId}`,28,y,944)+12;
 const xs=[28,140,676,812,972],top=y;const headers=[['จำนวน','Quantity'],['รายการ','Description'],['หน่วยละ','Unit Price'],['จำนวนเงิน','Amount']];
 ops.push({type:'rect',x:28,y,width:944,height:76,fill:secondary});headers.forEach(([th,en],i)=>{const middle=(xs[i]+xs[i+1])/2;text(th,middle,y+8,22,400,'center');text(en,middle,y+42,16,400,'center',ink,'Arial');});line(28,y,972,y);y+=76;line(28,y,972,y);
 for(const item of sale.lines){const quantities=wrap(`${item.quantity} ${item.unit}`,96,22),names=wrap(item.name,520,22),prices=wrap(money(item.price),120,22),amounts=wrap(money(item.quantity*item.price),144,22);const height=Math.max(52,...[quantities,names,prices,amounts].map(rows=>rows.length*32+16));[quantities,names,prices,amounts].forEach((rows,i)=>rows.forEach((value,j)=>text(value,xs[i]+8,y+8+j*32)));y+=height;line(28,y,972,y);}
 for(let i=sale.lines.length;i<12;i++){y+=52;line(28,y,972,y);}
 const written=wrap(bahtWords(sale.total),520,22),total=wrap(money(sale.total),144,22);const totalHeight=Math.max(64,written.length*32+16,total.length*32+16);
 ops.push({type:'rect',x:28,y,width:944,height:totalHeight,fill:secondary});text('บาท',36,y+8,22);text('Baht',36,y+34,16,400,'left',ink,'Arial');written.forEach((v,i)=>text(v,148,y+8+i*32));text('รวมเงิน',744,y+8,22,400,'center');text('Total',744,y+34,16,400,'center',ink,'Arial');total.forEach((v,i)=>text(v,820,y+8+i*32));y+=totalHeight;line(28,y,972,y);for(const x of xs)line(x,top,x,y);
 y+=20;text('ผู้รับเงิน',28,y,22);text('Collector',28,y+28,16,400,'left',ink,'Arial');if(d.receiverName)y=block(d.receiverName,160,y+8,812);else{line(160,y+38,972,y+38,true);y+=52;}
 const height=Math.ceil(y+32);ops.push({type:'rect',x:1,y:1,width:998,height:height-2,fill:'none',stroke:ink,radius:12});return {width:1000,height,ops};
}
export function measureReceiptText(){const canvas=document.createElement('canvas');const ctx=canvas.getContext('2d');if(!ctx)throw new Error('สร้างบิลไม่ได้ กรุณาลองใหม่');return (text:string,size:number,weight:number,font:string)=>{ctx.font=`${weight} ${size}px "${font}"`;return ctx.measureText(text).width;};}
