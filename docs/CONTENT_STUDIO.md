# Bradiboo Content Studio — avvio locale

Il progetto utilizza Next.js 16 e Payload 3. Il wireframe originale resta in `lib/wireframe.ts` come sorgente di importazione iniziale; le pagine visualizzate vengono lette da Payload.

## Avvio

Con Node.js compatibile disponibile nel PATH:

```sh
pnpm install
pnpm dev
```

Aprire `http://localhost:3000/admin` e creare il primo utente. Non viene creato alcun account predefinito. Tutti gli utenti della prima versione sono amministratori editoriali; permessi differenziati sono un passaggio successivo.

La configurazione locale `.env`, esclusa da Git, richiede:

```dotenv
PAYLOAD_SECRET=<segreto casuale lungo>
DATABASE_URL=file:./bradiboo.db
WIREFRAME_PREVIEW=true
```

`WIREFRAME_PREVIEW=true` rende visibili nel wireframe le bozze di pagine e moduli. Ometterlo in produzione: le pagine pubbliche rispettano lo stato pubblicato e nascondono i moduli in bozza. Le API applicano già i controlli editoriali; le scritture richiedono autenticazione.

## Aree disponibili

- Pagine: URL, area, pagina genitore, personaggio di riferimento e moduli riordinabili.
- Contenuti: serie, miniserie, format ed episodi, relazioni ai personaggi e contenuto genitore, copertina, URL.
- Personaggi: nome, slug, descrizione e ritratto.
- Media: upload locale con testo alternativo.
- Menu: voci della navigazione principale. Logo, Studio e footer sono ancora strutturali.
- Utenti: accesso amministrativo.

Al primo avvio su database vuoto vengono importate le pagine del wireframe, i sei personaggi e un episodio pilota dimostrativo, associato a Bradford, Placido e Joe. I blocchi “Guarda con…” delle pagine personaggio usano una raccolta automatica dei contenuti pubblicati associati. Il seed non sovrascrive pagine già presenti.

## Limiti della prima configurazione

Il frontend è ancora un wireframe: media, player e form contatti non hanno un rendering funzionale definitivo. I campi media sono disponibili nell’admin. Le raccolte dinamiche iniziali filtrano per personaggio, ordinano per creazione e limitano i risultati; filtri avanzati, elementi fissati ed esclusioni devono ancora essere aggiunti. Le altre raccolte restano manuali.

Il collegamento pagina genitore è disponibile ma l’alberatura iniziale non viene assegnata automaticamente. L’URL di un contenuto deve corrispondere a una pagina esistente: creare un contenuto non genera una pagina. Non sono ancora configurati SEO editoriale, multilingua, invio email, recupero password tramite provider, hosting o storage remoto. Braditime resta in bozza.

Database `bradiboo.db*`, file caricati in `media/` e `.env` sono esclusi da Git: conservarne un backup separato. La scelta SQLite e upload su disco serve allo sviluppo locale; l’ambiente di produzione richiede una decisione su database, storage e backup.

## Verifiche

```sh
pnpm exec payload generate:types
pnpm exec tsc --noEmit
pnpm build
```

## Gestione Home aggiornata

Aprire Pagine → Home. Sfondo pagina è gestito sopra Moduli. Nei moduli si trovano Mostra etichetta, Testo etichetta, Colore fondo blocco, Mostra media del blocco e Sorgente media. Per YouTube usare un link HTTPS watch, youtu.be, shorts o embed con ID valido; il player non viene montato quando il media è disattivato.

Il modulo Primo piano ha modalità manuale/automatica. Per l'automatica aprire Contenuti, attivare In primo piano e compilare ordine/etichetta, quindi pubblicare. Le raccolte manuali/catalogo e personaggi hanno righe trascinabili. Braditime ha modalità automatica con checkbox personaggi o manuale con righe di attività: il selettore carica il catalogo WordPress; Personalizza per questo blocco mostra gli override. Campi override vuoti ereditano WordPress. Salvare e aggiornare il wireframe con Cmd+R.

Il rendering media, YouTube e i controlli Home descritti qui superano i limiti iniziali riportati sopra; player dei singoli episodi e invio contatti restano da realizzare. Il sito è ancora locale e il visual provvisorio. `scripts/upgrade-home.ts` converte una volta i moduli iniziali; le Home già convertite mantengono i dati editoriali. Non eseguirlo durante modifiche editoriali in corso.

## Schede personaggio

Aprire Personaggi → Placido (o altro personaggio). Qui si modificano descrizione, identità, frase editoriale, passioni, peculiarità e universo musicale. Il modulo Scheda personaggio li richiama automaticamente nella pagina associata. La Hero ha testi propri inizializzati dalla bible; per cambiare quei testi aprire Pagine → personaggio.

In Momenti del personaggio aggiungere immagini, testo alternativo obbligatorio, didascalia ed eventuale episodio/contenuto correlato. L'ordine è trascinabile. Il modulo gallery nella pagina è inizialmente in bozza; si attiva dopo aver caricato materiali sufficienti. Clip audio e trascrizione sono facoltative e non compaiono senza file. Personaggi da mettere in relazione consente una selezione editoriale; senza selezione la pagina elenca gli altri membri della Braditriboo. Nessuna relazione specifica è dedotta automaticamente dalla bible.

### Schema SQLite locale

Nell'ambiente locale attuale `PAYLOAD_SCHEMA_PUSH=false` disattiva il riallineamento automatico di Drizzle, che tentava di ricreare indici esistenti. Lo schema è stato confrontato in sola lettura con un database di riferimento: nessuna colonna mancante o definizione differente, integrità e relazioni valide. Le future estensioni dello schema devono essere verificate su copia e applicate con migrazioni revisionate; non basta cambiare i campi e riavviare con il push disattivato. Su un database nuovo è necessario predisporre lo schema prima del seed.

### Catalogo Guarda e Telecomando
In **Contenuti**, scegliere il tipo guardabile e collegare YouTube o un file video. Un prodotto (serie/format) senza tipo guardabile non entra nel catalogo episodi. Compilare personaggi, temi e keywords: questi alimentano sia filtri sia telecomando. Il testo Nucleo emotivo descrive la storia, mentre Temi ed emozioni sono le etichette filtrabili condivise.

In **Guarda — catalogo e fascioni**, aggiungere righe editoriali: titolo, introduzione, modalità automatica (filtri sui metadati) o manuale (contenuti ordinabili), numero massimo. I fascioni introduttivi dei cluster restano nei blocchi della pagina Guarda. Le schede della bible sono esempi di anteprima, senza video; disattivarle da Mostra sample oppure escluderle con Solo video disponibili. Il telecomando le esclude inizialmente.

### Filtri a scomparsa e telecomando a pulsanti
In **Guarda — catalogo e fascioni → Filtri di Guarda**, ogni riga sceglie categoria, etichetta e posizione (Primario, Altri filtri, Nascosto). L'ordine è trascinabile; inizialmente Personaggi è primario. I primari sono menu a scomparsa, i secondari condividono il pannello Altri filtri. Le selezioni restano visibili nel riepilogo anche dopo la chiusura.

In **Pulsanti telecomando**, definire nome accessibile, immagine/illustrazione oppure icona provvisoria e più keyword dalla selezione ricercabile condivisa con i Contenuti. La lista iniziale di keyword è predefinita nello schema; eventuali nuove voci richiedono aggiornamento dello schema. Il click estrae immediatamente un video disponibile con almeno una keyword, senza combinare pulsanti come filtri. Titolo, descrizione, copertina e link sono ereditati dal contenuto. Sorprendimi usa tutto il catalogo riproducibile. Se non ci sono corrispondenze, un messaggio lo dichiara e il player conserva il contenuto precedente.

### Episodi nelle pagine di produzione
In **Contenuti → episodio → Serie / format di appartenenza**, selezionare la produzione corretta e pubblicare. Il blocco **Episodi della produzione** nelle pagine Serie, Miniserie e Format richiama automaticamente i contenuti pubblicati con quella relazione. Nel blocco sono modificabili produzione e numero massimo; titolo, descrizione, copertina e destinazione delle card provengono dai Contenuti. La lista segue la data di creazione crescente. Nessun episodio disponibile: messaggio esplicito. L'episodio pilota è ancora una scheda wireframe senza video; non è riproducibile finché non viene collegata una sorgente.

### Tematiche e keyword condivise (17 ottobre 2026)
**Payload → Temi e keyword** contiene i termini importati da WordPress e le aggiunte locali. La colonna Provenienza distingue le due fonti. **Crea nuovo** (oppure + nel selettore di un contenuto) aggiunge una voce locale: scegliere Temi/emozioni o Keyword/argomenti e inserire il nome. Lo slug viene compilato se lasciato vuoto; i duplicati nella stessa categoria vengono rifiutati.

**Aggiorna da WordPress** importa/aggiorna le tematiche (`topic`) e le keyword (`keyword`), comprese le voci non ancora usate. Non invia modifiche all'headless e non elimina le voci locali. I termini WordPress si rinominano sull'headless e si aggiornano qui con quel comando. Gli ID delle relazioni rimangono stabili durante il refresh. Le eventuali rimozioni dall'headless non cancellano automaticamente termini o associazioni locali.

I nuovi selettori ricercabili e multipli sono in **Contenuti**, **Fascioni editoriali** e **ZAP! → Keyword associate**. Anche i filtri pubblici e la scheda sotto al player leggono questi dizionari, quindi le nuove voci non richiedono aggiornamenti del codice. Le assegnazioni ai video si compilano in Payload: l'import dei dizionari non assegna automaticamente argomenti ai video.

Import iniziale: 13 tematiche e 61 keyword WordPress; conservate come termini locali anche le voci precedenti del prototipo che non esistevano sull'headless. Script `import-watch-terms.ts`: import idempotente e migrazione iniziale delle vecchie associazioni una sola volta (metadataVersion). I vecchi campi restano nascosti come storico e non alimentano più il player.

### Navigazione condivisa e Studio
Nel global **Menu, footer e navigazione Studio** si gestiscono menu principale, ingresso Studio, menu contestuale Studio e footer. Il menu Studio compare automaticamente soltanto in quell'area, senza sostituire il menu principale. Le nuove pagine Studio/Aziende/Partner sociali sono tutte in Pagine e usano i moduli esistenti.

Guarda e ZAP! sono ora entrambe in **Pagine**, compresa disposizione dei moduli e testi introduttivi. I moduli speciali Player e catalogo / Player e pulsanti vanno usati nelle due rispettive pagine; raccolte, filtri e pulsanti restano nel global Guarda. Il vecchio dettaglio del pilot è nascosto dalla mappa e reindirizza alla scheda integrata. I campi Nascondi dalla mappa e Reindirizza a sono disponibili sulle pagine; evitare destinazioni circolari.

Vedi `SITE_COHERENCE_AND_STUDIO.md` per provenienza dei testi e limiti della migrazione. I contatti sono CTA email funzionanti, senza form fittizi. Nei blocchi Braditime automatici si possono combinare personaggi, tematiche e keyword; i filtri non si applicano alla selezione manuale.

### Shop chiuso e Bradibox sold out
**Pagine → Shop** è ora la vetrina di una sola Bradibox: Dove sei?. **Pagine → Dove sei? — Bradibox** contiene presentazione, libro, gioco Mimetizoo, gallerie, approfondimento, competenze e dati confezione. Testi e immagini sono stati importati una tantum dall'headless e restano modificabili localmente. Sono stati conservati nel campo Fonti i riferimenti alla pagina online e alla repo.

Il badge Sold out e le CTA **Avvisami quando disponibile** sono nei blocchi Hero e Richiesta disponibilità. La destinazione è il form esistente `https://forms.fillout.com/t/prvJGgrgkxus`, recuperato da `components/formFillout.tsx` del legacy: è un collegamento diretto, senza checkout né invio di dati dal sito locale. Per cambiare la destinazione aggiornare Hero e CTA presenti sulle due pagine. Nessun form è stato inviato durante la verifica.

Non viene mostrato il secondo record dell'headless (Qualcosa di bello, status soon). Lo status live del record WordPress Dove sei? non viene interpretato come disponibilità di acquisto: lo shop chiuso/sold out è la scelta attuale confermata dall'utente. Script import-shop-showcase.ts, con backup e protezione da sovrascritture successive.

### Collegamento live dei prodotti + override (supera l'import statico)
Le pagine **Shop** e **Dove sei? — Bradibox** hanno ora `Prodotto headless collegato = dove-sei`. I moduli **Prodotto headless + override** leggono l'headless ogni 5 minuti circa (cache dati Next); non riscrivono i contenuti WordPress. Sono collegate presentazione/card, libro, gioco, gallerie, competenze, dati confezione e video.

In ciascun modulo attivare solo gli override desiderati: **Usa titolo locale**, **Usa testo locale**, **Usa media locale**, **Usa card / galleria / dati locali**. I campi locali già importati fungono da copia di sicurezza; non vengono sovrascritti dalla lettura remota. Un override testo attivo ma vuoto nasconde il testo; card locali vuote con override attivo svuotano la sezione. Disattivare il toggle ripristina i dati WordPress. Per modificare i dati della card prodotto usare l'override card; il titolo del modulo è un controllo separato.

Se WordPress è irraggiungibile o la sezione ricevuta non è valida, il sito usa la copia locale salvata (quella importata inizialmente, non una copia aggiornata a ogni lettura). Stato **Sold out** e link/testo **Fillout** rimangono locali e non dipendono dal campo `status` WordPress. Non vengono riattivati acquisto, prezzi o carrello. Per modificare i dati sorgente usare WordPress; per variazioni specifiche del sito usare gli override Payload.

### Organizzazione dell'editor Payload — 17 ottobre
- **Pagine**: titolo sempre visibile; tab Generale, Moduli, Aspetto, Collegamenti e fonti. Percorso e area nella sidebar; controlli pubblicazione standard conservati.
- **Contenuti**: Scheda, Video e copertina, Tematiche e associazioni, Collegamenti. Slug/tipologia nella sidebar; promozione In primo piano richiudibile.
- **Personaggi**: Scheda, Media e momenti, Relazioni e fonti. Fonte canonica richiudibile.
- **Guarda — catalogo e fascioni**: Filtri, Fascioni editoriali, ZAP!, Anteprima.
- **Menu/footer**: Menu principale, Menu Studio, Footer.
- **Ogni modulo**: sezioni Contenuto, Sorgente e selezione (quando applicabile), Media, Aspetto, CTA, Gestione modulo. I prodotti headless mostrano prima Sorgente WordPress e override e tengono chiusa la copia locale. Media/aspetto/CTA/gestione sono richiudibili; moduli e righe ripetute partono collassati, con titolo o etichetta leggibile nella riga.
- Controlli condizionali conservati e affinati: upload solo con media attivo e sorgente file; nei fascioni automatici compaiono filtri, nei manuali selezione contenuti; l'icona provvisoria di ZAP! scompare quando si carica un'illustrazione.

Tab e accordion sono senza nome dati: organizzano solo l'admin. Non introducono nuovi campi nel database e non spostano valori/relazioni. Il codice di organizzazione condiviso è `lib/admin-layout.ts`.

### Sidebar tematica
Raggruppate le voci dell'admin in **Sito e pagine** (Pagine, Menu e footer), **Universo Bradiboo** (Personaggi, Produzioni e video), **Risorse condivise** (Media, Temi e keyword), **Amministrazione** (Utenti) e **Guarda e ZAP!** (Catalogo, filtri e ZAP!). I gruppi sono richiudibili con i controlli nativi Payload.

La scorciatoia **↳ Pulsanti ZAP!**, sotto il gruppo Guarda, apre direttamente la tab ZAP! del global esistente. La route /admin/zap richiede login/permesso di lettura e modifica soltanto la preferenza della tab per l'utente corrente; non duplica configurazioni né contenuti. Logout, permessi e sidebar native restano gestiti da Payload.

### Fondi pagina e colori — 19 ottobre 2026
In **Pagine → Aspetto → Fondo pagina** scegliere **Trasparente**, **Tinta unica** oppure **Gradiente verticale**. Il campione apre il pannello colori; il campo accanto accetta un esadecimale completo a sei cifre (`#7235E8`). Nel gradiente il colore iniziale coincide con il limite superiore del contenuto pagina e quello finale con il limite inferiore: lo sviluppo segue l’intera lunghezza, visibile progressivamente scorrendo. Il fondo copre sempre tutta la larghezza, anche oltre la larghezza massima dei contenuti.
Anche i fondi dei singoli moduli hanno pannello colori e campo HEX. Usare Trasparente per far emergere il fondo pagina. Immagine di fondo pagina e fondi propri dei moduli restano sovrapposti al colore/gradiente; header e footer conservano il proprio fondo.

### Colore delle etichette modulo
In **Pagine → Moduli → [modulo] → Aspetto**, attivare **Mostra etichetta**, compilare il testo e scegliere **Colore fondo etichetta** con pannello colori o HEX. Il default è bianco. Nella Home l’etichetta è una pillola sovrapposta all’angolo superiore sinistro del modulo. Il testo passa al bianco con fondi scuri.
Per altri database eseguire la migrazione additiva `python3 scripts/add-badge-background.py [percorso-db]` prima di avviare il nuovo codice; crea un backup e conserva i dati esistenti.

### Stile dei testi dei blocchi
In **Pagine → Moduli → [modulo] → Contenuto** trovi **Colore generale testi del blocco**, **Titolo e stile** e **Testo e stile**.
- Imposta il colore con pannello o HEX. Automatico/eredita conserva lo stile previsto; il colore specifico di titolo o testo prevale sul colore generale. Per un Hero chiaro sul fondo viola, scegli ad esempio Colore titolo `#FFFFFF`.
- Il **livello del titolo H1–H6** definisce la gerarchia della pagina. La **dimensione visiva** è indipendente: scegli un preset H1–H6 o Libera e inserisci i px desktop. Su mobile le grandi dimensioni si riducono.
- Titolo e sottotesto hanno allineamento e peso separati; il sottotesto offre piccolo/medio/grande oppure dimensione libera. Non occorre cambiare font o contenuti per regolare il contrasto.
- I controlli riguardano i testi editoriali dei moduli comuni. Etichette, pulsanti e contenuti interni alle card conservano i rispettivi trattamenti.
Per altri database applicare `python3 scripts/add-block-typography.py [percorso-db]` prima di avviare il nuovo codice; la migrazione include le versioni e crea un backup.

### Convenzione di navigazione del backoffice
Usare sempre **tab interne**, non accordion, per organizzare i controlli editoriali. In Contenuto, Titolo e stile / Testo e stile / Colore generale / Elementi sono tab interne; le tab prive di campi vengono omesse. Le tab sono senza nome e non cambiano i percorsi dei dati.

### Etichetta condivisa su tutti i componenti
- **Modulo → Etichetta**: mostra/nascondi, testo e colore fondo (pannello/HEX). Disponibile anche su Guarda e ZAP!.
- **Card manuale → Etichetta**: testo e colore indipendenti; testo vuoto nasconde la pillola.
- **Produzioni e video → Etichetta**: testo e colore della card, condivisi fra raccolte editoriali e catalogo Guarda. I dati tecnici mantengono i nomi storici highlightBadge/highlightBadgeBackgroundColor. Se manca un testo editoriale, le card Guarda mostrano lo stato video.
La pillola sporge dall’angolo superiore sinistro. Ombra fissa netta blu #243162 al 30%, verso destra/basso (+4/+5px), fusione Overlay solo sul livello ombra.
Su altri database applicare prima `python3 scripts/add-shared-cookie-labels.py [percorso-db]`, con backup automatico.
