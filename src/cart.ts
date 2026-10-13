import {type Product} from './domain';
export type CartLine={productId:string;quantity:string;price:string};
export function addCartItem(lines:CartLine[],product:Product,available:number):CartLine[]{
 if(!product.active)throw new Error('สินค้านี้ปิดใช้งานแล้ว');
 const existing=lines.find(l=>l.productId===product.id);
 if(existing&&(!/^\d+$/.test(existing.quantity)||Number(existing.quantity)<1))throw new Error('กรุณาแก้จำนวนในหน้าสรุปก่อนเพิ่มสินค้า');
 const quantity=Number(existing?.quantity??0)+1;
 if(!Number.isSafeInteger(quantity)||quantity>available)throw new Error('จำนวนในตะกร้าถึงยอดที่ขายได้แล้ว');
 return existing?lines.map(l=>l.productId===product.id?{...l,quantity:String(quantity)}:l):[...lines,{productId:product.id,quantity:'1',price:(product.price/100).toFixed(2)}];
}
