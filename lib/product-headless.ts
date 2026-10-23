import 'server-only';
import type {HeadlessProduct} from './product-model';
export async function getHeadlessProduct(slug:string):Promise<HeadlessProduct|undefined>{
 const base=process.env.BRADITIME_API_BASE;if(!base||!slug)return;
 try{const r=await fetch(new URL('wp-json/bradicore/v1/product/all',base.endsWith('/')?base:base+'/'),{next:{revalidate:300,tags:['shop-products']},signal:AbortSignal.timeout(8000)});if(!r.ok)return;const rows:unknown=await r.json();if(!Array.isArray(rows))return;const product=rows.find(p=>p&&p.slug===slug&&Number.isInteger(p.id)&&typeof p.title==='string');return product as HeadlessProduct|undefined;}catch{return;}
}
