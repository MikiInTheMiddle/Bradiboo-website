import {cardFunctionFields} from './card-function';
import {cardAudioField} from './card-audio';
import {contentSelectionBlocks,contentSelectionField} from './content-selection';
import {contextualControls} from './admin-context';
import {elementLayout} from './admin-element-layout';
import {themedPanels} from './admin-panels';
import {compactFields} from './admin-compact';
import {wideAppearanceField} from './wide-appearance';
import {collectionBlockTypes,presentationFields,hasWideSlides} from './presentation-fields';
import {slideMediaFields} from './featured-fields';
import type {Block,CollectionConfig,Field,GlobalConfig,Tab,Condition} from 'payload';
// Unnamed tabs are presentation-only: stored paths stay intact.
const name=(field:Field)=>'name' in field?field.name:undefined;
function sectionTabs(label:string,fields:Field[]):Field[]{return fields.length?[tabs([{label,fields}])]:[];}
function tabs(groups:{label:string;fields:Field[];description?:string;condition?:Condition}[]):Field{return {type:'tabs',tabs:groups.filter(g=>g.fields.length).map(g=>({label:g.label,fields:g.fields,...((g.description||g.condition)?{admin:{description:g.description,condition:g.condition}}:{})})) as Tab[]};}
function picker(fields:Field[]){const used=new Set<Field>();return {take:(names:string[])=>fields.filter(f=>{if(!used.has(f)&&names.includes(name(f)||'')){used.add(f);return true;}return false;}),rest:()=>fields.filter(f=>!used.has(f))};}
function contextualField(field:Field,wide:boolean):Field {
 const previous=field.admin?.condition;
 const condition:Condition=(data,sibling,context)=>hasWideSlides(context.blockData)===wide&&(!previous||previous(data as never,sibling,context));
 return {...field,admin:{...field.admin,condition}} as Field;
}
function repeaters(fields:Field[],slides=false):Field[]{return compactFields(themedPanels(contextualControls(fields).map(field=>{
 if(slides&&['wideAppearance','hideBadge','slideBadge'].includes(name(field)||''))field=contextualField(field,true);
 if(['badgeBackgroundColor','badgeTextColor'].includes(name(field)||'')){
  const previous=field.admin?.condition;
  field={...field,admin:{...field.admin,condition:(data:any,s:any,ctx:any)=>{
   const path=ctx.path||[];
   if(path[path.length-2]==='wideAppearance'){
    const row=path.slice(0,-2).reduce((v:any,k:string|number)=>v?.[k],data);
    if(row?.hideBadge)return false;
   }
   return !previous||previous(data,s,ctx);
  }}} as Field;
 }

 if(slides&&name(field)==='appearance')field=contextualField(field,false);
 if(field.type==='group'&&['appearance','cardAppearance','wideAppearance'].includes(name(field)||'')){
  const wide=name(field)==='wideAppearance';
  field={...field,fields:field.fields.map(f=>f.type==='tabs'?{...f,tabs:f.tabs.map(t=>{
   if(!(wide&&t.label!=='Etichetta'||!wide&&['Testi','Bordi'].includes(String(t.label))))return t;
   const previous=t.admin?.condition;
   return {...t,admin:{...t.admin,condition:(data:any,s:any,ctx:any)=>Boolean(s.enabled)&&(!previous||previous(data,s,ctx))}};
  })}:f)};
 }

 if(field.type==='group'&&['cardAppearance','appearance','wideAppearance'].includes(name(field)||''))field={...field,label:['cardAppearance','appearance'].includes(name(field)||'')?false:field.label,admin:{...field.admin,className:[field.admin?.className,'bradi-settings-scope'].filter(Boolean).join(' '),...(name(field)==='cardAppearance'?{description:'Queste impostazioni valgono per tutte le card di questo blocco. Le sottosezioni Normale, Hover ed Etichetta appartengono a questo pannello; ogni card può avere un override locale.'}:{})}};
 if(field.type==='array'){
  const elementRows=slides&&['items','cards','panels','entries','cast','selections','cardOverrides','slideOverrides'].includes(field.name);
  const children=[...field.fields];
  if(slides&&field.name==='rails')children.push({name:'automaticCardsControl',type:'ui',admin:{components:{Field:{path:'/components/admin/AutomaticCards#AutomaticCards',clientProps:{blockSlug:'watchRail'}}}}});
  if(elementRows)children.push(...cardFunctionFields(),cardAudioField());
  if(elementRows&&['entries','cast','cardOverrides'].includes(field.name))children.push({type:'tabs',tabs:[{label:'Override contenuto',fields:[
   {name:'cardTitle',label:'Titolo locale (vuoto = sorgente)',type:'text'},
   {name:'cardDescription',label:'Descrizione locale (vuota = nessun testo)',type:'textarea'},
   {name:'cardImage',label:'Immagine locale (vuoto = sorgente)',type:'upload',relationTo:'media'},
  ]}]});
  if(elementRows&&!children.some(f=>name(f)==='wideAppearance'))children.push(wideAppearanceField());
  if(elementRows&&!children.some(f=>name(f)==='mobileImage'||f.type==='tabs'&&f.tabs.some(t=>t.fields.some(c=>name(c)==='mobileImage')))){
   const wideTab={label:'Slide Wide',fields:slideMediaFields()};
   const index=children.findIndex(f=>f.type==='tabs');const existing=children[index];
   if(existing?.type==='tabs')children[index]={...existing,tabs:[...existing.tabs,wideTab]};
   else children.push({type:'tabs',tabs:[wideTab]});
  }
  const hasRowField=(values:Field[],key:string):boolean=>values.some(f=>name(f)===key||f.type==='tabs'&&f.tabs.some(t=>hasRowField(t.fields,key)));
  if(elementRows&&!hasRowField(children,'slideBadge'))children.push({name:'slideBadge',label:'Testo etichetta slide',type:'text'});
  const fields=children.map(child=>{
   const key=name(child);
   if(field.name==='rails'&&['themeTerms','keywordTerms','characters','limit','entries'].includes(key||''))return {...child,admin:{...child.admin,...(key==='entries'?{components:{...child.admin?.components,Field:{path:'/components/admin/StoredCardOverrides#StoredCardOverrides',clientProps:{blockSlug:'watchRail'}}}}:{}),condition:(_data:unknown,sibling:Record<string,unknown>)=>key==='entries'?true:sibling.mode!=='manual'}} as Field;
   if(field.name==='remoteButtons'&&key==='icon')return {...child,admin:{...child.admin,condition:(_data:unknown,sibling:Record<string,unknown>)=>!sibling.image}} as Field;
   return child;
  });
  return {...field,fields:repeaters(elementRows?elementLayout(fields,field.name):fields,slides),admin:{...field.admin,initCollapsed:true,components:{...field.admin?.components,RowLabel:field.admin?.components?.RowLabel||'/components/admin/ArrayTitle#ArrayTitle'}}};
 }
 if(field.type==='blocks')return {...field,admin:{...field.admin,initCollapsed:true}};
 if(field.type==='tabs')return {...field,tabs:field.tabs.map(t=>({...t,fields:repeaters(t.fields,slides).map(f=>f.type==='group'&&!('name' in f)&&f.label===t.label?{...f,label:false}:f)}))};
 if('fields' in field)return {...field,fields:repeaters(field.fields,slides)};
 return field;
 })));}
export function organizeBlock(block:Block):Field[]{
 const compatible=collectionBlockTypes.has(block.slug);
 const autoSelection=contentSelectionBlocks.has(block.slug);
 const legacyKeys=new Set(['mode','selectionMode','character','production','limit','items','cards','panels','entries','cast','characterFilters','themeTerms','keywordTerms']);
 const fields=block.fields.map(original=>{
  // Section headings are optional; keep empty strings compatible with existing NOT NULL columns.
  const f:Field=name(original)==='title'&&original.type==='text'?{...original,required:false,hooks:{...original.hooks,beforeValidate:[...(original.hooks?.beforeValidate||[]),({value})=>value??'']},admin:{...original.admin,description:'Facoltativo. Lascia vuoto per non mostrare il titolo.'}}:original;
  if(!autoSelection||!legacyKeys.has(name(f)||''))return f;
  const previous=f.admin?.condition;
  const result={...f,admin:{...f.admin,condition:(d:any,s:any,c:any)=>!s.contentSelection?.enabled&&(!previous||previous(d,s,c))}} as Field;
  if(block.slug==='episodes'&&name(f)==='production')return {...result,required:false,validate:(v:any,{siblingData:s}:any)=>s.contentSelection?.enabled||Boolean(v)||'Seleziona la produzione.'} as Field;
  return result;
 });
 if(autoSelection)fields.unshift(contentSelectionField());
 if(compatible)for(const field of [...presentationFields(),...slideMediaFields().filter(f=>name(f)!=='hideBadge')])if(!fields.some(f=>name(f)===name(field)))fields.push(field);
 if(compatible){
  const extras:Field[]=[
   {name:'backgroundMode',label:'Tipo di fondo',type:'select',options:[{label:'Trasparente',value:'page'},{label:'Colore',value:'own'},{label:'Immagine',value:'image'}]},
   {name:'backgroundImage',label:'Immagine di fondo',type:'upload',relationTo:'media',admin:{condition:(_,s)=>s.backgroundMode==='image'}},
   {name:'showText',label:'Mostra titolo e testo',type:'checkbox',defaultValue:true},
   {name:'contentLayout',label:'Disposizione testo e media',type:'select',options:[{label:'Predefinita',value:'auto'},{label:'Testo a sinistra',value:'text-first'},{label:'Media a sinistra',value:'media-first'},{label:'Uno sotto l’altro',value:'stacked'}],admin:{condition:(_,s)=>s.presentation!=='wide'&&Boolean(s.showMedia)}},
   {name:'ctaLabel',label:'Testo CTA',type:'text'},
   {name:'ctaURL',label:'Destinazione CTA',type:'text'},
  ];
  for(const field of extras)if(!fields.some(f=>name(f)===name(field)))fields.push(field);
 }

 const p=picker(fields);
 const management=p.take(['label','draft','blockName']);
 const badge=p.take(['showBadge','badge','badgeBackgroundColor','badgeTextColor']);
 const presentation=p.take(['presentation']);
 const textVisibility=p.take(['showText','eyebrowMode','eyebrowText',...(block.slug==='characterProfile'?['overrideNote']:[])]);
 const mediaLayout=p.take(['contentLayout']).map(f=>f.type==='select'?{...f,options:[{label:'Predefinita',value:'auto'},{label:'Media a destra · testo a sinistra',value:'text-first'},{label:'Media a sinistra · testo a destra',value:'media-first'},{label:'Uno sotto l’altro',value:'stacked'}]} as Field:f);
 const elementDefaults=p.take(['showAudioControl','cardAppearance','cardLayout']).map(f=>['gallery','characterMoments'].includes(block.slug)&&name(f)==='cardLayout'?{...f,admin:{...f.admin,hidden:true}} as Field:f);
 const visual=p.take(['backgroundColor','backgroundMode','backgroundImage','randomHero','heroImages','edgeColorPreview','customEdgeColor','edgeColor','backgroundOpacity','backgroundBlur','wideOverlayOpacity','mobileImage','focalX','focalY']).map(f=>name(f)==='wideOverlayOpacity'?{...f,label:'Velo di leggibilità (%)',admin:{...f.admin,condition:(_,s)=>s.backgroundMode==='image',description:'0% mostra i colori originali. Il velo scurisce solo il fondo, senza modificare l’opacità dell’immagine.'}} as Field:f);
 const mediaOrder=['showMedia','mediaSource','youtubeURL','media','mediaMobileImage'];
 const profileMedia=block.slug==='characterProfile'?p.take(['overrideMedia','profileAudioOverride','profileAudio','profileAudioCaption']):[];
 const media=p.take(mediaOrder).sort((a,b)=>mediaOrder.indexOf(name(a)||'')-mediaOrder.indexOf(name(b)||''));
 const cta=p.take(['ctaLabel','ctaURL','ctaAlign']).map(f=>name(f)==='ctaAlign'?{...f,admin:{...f.admin,condition:(_,s)=>Boolean(s.ctaLabel||s.ctaURL)}} as Field:f);
 const source=p.take(['contentSelection','mode','selectionMode','section','overrideTitle','overrideNote','overrideMedia','overrideItems','production','character','characterFilters','themeTerms','keywordTerms','locale','limit']);
 const titleFields=p.take(['title','titleColor','headingLevel','titleSize','titleCustomSize','titleAlign','titleWeight']);
 const noteFields=p.take(['note','noteColor','noteSize','noteCustomSize','noteAlign','noteWeight']);
 const textColor=p.take(['textColor']);
 const watchRails=p.take(['railMode','railSelections']);
 const remainder=p.rest().map(f=>name(f)==='cardOverrides'?{...f,admin:{...f.admin,description:'Override dei contenuti automatici. Gli elementi selezionati manualmente si personalizzano direttamente nella loro riga.',components:{...f.admin?.components,Field:{path:'/components/admin/StoredCardOverrides#StoredCardOverrides',clientProps:{blockSlug:block.slug}}},condition:(_data:unknown,sibling:Record<string,unknown>)=>Boolean((sibling.contentSelection as {enabled?:boolean}|undefined)?.enabled)||Array.isArray(sibling.cardOverrides)&&sibling.cardOverrides.length>0||!['manual','catalog','characters'].includes(String(sibling.mode))&&block.slug!=='featured'&&!Array.isArray(sibling.items)&&block.slug!=='characterProfile'}} as Field:f);
 const title=titleFields.filter(f=>name(f)==='title');
 const titleStyle=titleFields.filter(f=>name(f)!=='title');
 const note=noteFields.filter(f=>name(f)==='note');
 const noteStyle=noteFields.filter(f=>name(f)!=='note');
 const textEditing=[...textColor,...title,...titleStyle,...note,...noteStyle];
 const linked=block.slug==='headlessProduct';
 const showMedia=block.fields.some(f=>name(f)==='showMedia');
 const conditionalMedia=media.map(f=>name(f)==='media'&&showMedia?{...f,admin:{...f.admin,condition:(_data:unknown,sibling:Record<string,unknown>)=>Boolean(sibling.showMedia)&&sibling.mediaSource!=='youtube'}} as Field:f);
 if(block.slug==='characterProfile')for(let i=0;i<conditionalMedia.length;i++){
  const field=conditionalMedia[i];if(name(field)==='showMedia')continue;
  const previous=field.admin?.condition;
  conditionalMedia[i]={...field,admin:{...field.admin,condition:(d:any,s:any,c:any)=>Boolean(s.showMedia&&s.overrideMedia)&&(!previous||previous(d,s,c))}} as Field;
 }
 if(compatible){
  const cardOnly=(values:Field[])=>values.map(f=>contextualField(f,false));
  const labelCondition:Condition=(_,s)=>s.presentation!=='wide'||(!['featured','collection','episodes','dynamic','braditime','characterFriends','characterMoments'].includes(block.slug)&&!['items','cards','panels'].some(k=>Array.isArray(s[k])&&s[k].length));
  const contextualBadge=badge.map(f=>{const previous=f.admin?.condition;return {...f,admin:{...f.admin,condition:(data:unknown,sibling:Record<string,unknown>,context:any)=>labelCondition(data as never,sibling,context)&&(!previous||previous(data as never,sibling,context))}} as Field;});
  return repeaters([...presentation,tabs([
   {label:'Contenuto',fields:[...textVisibility,...textColor,...title,...titleStyle,...note,...noteStyle,...cta],description:'Titolo, testo e CTA del blocco. In Wide con elementi, i contenuti delle slide si modificano in Elementi.'},
   {label:'Media',fields:block.slug==='characterProfile'?[...conditionalMedia.filter(f=>name(f)==='showMedia'),...profileMedia.filter(f=>name(f)==='overrideMedia'),...conditionalMedia.filter(f=>name(f)!=='showMedia'),...mediaLayout,...profileMedia.filter(f=>name(f)!=='overrideMedia')]:[...conditionalMedia,...mediaLayout],description:'Immagine o video del contenuto, separato dall’immagine di fondo. In Default puoi scegliere la disposizione rispetto al testo.'},
   {label:'Fondo',fields:visual},
   {label:'Etichetta',fields:contextualBadge,condition:labelCondition,description:'Etichetta del contenitore. Nel carosello Wide ogni slide ha la propria etichetta in Elementi → Aspetto → Etichetta.'},
   {label:'Elementi',description:block.slug==='characterFriends'?'Elenco automatico dal personaggio associato alla pagina. La selezione si modifica in Personaggi → quel personaggio → Relazioni e fonti; se vuota, compaiono tutti gli altri. Nome, immagini desktop/mobile e identità hover provengono dalle rispettive schede Personaggio. Qui sotto puoi personalizzare una singola card solo per questo blocco: non aggiunge né rimuove personaggi dall’elenco.':undefined,fields:[...source,{name:'automaticCardsControl',type:'ui',admin:{components:{Field:{path:'/components/admin/AutomaticCards#AutomaticCards',clientProps:{blockSlug:block.slug}}}}},...remainder.map(f=>block.slug==='characterFriends'&&name(f)==='cardOverrides'?{...f,label:'Altre personalizzazioni salvate',admin:{...f.admin,description:'Le card automatiche si aprono direttamente nell’elenco sopra. Qui restano accessibili le personalizzazioni salvate. Le impostazioni locali prevalgono sull’identità hover del personaggio e sullo Stile card del blocco. Senza override, continua a ereditare.'}} as Field:f)]},
   ...(watchRails.length?[{label:'Fascioni',fields:watchRails}]:[]),
   {label:'Stile comune delle card',fields:elementDefaults,description:'Funzione, presentazione e stile comuni alle card di questo blocco. Ogni elemento può ereditare o personalizzare queste impostazioni.'},
   {label:'Gestione',fields:management},
  ])],true);
 }

 return repeaters([tabs([
  ...(linked?[{label:'Sorgente e override',fields:source}]:[]),
  {label:linked?'Testi locali e stile':'Testi e stile',fields:textEditing},
  {label:'Elementi',fields:remainder},
  ...(!linked?[{label:'Sorgente e selezione',fields:source}]:[]),
  {label:'Media',fields:conditionalMedia},
  {label:'Etichetta',fields:badge},
  {label:'Aspetto',fields:[...presentation,...visual,...elementDefaults]},
  {label:'CTA',fields:cta},
  {label:'Gestione modulo',fields:management},
 ])]);
}
function sidebar(fields:Field[]){return fields.map(f=>({...f,admin:{...f.admin,position:'sidebar'}} as Field));}
export function organizeCollections(collections:CollectionConfig[]):CollectionConfig[]{return collections.map(collection=>{
 const p=picker(collection.fields);let result:Field[];
 if(collection.slug==='pages'){
  const top=p.take(['title']);const side=sidebar(p.take(['path','group']));
  const general=p.take(['purpose','parent','character','galleryContext']);const modules=p.take(['blocks']);const visual=p.take(['heroBackground','customHeroBackground','heroBackgroundColor','heroBackgroundMode','customHeroBackgroundEnd','heroBackgroundEndColor','pageBackgroundColor','pageBackgroundImage','cloudBackground','footerOverride']).map(f=>['pageBackgroundColor','pageBackgroundImage'].includes(name(f)||'')?{...f,admin:{...f.admin,condition:(_,s)=>!s.heroBackground}} as Field:f);const links=p.take(['headlessProductSlug','sourceReference','redirectTo','hideFromSitemap']);
  result=[...top,tabs([{label:'Generale',fields:general,description:'Informazioni sulla pagina e associazione al personaggio.'},{label:'Moduli',fields:modules,description:'Apri un modulo per modificarlo; trascina le righe per riordinarle.'},{label:'Aspetto',fields:visual,description:'Fondo della pagina. I controlli dei singoli moduli sono nella loro sezione Aspetto.'},{label:'Collegamenti e fonti',fields:[...sectionTabs('Sorgenti e riferimenti',links),...p.rest()]}]),...side];
 }else if(collection.slug==='contents'){
  const top=p.take(['title']);const side=sidebar(p.take(['slug','recordType','watchKind']).map(f=>name(f)==='watchKind'?{...f,admin:{...f.admin,condition:(_,s)=>s.recordType==='episode'}} as Field:f));
  const story=p.take(['description','emotionalCore','editorialSection']);const media=p.take(['cover','coverMobile','cardAudio','playbackSource','playbackURL','playbackFile']);const associations=p.take(['container','parent','themeTerms','keywordTerms','characters']);const badge=p.take(['highlightBadge','highlightBadgeBackgroundColor','highlightBadgeTextColor']);const highlights=p.take(['highlight','highlightOrder']).map(f=>name(f)==='highlight'?f:{...f,admin:{...f.admin,condition:(_data:unknown,sibling:Record<string,unknown>)=>Boolean(sibling.highlight)}} as Field);const links=p.take(['url','showInExplore']);
  result=[...top,tabs([{label:'Scheda',fields:story},{label:'Immagini e momenti',fields:p.take(['momentPhotos','moments'])},{label:'Media',fields:media.map(f=>name(f)?.startsWith('playback')?{...f,admin:{...f.admin,condition:(d:any,s:any,c:any)=>s.recordType==='episode'&&(!f.admin?.condition||f.admin.condition(d,s,c))}} as Field:f)},{label:'Tematiche e associazioni',fields:[...associations,...sectionTabs('In primo piano',highlights)]},{label:'Etichetta',fields:badge},{label:'Episodi',fields:p.take(['episodes']),condition:(_,s)=>s.recordType==='production'},{label:'Collegamenti',fields:links}]),...side,...p.rest()];
 }else if(collection.slug==='characters'){
  const top=p.take(['name']);const side=sidebar(p.take(['slug']));const story=p.take(['editorialSection','identity','tagline','description','passions','traits','music']);const media=p.take(['portrait','portraitMobile','voiceClip','voiceCaption','cardAudio','musicAudio']);const identity=p.take(['cardIdentity']);const relations=p.take(['friends']);const sources=p.take(['sourceReference']);
  result=[...top,tabs([{label:'Scheda',fields:story},{label:'Media',fields:[...media]},{label:'Immagini e momenti',fields:p.take(['momentPhotos','moments'])},{label:'Identità della card',fields:identity},{label:'Relazioni e fonti',fields:[...relations,...sectionTabs('Fonte canonica',sources)]}]),...side,...p.rest()];
 }else return {...collection,fields:repeaters(collection.fields)};
 return {...collection,fields:repeaters(result)};
 });}
export function organizeGlobals(globals:GlobalConfig[]):GlobalConfig[]{return globals.map(global=>{
 const p=picker(global.fields);let result:Field[];
 if(global.slug==='watch'){
  const filters=p.take(['searchIcon','filters']);const rails=p.take(['rails']);const remote=p.take(['fullZap','zapLogo','remoteButtons']);const preview=p.take(['showSamples']);const appearance=p.take(['cardAppearance','cardOverrides','presentation','wideOverlayOpacity']).map(f=>name(f)==='cardOverrides'?{...f,admin:{...f.admin,components:{...f.admin?.components,Field:{path:'/components/admin/StoredCardOverrides#StoredCardOverrides',clientProps:{blockSlug:'watch'}}}}} as Field:f);
  result=[tabs([{label:'Filtri',fields:filters},{label:'Fascioni editoriali',fields:rails},{label:'ZAP!',fields:remote},{label:'Aspetto card',fields:[...appearance,{name:'automaticCardsControl',type:'ui',admin:{components:{Field:{path:'/components/admin/AutomaticCards#AutomaticCards',clientProps:{blockSlug:'watch'}}}}}]},{label:'Anteprima',fields:preview}]),...p.rest()];
 }else if(global.slug==='navigation'){
  const primary=p.take(['brand','items','studioLabel','studioHref']);const studio=p.take(['studioNavTitle','studioItems']);const footer=p.take(['footerDecoration','footerTitle','footerItems','footerNote']);
  result=[tabs([{label:'Menu principale',fields:primary},{label:'Menu Studio',fields:studio},{label:'Footer',fields:footer}]),...p.rest()];
 }else result=global.fields;
 return {...global,fields:repeaters(result,global.slug==='watch')};
 });}
