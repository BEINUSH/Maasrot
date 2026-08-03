import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ListTodo, Plus } from 'lucide-react';
import type { WeekendMission } from '../types';
import { useCadets } from '../hooks/useCadets';
import { useWeekendMissions } from '../hooks/useWeekendMissions';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { MissionCard } from '../components/weekendMissions/MissionCard';
import { MissionFormModal } from '../components/weekendMissions/MissionFormModal';

export function WeekendMissionsPage() {
  const { cadets } = useCadets();
  const { missions, deleteMission, setMissionCompletion } = useWeekendMissions();
  const [formOpen, setFormOpen] = useState(false);
  const [editingMission, setEditingMission] = useState<WeekendMission | undefined>(undefined);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('new')) {
      setEditingMission(undefined);
      setFormOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const remove = (mission: WeekendMission) => {
    if (window.confirm(`למחוק את המשימה "${mission.title}"? הניקוד שנצבר עליה יוסר.`)) {
      deleteMission(mission.id);
    }
  };

  return (
    <div>
      <PageHeader
        title='משימות סופ"ש'
        subtitle="משימות עצמאיות לסוף השבוע — השלמה מזכה בניקוד"
        actions={
          <Button
            icon={Plus}
            onClick={() => {
              setEditingMission(undefined);
              setFormOpen(true);
            }}
          >
            משימה חדשה
          </Button>
        }
      />

      {missions.length === 0 ? (
        <Card>
          <EmptyState icon={ListTodo} title="אין משימות" hint='לחץ על "משימה חדשה" כדי להוסיף' />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {missions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              cadets={cadets}
              onToggle={(cadetId, completed) => setMissionCompletion(mission.id, cadetId, completed)}
              onEdit={() => {
                setEditingMission(mission);
                setFormOpen(true);
              }}
              onDelete={() => remove(mission)}
            />
          ))}
        </div>
      )}

      <MissionFormModal open={formOpen} onClose={() => setFormOpen(false)} mission={editingMission} />
    </div>
  );
}
