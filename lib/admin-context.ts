import type {Condition,Field} from 'payload';
const name=(f:Field)=>'name' in f?f.name:undefined;
const textNames=new Set(['eyebrowMode','eyebrowText','title','cardTitle','note','description','cardDescription','textColor','titleColor','headingLevel','titleSize','titleCustomSize','titleAlign','titleWeight','noteColor','noteSize','noteCustomSize','noteAlign','noteWeight']);
export function backgroundChoice(s:Record<string,any>,kind:'block'|'card'|'slide') {
 if(kind==='card'&&s.composition==='stacked'&&s.backgroundMode==='image')return s.backgroundColor&&s.backgroundColor!=='transparent'?'color':'transparent';
 if(['page','transparent'].includes(s.backgroundMode))return 'transparent';
 if(['own','color'].includes(s.backgroundMode))return 'color';
 if(s.backgroundMode==='image')return 'image';
 if(kind==='card'){
  if(s.backgroundMode!=='inherit'&&s.enabled){
   if(s.backgroundColor!=null&&s.backgroundColor!=='')return s.backgroundColor==='transparent'?'transparent':'color';
   if(s.composition==='overlay'&&s.backgroundOpacity!=null)return 'image';
  }
  return 'inherit';
 }
 if(kind==='slide')return 'image';
 return s.backgroundImage?'image':s.backgroundColor&&s.backgroundColor!=='transparent'?'color':'transparent';
}
function when(field:Field,condition:Condition):Field {
 const previous=field.admin?.condition;
 return {...field,admin:{...field.admin,condition:(data,s,ctx)=>condition(data,s,ctx)&&(!previous||previous(data,s,ctx))}} as Field;
}
/** UI conditions only: keep every stored name, value and required constraint intact. */
export function contextualControls(fields:Field[]):Field[]{
 const names=new Set(fields.map(name));
 const mode=fields.find(f=>name(f)==='backgroundMode');
 let kind:'block'|'card'|'slide'='block';
 if(mode?.type==='select'){
  const options=mode.options.map(o=>typeof o==='string'?o:o.value);
  kind=options.includes('page')?'block':options.includes('inherit')?'card':'slide';
 }
 const ordered=mode?[mode,...fields.filter(f=>f!==mode)]:fields;
 return ordered.map(field=>{
  const key=name(field)||'';
  if(names.has('showText')&&textNames.has(key))field=when(field,(_,s)=>s.showText!==false);
  if(names.has('showMedia')&&['media','mediaSource','youtubeURL'].includes(key))field=when(field,(_,s)=>Boolean(s.showMedia));
  if(names.has('backgroundMode')){
   if(key==='backgroundMode'&&field.type==='select')field={...field,label:false,admin:{...field.admin,components:{...field.admin?.components,Field:{path:'/components/admin/BackgroundMode#BackgroundMode',clientProps:{kind}}}}};
   if(key==='backgroundColor'){
    field={...field,label:'Colore',admin:{...field.admin,components:{...field.admin?.components,Field:{path:'/components/admin/ColorField#ColorField',clientProps:{label:'Colore',solidOnly:true}}}}} as Field;
    field=when(field,(_,s)=>backgroundChoice(s,kind)==='color');
   }
   if(key==='backgroundImage'||kind==='slide'&&key==='image')field=when(field,(_,s)=>backgroundChoice(s,kind)==='image');
   if(key==='backgroundOpacity'){field={...field,admin:{...field.admin,description:'0% rende il fondo invisibile; 100% lo mostra completamente.'}} as Field;field=when(field,(_,s)=>['color','image'].includes(backgroundChoice(s,kind)));}
   if(key==='overlayOpacity'||key==='wideOverlayOpacity')field=when(field,(_,s)=>backgroundChoice(s,kind)==='image'||kind==='card'&&backgroundChoice(s,kind)==='inherit'&&s.composition!=='stacked');
   if(['mobileImage','focalX','focalY'].includes(key))field=when(field,(_,s)=>backgroundChoice(s,kind)==='image');
   if(key==='backgroundBlur')field=when(field,(_,s)=>backgroundChoice(s,kind)!=='inherit');
  }
  return field;
 });
}
