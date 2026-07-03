import { useSyncExternalStore } from 'react';
import type { CloudAuthState } from '../lib/db/repository';
import { repository } from '../lib/db/repository';

export function useCloudAuth(): CloudAuthState {
  return useSyncExternalStore(repository.cloud.subscribe, repository.cloud.getSnapshot);
}
