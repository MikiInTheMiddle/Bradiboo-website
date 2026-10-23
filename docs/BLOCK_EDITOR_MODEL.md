# Modello unico dei blocchi

Questo documento sostituisce le descrizioni precedenti di Card/Wide e della gerarchia dei pannelli.

## Blocco

La prima scelta è **Default / Wide** (`presentation`: valori tecnici esistenti `cards` / `wide`).

- **Default:** contenitore con fondo proprio, titolo/testo attivabili, CTA e media facoltativo. Testo e media possono stare affiancati o in verticale. Gli elementi seguono la griglia o il carosello scelti.
- **Wide:** superficie unica con fondo e contenuti sovrapposti. Senza elementi usa titolo, testo, CTA ed etichetta del blocco. Con elementi usa i contenuti di ciascun elemento; con più di uno mostra il carosello esistente. Una sola slide non ha frecce o pallini.

I pannelli sono Contenuto, Fondo, Etichetta, Elementi, Stile card, Gestione. I campi non pertinenti sono condizionati alla modalità. Il nome editoriale resta in Gestione e non è un testo pubblicato.

Il fondo del blocco usa i campi esistenti, aggiunti dove mancavano: tipo, colore/immagine, opacità e sfocatura. I valori tecnici storici `page` / `own` / `image` corrispondono a Trasparente / Colore / Immagine. Nessun contenuto esistente viene cancellato.

## Elementi di un blocco Default

Due schede: **Contenuto** (titolo, descrizione, sorgente, CTA e immagine separata) e **Aspetto**.

La presentazione della card può ereditare le regole comuni o essere Default / Wide:
- Default: immagine e testo separati.
- Wide: fondo pieno immagine, colore o trasparente e testi sopra.

Aspetto raccoglie Fondo, Testi, Bordi, Hover, Etichetta. Le impostazioni comuni del blocco sono la base; quelle della singola card sono override. La selezione dell’immagine Wide riutilizza l’uploader già esistente, senza un secondo valore concorrente. Per le attività WordPress un cambio della copertina locale abilita l’override dell’attività.

L’etichetta usa una scelta Eredita / Personalizza / Nascondi, con testo e colori nello stesso pannello. I vecchi campi dell’etichetta del contenuto rimangono come fallback salvato, senza un secondo controllo visibile.

## Elementi di un blocco Wide

La presentazione del blocco rende già ogni elemento una slide: non si propone una seconda scelta Card/Wide al suo interno.

Contenuto raccoglie i testi e la sorgente. Aspetto raccoglie fondo, testi, bordi ed etichetta della slide. Sfondo e formattazione ereditano dal blocco, con override locale esplicito. L’etichetta è indipendente dal checkbox dello stile: Mostra, Testo, Fondo, Colore testo sono nello stesso pannello. Se il testo locale è vuoto, si usa l’etichetta del contenuto, altrimenti Highlights. Nascondi ha precedenza su ogni fallback.

I campi tecnici originali `slideBadge` e `hideBadge` sono modificati da un controllo UI nel pannello Etichetta: non ci sono due copie dei dati. I colori dell’etichetta sono indipendenti dall’override di fondo/testi. I colori locali storici della CTA sono conservati ma nascosti e ignorati: si usano i colori della UI madre.

## Verifica e conservazione

Migrazione esclusivamente additiva, con backup SQLite e verifica di conteggi e foreign key. Nessun vecchio percorso dati eliminato. Test di rendering per Wide singolo, carosello e trasparente; test condizioni dell’editor e salvataggio su copia temporanea del database. Le animazioni di etichette, pallini e navigazione del carosello rimangono quelle esistenti.
