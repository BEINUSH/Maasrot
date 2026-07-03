import { repository } from '../lib/db/repository';
import { useDb } from './useDb';

export function useNotes(cadetId?: string) {
  const db = useDb();
  const notes = cadetId ? db.notes.filter((n) => n.cadetId === cadetId) : db.notes;
  return {
    notes: [...notes].sort((a, b) => b.date.localeCompare(a.date)),
    addNote: repository.addNote,
    deleteNote: repository.deleteNote,
  };
}
