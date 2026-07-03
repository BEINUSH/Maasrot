import { useEffect, useState } from 'react';
import type { ScoreEventType } from '../../types';
import { SCORE_TYPE_LABELS } from '../../lib/constants';
import { todayISO } from '../../lib/date';
import { useCadets } from '../../hooks/useCadets';
import { useScores } from '../../hooks/useScores';
import { useSettings } from '../../hooks/useSettings';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { NumberField, SelectField, TextField } from '../ui/Field';

interface AddScoreModalProps {
  open: boolean;
  onClose: () => void;
  initialCadetId?: string;
}

const MANUAL_TYPES: ScoreEventType[] = ['helping', 'leadership', 'excellence', 'improvement', 'manual'];

export function AddScoreModal({ open, onClose, initialCadetId }: AddScoreModalProps) {
  const { cadets } = useCadets();
  const { addScoreEvent } = useScores();
  const { settings } = useSettings();

  const defaultPoints = (type: ScoreEventType): number => {
    switch (type) {
      case 'helping':
        return settings.scoring.helping;
      case 'leadership':
        return settings.scoring.leadership;
      case 'excellence':
        return settings.scoring.excellence;
      case 'improvement':
        return settings.scoring.improvement;
      default:
        return 5;
    }
  };

  const [cadetId, setCadetId] = useState('');
  const [type, setType] = useState<ScoreEventType>('helping');
  const [points, setPoints] = useState(defaultPoints('helping'));
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayISO());

  useEffect(() => {
    if (open) {
      setCadetId(initialCadetId ?? cadets[0]?.id ?? '');
      setType('helping');
      setPoints(defaultPoints('helping'));
      setNote('');
      setDate(todayISO());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialCadetId]);

  const changeType = (next: ScoreEventType) => {
    setType(next);
    setPoints(defaultPoints(next));
  };

  const save = () => {
    if (cadetId === '') return;
    addScoreEvent({ cadetId, type, points, note: note.trim() || undefined, date });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="הוספת ניקוד ידני"
      footer={
        <>
          <Button onClick={save} disabled={cadetId === ''}>
            הוספת ניקוד
          </Button>
          <Button variant="ghost" onClick={onClose}>
            ביטול
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField
          label="חניך"
          value={cadetId}
          onChange={setCadetId}
          options={cadets.map((c) => ({ value: c.id, label: c.fullName }))}
          className="sm:col-span-2"
        />
        <SelectField
          label="סוג אירוע"
          value={type}
          onChange={(v) => changeType(v as ScoreEventType)}
          options={MANUAL_TYPES.map((t) => ({ value: t, label: SCORE_TYPE_LABELS[t] }))}
        />
        <NumberField label="נקודות" value={points} onChange={setPoints} />
        <TextField label="תאריך" type="date" dir="ltr" value={date} onChange={setDate} />
        <TextField label="הערה" value={note} onChange={setNote} />
      </div>
    </Modal>
  );
}
