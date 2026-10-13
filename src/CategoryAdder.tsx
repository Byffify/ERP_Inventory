import {useState} from 'react';
import {Plus} from 'lucide-react';
export default function CategoryAdder({onAdd,onAdded}:{onAdd:(name:string)=>string|null;onAdded?:(id:string)=>void}){
 const [open,setOpen]=useState(false),[name,setName]=useState('');
 function add(){const id=onAdd(name);if(id){onAdded?.(id);setName('');setOpen(false);}}
 return <div className="category-adder">{open?<><label>ชื่อประเภทใหม่<input aria-label="ชื่อประเภทใหม่" value={name} maxLength={120} onChange={e=>setName(e.target.value)} autoFocus onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();add();}if(e.key==='Escape'){e.preventDefault();setOpen(false);setName('');}}}/></label><div className="actions"><button type="button" onClick={()=>{setOpen(false);setName('');}}>ยกเลิกเพิ่มประเภท</button><button type="button" className="primary" onClick={add}>บันทึกประเภท</button></div></>:<button type="button" onClick={()=>setOpen(true)}><Plus size={16} aria-hidden="true"/>เพิ่มประเภทสินค้า</button>}</div>;
}
