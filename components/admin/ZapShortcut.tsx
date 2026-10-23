import type {ServerProps} from 'payload';
export function ZapShortcut({permissions}:ServerProps){
 if(!permissions?.globals?.watch?.read)return null;
 return <a className="nav__link" href="/admin/zap"><span className="nav__link-label">↳ Pulsanti ZAP!</span></a>;
}
