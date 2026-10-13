import {it,expect} from 'vitest';
import {seed,stock,deductStock,undoDeduction,loadState,STORAGE_KEY} from '../src/domain';
it('manual deduction changes stock without creating an invoice',()=>{const s=deductStock(seed(),'m1','a',3);expect(stock(s,'a')).toBe(9);expect(s.sales).toHaveLength(0);expect(s.movements.at(-1).type).toBe('deduction')});
it('manual deduction retry cannot deduct twice',()=>{const s=deductStock(seed(),'m1','a',3);expect(stock(deductStock(s,'m1','a',3),'a')).toBe(9);expect(()=>deductStock(s,'m1','a',4)).toThrow(/รหัส/)});
it('undo returns manual quantity exactly once without a bill',()=>{const s=undoDeduction(deductStock(seed(),'m1','a',3),'m1');expect(stock(s,'a')).toBe(12);expect(stock(undoDeduction(s,'m1'),'a')).toBe(12);expect(s.sales).toHaveLength(0)});
it('manual deduction rejects shortage and invalid quantities',()=>{const s=seed();for(const q of [0,-1,1.5,13])expect(()=>deductStock(s,'m1','a',q)).toThrow();expect(stock(s,'a')).toBe(12)});
it('reload keeps manual history and undo state',()=>{const s=undoDeduction(deductStock(seed(),'m1','a',3),'m1');const st={getItem:(key:string)=>key===STORAGE_KEY?JSON.stringify(s):null,setItem:()=>{}};expect(stock(loadState(st),'a')).toBe(12)});
