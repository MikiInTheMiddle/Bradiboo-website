# Reference sito precedente e headless

Analisi preliminare del 16 ottobre 2026, effettuata leggendo lo ZIP senza eseguire il codice e senza modificare il nuovo sito.

Archivio sorgente: `/Users/michelepanzeri/Desktop/BRADIBOO_local/bradiboo-frontend-wp-sviluppo.zip`.

## Risultati verificati

- Frontend Next.js 14.2.35 / React 18, separato dal nuovo Next.js / Payload.
- `src/lib/api.ts` contiene sia chiamate REST personalizzate WordPress sia un client GraphQL tramite fetch POST.
- Braditime usa le API REST `wp-json/bradicore/v1/activity/all`, `activity/slug/{slug}`, `activity/sku/{sku}`. Sono presenti anche risorse boo e story.
- Base REST configurata con `NEXT_PUBLIC_WP_ENDPOINT`, GraphQL con `NEXT_PUBLIC_GRAPHQL_ENDPOINT`. Valori non copiati in questo documento.
- Le query GraphQL in `src/lib/graphQl/queries.ts` prevedono relazioni `postCharacter.characterMain` e `characterSecondary`, descrizioni brevi/lunghe, cover square/landscape/portrait, metadati attività e tassonomie.
- I campi GraphQL non dimostrano da soli la struttura delle risposte REST Bradicore: occorre verificarne il payload effettivo prima di definire il mapping.
- La route indice activities dello ZIP esegue un redirect alla home dopo il recupero dati. Non assumere quindi che la pagina sia attualmente accessibile al pubblico.
- Le chiamate usano force-cache e tag bradiboo: la strategia di cache va riprogettata per l'integrazione nuova.
- Lo ZIP contiene `.env.local`: escluderlo da qualsiasi commit o pubblicazione. L'analisi preliminare non costituisce un controllo completo di tutti i segreti presenti nel codice.

## Organizzazione

Restano due chat: Struttura, funzionalità e UX (questa integrazione) e Visual e UI. Nessuna terza chat necessaria per la sola reference legacy. Conservare questo documento come riferimento e aggiornare le decisioni condivise.

Raccomandato un repository privato separato `bradiboo-legacy-frontend` dopo verifica completa dei file da escludere. Il nuovo repository Bradiboo Website conserva solo il nuovo sito e il codice di integrazione necessario. Nessun repository remoto creato e nessun file legacy caricato.

## Passi successivi

Verificare gli schemi REST, il mapping dei personaggi, la lingua, le cover e la destinazione esterna delle attività. Implementare poi un adattatore server per trasformare le risposte in card uniformi; lasciare i moduli Braditime in bozza fino alla verifica del contratto e dell'ambiente esterno.

## Checkpoint Home da preservare

La definizione della Home procede nella stessa chat. Requisiti approvati ma ancora da implementare: fondo pagina e Hero con trasparenza/opacità/sfocatura; highlight manuali multipli o automatici da flag sui contenuti, etichetta e carosello; griglia personaggi ordinabile; tre card manuali Serie/Miniserie/Format; raccolta format manuale o da catalogo; media opzionale attivabile su tutti i moduli; unico Split aziendale per Studio e Partnership. Il mondo e Braditime restano in bozza. Riprendere questo checkpoint dopo l'analisi dell'headless.

## Implementazione — 16 ottobre 2026

Repository privato creato e push verificato: https://github.com/MikiInTheMiddle/bradiboo-legacy-frontend (snapshot iniziale 60fae9b). Checkout locale separato in `work/legacy-frontend`, escluso da Git e dal controllo TypeScript del nuovo progetto. Esclusi file env e README originale contenente credenziali; rimossi eventuali valori segreti delle variabili ambiente riscontrati nei file testuali. Consigliata la rotazione delle credenziali trovate nel materiale originale.

API REST verificata: restituisce un array di tre attività in italiano. Dati effettivi: `abstract.short`, `postVisual.cover.images.landscape.url`, `language.code`, `slug`, `metaInfos`. `uri` punta al backend data.bradiboo.com: non usarlo come destinazione pubblica. Il routing legacy stabilisce `/it/braditime/attivita/{slug}`; verificata risposta HTTP 200 per Fogliamo. Le associazioni characterMain/characterSecondary sono vuote per tutte le tre attività; il filtro per personaggio produce correttamente nessun risultato. L'endpoint non espone uno stato nei record osservati: verificare lato WordPress che restituisca esclusivamente attività pubblicate prima di togliere la bozza.

Implementato modulo Payload `braditime`, con titolo, sottotesto, stato bozza predefinito, lingua, limite e filtro personaggio. Aggiornati 15 richiami già presenti nelle pagine senza cambiare altri moduli. Adapter server in `lib/braditime.ts`, cache di cinque minuti, timeout, normalizzazione delle card e gestione di API non disponibile. Le immagini restano remote. Configurazione server in `.env`: `BRADITIME_API_BASE`, `BRADITIME_ACTIVITY_BASE`. Nessuna credenziale inviata al browser.

Per aggiornare altri database eseguire `pnpm exec payload run scripts/enable-braditime.ts` dopo aver configurato l'ambiente; lo script converte solo i segnaposto legacy riconosciuti e mantiene i moduli in bozza. Backup locale precedente alla conversione: `/tmp/bradiboo-before-braditime.db` (temporaneo, non backup durevole).

Verifiche: tipi, build completa, otto controlli su mapping/limiti/lingua/personaggi/bozze/URL, card reali renderizzate nella Home. Nessun deploy del nuovo sito effettuato. I requisiti degli altri blocchi Home rimangono da implementare.
