import {invalidatePublicContent} from '../../../../../../lib/public-cache-hooks';
export async function POST(){invalidatePublicContent({doc:{_status:'published'},previousDoc:{_status:'published'}});return Response.json({refreshed:true});}
