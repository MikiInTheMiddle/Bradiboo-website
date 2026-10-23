import {headers} from 'next/headers';
import {redirect} from 'next/navigation';
import {getPayload} from 'payload';
import config from '@payload-config';
import {selectZapAdminTab} from '@/lib/zap-admin-shortcut';
export const dynamic='force-dynamic';
export default async function ZapShortcutPage(){
 const payload=await getPayload({config});const {user}=await payload.auth({headers:await headers()});
 if(!user)redirect('/admin/login?redirect=%2Fadmin%2Fzap');
 const selected=await selectZapAdminTab(payload,user);
 redirect(selected?'/admin/globals/watch':'/admin');
}
