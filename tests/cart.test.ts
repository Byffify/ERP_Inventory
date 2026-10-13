import {it,expect} from 'vitest';
import {seed} from './fixtures.mjs';
import {addCartItem} from '../src/cart';
it('one click adds one and repeated clicks increment a single cart line without stock mutation',()=>{
 const state=seed(),p=state.products[0];const one=addCartItem([],p,12),two=addCartItem(one,p,12);
 expect(one).toEqual([{productId:'a',quantity:'1',price:'180.00'}]);expect(two).toEqual([{productId:'a',quantity:'2',price:'180.00'}]);expect(state.movements[0].quantity).toBe(12);
});
it('keeps existing price overrides and other cart items',()=>{
 const state=seed();const next=addCartItem([{productId:'a',quantity:'2',price:'175.00'},{productId:'b',quantity:'1',price:'60.00'}],state.products[0],12);
 expect(next[0]).toEqual({productId:'a',quantity:'3',price:'175.00'});expect(next[1].quantity).toBe('1');
});
it('blocks unavailable and inactive products and does not overwrite an invalid cart quantity',()=>{
 const state=seed();expect(()=>addCartItem([],state.products[2],0)).toThrow();expect(()=>addCartItem([{productId:'a',quantity:'12',price:'180.00'}],state.products[0],12)).toThrow();expect(()=>addCartItem([{productId:'a',quantity:'x',price:'180.00'}],state.products[0],12)).toThrow();state.products[0].active=false;expect(()=>addCartItem([],state.products[0],12)).toThrow();
});
