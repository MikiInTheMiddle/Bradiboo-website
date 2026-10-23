import type {Field} from 'payload';
const key=(f:Field)=>'name' in f?f.name:undefined;
const groups=[
 ['mode','selectionMode','locale','limit'],
 ['backgroundOpacity','backgroundBlur','overlayOpacity','wideOverlayOpacity'],
 ['focalX','focalY'],
 ['titleSize','titleCustomSize','titleAlign','titleWeight'],
 ['noteSize','noteCustomSize','noteAlign','noteWeight'],
];
/** Unnamed rows only change the editor layout, never the stored field paths. */
export function compactFields(fields:Field[]):Field[]{
 const consumed=new Set<Field>();const rows=new Map<Field,Field>();
 for(const group of groups){
  const members=fields.filter(f=>group.includes(key(f)||'')&&f.admin?.position!=='sidebar'&&!consumed.has(f));
  if(members.length<2)continue;
  members.forEach(f=>consumed.add(f));
  rows.set(members[0],{type:'row',admin:{className:group[0]==='titleSize'?'bradi-compact-row bradi-format-row bradi-format-title':group[0]==='noteSize'?'bradi-compact-row bradi-format-row bradi-format-note':'bradi-compact-row'},fields:members.map(f=>({...f,admin:{...f.admin,width:`${Math.round(100/members.length)}%`}} as Field))});
 }
 return fields.flatMap(f=>rows.has(f)?[rows.get(f)!]:consumed.has(f)?[]:[f.type==='number'?{...f,admin:{...f.admin,className:[f.admin?.className,'bradi-short-number'].filter(Boolean).join(' ')}}:f]);
}
