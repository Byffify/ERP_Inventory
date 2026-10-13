import {defaultDocument,type BillDetails,type DemoState} from './domain';
import {type CartLine} from './cart';

export const CART_KEY='inventory-cart-session-v1';
export type RecoverableCart={id:string;lines:CartLine[];document:BillDetails};
type SessionStore=Pick<Storage,'getItem'|'setItem'|'removeItem'>;
export function readCart(storage:SessionStore,state:DemoState):{cart:RecoverableCart|null;notice:string;error:string}{
 try{
  const raw=storage.getItem(CART_KEY);if(!raw)return {cart:null,notice:'',error:''};
  const data=JSON.parse(raw);
  if(data.version!==1||typeof data.id!=='string'||!data.id||!Array.isArray(data.lines)||!data.document||data.lines.some((l:CartLine)=>!l||typeof l.productId!=='string'||typeof l.quantity!=='string'||typeof l.price!=='string')||new Set(data.lines.map((l:CartLine)=>l.productId)).size!==data.lines.length)throw Error('invalid');
  const document=defaultDocument();for(const key of Object.keys(document) as (keyof BillDetails)[]){const value=data.document[key]??'';if(typeof value!=='string'||value.length>1000)throw Error('invalid');document[key]=value;}
  // A committed sale wins even if cleanup was interrupted immediately after issue.
  if(state.sales.some(s=>s.id===data.id))return {cart:null,notice:'',error:''};
  const lines=data.lines.filter((l:CartLine)=>state.products.some(p=>p.id===l.productId&&p.active&&!p.deleted));
  const removed=lines.length!==data.lines.length;
  return {cart:lines.length?{id:data.id,lines,document}:null,notice:removed?'นำสินค้าที่ไม่พร้อมใช้งานออกจากตะกร้าแล้ว':lines.length?'กู้คืนตะกร้าแล้ว · ตรวจรายการก่อนออกบิล':'',error:''};
 }catch{return {cart:null,notice:'',error:'กู้คืนตะกร้าชั่วคราวไม่สำเร็จ กรุณาเลือกสินค้าใหม่'};}
}
export function writeCart(storage:SessionStore,cart:RecoverableCart){
 try{if(!cart.lines.length)storage.removeItem(CART_KEY);else storage.setItem(CART_KEY,JSON.stringify({version:1,...cart}));}
 catch{throw Error('เก็บตะกร้าชั่วคราวไม่สำเร็จ กรุณาเปิดหน้านี้ไว้จนออกบิลเสร็จ');}
}
