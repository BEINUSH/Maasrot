import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import type { Cadet, WeekendMission } from '../../types';
import { missionProgressPercent } from '../../lib/selectors';
import { formatDate } from '../../lib/date';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';

interface MissionCardProps {
  mission: WeekendMission;
  cadets: Cadet[];
  onToggle: (cadetId: string, completed: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function MissionCard({ mission, cadets, onToggle, onEdit, onDelete }: MissionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const percent = missionProgressPercent(mission);
  const done = mission.completions.filter((c) => c.completed).length;

  const nameOf = (cadetId: string) => cadets.find((c) => c.id === cadetId)?.fullName ?? 'חניך שהוסר';

  return (
    <Card className="!p-0 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-bold text-lg">{mission.title}</h3>
            <div className="text-xs text-ink3 mt-0.5">{formatDate(mission.date)}</div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="sm" icon={Pencil} onClick={onEdit} aria-label="עריכה" />
            <Button variant="ghost" size="sm" icon={Trash2} onClick={onDelete} aria-label="מחיקה" className="!text-lvlc" />
          </div>
        </div>
        {mission.description && <p className="text-sm text-ink2 mt-2 whitespace-pre-line">{mission.description}</p>}
        {mission.videoUrl && (
          <a
            href={mission.videoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent mt-2 hover:underline"
          >
            <ExternalLink size={14} />
            סרטון הדרכה
          </a>
        )}
        <div className="flex items-center gap-3 mt-4">
          <ProgressBar value={percent} className="flex-1" colorVar="var(--chart-line-2)" />
          <span className="text-sm font-bold tabular-nums whitespace-nowrap">
            {done}/{mission.completions.length} · {percent}%
          </span>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center gap-1.5 text-sm font-semibold text-ink2 mt-3 hover:text-ink"
        >
          <motion.span animate={{ rotate: expanded ? 180 : 0 }}>
            <ChevronDown size={16} />
          </motion.span>
          רשימת השלמה
        </button>
      </div>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-line bg-surface2/50"
          >
            <ul className="max-h-72 overflow-y-auto divide-y divide-line">
              {mission.completions.map((completion) => (
                <li key={completion.cadetId}>
                  <button
                    type="button"
                    onClick={() => onToggle(completion.cadetId, !completion.completed)}
                    className="w-full flex items-center gap-3 px-5 py-3 text-start hover:bg-surface2 transition-colors"
                  >
                    <span
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                        completion.completed
                          ? 'bg-lvla border-lvla text-white'
                          : 'border-line bg-surface text-transparent'
                      }`}
                    >
                      <Check size={14} strokeWidth={3} />
                    </span>
                    <span className={`text-sm font-semibold ${completion.completed ? '' : 'text-ink2'}`}>
                      {nameOf(completion.cadetId)}
                    </span>
                    {completion.completed && completion.completedAt && (
                      <span className="ms-auto text-xs text-ink3 tabular-nums">
                        הושלם {formatDate(completion.completedAt)}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
