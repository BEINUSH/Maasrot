import { useEffect, useState } from 'react';
import type { Cadet, FitnessLevel, TeamId } from '../../types';
import { FITNESS_LEVELS, TEAMS, teamLabel } from '../../lib/constants';
import { todayISO } from '../../lib/date';
import { useCadets } from '../../hooks/useCadets';
import { useSettings } from '../../hooks/useSettings';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { CheckboxField, SelectField, TextAreaField, TextField } from '../ui/Field';

interface CadetFormModalProps {
  open: boolean;
  onClose: () => void;
  cadet?: Cadet;
}

type FormState = Omit<Cadet, 'id'>;

function emptyForm(): FormState {
  return {
    fullName: '',
    team: 1,
    fitnessLevel: 'B',
    trainingGroup: '',
    medicalProfile: '',
    restrictions: '',
    painNotes: '',
    exempt: false,
    phone: '',
    email: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    joinDate: todayISO(),
  };
}

export function CadetFormModal({ open, onClose, cadet }: CadetFormModalProps) {
  const { addCadet, updateCadet } = useCadets();
  const { settings } = useSettings();
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    if (open) {
      setForm(cadet ? { ...cadet } : emptyForm());
    }
  }, [open, cadet]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = () => {
    if (form.fullName.trim() === '') return;
    if (cadet) {
      updateCadet(cadet.id, form);
    } else {
      addCadet(form);
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={cadet ? `עריכת חניך – ${cadet.fullName}` : 'הוספת חניך חדש'}
      wide
      footer={
        <>
          <Button onClick={save} disabled={form.fullName.trim() === ''}>
            {cadet ? 'שמירת שינויים' : 'הוספת חניך'}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            ביטול
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="שם מלא" value={form.fullName} onChange={(v) => set('fullName', v)} required />
        <SelectField
          label="צוות"
          value={String(form.team)}
          onChange={(v) => set('team', Number(v) as TeamId)}
          options={TEAMS.map((t) => ({ value: String(t), label: teamLabel(t) }))}
        />
        <SelectField
          label="רמת כושר"
          value={form.fitnessLevel}
          onChange={(v) => set('fitnessLevel', v as FitnessLevel)}
          options={FITNESS_LEVELS.map((l) => ({ value: l, label: `${settings.levelLabels[l]} (${l})` }))}
        />
        <TextField label="קבוצת אימון" value={form.trainingGroup} onChange={(v) => set('trainingGroup', v)} />
        <TextField label="פרופיל רפואי" value={form.medicalProfile} onChange={(v) => set('medicalProfile', v)} />
        <TextField label="תאריך הצטרפות" type="date" dir="ltr" value={form.joinDate} onChange={(v) => set('joinDate', v)} />
        <TextAreaField
          label="הגבלות"
          value={form.restrictions}
          onChange={(v) => set('restrictions', v)}
          rows={2}
          className="sm:col-span-2"
        />
        <TextAreaField
          label="הערות כאב"
          value={form.painNotes}
          onChange={(v) => set('painNotes', v)}
          rows={2}
          className="sm:col-span-2"
        />
        <TextField label="טלפון" type="tel" dir="ltr" placeholder="05X-XXXXXXX" value={form.phone} onChange={(v) => set('phone', v)} />
        <TextField label='דוא"ל' type="email" dir="ltr" placeholder="name@example.com" value={form.email} onChange={(v) => set('email', v)} />
        <TextField
          label="איש קשר לחירום"
          value={form.emergencyContactName}
          onChange={(v) => set('emergencyContactName', v)}
        />
        <TextField
          label="טלפון איש קשר לחירום"
          type="tel"
          dir="ltr"
          placeholder="05X-XXXXXXX"
          value={form.emergencyContactPhone}
          onChange={(v) => set('emergencyContactPhone', v)}
        />
        <CheckboxField label="פטור מפעילות גופנית" checked={form.exempt} onChange={(v) => set('exempt', v)} className="sm:col-span-2" />
      </div>
    </Modal>
  );
}
