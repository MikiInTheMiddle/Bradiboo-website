# Propagazione controlli e UI condivisa — 20 ottobre 2026

Le impostazioni editoriali e gli override delle singole pagine sono conservati. Le regole visive prima limitate a Home sono caricate nel layout frontend condiviso (`site-ui`): tipografia, gutter responsive, card, CTA, etichette, menu con logo esplicito e footer. La classe e il comportamento immersivo restano esclusivi di Home. Tutte le Hero e i blocchi analoghi conservano gli stessi campi e lo stesso modello Default/Wide, sorgenti/override, trasparenza, blur, velo, focus e immagini responsive.

Guarda e ZAP ora usano i campi condivisi dei blocchi per fondo, testi/stile, etichetta, media/YouTube/CTA, visibilità testo, griglia/carosello e stile delle card. Wide dei moduli interattivi applica il fondo pieno al contenitore e mantiene player, ricerca, filtri e pulsanti: non converte queste funzioni in slide. Le card del catalogo possono comunque essere Default/Wide e personalizzate singolarmente. L’editor delle card è risolto anche nelle configurazioni globali e nei fascioni editoriali, con sorgenti originali conservate. La gestione avanzata dei filtri e dei pulsanti resta nel globale Guarda.

Il gradiente Hero usa il colore finale del Media principale anche su mobile; il colore iniziale continua a raccordarsi al bordo dell’immagine effettivamente mostrata. Se era definito solo un finale mobile, lo script di propagazione lo trasferisce al Media principale soltanto quando manca e non ci sono abbinamenti discordanti; nessun valore manuale esistente è sovrascritto.

I blocchi Wide singoli mantengono anche scheda informativa, voce/audio e media, evitando che la presentazione Wide nasconda i dati delle schede personaggio. Il footer riserva la stessa altezza della fascia anche nelle pagine Guarda/ZAP.

## Media
Audit di FK su tutti i componenti, globali e versioni, più riferimenti letterali nel codice e nei dati. Unico file senza riferimenti: ID 26 Highlights_1_mobile.png, rimosso tramite Payload dopo backup del record, file e intero DB. Archivio: `work/backups/unused-media-2026-10-20T14-31-00-662Z`.
Cinque file conservati perché usati nelle versioni storiche: ID 11, 27, 35, 37, 38. I riferimenti nei moduli in bozza, nei campi nascosti e nei fallback sono preservati. Audit finale: 42 Media, nessun candidato senza riferimenti, nessuna FK pendente.

## Verifiche
Migrazione additiva di 358 colonne/tabelle/indici, con backup e preservazione dei record/FK. Schema client reale Payload verificato per card dei blocchi e globali Guarda; 4870 percorsi senza definizioni duplicate. Test SSR: controlli condivisi in tutti i blocchi analoghi, Wide interattivo conserva filtri/player/ZAP, override locali e valori zero; scheda personaggio Wide mantiene dati e audio. 32 pagine pubblicate verificate via HTTP (200 o redirect previsto), shell condivisa e Home immersiva solo sulla Home. Nessun collaudo visivo interattivo browser dichiarato.
