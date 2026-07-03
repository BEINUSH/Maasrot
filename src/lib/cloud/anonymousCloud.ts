import type { DbShape } from '../../types';

const STORE_ID_KEY = 'platoon-fitness-anon-sync-id';
const API_BASE = 'https://jsonblob.com/api/jsonBlob';

export function loadAnonymousSyncId(): string | undefined {
  return localStorage.getItem(STORE_ID_KEY) ?? undefined;
}

export function saveAnonymousSyncId(id: string): void {
  localStorage.setItem(STORE_ID_KEY, id);
}

export function clearAnonymousSyncId(): void {
  localStorage.removeItem(STORE_ID_KEY);
}

/**
 * jsonblob.com needs no signup/API key: POST creates a blob and returns
 * its id in the Location header, GET/PUT read and overwrite it, and it
 * serves permissive CORS so a static site can call it directly. There is
 * no authentication — the id itself is the only thing standing between
 * anyone and the data, which is the deliberate, explicitly-accepted
 * trade-off of "zero setup" sync.
 */
export async function createAnonymousStore(initial: DbShape): Promise<string> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(initial),
  });
  if (!res.ok) throw new Error(`יצירת מסד נתונים משותף נכשלה (${res.status})`);
  const location = res.headers.get('Location') ?? '';
  const id = location.split('/').pop();
  if (!id) throw new Error('לא התקבל מזהה ממסד הנתונים המשותף');
  return id;
}

export async function fetchAnonymousStore(id: string): Promise<DbShape> {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error(`קריאת הנתונים המשותפים נכשלה (${res.status})`);
  return (await res.json()) as DbShape;
}

export async function writeAnonymousStore(id: string, next: DbShape): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(next),
  });
  if (!res.ok) throw new Error(`שמירת הנתונים המשותפים נכשלה (${res.status})`);
}

export function shareLinkFor(id: string): string {
  const url = new URL(window.location.href);
  url.hash = '/';
  url.searchParams.set('sync', id);
  return url.toString();
}

export function readSyncIdFromUrl(): string | undefined {
  return new URL(window.location.href).searchParams.get('sync') ?? undefined;
}
