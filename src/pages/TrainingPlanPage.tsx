import { useState } from 'react';
import { CalendarRange, ClipboardList, Pencil, Plus, Trash2 } from 'lucide-react';
import type { TrainingWeek } from '../types';
import { useTrainingPlans } from '../hooks/useTrainingPlans';
import { useSettings } from '../hooks/useSettings';
import { formatDate } from '../lib/date';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { WeekFormModal } from '../components/trainingPlan/WeekFormModal';

export function TrainingPlanPage() {
  const { trainingWeeks, deleteTrainingWeek } = useTrainingPlans();
  const { settings } = useSettings();
  const [formOpen, setFormOpen] = useState(false);
  const [editingWeek, setEditingWeek] = useState<TrainingWeek | undefined>(undefined);

  const nextWeekNumber = trainingWeeks.reduce((max, w) => Math.max(max, w.weekNumber), 0) + 1;

  const openNew = () => {
    setEditingWeek(undefined);
    setFormOpen(true);
  };

  const openEdit = (week: TrainingWeek) => {
    setEditingWeek(week);
    setFormOpen(true);
  };

  const remove = (week: TrainingWeek) => {
    if (window.confirm(`למחוק את שבוע ${week.weekNumber} מהתוכנית?`)) {
      deleteTrainingWeek(week.id);
    }
  };

  return (
    <div>
      <PageHeader
        title="תוכנית אימונים"
        subtitle="תכנון שבועי של מערך האימונים"
        actions={
          <Button icon={Plus} onClick={openNew}>
            שבוע חדש
          </Button>
        }
      />

      {trainingWeeks.length === 0 ? (
        <Card>
          <EmptyState icon={ClipboardList} title="אין שבועות בתוכנית" hint='לחץ על "שבוע חדש" כדי להתחיל לתכנן' />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {trainingWeeks.map((week) => (
            <Card key={week.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent to-accent2 text-white flex items-center justify-center font-extrabold">
                    {week.weekNumber}
                  </span>
                  <div>
                    <div className="font-bold">שבוע {week.weekNumber}</div>
                    <div className="text-xs text-ink3 flex items-center gap-1 tabular-nums">
                      <CalendarRange size={12} />
                      {formatDate(week.startDate)} – {formatDate(week.endDate)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="sm" icon={Pencil} onClick={() => openEdit(week)} aria-label="עריכה" />
                  <Button variant="ghost" size="sm" icon={Trash2} onClick={() => remove(week)} aria-label="מחיקה" className="!text-lvlc" />
                </div>
              </div>
              {week.goals && (
                <p className="text-sm text-ink2 mt-3">
                  <span className="font-bold text-ink">מטרות: </span>
                  {week.goals}
                </p>
              )}
              {week.types.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {week.types.map((type) => (
                    <Badge key={type} className="bg-accent/10 text-accent border border-accent/30">
                      {settings.trainingTypeLabels[type]}
                    </Badge>
                  ))}
                </div>
              )}
              {week.notes && <p className="text-xs text-ink3 mt-3 whitespace-pre-line">{week.notes}</p>}
            </Card>
          ))}
        </div>
      )}

      <WeekFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        week={editingWeek}
        nextWeekNumber={nextWeekNumber}
      />
    </div>
  );
}
