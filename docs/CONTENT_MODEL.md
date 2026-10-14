# Bradiboo — Content Model

Ultimo aggiornamento: 14 ottobre 2026

## Obiettivo

Definire un Content Studio essenziale, guidato e costruito intorno alle esigenze reali di Bradiboo. Il sistema deve gestire contenuti, pagine, relazioni, menu e media senza ricreare la complessità di un CMS generalista.

## Entità principali

### Contenuto

Campi iniziali:

- titolo;
- slug;
- tipologia;
- descrizione breve e completa;
- cover, immagini e media;
- stato: bozza, pubblicato, programmato;
- data di pubblicazione;
- personaggi associati;
- property, serie o format di appartenenza;
- temi e categorie;
- attività e prodotti collegati;
- contenuti correlati.

### Personaggio

- nome;
- slug;
- descrizione;
- immagini e asset;
- caratteristiche e passioni;
- eventuale format condotto;
- contenuti associati automaticamente tramite relazione.

I personaggi non sono tag di testo libero: sono entità controllate. Un contenuto può essere associato a uno o più personaggi.

### Pagina

- titolo;
- slug e URL;
- template;
- pagina genitore;
- stato di pubblicazione;
- blocchi ordinati;
- impostazioni SEO essenziali;
- presenza nei menu.

### Menu

- nome del menu;
- voci ordinate;
- collegamento a pagina interna o URL esterno;
- eventuali livelli figli;
- visibilità.

### Media

- file;
- titolo e testo alternativo;
- tipo;
- metadati essenziali;
- contenuti che utilizzano il media.

## Blocchi manuali e dinamici

### Blocco manuale

Il redattore sceglie gli elementi e il loro ordine.

### Blocco dinamico

Il redattore definisce una query guidata, per esempio:

- personaggio: Placido;
- tipologia: episodio;
- stato: pubblicato;
- ordinamento: più recente;
- limite: 6;
- eventuali contenuti fissati o esclusi.

Questa modalità alimenta automaticamente pagine personaggio, pagine serie, format, homepage e contenuti correlati.

## Relazioni iniziali

- episodio → serie;
- contenuto ↔ personaggi;
- format → personaggio conduttore;
- attività ↔ contenuto di origine;
- prodotto ↔ personaggi o property;
- pagina → template;
- pagina → blocchi;
- blocco dinamico → regola di selezione;
- pagina → pagina genitore;
- voce di menu → pagina o URL.

## Aree iniziali del Content Studio

- Contenuti
- Personaggi
- Pagine
- Menu
- Media
- Impostazioni

## Principio guida

Il sistema deve essere abbastanza flessibile da permettere al sito di evolvere e abbastanza vincolato da non consentire composizioni incoerenti o la rottura del frontend.

## Da definire

- elenco definitivo delle tipologie di contenuto;
- campi obbligatori per ciascuna tipologia;
- blocchi consentiti per ogni template;
- regole di ordinamento e fallback dei blocchi dinamici;
- bozze, preview, programmazione e versioni;
- ruoli e autorizzazioni;
- gestione multilingua;
- destinazione e comportamento dello shop.
