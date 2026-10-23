# Verifica infrastruttura esistente — 19 ottobre 2026

Verifica in sola lettura di repo legacy e header HTTP pubblici. Nessun accesso agli account provider e nessuna modifica a deploy/DNS.

| Componente | Evidenza | Conclusione |
|---|---|---|
| Frontend attuale | package.json legacy: Next 14.2.35/React18; risposta live della scheda Dove sei? con Server: Vercel e X-Vercel-Id | Frontend su Vercel confermato. Repo priva di manifest deploy/.vercel/CI: progetto/team/piano e collegamento Git non determinabili. automaticVercelMonitors nel config Sentry, da solo, non sarebbe prova dell'hosting. |
| Headless | API data.bradiboo.com live; next.config legacy autorizza wordpress-853088-3979771.cloudwaysapps.com | WordPress headless confermato; Cloudways è un riferimento storico concreto nella repo, non una conferma dell'attuale account/server. Header live nginx non identifica da solo il provider. |
| Media | Immagini WordPress (data.bradiboo.com e proxy i0.wp.com), file video ufs.sh | Asset già ospitati esternamente e riutilizzati. ufs.sh indica distribuzione UploadThing; nessuna configurazione/credenziale di gestione storage per i nuovi upload Payload nella repo. |
| Ecommerce | Client Shopify e variabili dominio/token previste nella repo | Integrazione precedente; non prova di un abbonamento attivo o di un servizio utile al DB Payload. Shop chiuso e richiesta Fillout confermati dall'utente. |
| Database Payload | Nessun adapter/connessione DB applicativo nella repo legacy; progetto attuale usa file SQLite locale | Non risulta un DB persistente pronto per Payload nei file verificati. Il database WordPress non va assunto riutilizzabile per Payload. |

## Risposte operative
1. **Applicazione Next + Payload:** l'hosting Vercel attuale è una base tecnicamente compatibile; possibilità concreta di riusare il progetto/account da verificare nel pannello. Non è necessario presumere un nuovo hosting frontend.
2. **Database:** scegliere/confermare un servizio persistente compatibile con l'adapter Payload (es. SQLite remoto/libSQL oppure Postgres). Il file locale bradiboo.db non è la configurazione da trasferire invariata in un runtime serverless.
3. **Upload Payload:** occorre storage persistente con adapter configurato. I media WordPress esistenti possono restare dove sono; questo non rende automaticamente persistente la cartella media del nuovo Payload.

Documentazione ufficiale verificata: https://payloadcms.com/docs/production/deployment e https://payloadcms.com/docs/database/sqlite . Per chiudere la verifica servono inventario del progetto Vercel (Storage/integrations/runtime/variabili per nome, senza esporre segreti) e conferma dei servizi già attivi. Nessun costo o piano dedotto dalla repo.

## Promemoria concordato — prima del deploy in produzione
L'utente chiede di recuperare tutte le informazioni necessarie per gestire il deploy, privilegiando i servizi già attivi. Riprendere questa attività quando si prepara la pubblicazione; non avviare deploy o creare servizi sulla sola base di questo promemoria.

Da verificare/raccogliere:
- Vercel: account/team e progetto del sito attuale, repo/branch collegati, build e install command, versione Node, domini/redirect, ambienti preview/produzione, integrazioni e servizi storage/database già attivi.
- Database Payload: servizio/adattatore scelto, connessioni per preview e produzione, migrazioni ripetibili, backup e trasferimento dei dati SQLite locali (incluso l'utente editoriale).
- Upload Payload: account/storage già disponibile (incluso UploadThing), adapter, permessi, URL pubblici e migrazione degli upload locali; mantenere dove appropriato gli asset remoti WordPress.
- Variabili d'ambiente: inventario per nome e ambiente, configurazione PAYLOAD_SECRET, DATABASE_URL, headless e destinazioni, disattivazione WIREFRAME_PREVIEW in produzione e auto-push schema; valori segreti esclusivamente nei secret manager/env dei servizi, non nei documenti o nella chat.
- WordPress: endpoint produzione, eventuali limiti/accessi di lettura; credenziali di scrittura soltanto se tale funzione sarà richiesta e autorizzata. Confermare che la produzione attuale non venga alterata dalla preparazione.
- Email applicative (se necessarie per inviti/reset password), URL di callback e collegamenti Fillout esistenti.
- Piano di pubblicazione: ambiente di staging, verifica contenuti/bozze/accessi, backup della produzione attuale, prova migrazione e possibilità di rollback, verifica domini e percorsi legacy.

Raccogliere prima i dati tramite repo, configurazioni e accessi già disponibili; chiedere all'utente soltanto ciò che manca. Questo è un promemoria nel progetto, non un'attività programmata o una richiesta di raccolta immediata delle credenziali.

## 23 ottobre 2026 — Errore runtime libSQL su Vercel
Il log runtime dell'utente mostra 42 messaggi riconducibili a `Cannot find module 'libsql'`, sulle richieste home e favicon. Next.js viene ora compilato; il driver SQLite, esternalizzato da withPayload, non viene risolto nella funzione distribuita.
Aggiunti `@libsql/client@0.14.0` e `libsql@0.4.7` come dipendenze dirette, identiche alle versioni già transitive dell'adapter Payload. Nessun aggiornamento di versione o modifica del database. Verifica artefatti con `node scripts/check-libsql-traces.mjs` dopo `pnpm build`.
Riferimenti: https://github.com/payloadcms/payload/issues/15079 e documentazione locale Next `serverExternalPackages`/`output`.
Questa correzione riguarda il pacchetto server, non la persistenza dei dati: database remoto, auth token, migrazione contenuti e storage media restano da confermare con l'utente.
Inclusi esplicitamente anche i binding nativi libSQL sotto la struttura pnpm tramite `outputFileTracingIncludes`: la prima verifica mostrava driver JS presente ma `.node` assente. Verificata build completa, trace di home/pagine/API Payload e query in memoria da un artefatto temporaneo costruito esclusivamente con i file elencati nella trace. Verifica locale macOS; il risultato del successivo deploy Linux Vercel resta da confermare.
Il pannello Vercel non è autenticato nel browser disponibile; l'utente non sa se sia stato predisposto un database remoto. Nessuna destinazione/credenziale DB inventata o modificata.

## 23 ottobre 2026 — Infrastruttura autorizzata e trasferita
- Progetto Vercel verificato: `in-the-middle/bradiboo-website`, repository GitHub `MikiInTheMiddle/Bradiboo-website`, branch `main`. DNS e dominio del sito precedente non modificati.
- Turso `bradiboo-website-db`, piano Starter: store `store_UWKf3ibbJvrBXLPG`, collegato a produzione/preview. Adapter SQLite configurato con `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN`; seed disabilitato in produzione.
- Backup SQLite prima del trasferimento e prima dei due campi tecnici media sotto `work/backups/` (ignorato da Git). Importazione transazionale: 19.949 istruzioni, integrità referenziale valida. Confronto completo delle righe nelle 185 tabelle; riconciliate anche 79 modifiche locali successive, senza DELETE e con controllo anti-sovrascrittura di eventuali modifiche remote.
- Vercel Blob `bradiboo-website-media`, store `store_FBA5yRNVhUxNq1AK`, regione fra1, **privato** su richiesta esplicita dell'utente. Verificati tutti i 113 file per dimensione. Accesso OIDC, nessun token statico. Development abilitato con consenso solo durante l'import e rimosso tramite trap EXIT; collegamenti finali produzione/preview.
- L'adapter Vercel Blob standard di Payload 3.90.2 espone solo `access: public`: usato quindi il plugin ufficiale cloud-storage con adapter privato e SDK Blob 2.8.2 (OIDC). Gli URL restano `/api/media/file/...`; Payload controlla accesso e pubblicazione prima dello streaming, anche per range audio. Cache risposta `private, no-store`.
- Accesso anonimo media limitato ai riferimenti nello schema di contenuti pubblicati, rispettando i rami nascosti e i moduli in bozza; editor autenticati possono gestire tutti i file. Test sul database di prova: 100 media referenziati pubblicamente, 13 privati. Nessun nuovo controllo editoriale richiesto al backoffice.
- Variabili produzione/preview: PAYLOAD_SECRET (segreto), PAYLOAD_SCHEMA_PUSH=false, WIREFRAME_PREVIEW=false, endpoint Braditime, variabili gestite Turso e BLOB_STORE_ID. Nessun valore segreto nei documenti o nel repository.
- I comandi di import/sync in scripts sono operazioni una tantum del primo rilascio, NON una sincronizzazione continua fra locale e produzione. Dopo il passaggio online la produzione diventa la sorgente dei contenuti.
- Restano da verificare: deploy Vercel Linux e risposta HTTP reale; i tentativi precedenti alla configurazione completa segnalavano un errore interno Vercel dopo la build.

### Verifiche remote e compatibilità builder
- Commit 8e2bcbc: Vercel compila e completa TypeScript, prerender e trace, ma fallisce durante `Deploying outputs`; API riporta `readyStateReason: The deployment failed because of an internal Vercel error`, nessun errorCode e zero output. Nessun middleware/proxy nella repo. Anche i due tentativi del commit precedente falliscono allo stesso punto.
- Verifiche dirette Payload→Turso: home, Braditriboo, Guarda, Shop e Studio caricano pagine pubblicate, blocchi e relazioni; accesso anonimo conferma 100 media referenziati e 13 privati. Tutti i controlli locali TypeScript/build passano.
- Tentativo mirato: svuotare NEXT_ADAPTER_PATH nel comando next build per usare il builder tradizionale Vercel, conservando compilazione e controllo TypeScript. Riferimento primario sul fallback del builder: https://github.com/vercel/next.js/issues/96657 . È un'ipotesi di compatibilità dell'adapter, non una diagnosi definitiva dell'errore interno. Build locale col comando aggiornato riuscita.
