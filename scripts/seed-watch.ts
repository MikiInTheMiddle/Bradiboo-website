import { getPayload } from 'payload';
import config from '../payload.config';
const payload=await getPayload({config});
const settings=await payload.findGlobal({slug:'watch',depth:0});
if(!settings.rails?.length)await payload.updateGlobal({slug:'watch',data:{showSamples:true,rails:[
 {title:'Piccole grandi scoperte',description:'Natura, domande e nuovi punti di vista.',mode:'automatic',keywords:['natura','scoperte'],limit:6},
 {title:'Quando ci vuole un po’ di pazienza',description:'Aspettare, riprovare, trovare un altro modo.',mode:'automatic',themes:['pazienza','determinazione'],limit:6},
 {title:'Insieme, ognuno a modo suo',description:'Amicizia, appartenenza e il coraggio di essere sé stessi.',mode:'automatic',themes:['amicizia','appartenenza','autenticita'],limit:6},
]}});
await payload.destroy();
