import { useEffect, useState } from 'react';
import type { TeamId, TrainingSession } from '../../types';
import { TEAMS, teamLabel } from '../../lib/constants';
import { todayISO } from '../../lib/date';
import { useAttendance } from '../../hooks/useAttendance';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { SelectField, TextAreaField, TextField } from '../ui/Field';

interface SessionFormModalProps {
  open: boolean;
  onClose: () => void;
  session?: TrainingSession;
  onSaved?: (id: string) => void;
}

export function SessionFormModal({ open, onClose, session, onSaved }: SessionFormModalProps) {
  const { addSession, updateSession } = useAttendance();
  const [name, setName] = useState('');
  const [date, setDate] = useState(todayISO());
  const [description, setDescription] = useState('');
  const [team, setTeam] = useState<string>('all');

  useEffect(() => {
    if (open) {
      setName(session?.name ?? '');
      setDate(session?.date ?? todayISO());
      setDescription(session?.description ?? '');
      setTeam(session?.team ? String(session.team) : 'all');
    }
  }, [open, session]);

  const save = () => {
    if (name.trim() === '') return;
    const payload = {
      name: name.trim(),
      date,
      description: description.trim() || undefined,
      team: team === 'all' ? undefined : (Number(team) as TeamId),
    };
    if (session) {
      updateSession(session.id, payload);
      onSaved?.(session.id);
    } else {
      const created = addSession(payload);
      onSaved?.(created.id);
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={session ? 'עריכת מפגש אימון' : 'מפגש אימון חדש'}
      footer={
        <>
          <Button onClick={save} disabled={name.trim() === ''}>
            {session ? 'שמירה' : 'יצירת מפגש'}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            ביטול
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="שם המפגש" value={name} onChange={setName} required className="sm:col-span-2" />
        <TextField label="תאריך" type="date" dir="ltr" value={date} onChange={setDate} />
        <SelectField
          label="שיוך"
          value={team}
          onChange={setTeam}
          options={[
            { value: 'all', label: 'כל הפלוגה' },
            ...TEAMS.map((t) => ({ value: String(t), label: teamLabel(t) })),
          ]}
        />
        <TextAreaField
          label="תיאור (אופציונלי)"
          value={description}
          onChange={setDescription}
          className="sm:col-span-2"
        />
      </div>
    </Modal>
  );
}
