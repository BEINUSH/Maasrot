import { useSyncExternalStore } from 'react';
import type { SyncState } from '../lib/db/repository';
import { repository } from '../lib/db/repository';

export function useCloudAuth(): SyncState {
  return useSyncExternalStore(repository.cloud.subscribe, repository.cloud.getSnapshot);
}
