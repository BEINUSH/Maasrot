import { repository } from '../lib/db/repository';
import { useDb } from './useDb';

export function useAttendance() {
  const db = useDb();
  return {
    sessions: db.sessions,
    attendance: db.attendance,
    addSession: repository.addSession,
    updateSession: repository.updateSession,
    deleteSession: repository.deleteSession,
    setAttendance: repository.setAttendance,
    removeAttendance: repository.removeAttendance,
    setAttendanceNote: repository.setAttendanceNote,
  };
}
