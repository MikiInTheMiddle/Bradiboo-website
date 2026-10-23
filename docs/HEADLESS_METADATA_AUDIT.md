# Verifica metadati headless — 17 ottobre 2026

Verifica in sola lettura dell'headless `https://data.bradiboo.com/`. Nessuna modifica a WordPress, schema/dati Payload o selettori del sito.

## Dizionari centralizzati
Tutti gli endpoint qui sotto rispondono HTTP 200 senza autenticazione. Richieste con `?per_page=100&hide_empty=false`, totale da header X-WP-Total.

| Categoria | Endpoint | Termini |
|---|---|---:|
| Keyword | `/wp-json/wp/v2/keyword` | 61 |
| Tematiche | `/wp-json/wp/v2/topic` | 13 |
| Situazioni | `/wp-json/wp/v2/situation` | 14 |
| Life Skills | `/wp-json/wp/v2/life-skill` | 10 |
| Spazi | `/wp-json/wp/v2/place` | 2 |
| Strumenti | `/wp-json/wp/v2/tool` | 10 |
| Elementi | `/wp-json/wp/v2/element` | 23 |
| Tipologie attività | `/wp-json/wp/v2/activity-type` | 4 |

Ogni termine include ID numerico, slug, nome, descrizione, parent e count. Nomi con entità HTML vanno decodificati. Identità da preservare: taxonomy + term ID, non solo slug (Empatia esiste sia come topic sia come life-skill). Prevedere paginazione anche se oggi i totali sono inferiori a 100.

Non risultano tassonomie dedicate `emotion`/`emozioni` o `moment`/`momenti` nel registro `/wp-json/wp/v2/taxonomies`. Emozioni e concetti affini sono attualmente mescolati in topic (calma, tristezza, amicizia, empatia ecc.); Gestione delle emozioni è una Life Skill, non una singola emozione. I momenti d'uso sono rappresentati dalle Situazioni (dopo cena, dopo scuola, in attesa ecc.). Se “momenti” significa scene/still degli episodi, questa verifica non ha identificato una tassonomia dedicata.

## Associazioni già esposte
Endpoint custom `/wp-json/bradicore/v1/activity/all` (3 record), `/story/all` (2), `/boo/all` (1) espongono `postTaxonomy`: tax_keyword, tax_topic, tax_situation, tax_life-skill, tax_place, tax_tool, tax_activity-type, tax_element e materiali. Le query GraphQL della repo legacy richiedono gli stessi concetti con nomi camelCase; nessuna nuova interrogazione GraphQL necessaria per confermare gli elenchi REST.

Attenzione: nei tre record activity, tax_tool restituisce termini taxonomy=situation uguali a tax_situation: possibile bug di mapping del custom endpoint. Non usare quel campo senza controllo della taxonomy dei termini. I dizionari REST tool espongono invece strumenti corretti.

## Possibile integrazione successiva (non implementata)
WordPress resta fonte dei dizionari; Payload seleziona riferimenti sincronizzati/ricercabili per Contenuti, fascioni e ZAP!. Le associazioni dei video locali devono essere selezionate editorialmente: la disponibilità del dizionario non le genera automaticamente. La voce pubblica “Temi ed emozioni” può usare topic; valutare una tassonomia emotion separata soltanto se serve distinguere semanticamente le emozioni.

Risposte pubbliche di audit salvate in `work/api-audit/` (directory ignorata); nessun dato di autenticazione usato.
