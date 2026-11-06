import {createHash} from 'node:crypto';
/** Shared vocabulary for cache reads and Payload write hooks. No user/session data. */
export const PUBLIC_CONTENT_TAG='bradiboo-public-content-v1';
export const PUBLIC_NAVIGATION_GROUPS_TAG='bradiboo-navigation-groups-v2';
export const PUBLIC_HIERARCHY_TAG='bradiboo-public-hierarchy-v2';
export const collectionTag=(slug:string)=>`bradiboo:collection:${slug}`;
export const globalTag=(slug:string)=>`bradiboo:global:${slug}`;
// Hash long or Unicode paths to stay below Next's 256-character tag limit.
export function pageTag(path:string){return `bradiboo:page:${createHash('sha256').update(path).digest('hex')}`;}
