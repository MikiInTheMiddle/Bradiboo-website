import type {Field,Condition} from 'payload';
import {compactFields} from './admin-compact';
const key=(f:Field)=>'name' in f?f.name:undefined;
const themes:{label:string;names:string[]}[]=[
 {label:'Fondo',names:['backgroundMode','backgroundColor','backgroundImage','backgroundOpacity','backgroundBlur','overlayOpacity','wideOverlayOpacity']},
 {label:'Titolo',names:['title','cardTitle','titleColor','headingLevel','titleSize','titleCustomSize','titleAlign','titleWeight']},
 {label:'Descrizione',names:['note','description','cardDescription','noteColor','noteSize','noteCustomSize','noteAlign','noteWeight']},
 {label:'Etichetta',names:['showBadge','badge','badgeMode','badgeText','badgeBackgroundColor','badgeTextColor','hideBadge']},
 {label:'Hover · fondo',names:['hoverBackgroundColor','hoverOpacity']},
 {label:'Hover · testi',names:['hoverTextColor','hoverTitleColor','hoverNoteColor']},
 {label:'Hover · etichetta',names:['hoverBadgeBackgroundColor','hoverBadgeTextColor']},
 {label:'Bordi e angoli',names:['borderColor','borderRadius']},
 {label:'CTA',names:['ctaLabel','ctaURL','ctaBackgroundColor','ctaTextColor']},
 {label:'Immagine responsive',names:['mobileImage','focalX','focalY']},
];
export function themedPanels(fields:Field[]):Field[]{
 const used=new Set<Field>();const panels=new Map<Field,Field>();
 for(const theme of themes){
  const members=fields.filter(f=>theme.names.includes(key(f)||'')&&!used.has(f)&&!(f.admin&&'hidden' in f.admin&&f.admin.hidden)&&f.admin?.position!=='sidebar');
  if(members.length<2)continue;
  members.forEach(f=>used.add(f));
  const condition:Condition=(data,sibling,context)=>members.some(f=>!f.admin?.condition||f.admin.condition(data,sibling,context));
  panels.set(members[0],{type:'group',label:theme.label,admin:{className:'bradi-theme-panel',hideGutter:true,condition},fields:compactFields(members)});
 }
 return fields.flatMap(f=>panels.has(f)?[panels.get(f)!]:used.has(f)?[]:[f]);
}
