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
