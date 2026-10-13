import {seed} from './fixtures.mjs';
import {it,expect} from 'vitest';
import {issueSale,defaultDocument} from '../src/domain';
import {receiptLayout} from '../src/receipt-layout';
it('the title cannot cover any supported long seller-name row',()=>{
 const sale=issueSale(seed(),'s1',[{productId:'a',quantity:3,price:18000}],{...defaultDocument(),sellerName:'W'.repeat(1000)}).sales[0];
 const layout=receiptLayout(sale,(text,size)=>Array.from(text).length*size*.9);
 const title=layout.ops.find(op=>op.type==='rect'&&op.width===1000&&op.height===80)!;
 const names=layout.ops.filter(op=>op.type==='text'&&/^W+$/.test(op.value));
 expect(names.length).toBeGreaterThan(20);
 for(const op of names)if(op.type==='text'&&title.type==='rect')expect(op.y+op.size).toBeLessThanOrEqual(title.y);
});
