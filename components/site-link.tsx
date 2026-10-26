import NextLink from 'next/link';
import type {ComponentProps} from 'react';
import {formLinkBehavior} from '@/lib/link-behavior';

/** Shared link policy applies to saved CMS links as well as newly inserted blocks. */
export default function SiteLink(props:ComponentProps<typeof NextLink>){
 return <NextLink {...props} {...formLinkBehavior(props.href,props.rel)}/>;
}
