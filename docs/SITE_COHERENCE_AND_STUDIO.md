# Coerenza frontend/Payload e area Studio — 17 ottobre 2026

## Dove si gestisce cosa
- **Pagine → Guarda**: introduzione, CTA ZAP!, modulo Player e catalogo, fascioni Serie/Miniserie/Format. I blocchi si riordinano dalla pagina e vengono tutti letti dal frontend; rimosse dal documento corrente le vecchie sezioni non renderizzate. Copia precedente conservata in backup e versioni Payload.
- **Pagine → ZAP!**: pagina autonoma con introduzione e modulo player/pulsanti, presente nella mappa del sito. Il percorso `/guarda/telecomando` resta valido.
- **Guarda — catalogo e fascioni**: criteri/ordine delle raccolte, filtri e pulsanti. **Contenuti**: dati dei singoli video. **Temi e keyword**: vocabolario comune.
- **Menu, footer e navigazione Studio**: menu principale, ingresso Studio, footer e secondo menu Studio separato. La navigazione interna appare solo su `/studio` e discendenti, con voce corrente evidenziata; su sottopagine partnership è attiva Partnership. Gli stessi header/footer sono usati anche da Guarda/ZAP!.
- **Pagine → Studio e sottopagine**: tutti i testi recuperati sono salvati come blocchi Payload modificabili, non importati a runtime dal vecchio sito. Fonti annotate in un campo editoriale interno.
- Le card episodio delle produzioni e dei personaggi portano a `/guarda?contenuto=<slug>#watch-player`, selezionando direttamente la scheda/player corretta. Il vecchio percorso del pilot è conservato come redirect verso Guarda ed escluso dalla mappa. Nessuna pagina di dettaglio obbligatoria.
- **Moduli Braditime**: selezione automatica ora anche per tematiche e keyword dal catalogo comune; OR dentro la categoria, AND fra categorie/personaggi. La selezione manuale mantiene ordine e override, indipendente dai filtri automatici. Non sono state inventate associazioni su WordPress.

## Studio: fonti e destinazioni
| Pagina | Fonti recuperate |
|---|---|
| Studio | Deck pp. 2–3 e 18: identità IP, universo, aree di sviluppo |
| Perché Bradiboo | Deck pp. 2–3, 22 + manifesto repo |
| Approccio | Deck p. 17 + cinque sezioni psicopedagogia repo |
| Partnership | Deck pp. 18, 20 + ingressi Aziende/Partner sociali repo |
| Partnership / Aziende e brand | Tre servizi e fasi collaborazione repo |
| Partnership / Partner sociali | BradiCare e fasi collaborazione repo |
| Team | Deck p. 21 per founder/advisor + collaboratori attivi nella repo, esclusi record commentati |
| Contatti | Deck p. 23: ciao@bradiboo.com. CTA mailto reale; nessun form con invio simulato |

Deck: `Bradiboo_Deck 2026.pdf` fornito dall'utente. Repo: `work/legacy-frontend/src/app/[locale]/(content)/bradiworld` e `bradicollab`. Estratto strutturato in `lib/studio-source.json`. Non sono stati importati asset visuali; le immagini restano per la fase UI/editoriale.

Tentativo di confronto online eseguito: gli URL www/non-www e con/senza slash di bradiboo.com si rimandano tramite HTTP 308, impedendo la lettura delle pagine con i client usati. I testi non sono quindi dichiarati verificati sul sito live: sono recuperati dalla repo e dal deck. Non sono state toccate configurazioni del sito in produzione.

## Migrazione e limiti
Script `align-site-and-studio.ts`, una tantum (coherenceVersion sul global navigation), snapshot dei documenti prima dell'allineamento in `work/backups`. Schema SQLite aggiornato solo con aggiunte nullable/tabelle/indici e controllo integrità/conservazione record. I documenti eliminati dal rendering di Guarda non sono stati ricreati in silenzio dal seed.

Restano per le fasi successive: revisione editoriale/ruoli team, assegnazione temi ai video, immagini/gallerie, UI finale (compresa console ZAP! compatta), pubblicazione delle aree in bozza, scelta/collegamento definitivo dell'ecommerce e hosting. Il form contatti non è un sistema di ticket: i contatti aprono l'email dell'utente. L'headless resta in sola lettura.
