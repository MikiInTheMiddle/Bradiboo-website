import {getPayload} from 'payload';import config from '../payload.config';
const p=await getPayload({config});try{for(const draft of [false,true]){const r=await p.find({collection:'production-containers',draft,depth:0,limit:100});console.log({draft,total:r.totalDocs,ids:r.docs.map(x=>x.id)});}}finally{await p.destroy()}
