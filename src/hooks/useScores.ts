import { repository } from '../lib/db/repository';
import { useDb } from './useDb';

export function useScores() {
  const db = useDb();
  return {
    scores: db.scores,
    addScoreEvent: repository.addScoreEvent,
    deleteScoreEvent: repository.deleteScoreEvent,
  };
}
