# Bradiboo — Decisions and Status

Ultimo aggiornamento: 16 ottobre 2026

## Ripresa dalla cronologia e verifica del repository — 16 ottobre 2026

Fonte: cronologia della chat “Bradiboo — Struttura, moduli e Content Studio” (`01a0b118-ec96-7fc2-92f2-b1f9e021bb6b`), confrontata con documentazione, route, renderer e configurazione locali.

- Il primo prototipo visuale con BradiTV, Dove sei? e Mimetizoo è stato superato dalla revisione basata sul deck. Il riferimento operativo è il wireframe attuale con Guarda, non quelle vecchie route.
- Dopo il check dei blocchi, l’utente ha confermato: “si, concordo. Partiamo con questi blocchi, poi vediamo una volta su, se ne servano altri.” Il catalogo iniziale è quindi accettato per partire; campi, query e varianti devono ancora essere definiti. Non occorre riaprire una validazione generale del catalogo.
- Il catalogo proposto comprende Hero, Editorial Intro, Media Player / Featured Media, Split Content, Card Grid, Card Rail, Dynamic Collection, CTA, Structured Information e Contact Form. Related Content è candidato a variante compatta di grid/rail; l’accorpamento non è ancora implementato.
- R2 per i file editoriali, D1 per metadati e relazioni e Workers per l’applicazione sono stati proposti nell’ultima parte della chat. Sono una direzione tecnica discussa, non servizi già configurati né una scelta definitiva esplicitamente approvata. Media Braditime resterebbero esterni; asset strutturali nel repository.
- Account, dominio e infrastruttura controllati da Bradiboo sono la raccomandazione emersa nella chat. Titolarità effettiva e attivazione dei servizi non sono state verificate. Le stime economiche della vecchia chat non sono state rivalidate in questa ricostruzione.

### Stato verificato nei file

- Branch locale `main`, commit `f72ce94`, working tree pulito prima di questo aggiornamento. Il riferimento locale `origin/main` coincide; nessuna verifica remota nuova effettuata.
- Frontend React con Vinext/Vite e predisposizione Cloudflare/Sites; dati statici in `lib/wireframe.ts`, renderer comune in `components/wireframe.tsx`.
- Homepage, route catch-all e mappa del sito sono implementate. Le pagine personaggio e format sono generate da elenchi statici.
- Non risultano implementati admin/Content Studio, autenticazione, persistenza, upload, query relazionali, player reale o invio del form contatti.
- `.openai/hosting.json` contiene `d1: null` e `r2: null`: la predisposizione nei file di build non equivale a servizi collegati.
- Lo stato draft è un’annotazione del prototipo: pagine e moduli restano visibili e navigabili nel wireframe. Il filtro pubblico delle bozze dovrà essere implementato prima della pubblicazione del sito reale.
- La vetrina Shop è un segnaposto per la destinazione ecommerce; provider, URL e integrazione definitivi restano da confermare.
- Il deck è citato nei documenti ma non è incluso nel repository; questa ripresa ricostruisce le decisioni sul deck dalla chat, senza una nuova analisi del PDF.

### Prossimo passaggio operativo

Tradurre il catalogo accettato in un inventario essenziale pagina → modulo → campi → relazioni → modalità manuale/dinamica/ibrida → controlli visuali → componente. Partire dalla homepage e dalla pagina personaggio, poi realizzare una prima catena completa: contenuto associato a personaggio → Content Studio → raccolta automatica → pagina personaggio. Braditime e Il mondo restano differiti. Evitare nuove chat o documenti paralleli non necessari.

Le sezioni sottostanti conservano il checkpoint del 15 ottobre: “da validare” si riferisce ora ai dettagli dei moduli e dei template, non alla necessità di approvare nuovamente il catalogo iniziale.

## Decisioni confermate

- Il deck Bradiboo è la nuova source of truth strategica.
- La centralità del nuovo sito è l’IP, non la presentazione aziendale.
- Serie, miniserie e format sono categorie distinte nell’area Guarda.
- L’attuale contenuto aziendale confluisce in un secondo livello provvisoriamente chiamato Bradiboo Studio.
- Lo shop resta nell’ecosistema.
- Prima del visual design viene validata una struttura wireframe in bianco e nero.
- Il wireframe espone i tipi di blocco e i template soltanto come annotazioni tecniche.
- Il Content Studio utilizza blocchi definiti e ripetibili.
- Pagine e contenuti sono separati.
- I contenuti sono associabili a entità personaggio controllate.
- Le pagine personaggio richiamano automaticamente i contenuti associati.
- Menu, alberatura e collocazione delle pagine devono essere gestibili dal Content Studio.
- Struttura, moduli, Content Studio e integrazione frontend vengono progettati nello stesso flusso operativo.
- Si mantiene una sola chat attiva fino alla validazione dei moduli.
- Dopo la struttura si identificano i moduli; per ogni modulo si definiscono dati, relazioni, gestione e variabili visuali.
- La pagina Il mondo e il relativo modulo homepage restano in bozza non pubblicata per mancanza di materiale sufficiente.
- Gioca viene ricondotto a Braditime, ambiente esterno basato su WordPress headless.
- Le attività Braditime potranno apparire come card contestuali nel sito e apriranno l’applicazione esterna.
- I moduli Braditime e la relativa integrazione API restano in bozza.
- “Oltre lo schermo” viene rimosso dal menu e assorbito nella landing Partnership di Bradiboo Studio.
- Il menu pubblico iniziale è ridotto a Braditriboo, Guarda, Shop e Studio; Home resta accessibile dal logo.

## Realizzato

- Prima sitemap navigabile.
- Wireframe locale in bianco e nero.
- Pagine principali, personaggi, categorie media, property, episodio, attività e area Studio.
- Mappa del sito navigabile.
- Prima tassonomia dei blocchi.
- Prima definizione concettuale del Content Studio.
- Stati `draft / non pubblicato` introdotti nel wireframe per pagine e moduli.
- Struttura Braditime rappresentata come futura integrazione WordPress headless.
- Contenuti “Oltre lo schermo” trasferiti nella pagina Partnership.

## In corso

- Validazione della sitemap.
- Validazione dei template.
- Individuazione dei blocchi mancanti o ridondanti.
- Inventario dei moduli pagina per pagina.
- Definizione contestuale di contenuti, relazioni, variabili visuali e componente frontend.

## Prossimi checkpoint

1. Approvare o correggere la navigazione principale.
2. Validare le pagine contenute nella sitemap.
3. Validare i template pagina.
4. Costruire e validare l’inventario dei moduli.
5. Definire per ogni modulo campi, relazioni, query e variabili visuali.
6. Tradurre i moduli nel Content Studio e collegarli al frontend.
7. Passare al visual design e ai Figma specifici.

## Questioni aperte

- Nome definitivo della sezione Studio.
- Presenza di aree o pagine mancanti nella sitemap.
- Regole esatte dei fascioni automatici.
- Gestione multilingua.
- Shop interno o esterno.
- Autenticazione e ruoli del Content Studio.
- Strategia di migrazione dei contenuti esistenti.
- Contratto delle API WordPress Braditime e tassonomie condivise.
- Nome definitivo della landing Partnership e relativo tono pubblico/professionale.

## Regola di aggiornamento

Dopo ogni sessione significativa aggiornare:

- decisioni prese;
- questioni rimaste aperte;
- modifiche effettuate;
- prossimo passaggio concordato.

## Migrazione Payload — 16 ottobre 2026

Autorizzata e implementata la prima configurazione Next.js + Payload. Aree: Utenti, Pagine, Contenuti, Personaggi, Media, Menu. Wireframe alimentato dal database locale SQLite; importazione iniziale delle pagine, sei personaggi e episodio dimostrativo. Raccolta automatica pubblicata per personaggio. Admin italiano con creazione del primo utente a cura dell’utente. Database e upload locali esclusi dal repository. Nessun hosting o account esterno attivato.

Questo checkpoint supera lo stato “Content Studio non implementato” riportato nella ricostruzione precedente. Dettagli, avvio e limiti in `CONTENT_STUDIO.md`. Restano da sviluppare rendering media e moduli funzionali, campi avanzati, gestione completa navigazione/alberatura e configurazione di produzione.

### Correzione admin dopo il primo accesso

Generata la import map Payload mancante per CollectionCards. Aggiunta generazione automatica prima di dev e build, per evitare ricadute. Dashboard autenticata verificata con tutte le aree editoriali visibili; controllo TypeScript superato.

## Organizzazione delle chat — 16 ottobre 2026

Due chat operative: “Bradiboo — Struttura, funzionalità e UX” per architettura, funzionalità, UX, Payload e integrazione frontend; “Bradiboo — Visual e UI” per visual design, componenti, responsive e motion. La precedente chat “Bradiboo — Struttura, moduli e Content Studio” viene archiviata come cronologia recuperabile, già ricostruita nei documenti. Le decisioni UI che richiedono campi o varianti editoriali devono essere registrate in PRODUCT_ARCHITECTURE.md e tradotte in controlli Payload e relativo rendering; usare palette e varianti controllate. Entrambe le chat leggono PRODUCT_ARCHITECTURE.md, DECISIONS_AND_STATUS.md e CONTENT_STUDIO.md (SITE_ARCHITECTURE.md è superato). Nome progetto richiesto: “bradiboo website”.

## Braditime e repository legacy — 16 ottobre 2026

Creato repository legacy privato separato, esclusi file ambiente e credenziali del README. Implementato modulo Braditime in Payload e adapter REST server; convertiti 15 richiami esistenti mantenendoli in bozza. Home alimentata dalle tre attività reali. Filtro personaggio disponibile ma associazioni WordPress attualmente vuote. Dettagli e limiti in LEGACY_HEADLESS_REFERENCE.md. Requisiti Home approvati nelle conversazioni precedenti restano nel checkpoint di quel documento; non considerare questa integrazione come implementazione degli altri moduli.

## Home e controlli editoriali — 16 ottobre 2026

Implementati i requisiti approvati per la Home: sfondo pagina, Hero, featured manuale/automatico, raccolte, media file/YouTube e badge comuni, Split aziendale; Braditime manuale, checkbox multiple e override locali. Il checkpoint precedente “requisiti ancora da implementare” è superato per questi moduli. Account e dati preservati; migrazione Home tramite scripts/upgrade-home.ts. Backup prima dell'intervento in /tmp/bradiboo-before-home-controls.db e /tmp/bradiboo-pre-schema-sync.db. La sincronizzazione automatica SQLite ha richiesto allineamento dello schema su copia di riferimento, con conteggi e integrità relazionale verificati; nessun dato/account cancellato. Backup temporanei: non sostituiscono una strategia durevole.

Verifiche: TypeScript, build Next.js, pagina QA salvata e letta dal frontend per override/ordine/YouTube/toggle/opacità/split, catalogo attività protetto (401 senza login), nove controlli di normalizzazione e sicurezza URL. Pagina QA rimossa dopo la verifica. Preview su localhost. Le associazioni personaggio WordPress risultano ancora da compilare; Il mondo e Braditime restano in bozza.

## Template personaggio e bible — 16 ottobre 2026

Acquisita e confrontata la Pitch Bible (37 pagine), con schede personaggi pp. 7–12 e musica p. 23. Importate le sei caratterizzazioni in Payload, preservando account e altri contenuti. Scheda strutturata, gallery Momenti in bozza, audio opzionale e selezione relazioni disponibili. Template personaggio aggiornato per tutti e sei senza duplicare biografie nei moduli. Immagini dei momenti, clip audio, relazioni editoriali e validazione delle associazioni contenuto/personaggio restano da completare. La fonte e il contratto sono documentati in PRODUCT_ARCHITECTURE.md; non serve una nuova chat.

Verifica template personaggio: build Next.js superata. L'auto-review ha respinto uno script custom che ricostruiva tabelle; non eseguito. Confronto in sola lettura con database di riferimento: schema già completo, integrità SQLite ok e nessuna violazione FK. Evitata ogni ricostruzione impostando PAYLOAD_SCHEMA_PUSH=false nel solo ambiente locale per disabilitare il tentativo ridondante di Drizzle. Per le prossime variazioni usare migrazioni revisionate.

## Cluster media e prodotti — 16 ottobre 2026

Recepita la richiesta titolo + breve introduzione + immagine per Serie, Miniserie e Format, distinti dalle presentazioni dei singoli prodotti. Importati testi e nove immagini di anteprima dal deck 2026, senza estensioni di schema. Popolate introduzioni in Guarda e indici; card e dettagli con titoli editoriali effettivi. Conservati percorsi e account. Verificati TypeScript, risposte 200 di Guarda/Serie/dettaglio Arte e rendering di testo/immagini. Immagini provvisorie derivate dal PDF, sostituibili in Media. Nessun deploy esterno.

## Intestazioni blocchi Payload — 16 ottobre 2026

Le intestazioni dei moduli ora mostrano il titolo interno in tempo reale, con fallback al nome editoriale e poi “Nuovo blocco”. Conservati numero e tipo del modulo. Componente admin condiviso BlockTitle registrato su tutti i tipi di blocco; nessuna duplicazione del titolo nel database e nessuna variazione di schema. Import map e TypeScript verificati.

## 16 ottobre 2026 — Guarda e Telecomando: sample UX
- `/guarda` ora ha un player, catalogo filtrabile per più personaggi, temi/emozioni, keywords, tipo, ricerca e disponibilità video; conserva i fascioni introduttivi Serie, Miniserie e Format della pagina Payload.
- Filtri: OR fra valori dello stesso gruppo, AND fra gruppi. I fascioni editoriali restano indipendenti dai filtri del catalogo.
- `/guarda/telecomando` è un percorso distinto: icone con nomi accessibili, preferenze combinate e scelta casuale. Evita il video precedente quando esistono alternative; zero risultati produce un messaggio, senza ignorare le preferenze.
- Payload → Contenuti: tipo guardabile, sorgente YouTube/file, personaggi, nucleo emotivo descrittivo, temi e keywords. Il nucleo emotivo libero resta distinto dai temi normalizzati usati dai filtri.
- Payload → Guarda — catalogo e fascioni: righe editoriali con titolo, descrizione, filtri automatici oppure selezione manuale ordinata, limite di elementi, visibilità delle schede sample.
- Quattro URL forniti dall'utente sono stati collegati come contenuti pubblicati autonomi, con titoli/copertine da YouTube oEmbed: Muovi le piume (kxC0C3DmwVs), Che giornata (SS2Xsp6ykxo), Oltre la tela (bEz8muyZIlQ), BradiLo-Fi (RBTSexoOZKU). Keywords iniziali conservative: movimento, arte e musica; personaggi Petronilla/Nancy per i format identificati nel deck. Le altre associazioni richiedono revisione editoriale.
- Le storie della bible sono schede demo, prive di video e visibili soltanto in WIREFRAME_PREVIEW. Il telecomando seleziona inizialmente soltanto video disponibili; in anteprima si possono includere le demo esplicitamente.
- Nessun costo di servizio aggiuntivo per il sample: player embed YouTube e catalogo locale Payload. Non è un servizio streaming proprietario.
- Schema SQLite aggiornato con sole aggiunte, backup e controllo di conservazione dei record; auto-push resta disabilitato. Script idempotenti: apply-watch-schema.py, seed-watch.ts, seed-watch-videos.ts.
- Validazione sample: TypeScript e build Next superati; check-watch.ts verifica OR/AND, ricerca, disponibilità, assenza di ripetizione e catalogo vuoto. HTTP 200 su Home, admin, Guarda, Telecomando; quattro ID video e tre fascioni cluster presenti nel rendering server. Riproduzione effettiva e interazioni browser da confermare in revisione utente.

## Telecomando e filtri — revisione 16 ottobre
- Telecomando trasformato in gioco a pulsanti indipendenti, configurabili in Payload (upload illustrazione, nome, icona provvisoria, keyword multiple). Click → estrazione immediata OR sulle keyword, solo video disponibili; nessun raggruppamento per faccette. Sorprendimi pesca dall'intero catalogo disponibile.
- Filtri Guarda trasformati in dropdown: configurazione ordinabile per categoria, titolo personalizzato e posizione primaria/secondaria/nascosta nello stesso global Payload. Default Personaggi primario, temi/argomenti/tipo/disponibilità secondari.
- Migrazione locale esclusivamente additiva (3 tabelle + indici), backup e verifica record/FK. Seed iniziale idempotente preserva configurazioni esistenti.
- Verifica revisione completata: build Next/TypeScript, test filtri e remoteMatches superati. HTTP 200 su Guarda, Telecomando e admin global; confermata struttura dropdown di Guarda e assenza delle vecchie faccette nel telecomando. Interazioni visuali/player da rivedere nel browser con l'utente.

## Nome e direzione UI del telecomando
- Nome approvato: **ZAP!**. Aggiornati titolo pubblico, link da Guarda e nome del campo pulsanti in Payload. Percorso esistente `/guarda/telecomando` conservato.
- Direzione UI da applicare nel passaggio visual: console compatta a fianco del viewer, icone poco più grandi di emoji; su mobile disposizione sotto al player da valutare.

## Completamento episodi delle produzioni — 16 ottobre
- Aggiunto blocco Payload `episodes`, produzione obbligatoria e limite, query automatica sui contenuti figli pubblicati. Stato vuoto esplicito; nessun inserimento duplicato di card.
- Collegati i quattro video YouTube ai contenitori Che giornata!, Muovi le piume!, Oltre la tela e BradiLOFI. Collegata la scheda pilota preesistente a Bradiboo — La serie, mantenendola senza video.
- Convertiti gli elenchi delle otto pagine produzione in blocchi automatici, conservando il resto della pagina. Migrazione SQLite soltanto additiva con backup e controllo record/FK; script idempotente link-production-episodes.ts.

## 17 ottobre — scheda episodio integrata nel player
- Scelta UX: lettura dei contenuti sotto al player di Guarda/ZAP!, senza passaggio obbligatorio a una pagina dettaglio.
- Sample: titolo e CTA, produzione, descrizione/sinossi, nucleo narrativo-emotivo, personaggi, temi e keywords. La scheda segue il contenuto selezionato, con dati ereditati dal Contenuto Payload; nessuna duplicazione editoriale.
- Nucleo emotivo già presente nello schema ora esposto anche nel player. Schede demo restano distinte; campi editoriali non compilati sono dichiarati nel sample. La scheda demo Bosco riprende il nucleo emotivo già fornito dall'utente.
- Verificati TypeScript e risposta HTTP 200 con scheda presente in Guarda e ZAP!. Nessuna modifica allo schema SQLite necessaria.

## 17 ottobre — dizionario headless + integrazioni locali
- Implementata raccolta Payload `watch-terms` / Temi e keyword: nome, categoria topic/keyword, slug univoco nella categoria, provenienza, ID WordPress e data import. Origine/ID WordPress non modificabili dall'API editoriale; rinomina dei termini importati protetta.
- Import iniziale 74 termini dall'headless; salvate come locali le opzioni precedenti assenti da WordPress. Conservate le associazioni dei contenuti, fascioni e pulsanti ZAP! mediante migrazione iniziale marcata metadataVersion=1.
- Relazioni multiple ricercabili con creazione locale nei moduli editoriali; filtri pubblici, scheda player e ZAP! usano gli stessi termini, senza liste statiche per le selezioni.
- Pulsante Aggiorna da WordPress in elenco: import in sola lettura verso l'headless, endpoint POST locale autenticato e controllo origin. Paginazione, timeout, identità ID WordPress e controllo duplicati; nessuna cancellazione automatica dei termini locali o rimossi upstream.
- La scrittura su WordPress non è attivata. Accesso di scrittura e credenziali non verificati in questo intervento.
- Schema SQLite additivo, backup e integrità FK/record verificati. Test su copia del DB: creazione locale, duplicati, protezione importati, relazioni contenuti, filtri/ZAP!, import paginato e idempotente con conservazione dei locali. Build Next superata.

## Ricerca Guarda semplificata — 17 ottobre
- Tematiche in primo piano come piccoli tag/pillole con selezione multipla (OR), aria-pressed e stato selezionato visibile. Posizione primaria/secondaria/nascosta ancora governata dal global Payload.
- Keyword escluse dai filtri pubblici di Guarda per ridurre il rumore. Dati e dizionario mantenuti per gli usi editoriali/Braditime e associazioni ZAP! esistenti. Personaggi e altri filtri non tematici conservano la configurazione corrente.

## 17 ottobre — coerenza CMS e struttura Studio
- Menu/footer centralizzati e condivisi da tutte le viste, inclusi Guarda e ZAP!. Menu contestuale Studio separato, ordinabile nel global navigation, con pagina corrente attiva e supporto ai discendenti Partnership.
- Guarda e ZAP! renderizzano i moduli reali dalle pagine Payload; rimossi dal documento Guarda i blocchi superati non renderizzati. ZAP! registrato in Pagine/mappa. Vecchio dettaglio pilot preservato come redirect nascosto dalla mappa. Card episodio → player Guarda selezionato per slug.
- Area Studio recuperata da deck e repo, con fonti interne e sottopagine Aziende/Partner sociali. Team: deck prioritario per founder/advisor e collaboratori attivi repo. Contatti: mailto del deck, senza invio simulato.
- Moduli Braditime automatici ora filtrabili anche per temi e keyword centralizzati; modalità manuale/override conservata. Nessuna scrittura su headless.
- Note fonti e mappa completa dei controlli in SITE_COHERENCE_AND_STUDIO.md. Confronto online impedito da redirect 308 circolari; nessuna verifica live dei testi dichiarata.
- Verifica finale: build e TypeScript superati; test OR/AND e selezione manuale Braditime superati. QA HTTP in sola lettura su tutte le 33 destinazioni mappa, con verifica di menu principale/footer identici, isolamento del menu Studio e voce attiva nei discendenti, contenuti recuperati, CTA mailto, redirect pilot e selezione del video per slug. Migrazione rilanciata: coherenceVersion impedisce sovrascritture successive. Nessuna verifica visuale completa nel browser eseguita.

## 17 ottobre — Shop come vetrina sold out
- Correzione di scope fornita dall'utente: ecommerce attualmente chiuso. /shop ora presenta un solo prodotto, Bradibox Dove sei?, con scheda /shop/bradibox/dove-sei e CTA Avvisami quando disponibile verso Fillout esistente. Nessun carrello o checkout.
- Repo verificata: bradishop e components/formFillout.tsx. Pagina online canonica non-www raggiunta HTTP 200 e confrontata: libro Dove sei?, gioco Mimetizoo, caratteristiche, dati tecnici e CTA confermati. Recuperati i dati pubblici headless product ID 2783 e 11 immagini, importati in Media/Pagine Payload con fonti e backup.
- Record soon Qualcosa di bello escluso. Status live dell'headless non assunto come stock disponibile. Form Fillout non inviato; lettura automatica diretta respinta HTTP 403, destinazione verificata nella repo.
- Inclusi anche i collegamenti ai due video remoti preesistenti (presentazione prodotto e approfondimento psicopedagogico), modificabili come CTA nella pagina. TypeScript e controlli HTTP su vetrina/scheda/mappa superati; CTA sold out presente e carrello assente.

## 17 ottobre — prodotto headless con override locali
- Superato import statico: /shop e scheda Dove sei? leggono il prodotto WordPress indicato nello slug pagina. Sezioni rese da nuovo modulo headlessProduct con selezione sezione e toggle indipendenti per titolo/testo/media/card locali.
- Lettura remota con cache 300 secondi, timeout e fallback alla copia importata conservata nei moduli. Nessuna scrittura verso WordPress, nessuna sovrascrittura dei valori locali in seguito al fetch.
- Stato Sold out e CTA Fillout rimangono locali; status live del prodotto non riattiva alcun acquisto. Gallerie/video/dati possono seguire il sorgente o gli override.
- Migrazione additiva con backup e conservazione dei record; convertiti solo i moduli prodotto, lasciate introduzioni vetrina e CTA locali. Test unitari: sorgente remota, override indipendenti/vuoti, immagini/card, fallback e mantenimento sold out superati.
- Verifica finale HTTP: /shop e scheda prodotto rispondono 200 con immagini remote (prova del fetch live), libro/gioco/dati/video corretti e CTA Fillout/sold out conservati. Integrità FK e TypeScript verificati. La cache remota può ritardare gli aggiornamenti fino al ciclo di revalidazione di 5 minuti.

## 17 ottobre — UX del backoffice
Riorganizzati Pagine, Contenuti, Personaggi e global Guarda/Navigazione con tab tematiche, sidebar per identificativi e accordion nei moduli. Righe di array e moduli collassate inizialmente con titoli descrittivi. Condizioni media/modalità manuale-automatica/icone e controlli In primo piano mantenute o affinate.
Confronto fra schema generato prima/dopo: 532 tabelle/indici identici, nessuna migrazione né scrittura sul DB originale. Verifica di salvataggio su copia del DB per pagine prodotto, personaggi e global per controllare conservazione di moduli/associazioni.

## 17 ottobre — sidebar Payload
Gruppi tematici per Pagine/Menu, Personaggi/Produzioni e video, risorse, amministrazione e Guarda/ZAP!. Rinominata la raccolta Contenuti in Produzioni e video (slug/API invariati). Scorciatoia autenticata /admin/zap verso la tab del controller esistente, tramite preferenza personale, senza doppio pannello dati. Nessuna modifica allo schema dei contenuti.
- Build/TypeScript superati; verificato redirect alla login per /admin/zap senza sessione e assenza di modifiche alle preferenze in quel caso. Backoffice e Guarda rispondono HTTP 200. La scorciatoia usa navigazione completa per ricaricare la preferenza aggiornata anche quando si parte dallo stesso pannello Guarda.

## Correzione scorciatoia ZAP! — 17 ottobre
Risolti due errori: il salvataggio delle preferenze richiede req.user (l'hook Payload ignora il valore user esplicito se manca req), e il percorso di una tab senza nome è `_index-0`, non `tabs-0`. La scorciatoia usa ora createLocalReq, permessi e getFieldPaths della versione installata. Test su copia DB per primo accesso, aggiornamento, identità utente e conservazione delle altre preferenze.

## 19 ottobre — promemoria preparazione deploy
Prima della pubblicazione recuperare account/progetto Vercel, servizi DB/storage già attivi, configurazioni per ambiente, migrazione dati/upload, backup e rollback. Privilegiare il riuso dell'infrastruttura esistente; non dare per acquisiti DB Payload o storage upload. Checklist persistente in PRODUCTION_HOSTING_AUDIT.md. Nessun deploy o servizio nuovo autorizzato da questo promemoria.

## 19 ottobre — fondi pagina e selezione colori
- Fondo pagina esteso a tutta la larghezza, indipendente dal contenitore dei contenuti e dai breakpoint; rendering condiviso con Guarda e ZAP!. I moduli trasparenti lasciano vedere il fondo continuo.
- In Pagine → Aspetto → Fondo pagina: Trasparente, Tinta unica o Gradiente verticale. Pannello colori nativo, inserimento HEX a sei cifre, campioni visivi e anteprima. Anche i colori dei moduli usano pannello e HEX.
- Gradiente unico dall’alto al basso dell’intero contenuto pagina, con altezza determinata dal contenuto: nessuna ripetizione per modulo o viewport, nessun fondo fisso. Header e footer conservano il proprio trattamento. Le immagini e i fondi espliciti dei moduli possono coprirlo.
- Compatibilità con i nomi colore esistenti; valori HEX e gradiente salvati nelle colonne testuali già presenti, senza nuove colonne o migrazioni.
- Verifiche: build e TypeScript superati; salvataggio/lettura colori legacy, HEX, gradiente e trasparenza su copia temporanea DB; validazione valori errati; moduli conservati; 532 tabelle/indici invariati. Controllo browser frontend a 319px: fondo largo come viewport. Verifica interattiva pannello Payload da completare nella sessione autenticata dell’utente.
- Architettura e navigazione invariate. Prossimo passaggio: scegliere e provare i colori effettivi dalla tab Aspetto.

## 19 ottobre — prima veste UI della Home
- Prova richiesta dall’utente prima di decidere se disegnare un redesign completo in Figma: ereditare angoli e tipografia dall’attuale, poi procedere per correzioni mirate.
- Sorgente verificata: checkout `work/legacy-frontend`, `src/scss/02_typography`, `src/assets/fonts`, utility `.rounded` in `src/app/styles.css`. Bricolage Grotesque per titoli e corpo; Bradifont per accenti grafici. Raggio legacy clamp 2–5rem con root 10px, tradotto in 20–50px. Logo SVG originale recuperato.
- Plus Jakarta Sans per badge/etichette e didascalie, ospitato localmente da file Google Fonts. Estensione ai biscottini di Guarda rimandata alla propagazione UI dopo revisione Home.
- CSS confinato a `.home-ui`: gerarchie tipografiche, card arrotondate, pulsanti, header/footer e responsive. Fondo/gradiente e contenuti Payload conservati, nessuna scrittura DB o modifica di schema. Immagini personaggi esistenti usate come fallback nella Home quando manca la copertina editoriale.
- Ingressi alla prima comparsa: salita 24–32px, opacità 0→1, rotazione casuale −2°/+2° verso zero e piccolo rimbalzo; 620ms, sfalsamento breve fra card. IntersectionObserver + Web Animations; contenuto visibile senza JS, movimento escluso con prefers-reduced-motion e annullato sugli elementi raggiunti da tastiera.
- Verifiche: TypeScript e lint del componente animazioni superati; lint di UXPreview segnala un setState in effect preesistente; frontend nel browser desktop 1440px, mobile 390px e 320px senza overflow orizzontale; font calcolati verificati, nessun errore browser osservato. Non eseguita build concorrente al dev server.
- Architettura, ordinamento e testi invariati. Hero e primo piano conservano le aree senza media già presenti: la prova visiva non equivale a completamento editoriale. Prossimo passaggio: revisione utente della Home e piccoli fix prima della propagazione.

## 19 ottobre — ingresso ritardato ed etichetta sovrapposta
- Su richiesta utente, ingresso Home posticipato: trigger 96px dentro il viewport e ritardo base 200ms, oltre allo sfalsamento card.
- Etichette modulo della Home a pillola completamente arrotondata, sovrapposte a metà sul bordo superiore sinistro, senza clipping. Etichette card indipendenti.
- Nuovo campo `badgeBackgroundColor` nei moduli comuni: Pagine → Moduli → Aspetto → Colore fondo etichetta, visibile con Mostra etichetta. Pannello colore/HEX; default bianco, testo bianco sui fondi scuri.
- Migrazione dedicata `scripts/add-badge-background.py`: 38 colonne testuali additive fra moduli e versioni; backup in work/backups, nessuna ricostruzione tabelle. Testata su copia e poi applicata al DB locale con conteggi record e FK conservati. Riesecuzione idempotente verificata su copia.
- Test `scripts/check-badge-background.ts` su copia: salvataggio colore e versioni, ID/titoli/numero moduli conservati. TypeScript e lint animazioni superati; verifica browser desktop e mobile 390px, pillola visibile oltre il bordo e assenza di overflow.
- Architettura invariata; attendere revisione visuale utente.

## 19 ottobre — tipografia dei blocchi gestibile in Payload
- Richiesta utente: poter gestire colore, dimensione e allineamento contestualmente alla scrittura dei testi, incluso il caso Hero viola su fondo pagina viola.
- Nei moduli con campi editoriali comuni, tab Contenuto: colore generale dei testi; accordion Titolo e stile / Testo e stile accanto ai rispettivi testi. Colori con pannello/HEX e Automatico/eredita; override separati titolo e sottotesto; allineamento sinistra/centro/destra e peso.
- Titolo: livello semantico H1–H6 indipendente dalla dimensione visiva (preset H1–H6 oppure px liberi). Sottotesto: piccolo/medio/grande o px liberi. Dimensioni libere ridotte progressivamente su mobile. Il livello Auto conserva il comportamento precedente.
- Rendering condiviso dei blocchi tramite `lib/text-style.ts`, metadati propagati da CMS a WireBlock. Stili specifici del titolo prevalgono sul colore generale e sul tema, consentendo testo chiaro sul fondo viola.
- Schema verificato su DB di riferimento nuovo; migrazione additiva `scripts/add-block-typography.py`, con backup e preservazione conteggi/FK, testata su copia e applicata al DB locale. Include versioni dei moduli. Riesecuzione idempotente verificata su copia. Nessuna modifica ai valori editoriali esistenti.
- Verifiche: TypeScript/lint dei nuovi helper e controllo colore superati; round-trip su copia per tutti i campi, versioni, conservazione ID/titoli/numero moduli, fallback colori, gerarchia e dimensioni responsive; 456 definizioni colonna confrontate con lo schema Payload generato. Frontend Home caricato nel browser. Nessuna build concorrente al dev server.
- Nessuna modifica architetturale. Prossimo passaggio: scegliere i colori dei testi nel CMS e verificare la composizione.

## 19 ottobre — preferenza permanente tab interne
- Indicazione esplicita utente: usare sempre tab interne per organizzare i controlli, senza accordion.
- Sostituiti gli accordion di Titolo/Testo con un unico insieme di tab interne nella tab Contenuto: Titolo e stile, Testo e stile, Colore generale ed Elementi (quando presente). Convertiti in tab anche i raggruppamenti residui di fonti e In primo piano nel layout amministrativo condiviso.
- Tab senza nome: percorsi dei campi e schema di storage invariati; nessuna migrazione. Questa convenzione vale per le prossime aggiunte al CMS.

## 19 ottobre — biscottino condiviso e ombra Overlay
- Propagata l’etichetta dalla Home a tutti i blocchi comuni e ai moduli speciali Guarda/ZAP!, alle card editoriali e alle card del catalogo Guarda. Componente unico `components/cookie-label.tsx`.
- Pillola sovrapposta all’angolo superiore sinistro. Ombra netta tramite pseudo-elemento, offset +4px/+5px, colore #243162 al 30%, mix-blend-mode overlay applicato soltanto all’ombra; faccia e testo conservano i propri colori.
- Tab interna Etichetta sui moduli e sulle card manuali; Mostra etichetta/testo/colore sui moduli, testo e colore sulle card. Etichetta delle produzioni gestita in tab Etichetta, condivisa fra card editoriali e Guarda; quando manca, Guarda conserva il testo funzionale di disponibilità. Font Plus Jakarta Sans condiviso.
- Migrazione additiva `scripts/add-shared-cookie-labels.py`: 42 colonne fra card, moduli speciali, produzioni e rispettive versioni; backup, record e FK preservati, test e idempotenza verificati su copia. Nessuna modifica ai contenuti o all’architettura.
- Verifiche: TypeScript; test round-trip e versioni per moduli/card/Guarda/ZAP!, colore produzioni e rendering del componente condiviso; browser Home e Guarda con stili calcolati RGBA/Overlay/offset verificati, overflow visibile sulle card e viewport mobile 390px senza overflow orizzontale.

### 2026-10-19 — Aspetto card annidato
Aggiunti controlli opzionali di aspetto alle card manuali, selezioni catalogo/personaggi, Braditime e Guarda. Default per modulo/catalogo e override locali per singoli elementi; fondo/opacità/backdrop blur, colori/testi/bordi. Dati originali e headless invariati. Dettagli operativi in HANDOFF_VISUAL_UI.md. Migrazione additiva con backup e conservazione record; tsc e test su copia DB passati.
