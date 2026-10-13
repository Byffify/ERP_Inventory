import {stock,productName,type DemoState,type Product} from './domain';
export type Availability='all'|'available'|'empty';
export function inventoryStatus(state:DemoState,product:Product){return stock(state,product.id)===0?'empty':'available';}
export function filterInventory(state:DemoState,{search='',category='',availability='all',includeInactive=false}:{search?:string;category?:string;availability?:Availability;includeInactive?:boolean}):Product[]{
 const query=search.trim().toLocaleLowerCase('th');
 return state.products.filter(p=>!p.deleted&&(includeInactive||p.active)&&(!category||(p.categoryId??state.models.find(m=>m.id===p.modelId)?.categoryId)===category)&&(availability==='all'||inventoryStatus(state,p)===availability)&&`${p.code} ${productName(p)}`.toLocaleLowerCase('th').includes(query));
}
