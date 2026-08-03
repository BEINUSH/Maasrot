import { useEffect, useState } from 'react';
import type { WeekendMission } from '../../types';
import { todayISO } from '../../lib/date';
import { useWeekendMissions } from '../../hooks/useWeekendMissions';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { TextAreaField, TextField } from '../ui/Field';

interface MissionFormModalProps {
  open: boolean;
  onClose: () => void;
  mission?: WeekendMission;
}

export function MissionFormModal({ open, onClose, mission }: MissionFormModalProps) {
  const { addMission, updateMission } = useWeekendMissions();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [date, setDate] = useState(todayISO());

  useEffect(() => {
    if (open) {
      setTitle(mission?.title ?? '');
      setDescription(mission?.description ?? '');
      setVideoUrl(mission?.videoUrl ?? '');
      setDate(mission?.date ?? todayISO());
    }
  }, [open, mission]);

  const save = () => {
    if (title.trim() === '') return;
    const payload = {
      title: title.trim(),
      description: description.trim(),
      videoUrl: videoUrl.trim() || undefined,
      date,
    };
    if (mission) {
      updateMission(mission.id, payload);
    } else {
      addMission(payload);
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mission ? 'עריכת משימת סופ"ש' : 'משימת סופ"ש חדשה'}
      footer={
        <>
          <Button onClick={save} disabled={title.trim() === ''}>
            {mission ? 'שמירה' : 'יצירת משימה'}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            ביטול
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4">
        <TextField label="כותרת" value={title} onChange={setTitle} required />
        <TextAreaField label="תיאור" value={description} onChange={setDescription} />
        <TextField
          label="קישור לסרטון הדרכה (אופציונלי)"
          type="url"
          dir="ltr"
          placeholder="https://…"
          value={videoUrl}
          onChange={setVideoUrl}
        />
        <TextField label="תאריך" type="date" dir="ltr" value={date} onChange={setDate} />
      </div>
    </Modal>
  );
}
