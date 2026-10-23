import {getPayload} from 'payload';
import config from '../payload.config';
const payload=await getPayload({config});
const settings=await payload.findGlobal({slug:'watch',depth:0});
await payload.updateGlobal({slug:'watch',data:{filters:(settings.filters||[]).map(f=>({...f,...(f.key==='themes'?{placement:'primary' as const,label:'Tematiche'}:f.key==='keywords'?{placement:'hidden' as const}:{})}))}});
await payload.destroy();
