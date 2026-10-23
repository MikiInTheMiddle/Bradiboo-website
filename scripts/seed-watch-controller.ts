import {getPayload} from 'payload';
import config from '../payload.config';
import {defaultWatchFilters} from '../lib/watch-model';
const payload=await getPayload({config});
const settings=await payload.findGlobal({slug:'watch',depth:0});
await payload.updateGlobal({slug:'watch',data:{
 ...(!settings.filters?.length?{filters:defaultWatchFilters}:{}),
 ...(!settings.remoteButtons?.length?{remoteButtons:[{label:'Muoviamoci!',icon:'bike' as const,keywords:['movimento' as const]},{label:'Spazio alla creatività',icon:'palette' as const,keywords:['arte' as const]},{label:'Un po’ di musica',icon:'music' as const,keywords:['musica' as const]},{label:'Esploriamo la natura',icon:'leaf' as const,keywords:['natura' as const,'scoperte' as const]}]}:{})
}});
await payload.destroy();
