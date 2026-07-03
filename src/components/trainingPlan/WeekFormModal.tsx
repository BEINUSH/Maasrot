import { useEffect, useState } from 'react';
import type { TrainingType, TrainingWeek } from '../../types';
import { TRAINING_TYPES } from '../../lib/constants';
import { addDays, todayISO } from '../../lib/date';
import { useSettings } from '../../hooks/useSettings';
import { useTrainingPlans } from '../../hooks/useTrainingPlans';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { NumberField, TextAreaField, TextField } from '../ui/Field';

interface WeekFormModalProps {
  open: boolean;
  onClose: () => void;
  week?: TrainingWeek;
  nextWeekNumber: number;
}

export function WeekFormModal({ open, onClose, week, nextWeekNumber }: WeekFormModalProps) {
  const { addTrainingWeek, updateTrainingWeek } = useTrainingPlans();
  const { settings } = useSettings();
  const [weekNumber, setWeekNumber] = useState(nextWeekNumber);
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState(addDays(todayISO(), 6));
  const [goals, setGoals] = useState('');
  const [types, setTypes] = useState<TrainingType[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) {
      setWeekNumber(week?.weekNumber ?? nextWeekNumber);
      setStartDate(week?.startDate ?? todayISO());
      setEndDate(week?.endDate ?? addDays(todayISO(), 6));
      setGoals(week?.goals ?? '');
      setTypes(week?.types ?? []);
      setNotes(week?.notes ?? '');
    }
  }, [open, week, nextWeekNumber]);

  const toggleType = (type: TrainingType) => {
    setTypes((current) =>
      current.includes(type) ? current.filter((t) => t !== type) : [...current, type],
    );
  };

  const save = () => {
    const payload = { weekNumber, startDate, endDate, goals: goals.trim(), types, notes: notes.trim() };
    if (week) {
      updateTrainingWeek(week.id, payload);
    } else {
      addTrainingWeek(payload);
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={week ? `עריכת שבוע ${week.weekNumber}` : 'שבוע אימונים חדש'}
      footer={
        <>
          <Button onClick={save}>{week ? 'שמירה' : 'הוספת שבוע'}</Button>
          <Button variant="ghost" onClick={onClose}>
            ביטול
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <NumberField label="מספר שבוע" value={weekNumber} onChange={setWeekNumber} />
        <TextField label="תאריך התחלה" type="date" dir="ltr" value={startDate} onChange={setStartDate} />
        <TextField label="תאריך סיום" type="date" dir="ltr" value={endDate} onChange={setEndDate} />
        <TextAreaField label="מטרות השבוע" value={goals} onChange={setGoals} rows={2} className="sm:col-span-3" />
        <div className="sm:col-span-3">
          <span className="block text-xs font-semibold text-ink2 mb-1.5">סוגי אימון</span>
          <div className="flex flex-wrap gap-2">
            {TRAINING_TYPES.map((type) => {
              const active = types.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleType(type)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                    active
                      ? 'bg-accent text-white border-accent'
                      : 'bg-surface2 text-ink2 border-line hover:border-accent/50'
                  }`}
                >
                  {settings.trainingTypeLabels[type]}
                </button>
              );
            })}
          </div>
        </div>
        <TextAreaField label="הערות חופשיות" value={notes} onChange={setNotes} className="sm:col-span-3" />
      </div>
    </Modal>
  );
}
