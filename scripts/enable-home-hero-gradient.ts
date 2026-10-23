import {getPayload} from 'payload';
import config from '../payload.config';
import {gradientColors} from '../lib/background';
const payload=await getPayload({config});
try{
 const page=(await payload.find({collection:'pages',where:{path:{equals:'/'}},depth:0,limit:1})).docs[0];
 if(!page)throw new Error('Home non trovata');
 const colors=gradientColors(page.pageBackgroundColor);
 if(!colors)throw new Error('Nessun gradiente manuale da recuperare');
 await payload.update({collection:'pages',id:page.id,data:{heroBackgroundMode:'gradient',heroBackgroundEndColor:colors[1]}});
 console.log('Recuperato colore finale già impostato:',colors[1]);
}finally{await payload.destroy();}
