import fs from 'node:fs/promises';
import {publicRead} from '../../../../../../lib/public-cache';
export const dynamic='force-dynamic';
const read=publicRead('isolated-cache-test',async()=>{
 const state=JSON.parse(await fs.readFile('/private/tmp/bradiboo-cache-upstream.json','utf8'));
 await fs.appendFile('/private/tmp/bradiboo-cache-calls.txt','read\n');
 if(state.fail)throw new Error('Simulated upstream outage');
 return {value:state.value};
},2);
export async function GET(){try{return Response.json(await read());}catch{return Response.json({unavailable:true},{status:503});}}
