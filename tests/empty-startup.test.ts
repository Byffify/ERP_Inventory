import {it,expect} from 'vitest';
import {seed,STORAGE_KEY} from '../src/domain';
import {initializeAppStorage,CLEAN_START_KEY} from '../src/startup';
const storage=()=>{const values=new Map<string,string>();return {values,getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value);},removeItem:(key:string)=>{values.delete(key);}};};
it('initial system has no products, bills, prices or stock movements',()=>{const initial=seed();expect(initial.products).toEqual([]);expect(initial.models).toEqual([]);expect(initial.sales).toEqual([]);expect(initial.movements).toEqual([]);expect(initial.history).toEqual([]);});
it('performs the user-authorized trial-data reset once and preserves subsequent records',()=>{
 const store=storage();store.setItem(STORAGE_KEY,'old trial data');store.setItem('s4-demo-v1-backup','old backup');
 const first=initializeAppStorage(store);expect(first.cleared).toBe(true);expect(first.state.products).toEqual([]);expect(store.getItem('s4-demo-v1-backup')).toBeNull();expect(store.getItem(CLEAN_START_KEY)).toBe('done');
 const actual=seed();actual.shop={name:'ร้านที่บันทึกเอง',address:'',taxId:''};store.setItem(STORAGE_KEY,JSON.stringify(actual));
 expect(initializeAppStorage(store).cleared).toBe(false);expect(initializeAppStorage(store).state.shop?.name).toBe('ร้านที่บันทึกเอง');
});
