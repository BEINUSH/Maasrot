import { useSyncExternalStore } from 'react';
import type { DbShape } from '../types';
import { repository } from '../lib/db/repository';

export function useDb(): DbShape {
  return useSyncExternalStore(repository.subscribe, repository.getSnapshot);
}
