import { repository } from '../lib/db/repository';
import { useDb } from './useDb';

export function useTrainingPlans() {
  const db = useDb();
  return {
    trainingWeeks: [...db.trainingWeeks].sort((a, b) => a.weekNumber - b.weekNumber),
    addTrainingWeek: repository.addTrainingWeek,
    updateTrainingWeek: repository.updateTrainingWeek,
    deleteTrainingWeek: repository.deleteTrainingWeek,
  };
}
