import {getPayload} from 'payload';
import config from '@payload-config';
import {syncWatchTerms} from '@/lib/sync-watch-terms';
export async function POST(request:Request){
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Origine non consentita'},{status:403});
 const payload=await getPayload({config});const {user}=await payload.auth({headers:request.headers});if(!user)return Response.json({error:'Accesso richiesto'},{status:401});
 try{return Response.json(await syncWatchTerms(payload));}catch{return Response.json({error:'Importazione non completata. I termini già salvati restano disponibili; puoi riprovare.'},{status:502});}
}
