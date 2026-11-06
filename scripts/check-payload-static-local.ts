/** Integration test against the full built app on 127.0.0.1:3009.
 * Use only a disposable DB copy; schema initialization/build are separate.
 * Never run against the live Turso database or create an online editor.
 */
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
if(process.env.DATABASE_URL!=='file:/private/tmp/bradiboo-static-check.db')throw Error('Disposable test DB required');
const {getPayload}=await import('payload');const {default:config}=await import('../payload.config');
const payload=await getPayload({config});
const base='http://127.0.0.1:3009';
const email=`static-test-${Date.now()}@example.invalid`,password=randomBytes(32).toString('hex');
try{
 await payload.create({collection:'users',data:{email,password,name:'Isolated SSG test'}});
 async function request(path:string,method='GET',data?:unknown,token?:string){
  const response=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`JWT ${token}`}:{})},body:data?JSON.stringify(data):undefined});
  return {status:response.status,body:await response.text(),headers:response.headers};
 }
 const login=await request('/api/users/login','POST',{email,password});assert.equal(login.status,200);
 const token=JSON.parse(login.body).token;
 const suffix=String(Date.now()),path=`/cache-verifica-${suffix}`;
 async function untilPublished(value:string){
  for(let attempt=0;attempt<50;attempt++){
   const response=await request(path);if(response.status===200&&response.body.includes(value))return response;
   await new Promise(resolve=>setTimeout(resolve,100));
  }
  throw Error('Published change did not appear');
 }
 const created=await request('/api/pages','POST',{title:'Local SSG test',path,_status:'published',blocks:[{blockType:'intro',label:'Local test',title:'Public first revision',showText:true}]},token);
 assert.equal(created.status,201,created.body.slice(0,200));
 const doc=JSON.parse(created.body).doc;
 await untilPublished('Public first revision');
 assert.equal((await request(path)).headers.get('x-nextjs-cache'),'HIT');
 const blocks=doc.blocks;blocks[0].title='Public second revision';
 assert.equal((await request(`/api/pages/${doc.id}`,'PATCH',{blocks,_status:'published'},token)).status,200);
 await untilPublished('Public second revision');
 blocks[0].title='PRIVATE DRAFT MUST NEVER LEAK';
 assert.equal((await request(`/api/pages/${doc.id}?draft=true`,'PATCH',{blocks,_status:'draft'},token)).status,200);
 const publicPage=await request(path);
 assert.equal(publicPage.status,200);assert.ok(publicPage.body.includes('Public second revision'));assert.ok(!publicPage.body.includes('PRIVATE DRAFT MUST NEVER LEAK'));
 assert.equal((await request(`/api/pages/${doc.id}?draft=false`,'PATCH',{_status:'draft'},token)).status,200);
 // Next/CDN tag purges propagate asynchronously after the write response.
 // Never allow the private draft, and bound the withdrawal propagation time.
 async function untilWithdrawn(url:string){
  for(let attempt=0;attempt<50;attempt++){
   const response=await request(url);assert.ok(!response.body.includes('PRIVATE DRAFT MUST NEVER LEAK'));
   if(response.status===404)return response;
   await new Promise(resolve=>setTimeout(resolve,100));
  }
  throw Error('Withdrawal did not propagate within 5 seconds');
 }
 const unpublished=await untilWithdrawn(path);assert.ok(!unpublished.body.includes('Public second revision'));
 const container=await request('/api/production-containers','POST',{title:'Local container',slug:`local-${suffix}`,url:`/guarda/local-${suffix}`,_status:'published'},token);
 assert.equal(container.status,201,container.body.slice(0,200));const containerID=JSON.parse(container.body).doc.id;
 const production=await request('/api/contents','POST',{title:'Local production',slug:`production-${suffix}`,recordType:'production',kind:'format',container:containerID,_status:'published'},token);
 assert.equal(production.status,201,production.body.slice(0,200));const child=JSON.parse(production.body).doc.url;
 assert.equal((await request(child)).status,200);assert.equal((await request(child)).headers.get('x-nextjs-cache'),'HIT');
 assert.equal((await request(`/api/production-containers/${containerID}`,'PATCH',{_status:'draft'},token)).status,200);
 await untilWithdrawn(child);
 console.log('PASS: real Payload publish, static HIT, edit, private draft, unpublish after draft, and bounded withdrawal of a static child branch.');
}finally{await payload.destroy();}
