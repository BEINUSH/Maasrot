import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Search, UserPlus, Users } from 'lucide-react';
import type { FitnessLevel } from '../types';
import { useDb } from '../hooks/useDb';
import { cadetAttendanceStats, totalScoreFor } from '../lib/selectors';
import { FITNESS_LEVELS } from '../lib/constants';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { TeamFilter } from '../components/ui/TeamFilter';
import { EmptyState } from '../components/ui/EmptyState';
import { CadetCard } from '../components/cadets/CadetCard';
import { CadetFormModal } from '../components/cadets/CadetFormModal';
import type { TeamId } from '../types';

type SortKey = 'score' | 'attendance' | 'name';

export function CadetsPage() {
  const db = useDb();
  const [teamFilter, setTeamFilter] = useState<TeamId | 'all'>('all');
  const [levelFilter, setLevelFilter] = useState<FitnessLevel | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('new')) {
      setFormOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const rows = useMemo(() => {
    const enriched = db.cadets.map((cadet) => ({
      cadet,
      score: totalScoreFor(db.scores, cadet.id),
      attendancePercent: cadetAttendanceStats(db, cadet.id).percent,
    }));
    const filtered = enriched.filter(
      (r) =>
        (teamFilter === 'all' || r.cadet.team === teamFilter) &&
        (levelFilter === 'all' || r.cadet.fitnessLevel === levelFilter) &&
        (query.trim() === '' || r.cadet.fullName.includes(query.trim())),
    );
    filtered.sort((a, b) => {
      if (sortKey === 'score') return b.score - a.score;
      if (sortKey === 'attendance') return b.attendancePercent - a.attendancePercent;
      return a.cadet.fullName.localeCompare(b.cadet.fullName, 'he');
    });
    return filtered;
  }, [db, teamFilter, levelFilter, sortKey, query]);

  return (
    <div>
      <PageHeader
        title="חניכים"
        subtitle={`${db.cadets.length} חניכים בפלוגה`}
        actions={
          <Button icon={UserPlus} onClick={() => setFormOpen(true)}>
            הוספת חניך
          </Button>
        }
      />

      <div className="card p-4 mb-6 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <TeamFilter value={teamFilter} onChange={setTeamFilter} />
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setLevelFilter('all')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                levelFilter === 'all' ? 'bg-ink text-page border-ink' : 'bg-surface text-ink2 border-line'
              }`}
            >
              כל הרמות
            </button>
            {FITNESS_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setLevelFilter(level)}
                className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                  levelFilter === level ? 'bg-ink text-page border-ink' : 'bg-surface text-ink2 border-line'
                }`}
              >
                {db.settings.levelLabels[level]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-52">
            <Search size={15} className="absolute top-1/2 -translate-y-1/2 right-3 text-ink3 pointer-events-none" />
            <input
              className="input-base"
              style={{ paddingInlineStart: '2.25rem' }}
              placeholder="חיפוש לפי שם…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            className="input-base !w-auto"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
          >
            <option value="score">מיון לפי ניקוד</option>
            <option value="attendance">מיון לפי נוכחות</option>
            <option value="name">מיון לפי שם</option>
          </select>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={Users} title="לא נמצאו חניכים" hint="נסה לשנות את הסינון או החיפוש" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {rows.map((row) => (
              <CadetCard
                key={row.cadet.id}
                cadet={row.cadet}
                score={row.score}
                attendancePercent={row.attendancePercent}
                levelLabels={db.settings.levelLabels}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <CadetFormModal open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}
