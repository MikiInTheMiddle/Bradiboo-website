import { getPayload } from 'payload';
import config from '@payload-config';
import { getBraditime } from '@/lib/braditime';
export async function GET(request: Request) {
 const payload=await getPayload({config});const {user}=await payload.auth({headers:request.headers});
 if(!user)return Response.json({error:'Accesso richiesto'},{status:401});
 const result=await getBraditime({locale:'all',limit:1000});
 return Response.json({items:result.items.map(i=>({id:i.id,label:i.label})),message:result.message});
}
