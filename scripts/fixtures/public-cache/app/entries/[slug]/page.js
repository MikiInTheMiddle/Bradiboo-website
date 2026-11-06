import {notFound} from 'next/navigation';
import {readEntry} from '../../../lib/entries';
export const dynamic='error';
export const revalidate=false;
export const dynamicParams=true;
export function generateStaticParams(){return [{slug:'one'},{slug:'two'}]}
export default async function Page({params}){const {slug}=await params;const value=await readEntry(slug);if(!value)notFound();return <h1>{value}</h1>}
