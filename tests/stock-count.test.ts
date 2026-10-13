import {seed} from './fixtures.mjs';
import {describe,it,expect} from 'vitest';
import {stock,countStock,commit,loadState,STORAGE_KEY} from '../src/domain';

describe('physical stock count',()=>{
  it('sets the counted quantity by recording a difference without creating a sale',()=>{
    const original=seed();
    const counted=countStock(original,'count-1','a',10);
    expect(stock(counted,'a')).toBe(10);
    expect(stock(original,'a')).toBe(12);
    expect(counted.movements.at(-1)).toMatchObject({type:'count',quantity:-2,countedQuantity:10});
    expect(counted.sales).toEqual([]);
  });
  it('accepts zero and an increased count, and records an unchanged count',()=>{
    expect(stock(countStock(seed(),'empty','a',0),'a')).toBe(0);
    expect(stock(countStock(seed(),'more','a',15),'a')).toBe(15);
    const same=countStock(seed(),'same','a',12);
    expect(same.movements.at(-1)).toMatchObject({type:'count',quantity:0,countedQuantity:12});
  });
  it('retries once and rejects changing the operation payload',()=>{
    const counted=countStock(seed(),'once','a',10);
    expect(countStock(counted,'once','a',10)).toBe(counted);
    expect(()=>countStock(counted,'once','a',9)).toThrow();
    expect(()=>countStock(counted,'once','b',10)).toThrow();
  });
  it('rejects invalid or inactive counts without changing the snapshot',()=>{
    const original=seed();
    for(const value of [-1,0.5,NaN,Infinity,Number.MAX_SAFE_INTEGER+1])expect(()=>countStock(original,'invalid','a',value)).toThrow();
    original.products[0].active=false;
    expect(()=>countStock(original,'inactive','a',10)).toThrow();
    expect(stock(original,'a')).toBe(12);
  });
  it('commits and reloads counts alongside existing stock history',()=>{
    const values=new Map<string,string>();
    const storage={getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value);}};
    const original=seed();storage.setItem(STORAGE_KEY,JSON.stringify(original));
    commit(storage,original,countStock(original,'saved','a',10));
    expect(stock(loadState(storage),'a')).toBe(10);
    const damaged=loadState(storage);damaged.movements.at(-1)!.countedQuantity=-1;
    storage.setItem(STORAGE_KEY,JSON.stringify(damaged));
    expect(()=>loadState(storage)).toThrow();
  });
  it('rejects count history whose difference does not reach the counted quantity',()=>{
    const damaged=countStock(seed(),'bad-delta','a',10);damaged.movements.at(-1)!.quantity=-1;
    expect(()=>loadState({getItem:()=>JSON.stringify(damaged),setItem:()=>{}})).toThrow();
  });
});
