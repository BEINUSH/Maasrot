import type { Cadet } from '../types';
import { repository } from '../lib/db/repository';
import { useDb } from './useDb';

export function useCadets() {
  const db = useDb();
  return {
    cadets: db.cadets,
    getCadet: (id: string): Cadet | undefined => db.cadets.find((c) => c.id === id),
    addCadet: repository.addCadet,
    updateCadet: repository.updateCadet,
    deleteCadet: repository.deleteCadet,
  };
}
