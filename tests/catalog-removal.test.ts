import {seed} from './fixtures.mjs';
import {describe,it,expect} from 'vitest';
import {canDeleteModel,deleteModel,archiveModel} from '../src/catalog';
import {stock,issueSale,cancelSale,defaultDocument,loadState} from '../src/domain';
describe('catalog removal with stock history preservation',()=>{
 it('deletes an unused zero-stock model and its opening movement',()=>{
  const original=seed(),next=deleteModel(original,'model-c');
  expect(next.models.some(m=>m.id==='model-c')).toBe(false);
  expect(next.products.some(p=>p.id==='c')).toBe(false);
  expect(next.movements.some(m=>m.productId==='c')).toBe(false);
  expect(stock(next,'a')).toBe(12);expect(original.products).toHaveLength(3);
  expect(loadState({getItem:()=>JSON.stringify(next),setItem:()=>{}})).toEqual(next);
 });
 it('does not delete stock or referenced history even when current quantity is zero',()=>{
  expect(canDeleteModel(seed(),'model-a')).toBe(false);
  expect(()=>deleteModel(seed(),'model-a')).toThrow();
  const sold=issueSale(seed(),'sale',[{productId:'a',quantity:12,price:18000}],defaultDocument());
  expect(stock(sold,'a')).toBe(0);expect(()=>deleteModel(sold,'model-a')).toThrow();
 });
 it('deactivates a referenced model without changing quantities or invoice records',()=>{
  const sold=issueSale(seed(),'sale',[{productId:'a',quantity:3,price:18000}],defaultDocument());
  const archived=archiveModel(sold,'model-a');expect(archived.products.find(p=>p.id==='a')?.active).toBe(false);
  expect(stock(archived,'a')).toBe(9);expect(archived.sales).toEqual(sold.sales);
  expect(stock(cancelSale(archived,'sale'),'a')).toBe(12);
 });
 it('allows deleting the last unused product and loading an empty catalog',()=>{
  let state=seed();state.movements.forEach(m=>m.quantity=0);
  for(const id of ['model-a','model-b','model-c'])state=deleteModel(state,id);
  expect(state.products).toEqual([]);expect(state.models).toEqual([]);
  expect(loadState({getItem:()=>JSON.stringify(state),setItem:()=>{}})).toEqual(state);
 });
 it('rejects an unknown model instead of affecting another product',()=>{
  expect(()=>deleteModel(seed(),'missing')).toThrow();expect(()=>archiveModel(seed(),'missing')).toThrow();
 });
});
