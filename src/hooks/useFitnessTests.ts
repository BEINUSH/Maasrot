import { repository } from '../lib/db/repository';
import { useDb } from './useDb';

export function useFitnessTests() {
  const db = useDb();
  return {
    fitnessTests: db.fitnessTests,
    upsertFitnessTest: repository.upsertFitnessTest,
  };
}
