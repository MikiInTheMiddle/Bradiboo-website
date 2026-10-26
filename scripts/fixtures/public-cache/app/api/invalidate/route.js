import {invalidatePublicContent} from '../../../../../../lib/public-cache-hooks';
export async function POST(){invalidatePublicContent({doc:{}});return Response.json({invalidated:true});}
