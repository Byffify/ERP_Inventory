const DB_NAME='s4-product-images';
let database:Promise<IDBDatabase>|undefined;
function open():Promise<IDBDatabase>{
 if(!database)database=new Promise((resolve,reject)=>{const request=indexedDB.open(DB_NAME,1);request.onupgradeneeded=()=>request.result.createObjectStore('images');request.onsuccess=()=>{request.result.onversionchange=()=>{request.result.close();database=undefined;};resolve(request.result);};request.onerror=()=>{database=undefined;reject(new Error('เปิดพื้นที่เก็บรูปไม่ได้ กรุณาตรวจการอนุญาตของเบราว์เซอร์'));};request.onblocked=()=>{database=undefined;reject(new Error('พื้นที่เก็บรูปถูกใช้อยู่ กรุณาปิดแท็บอื่นแล้วลองใหม่'));};});
 return database;
}
async function operation<T>(mode:IDBTransactionMode,action:(store:IDBObjectStore)=>IDBRequest<T>):Promise<T>{
 const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction('images',mode);const request=action(tx.objectStore('images'));let result:T;request.onsuccess=()=>{result=request.result;};tx.oncomplete=()=>resolve(result);tx.onerror=tx.onabort=()=>reject(new Error('บันทึกหรืออ่านรูปไม่สำเร็จ กรุณาตรวจพื้นที่จัดเก็บแล้วลองใหม่'));});
}
export async function getImage(id:string):Promise<Blob|undefined>{return operation('readonly',s=>s.get(id));}
export async function removeImage(id:string){await operation('readwrite',s=>s.delete(id));}
export async function clearImages(){await operation('readwrite',s=>s.clear());}
export async function uploadImage(file:File):Promise<string>{
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('รองรับเฉพาะ JPEG, PNG และ WebP กรุณาเลือกไฟล์รูปใหม่');
 if(!file.size||file.size>8*1024*1024)throw new Error('รูปต้องมีขนาดไม่เกิน 8 MB กรุณาเลือกรูปที่เล็กลง');
 let bitmap:ImageBitmap;try{bitmap=await createImageBitmap(file);}catch{throw new Error('อ่านรูปไม่ได้ ไฟล์อาจเสียหาย กรุณาเลือกรูปใหม่');}
 try{
  const scale=Math.min(1,1200/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));const ctx=canvas.getContext('2d');if(!ctx)throw new Error('ปรับขนาดรูปไม่ได้ กรุณาลองใหม่');ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
  const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('ปรับขนาดรูปไม่ได้ กรุณาลองใหม่')),'image/webp',.85));
  if(blob.size>2*1024*1024)throw new Error('รูปหลังย่อยังใหญ่เกินไป กรุณาเลือกรูปที่เล็กลง');
  const id=crypto.randomUUID();try{await operation('readwrite',s=>s.put(blob,id));}catch{throw new Error('บันทึกรูปไม่สำเร็จ กรุณาตรวจพื้นที่จัดเก็บแล้วลองใหม่');}return id;
 }finally{bitmap.close();}
}
