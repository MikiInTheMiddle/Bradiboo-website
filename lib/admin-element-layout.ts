import {hasWideSlides} from './presentation-fields';
import type {Field,Condition} from 'payload';
const key=(f:Field)=>'name' in f?f.name:undefined;
function flat(fields:Field[]):Field[]{return fields.flatMap(f=>f.type==='tabs'&&f.tabs.every(t=>!('name' in t&&t.name))?f.tabs.flatMap(t=>flat(t.fields)):f.type==='group'&&!('name' in f)?flat(f.fields):[f]);}
function scope(data:any,context:any){if(context.blockData)return context.blockData;const path=context.path||[];const index=path.indexOf('entries');return index>=0?path.slice(0,index).reduce((v:any,k:any)=>v?.[k],data)||data:data;}
export function overlayInRow(sibling:Record<string,any>,block:Record<string,any>={}) {
 const local=sibling.appearance?.composition;
 return !hasWideSlides(block)&&(local==='overlay'||(!local||local==='inherit')&&block.cardAppearance?.composition==='overlay');
}
export function elementLayout(fields:Field[],_arrayName:string):Field[]{
 const all=flat(fields);
 const imageName=all.some(f=>key(f)==='cardImage')?'cardImage':all.some(f=>key(f)==='image')?'image':all.some(f=>key(f)==='overrides'&&f.type==='group'&&f.fields.some(c=>key(c)==='image'))?'overrides.image':undefined;
 const content:Field[]=[],styles:Field[]=[];
 for(let field of all){
  const name=key(field);
  // Old label inputs remain stored for compatibility. Only the contextual label panel is editable.
  if(['badge','badgeBackgroundColor','slideBadge','hideBadge'].includes(name||'')){
   content.push({...field,admin:{...field.admin,hidden:true}} as Field);continue;
  }
  if(name==='appearance'&&field.type==='group'){
   const condition:Condition=(_data,sibling,context)=>overlayInRow({appearance:sibling},scope(_data,context))&&sibling.backgroundMode==='image';
   const controls:Field[]=imageName?[{name:'backgroundImageControl',type:'ui',admin:{condition,components:{Field:{path:imageName==='overrides.image'?'/components/admin/CardBackgroundImage#ActivityCardBackgroundImage':'/components/admin/CardBackgroundImage#CardBackgroundImage',clientProps:{target:imageName}}}}}]:[];
   const fields=field.fields.map(f=>f.type==='tabs'?{...f,tabs:f.tabs.map(t=>t.label==='Fondo'?{...t,fields:[...t.fields,...controls]}:t)}:f);
   styles.push({...field,label:false,fields});continue;
  }
  if(name==='wideAppearance'&&field.type==='group'){
   styles.push(field);continue;
  }
  if(name==='overrides'&&field.type==='group'&&imageName==='overrides.image'){
   field={...field,fields:field.fields.map(f=>key(f)==='image'?{...f,admin:{...f.admin,condition:(data:Record<string,any>,_s:unknown,context:any)=>{
    const row=context.path.slice(0,-2).reduce((v:any,k:string|number)=>v?.[k],data);
    return !hasWideSlides(context.blockData)&&!overlayInRow(row||{},scope(data,context));
   }}} as Field:f)};
  }
  if(['label','description','ctaLabel','href'].includes(name||'')){
   const previous=field.admin?.condition;
   field={...field,admin:{...field.admin,condition:(data:any,s:any,ctx:any)=>(!(s.sourceMode==='profile'||s.sourceMode==='linked'||s.source&&s.sourceMode!=='manual')||Boolean(s.overrideContent))&&(!previous||previous(data,s,ctx))}} as Field;
  }
  if(name===imageName){
   const previous=field.admin?.condition;
   const condition:Condition=(data,sibling,context)=>!overlayInRow(sibling,scope(data,context))&&!hasWideSlides(context.blockData)&&(!(sibling.sourceMode==='profile'||sibling.sourceMode==='linked'||sibling.source&&sibling.sourceMode!=='manual')||Boolean(sibling.overrideImage))&&(!previous||previous(data,sibling,context));
   field={...field,label:'Immagine',admin:{...field.admin,condition}} as Field;
  }
  content.push(field);
 }
 return [{name:'editorControl',type:'ui',admin:{components:{Field:'/components/admin/CardEditor#CardEditor'}}},...[...content,...styles].map(f=>({...f,admin:{...f.admin,hidden:true}} as Field))];
}
