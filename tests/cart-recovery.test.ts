import {describe,it,expect} from 'vitest';
import {seed,defaultDocument,issueSale} from '../src/domain';
import {CART_KEY,readCart,writeCart,type RecoverableCart} from '../src/cart-recovery';

const storage=()=>{let raw:string|null=null;return {getItem:()=>raw,setItem:(_key:string,value:string)=>{raw=value;},removeItem:()=>{raw=null;}};};
function fixture(){const s=seed();s.models.push({id:'model-a',name:'A',description:'',categoryId:'uncategorized'});s.products.push({id:'a',modelId:'model-a',active:true,code:'A',name:'A',unit:'แพ็ก',price:18000});s.movements.push({id:'opening-a',productId:'a',quantity:12,type:'opening',reference:'opening',createdAt:new Date().toISOString()});return s;}
const cart=():RecoverableCart=>({id:'cart-1',lines:[{productId:'a',quantity:'3',price:'180.00'}],document:{...defaultDocument(),buyerName:'ลูกค้าเดิม'}});
describe('temporary cart recovery',()=>{
 it('recovers quantities, prices and document without changing stock or sales',()=>{const s=fixture(),before=JSON.stringify(s),store=storage();writeCart(store,cart());expect(readCart(store,s).cart).toEqual(cart());expect(JSON.stringify(s)).toBe(before);});
 it('preserves unfinished input for correction and does not cap quantities silently',()=>{const s=fixture(),store=storage(),c=cart();c.lines[0].quantity='99';c.lines[0].price='';writeCart(store,c);expect(readCart(store,s).cart?.lines).toEqual(c.lines);});
 it('does not revive an already issued cart even if cache removal failed',()=>{const s=issueSale(fixture(),'cart-1',[{productId:'a',quantity:3,price:18000}],defaultDocument()),store=storage();writeCart(store,cart());expect(readCart(store,s).cart).toBeNull();});
 it('drops unavailable products and explains removal instead of resurrecting them',()=>{const s=fixture(),store=storage();s.products[0].deleted=true;writeCart(store,cart());const result=readCart(store,s);expect(result.cart).toBeNull();expect(result.notice).toContain('ไม่พร้อมใช้งาน');});
 it('rejects corrupt cache without affecting main records',()=>{const store=storage();store.setItem(CART_KEY,'{bad');expect(readCart(store,fixture()).error).toContain('กู้คืน');});
 it('clears the cache after the last item is removed',()=>{const store=storage();writeCart(store,cart());writeCart(store,{...cart(),lines:[]});expect(store.getItem()).toBeNull();});
 it('reports storage errors',()=>{expect(()=>writeCart({getItem:()=>null,setItem:()=>{throw Error('quota');},removeItem:()=>{}},cart())).toThrow('เก็บตะกร้า');});
});
