# Bradiboo — Architettura operativa

Ultimo aggiornamento: 15 ottobre 2026

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
