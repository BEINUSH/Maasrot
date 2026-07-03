import { useMemo, useState } from 'react';
import type { SearchResults } from '../lib/selectors';
import { searchEverything } from '../lib/selectors';
import { useDb } from './useDb';

export function useGlobalSearch() {
  const db = useDb();
  const [query, setQuery] = useState('');
  const results: SearchResults = useMemo(() => searchEverything(db, query), [db, query]);
  const hasResults =
    results.cadets.length > 0 || results.sessions.length > 0 || results.missions.length > 0;
  return { query, setQuery, results, hasResults };
}
