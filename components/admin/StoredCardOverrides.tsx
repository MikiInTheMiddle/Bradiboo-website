'use client';
import {ArrayField,useFormFields} from '@payloadcms/ui';
export function StoredCardOverrides(props:any){
 const prefix=props.path.includes('.')?props.path.slice(0,props.path.lastIndexOf('.')):'';
 const automatic=useFormFields(([f])=>['watch','watchExperience','zapExperience'].includes(props.blockSlug)||props.blockSlug==='watchRail'&&f[`${prefix}.mode`]?.value!=='manual'||Boolean(f[`${prefix}.contentSelection.enabled`]?.value)||['characterFriends','dynamic','episodes'].includes(props.blockSlug)||props.blockSlug==='featured'&&f[`${prefix}.mode`]?.value==='automatic');
 return automatic?null:<ArrayField {...props}/>;
}
