// Fictional records for isolated tests only. Never imported by application code.
export function seed(){
 const products=[{id:'a',modelId:'model-a',active:true,code:'DEMO-A',name:'ชุดชั้นในรุ่น A',color:'ดำ',size:'M',unit:'แพ็ก',price:18000},{id:'b',modelId:'model-b',active:true,code:'DEMO-B',name:'ชุดชั้นในรุ่น B',unit:'ชิ้น',price:6000},{id:'c',modelId:'model-c',active:true,code:'DEMO-C',name:'ชุดชั้นในรุ่น C',color:'ครีม',size:'L',unit:'แพ็ก',price:20000}];
 return {version:2,categories:[{id:'uncategorized',name:'ยังไม่จัดประเภท'}],models:products.map(p=>({id:p.modelId,name:p.name,description:'',categoryId:'uncategorized'})),products,sales:[],history:[],movements:products.map((p,i)=>({id:`opening-${p.id}`,productId:p.id,quantity:[12,20,0][i],type:'opening',reference:'opening',createdAt:'2026-10-13T00:00:00+07:00'}))};
}
export async function installFixture(page){await page.addInitScript(data=>{localStorage.setItem('inventory-clean-start-2026-10-13','done');if(localStorage.getItem('s4-demo-v1')===null)localStorage.setItem('s4-demo-v1',JSON.stringify(data));},seed());}
