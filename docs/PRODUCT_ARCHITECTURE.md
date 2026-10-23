# Bradiboo — Architettura operativa

Ultimo aggiornamento: 16 ottobre 2026

## Checkpoint recuperato dalla chat

Il catalogo iniziale dei moduli è stato accettato dall’utente per iniziare lo sviluppo: Hero, Editorial Intro, Media Player / Featured Media, Split Content, Card Grid, Card Rail, Dynamic Collection, CTA, Structured Information, Contact Form. Le nove tipologie del wireframe sottostante descrivono la rappresentazione attuale, non dieci componenti già sviluppati. Dynamic Collection è una logica di selezione che può alimentare grid o rail; Related Content può essere una variante compatta, ancora da formalizzare. Restano da specificare i campi e il comportamento dei singoli moduli.

Il Content Studio non è ancora implementato. La direzione R2/D1/Workers è una proposta emersa nella chat, con servizi ancora scollegati. Il prossimo lavoro è rendere operativo il catalogo accettato, iniziando dalla homepage e da una pagina personaggio, senza una nuova fase estesa di architettura teorica.

## Metodo

Il progetto procede in un unico flusso, rapido e verificabile:

1. validare la struttura navigabile già presente;
2. identificare i moduli che compongono le pagine;
3. definire per ogni modulo contenuti, relazioni e modalità di gestione;
4. tradurre i moduli nel Content Studio;
5. collegare Content Studio e frontend;
6. definire le variabili visuali modificabili senza compromettere il design system.

Struttura, Content Studio e frontend non sono più trattati come progetti separati. Ogni modulo viene analizzato contemporaneamente dal punto di vista editoriale, dati, visuale e tecnico.

## Navigazione pubblica corrente

- Home
- Braditriboo
- Guarda
- Shop
- Bradiboo Studio, con presenza più discreta

`Il mondo` e Braditime vengono conservati nel wireframe come bozze non pubblicate e non compaiono nel menu. La precedente area “Oltre lo schermo” è confluita nella landing professionale Partnership di Bradiboo Studio.

## Alberatura corrente

```text
Home
├── Braditriboo
│   └── Personaggio
├── Guarda
│   ├── Serie
│   │   └── Bradiboo — La serie
│   │       └── Episodio
│   ├── Miniserie
│   │   └── Che giornata!
│   └── Format
│       └── Pagina format
├── Shop
└── Bradiboo Studio
    ├── Perché Bradiboo
    ├── Approccio
    ├── Partnership
    ├── Team
    └── Contatti

Bozze non pubblicate
├── Il mondo
└── Braditime — integrazione esterna
```

## Template iniziali

- Home
- Hub editoriale
- Indice personaggi
- Personaggio
- Indice contenuti
- Serie o miniserie
- Format
- Episodio o contenuto media
- Integrazione Braditime, bozza tecnica
- Pagina editoriale Studio
- Pagina contatti

Il template è una struttura tecnica invisibile nel sito finale. Stabilisce i blocchi richiesti, consentiti e predefiniti.

## Inventario preliminare dei moduli

| Modulo | Funzione | Contenuto | Gestione prevista | Stato |
|---|---|---|---|---|
| Hero | Apertura e identità pagina | Testo, media, CTA | Campi manuali vincolati | Da validare |
| Intro | Introduzione editoriale | Titolo e testo | Manuale | Da validare |
| Media | Fruizione principale | Video, poster o esperienza | Relazione a contenuto media | Da validare |
| Grid | Catalogo di elementi equivalenti | Card | Manuale o query | Da validare |
| Rail | Fascione orizzontale | Card ordinate | Manuale o query dinamica | Da validare |
| Split | Approfondimento testo/media | Testo, media e CTA | Manuale, layout controllato | Da validare |
| List | Informazioni o elementi funzionali | Voci strutturate | Manuale | Da validare |
| Related | Collegamenti contestuali | Contenuti correlati | Relazione o query dinamica | Da validare |
| CTA | Passaggio verso altra area | Titolo, testo e link | Manuale | Da validare |

Questa tabella verrà sostituita da un inventario completo pagina per pagina. Per ogni modulo dovranno essere definiti:

- pagine nelle quali può comparire;
- contenuti accettati;
- campi obbligatori e facoltativi;
- gestione manuale, automatica o ibrida;
- regole di ordinamento e fallback;
- relazioni con personaggi, serie, format, attività e prodotti;
- variabili visuali modificabili;
- componente frontend corrispondente;
- stato di validazione e sviluppo.

## Contenuti ed entità

### Contenuto

- titolo e slug;
- tipologia;
- descrizioni;
- cover, immagini e media;
- stato e data di pubblicazione;
- personaggi associati;
- property, serie o format di appartenenza;
- temi e categorie;
- attività, prodotti e contenuti correlati.

### Personaggio

- nome e slug;
- descrizione e caratteristiche;
- immagini e asset;
- passioni ed eventuale format;
- contenuti associati automaticamente tramite relazione.

I personaggi sono entità controllate, non tag testuali liberi. Un contenuto può essere collegato a più personaggi.

### Pagina

- titolo, slug e URL;
- template;
- pagina genitore;
- stato di pubblicazione;
- moduli ordinati;
- SEO essenziale;
- presenza nei menu.

### Menu

- voci ordinate;
- pagine interne o URL esterni;
- livelli figli;
- visibilità.

### Media

- file;
- titolo e testo alternativo;
- tipo e metadati;
- contenuti e moduli che lo utilizzano.

## Moduli manuali e dinamici

Un modulo manuale contiene elementi scelti e ordinati dal redattore.

Un modulo dinamico utilizza una regola guidata, per esempio:

- personaggio: Placido;
- tipologia: episodio;
- stato: pubblicato;
- ordinamento: più recente;
- limite: 6;
- contenuti fissati o esclusi.

La pagina personaggio utilizzerà questa logica per richiamare automaticamente i contenuti associati.

## Relazioni iniziali

- episodio → serie;
- contenuto ↔ personaggi;
- format → personaggio conduttore;
- attività Braditime esterna ↔ personaggi e contenuto di origine;
- prodotto ↔ personaggi o property;
- pagina → template;
- pagina → moduli;
- modulo dinamico → regola di selezione;
- pagina → pagina genitore;
- voce di menu → pagina o URL.

## Content Studio essenziale

- Contenuti
- Personaggi
- Pagine
- Menu
- Media
- Impostazioni

Non verranno introdotti plugin, widget generici o libertà di composizione non necessarie. Il sistema dovrà essere sufficientemente flessibile da evolvere, ma abbastanza vincolato da non rompere il frontend.

## Integrazione Braditime

Braditime è un ambiente esterno basato su WordPress headless. Non viene ricostruito dentro il nuovo sito.

Il sito Bradiboo dovrà poter ricevere tramite API almeno:

- identificativo e titolo attività;
- descrizione breve;
- cover o thumbnail;
- personaggi associati;
- età, tema e altri metadati utili;
- stato di pubblicazione;
- URL dell’attività nell’ambiente Braditime.

Le attività potranno essere mostrate come card contestuali in homepage, pagine personaggio, episodi, serie e format. La card appartiene al frontend Bradiboo, mentre la destinazione resta esterna.

L’integrazione e i relativi moduli restano in stato bozza finché non saranno definite API, tassonomie condivise e responsabilità editoriale delle associazioni.

## Partnership

La precedente area “Oltre lo schermo” non è più una voce autonoma della navigazione. Publishing, prodotti, esperienze, digital, produzione, distribuzione, broadcast e licensing confluiscono nella landing `Bradiboo Studio / Partnership`.

## Variabili visuali

Le variabili visuali verranno definite modulo per modulo. La direzione iniziale è consentire soltanto scelte controllate, per esempio:

- variante del modulo;
- tema cromatico da una palette predefinita;
- orientamento media/testo;
- densità o numero massimo di card;
- formato delle card;
- presenza della CTA;
- eventuale comportamento responsive previsto.

Non saranno modificabili liberamente font, spaziature, dimensioni arbitrarie o colori fuori sistema.

## Prossimo checkpoint

Percorrere il wireframe pagina per pagina e costruire l’inventario definitivo dei moduli. Per ogni modulo decidere: resta, si elimina, si fonde, è manuale, è dinamico oppure è ibrido.

## Implementazione iniziale Payload — 16 ottobre 2026

Il wireframe è migrato a Next.js con Payload integrato. Pagine e navigazione vengono lette da Payload, con seed dal wireframe statico. SQLite e upload locali sostituiscono provvisoriamente la proposta D1/R2; l’infrastruttura di produzione resta da decidere. Una prima Dynamic Collection collega i contenuti pubblicati ai personaggi. La configurazione e i limiti effettivi sono descritti in `CONTENT_STUDIO.md`.

## Controlli Home implementati — 16 ottobre 2026

- Ogni modulo: etichetta con toggle, colore da palette controllata (trasparente compreso), media del blocco attivabile, sorgente file o URL YouTube. Nessuno spazio riservato al media disattivato. Le immagini delle card sono separate dal media del modulo.
- Pagina: colore e immagine di fondo.
- Hero: fondo pagina o fondo proprio, immagine dedicata, opacità 0–100 e sfocatura 0–30 px del solo fondo, titolo, sottotesto e CTA opzionale. In modalità fondo pagina la sfocatura riguarda ciò che si trova dietro al blocco; l'opacità riguarda il fondo proprio, non testo/CTA.
- Primo piano: card manuali ordinate oppure contenuti pubblicati flaggati In primo piano; ordine numerico e limite; etichetta per card. Più card generano un carosello navigabile. Per card manuali sono disponibili titolo, descrizione, immagine e link/CTA.
- Raccolta: card manuali oppure contenuti da catalogo oppure personaggi, tutti con ordine tramite righe trascinabili. Le card catalogo seguono i dati delle entità. Home Braditriboo usa i sei personaggi; i format possono essere manuali o da catalogo. Creati record format iniziali dalle pagine wireframe già presenti, con descrizioni dichiaratamente provvisorie.
- Ingressi Serie/Miniserie/Format: tre card manuali nel modulo Grid.
- Studio/Partnership: unico modulo Split aziendale con due parti, titoli, descrizioni e CTA distinte.
- Braditime: modalità automatica con checkbox personaggi (OR, nessuna selezione = tutti), oppure scelta manuale delle attività remote e ordine. Limite numerico, lingua e override locali per ogni ID attività; titolo, descrizione, copertina e CTA personalizzabili, campo vuoto = valore remoto. Il selettore legge il catalogo remoto da un endpoint autenticato. I contenuti originali non vengono modificati. Modulo ancora in bozza.

La palette e il rendering rimangono provvisori per la verifica funzionale; la chat Visual e UI può modificarne la composizione mantenendo questi campi. File video/GIF sono media caricati; animazioni Lottie non implementate. Il modulo contatti resta un segnaposto. Nessun deploy esterno eseguito.

## Pagina personaggio — confronto UX Bluey (16 ottobre 2026)

Reference letta: https://www.bluey.tv/characters/bluey/. Presenta identità e biografia, citazione riferita a episodio, catchphrase audio, quick facts, episodi, Bluey's World, attività e famiglia. Non sono stati verificati tutti i comportamenti interattivi dei contenuti caricati via JavaScript.

Nel wireframe Bradiboo esistono già hero, presentazione, contenuti associati, format, Braditime, prodotti e altri personaggi. Gap da definire con l'utente: scheda di tratti essenziali, citazione/audio facoltativi, galleria di momenti statici e selezione editoriale delle relazioni tra personaggi. La galleria proposta (“Momenti con [nome]”, naming provvisorio) deve avere immagini, testo alternativo, didascalia/contesto e possibile collegamento a un episodio; non usare la geografia del mondo come sostituto dei momenti di caratterizzazione. Riutilizzare media, etichette e fondi già disponibili.

La bible non è presente nei percorsi locali controllati (progetto, Documents/ChatGPT e Desktop/BRADIBOO_local); il precedente percorso CloudMounter del deck non è accessibile. Descrizioni nel frontend legacy disponibili soltanto come reference storica, non come nuova fonte canonica. Attendere la bible per verificare tratti, passioni, voce, relazioni e materiali; non inventare dati come età o catchphrase per riempire i moduli. Questa sezione è una proposta UX, non una dichiarazione di implementazione dei nuovi moduli.

## Personaggi: bible verificata e template integrato — 16 ottobre 2026

La bible è ora accessibile: `/Users/michelepanzeri/Library/CloudStorage/CloudMounter-BRADIBOO2/BRADIBOO/_DOC PER ESTERNI/Bradiboo_Pitch Bible.pdf`. Supera la precedente nota sull'assenza della fonte. Letti i testi e verificate visivamente la scheda di Placido, quella di Mimì e la tavola musicale. Le sei schede (pp. 7–12) offrono già biografia, identità, frase editoriale, passioni/competenze e peculiarità. Pagina 23 specifica l'universo sonoro per ciascun personaggio.

Implementati campi sull'entità Personaggio: identità, frase editoriale, passioni ordinate, peculiarità ordinate, universo musicale, clip audio e trascrizione facoltativi, gallery di momenti con immagine/testo alternativo/didascalia e relazione a un contenuto pubblicato, selezione facoltativa dei personaggi correlati. Fonte canonica registrata sulla scheda. Primo import una tantum: `scripts/upgrade-characters.ts`, con dati estratti in `lib/character-bible.json`; successive modifiche editoriali alla scheda non vengono sovrascritte dall'import.

Nuovi moduli condivisi: Scheda personaggio (legge i dati della scheda), Momenti del personaggio (legge la gallery), Amici e altri personaggi (selezione editoriale o altri membri della Braditriboo). Mantengono i controlli comuni media/etichetta/fondo. Integrati nei sei template esistenti. La Hero iniziale conserva campi pagina propri, con nome/frase inizializzati dalla bible; la biografia e i fatti restano invece collegati alla scheda.

La gallery “Momenti con [nome]” è in bozza, vuota: non sono state estratte arbitrariamente scene dalla bible né generati screenshot. I momenti vuoti sono segnalati nella preview locale e nascosti nella vista pubblica. Nessun audio inventato; il lettore appare solo quando viene caricato un file. Non sono stati attribuiti legami familiari alla Braditriboo: selezione relazioni da gestire editorialmente, altrimenti semplice elenco degli altri.

L'universo sonoro distingue il modello Bradiboo dalla reference Bluey: per Placido Hawaiian, Ska, Skate punk; passioni Natura, Esplorazione, Musica, Polistrumentista. La frase “Prima si parte. Poi si pensa. Forse.” è una presentazione editoriale della bible, non una citazione certificata di un episodio. Le relazioni dimostrative del pilot e dei format restano dati di prototipo, da confermare editorialmente.

## Introduzioni media dal deck — 16 ottobre 2026

Fonte acquisita: `Bradiboo_Deck 2026.pdf`, percorso CloudMounter `_DOC PER ESTERNI`. Pagine 12–16 distinguono cluster Serie/Miniserie/Format e prodotti specifici. Il titolo, sottotesto e media attivabile del blocco restano campi di pagina; titolo, descrizione e cover del prodotto sono gestiti in Contenuti. La logline breve introduce il prodotto; la sinossi più lunga appartiene al dettaglio. Nessuna modifica dello schema necessaria.

Popolati i cluster nell'hub Guarda e le introduzioni degli indici. Aggiornati i prodotti e le card: Bradiboo — La serie, Che giornata!, Oltre la tela, Muovi le piume!, BradiLOFI, Sfide bestiali, Il lab di Joe, Parole da ricordare. Conservati gli URL esistenti; Arte/Fitness/Focus/Natura/Scienza/Cultura sono identificatori tematici dei vecchi percorsi, non i titoli editoriali dei prodotti. Associazioni dei format ai conduttori ricavate dalle immagini e didascalie del deck. I tre format futuri conservano l'etichetta In pre-produzione nelle card manuali, distinta dallo stato di pubblicazione della pagina di presentazione.

Importate nove anteprime dal deck nella libreria Media, come ritagli renderizzati delle aree grafiche di riferimento, non asset originali ad alta risoluzione. Sostituibili dal CMS. Le card manuali contengono copie editoriali; le raccolte da catalogo leggono descrizione e cover del contenuto. Le sinossi di serie/miniserie sono compilate nel blocco descrittivo delle pagine di dettaglio. Script di import una tantum `scripts/upgrade-media-intros.ts`, dati fonte `lib/media-deck.json`; non rieseguirlo automaticamente dopo modifiche editoriali.
