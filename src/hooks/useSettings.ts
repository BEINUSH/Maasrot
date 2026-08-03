import { repository } from '../lib/db/repository';
import { useDb } from './useDb';

export function useSettings() {
  const db = useDb();
  return {
    settings: db.settings,
    updateSettings: repository.updateSettings,
    exportJson: repository.exportJson,
    importJson: repository.importJson,
    resetToSeed: repository.resetToSeed,
  };
}
