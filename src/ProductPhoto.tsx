import {useEffect,useRef,useState} from 'react';
import {ImagePlus,Package,X} from 'lucide-react';
import {getImage,removeImage,uploadImage} from './images';

export function ProductPhoto({id,alt,className=''}:{id?:string;alt:string;className?:string}){
 const [url,setUrl]=useState('');const [failed,setFailed]=useState(false);
 useEffect(()=>{let cancelled=false,owned='';setUrl('');setFailed(false);if(id)getImage(id).then(blob=>{if(!blob){if(!cancelled)setFailed(true);return;}owned=URL.createObjectURL(blob);if(cancelled)URL.revokeObjectURL(owned);else setUrl(owned);}).catch(()=>{if(!cancelled)setFailed(true);});return ()=>{cancelled=true;if(owned)URL.revokeObjectURL(owned);};},[id]);
 return <div className={`product-photo ${className}${failed?' photo-failed':''}`}>{url&&!failed?<img src={url} alt={alt} onError={()=>setFailed(true)}/>:<><Package size={24} aria-hidden="true"/><span>{failed?'รูปไม่พร้อมใช้':'ยังไม่มีรูป'}</span></>}</div>;
}
export function PhotoField({id,label,fallback,onChange,onStaged,onBusy}:{id?:string;label:string;fallback?:string;onChange:(id?:string)=>void;onStaged:(id:string)=>void;onBusy:(amount:number)=>void}){
 const [error,setError]=useState('');const [working,setWorking]=useState(false);const mounted=useRef(true);
 useEffect(()=>{mounted.current=true;return ()=>{mounted.current=false;};},[]);
 async function select(file?:File){if(!file)return;setWorking(true);setError('');onBusy(1);try{const image=await uploadImage(file);if(!mounted.current){await removeImage(image);return;}onStaged(image);onChange(image);}catch(e){if(mounted.current)setError(e instanceof Error?e.message:'อัปโหลดรูปไม่สำเร็จ');}finally{onBusy(-1);if(mounted.current)setWorking(false);}}
 return <section className="photo-field" aria-label={`${label} — จัดการรูป`}><div className="photo-field-preview"><ProductPhoto id={id??fallback} alt={label}/><div><h3>{label}</h3><p className="muted small">{fallback&&!id?'ใช้รูปหลักของรุ่น · เพิ่มรูปเฉพาะได้':'JPEG, PNG, WebP · ไม่เกิน 8 MB'}</p><label className="upload-label"><ImagePlus size={20} aria-hidden="true"/>{working?'กำลังย่อและเก็บรูป…':'เลือกรูปจากอุปกรณ์'}<input type="file" aria-label={label} accept="image/jpeg,image/png,image/webp" disabled={working} onChange={e=>{void select(e.target.files?.[0]);e.target.value='';}}/></label>{id&&<button type="button" className="text-button" disabled={working} onClick={()=>{onChange(undefined);setError('');}}><X size={18} aria-hidden="true"/>นำรูปออก</button>}</div></div>{error&&<p className="field-error" role="alert">{error}</p>}</section>;
}

