import {audioUpload} from './card-audio';
import {profileFields} from './profile-fields';
import {galleryPhotosField,momentsField,galleryFields} from './gallery-fields';
import {characterCardIdentityField} from './character-card-identity';
import type { Block, Field } from 'payload';
import { commonFields } from './editorial-fields';
export const characterFields: Field[] = [
 characterCardIdentityField,
 {name:'editorialSection',label:'Sezione editoriale',type:'text',admin:{description:'Vuoto: Braditriboo. Segue il personaggio nelle card collegate.'}},
 {name:'identity',label:'Chi sono',type:'text'},
 {name:'tagline',label:'In una frase',type:'text'},
 {name:'passions',label:'Cosa mi piace',type:'array',fields:[{name:'text',label:'Voce',type:'text',required:true}]},
 {name:'traits',label:'Come sono',type:'array',fields:[{name:'text',label:'Voce',type:'text',required:true}]},
 {name:'music',label:'Universo musicale',type:'text'},
 {name:'voiceClip',label:'Audio del personaggio (facoltativo)',type:'upload',relationTo:'media',filterOptions:{mimeType:{contains:'audio/'}}},
 {name:'voiceCaption',label:'Testo / trascrizione audio',type:'textarea'},
 audioUpload(),audioUpload('musicAudio','Traccia musicale (Universo musicale)'),
 galleryPhotosField(),momentsField(),
 {name:'friends',label:'Personaggi mostrati nel blocco “Amici e altri personaggi”',type:'relationship',relationTo:'characters',hasMany:true,admin:{description:'Seleziona i personaggi da mostrare nella pagina di questo personaggio. Vuoto: compaiono tutti gli altri. Ogni card eredita immagini e identità hover dalla propria scheda; gli override della pagina restano locali.'}},
 {name:'sourceReference',label:'Fonte canonica',type:'text',admin:{readOnly:true}},
];
const base:Field[]=[{name:'label',label:'Nome editoriale',type:'text',required:true},{name:'title',label:'Titolo sezione',type:'text',required:true},{name:'note',label:'Introduzione facoltativa',type:'textarea'},{name:'draft',label:'Modulo in bozza',type:'checkbox'},...commonFields(),{name:'media',label:'Media del blocco',type:'upload',relationTo:'media'}];
export const characterBlocks:Block[]=[
 {slug:'characterProfile',labels:{singular:'Scheda personaggio',plural:'Schede personaggio'},fields:[...base.map(f=>'name'in f&&f.name==='note'?{...f,label:'Descrizione locale',admin:{...f.admin,condition:(_,s)=>Boolean(s.overrideNote)}} as Field:f),...profileFields()]},
 {slug:'characterMoments',labels:{singular:'Momenti del personaggio',plural:'Gallerie personaggio'},fields:[...base,...galleryFields()]},
 {slug:'characterFriends',labels:{singular:'Amici e altri personaggi',plural:'Relazioni personaggio'},fields:base},
];
