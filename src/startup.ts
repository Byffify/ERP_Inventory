import {loadState,STORAGE_KEY,type StoragePort,type DemoState} from './domain';
export const CLEAN_START_KEY='inventory-clean-start-2026-10-13';
export interface StartupStorage extends StoragePort {removeItem:(key:string)=>void}
export function initializeAppStorage(storage:StartupStorage):{state:DemoState;cleared:boolean}{
 const cleared=storage.getItem(CLEAN_START_KEY)!=='done';
 if(cleared){storage.removeItem(STORAGE_KEY);storage.removeItem('s4-demo-v1-backup');storage.setItem(CLEAN_START_KEY,'done');}
 return {state:loadState(storage),cleared};
}
