import type {Field} from 'payload';
export type CTAAlignment='inherit'|'left'|'center'|null;
export const ctaAlignmentField=():Field=>({name:'ctaAlign',label:'Allineamento CTA',type:'select',enumName:'cta_align',options:[{label:'Eredita / predefinito',value:'inherit'},{label:'A sinistra',value:'left'},{label:'Al centro',value:'center'}],admin:{description:'La CTA resta sotto al contenuto. Vuoto o Eredita mantiene l’impostazione comune; di base è a sinistra.'}});
export function resolveCTAAlignment(...values:(CTAAlignment|undefined)[]){return values.reduce<'left'|'center'>((result,value)=>value==='left'||value==='center'?value:result,'left');}
