import {invalidatePublicContent} from '../../../../../../lib/public-cache-hooks';
export async function POST(){invalidatePublicContent({doc:{_status:'draft'},previousDoc:{_status:'published'}});return Response.json({invalidated:true});}
