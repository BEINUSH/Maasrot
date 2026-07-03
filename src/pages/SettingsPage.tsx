import { useRef, useState } from 'react';
import { Download, RotateCcw, Save, Upload } from 'lucide-react';
import type { AppSettings, FitnessLevel, ScoringRules, TrainingType } from '../types';
import { FITNESS_LEVELS, STATUS_LABELS, TRAINING_TYPES } from '../lib/constants';
import { todayISO } from '../lib/date';
import { downloadJson } from '../lib/export';
import { useSettings } from '../hooks/useSettings';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { NumberField, TextField } from '../components/ui/Field';
import { CloudSyncCard } from '../components/settings/CloudSyncCard';

const SCORING_LABELS: Record<keyof ScoringRules, string> = {
  present: `נוכחות (${STATUS_LABELS.present})`,
  listener: `${STATUS_LABELS.listener}`,
  medical: `${STATUS_LABELS.medical}`,
  absent: `${STATUS_LABELS.absent}`,
  mission: 'משימת סופ"ש',
  improvement: 'שיפור',
  helping: 'עזרה לחברים',
  leadership: 'מנהיגות',
  excellence: 'ביצוע מצטיין',
};

export function SettingsPage() {
  const { settings, updateSettings, exportJson, importJson, resetToSeed } = useSettings();
  const [draft, setDraft] = useState<AppSettings>(() => JSON.parse(JSON.stringify(settings)) as AppSettings);
  const [savedFlash, setSavedFlash] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const save = () => {
    updateSettings(draft);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
  };

  const onImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importJson(String(reader.result));
      if (ok) {
        window.alert('הנתונים יובאו בהצלחה. רענן את העמוד אם משהו לא מתעדכן.');
        window.location.reload();
      } else {
        window.alert('קובץ לא תקין — הייבוא בוטל.');
      }
    };
    reader.readAsText(file);
  };

  const reset = () => {
    if (window.confirm('לאפס את כל הנתונים לנתוני הדמו המקוריים? פעולה זו תמחק את כל השינויים.')) {
      resetToSeed();
      window.location.reload();
    }
  };

  return (
    <div>
      <PageHeader
        title="הגדרות"
        subtitle="פרטי קורס, כללי ניקוד, תוויות וגיבוי"
        actions={
          <Button icon={Save} onClick={save}>
            {savedFlash ? 'נשמר ✓' : 'שמירת כל ההגדרות'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-bold mb-4">פרטי קורס</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="שם האפליקציה" value={draft.appName} onChange={(v) => set('appName', v)} />
            <TextField label="כותרת משנה" value={draft.subtitle} onChange={(v) => set('subtitle', v)} />
            <TextField label="שם מנהל המערכת" value={draft.managerName} onChange={(v) => set('managerName', v)} />
            <TextField label="תפקיד" value={draft.managerRole} onChange={(v) => set('managerRole', v)} />
            <TextField label="תחילת קורס" type="date" dir="ltr" value={draft.courseStart} onChange={(v) => set('courseStart', v)} />
            <TextField label="סיום קורס" type="date" dir="ltr" value={draft.courseEnd} onChange={(v) => set('courseEnd', v)} />
          </div>
        </Card>

        <Card>
          <h3 className="font-bold mb-4">כללי ניקוד</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {(Object.keys(SCORING_LABELS) as (keyof ScoringRules)[]).map((key) => (
              <NumberField
                key={key}
                label={SCORING_LABELS[key]}
                value={draft.scoring[key]}
                onChange={(v) => set('scoring', { ...draft.scoring, [key]: v })}
              />
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-bold mb-4">תוויות רמות כושר</h3>
          <div className="grid grid-cols-3 gap-4">
            {FITNESS_LEVELS.map((level: FitnessLevel) => (
              <TextField
                key={level}
                label={`רמה ${level}`}
                value={draft.levelLabels[level]}
                onChange={(v) => set('levelLabels', { ...draft.levelLabels, [level]: v })}
              />
            ))}
          </div>
          <h3 className="font-bold mt-6 mb-4">תוויות סוגי אימון</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {TRAINING_TYPES.map((type: TrainingType) => (
              <TextField
                key={type}
                label={type}
                value={draft.trainingTypeLabels[type]}
                onChange={(v) => set('trainingTypeLabels', { ...draft.trainingTypeLabels, [type]: v })}
              />
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-bold mb-4">גיבוי ושחזור</h3>
          <p className="text-sm text-ink2 mb-4">
            הנתונים נשמרים מקומית בדפדפן (LocalStorage). מומלץ לייצא גיבוי JSON מעת לעת.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              icon={Download}
              onClick={() => downloadJson(`platoon-fitness-backup-${todayISO()}.json`, exportJson())}
            >
              ייצוא גיבוי (JSON)
            </Button>
            <Button variant="secondary" icon={Upload} onClick={() => fileInputRef.current?.click()}>
              ייבוא מקובץ JSON
            </Button>
            <Button variant="danger" icon={RotateCcw} onClick={reset}>
              איפוס לנתוני דמו
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImportFile(file);
              e.target.value = '';
            }}
          />
        </Card>

        <CloudSyncCard />
      </div>
    </div>
  );
}
