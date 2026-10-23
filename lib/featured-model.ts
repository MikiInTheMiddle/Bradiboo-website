import type {WireLink} from './wireframe';
export function resolveFeaturedSlide(original:WireLink,override?:Partial<WireLink>):WireLink {
 const local=Object.fromEntries(Object.entries(override||{}).filter(([,v])=>v!==undefined&&v!==null&&v!==''));
 const result={...original,...local};
 return {...result,ctaLabel:result.ctaLabel||(result.href.startsWith('/guarda?contenuto=')?'Guarda ora':'Scopri di più')};
}
