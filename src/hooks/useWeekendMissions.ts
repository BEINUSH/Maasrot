import { repository } from '../lib/db/repository';
import { useDb } from './useDb';

export function useWeekendMissions() {
  const db = useDb();
  return {
    missions: [...db.missions].sort((a, b) => b.date.localeCompare(a.date)),
    addMission: repository.addMission,
    updateMission: repository.updateMission,
    deleteMission: repository.deleteMission,
    setMissionCompletion: repository.setMissionCompletion,
  };
}
