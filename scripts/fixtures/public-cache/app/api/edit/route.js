// Local fixture only; scripts/fixtures is excluded from production uploads.
import {invalidatePublicContent} from '../../../../../../lib/public-cache-hooks';
export async function POST(request){
 if(!['localhost','127.0.0.1'].includes(new URL(request.url).hostname))return new Response(null,{status:403});
 const args=await request.json();invalidatePublicContent(args);return Response.json({invalidated:true});
}
