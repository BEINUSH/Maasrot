import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import type { Cadet, FitnessLevel } from '../../types';
import { LEVEL_META, TEAM_META, teamLabel } from '../../lib/constants';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';

interface CadetCardProps {
  cadet: Cadet;
  score: number;
  attendancePercent: number;
  levelLabels: Record<FitnessLevel, string>;
}

export function CadetCard({ cadet, score, attendancePercent, levelLabels }: CadetCardProps) {
  const team = TEAM_META[cadet.team];
  const level = LEVEL_META[cadet.fitnessLevel];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -3 }}
    >
      <Link
        to={`/cadets/${cadet.id}`}
        className={`card block p-4 border-s-4 ${team.cardBorder} hover:shadow-md transition-shadow`}
      >
        <div className="flex items-center gap-3">
          <Avatar name={cadet.fullName} team={cadet.team} />
          <div className="min-w-0 flex-1">
            <div className="font-bold truncate flex items-center gap-1.5">
              {cadet.fullName}
              {cadet.exempt && <ShieldAlert size={14} className="text-lvlc shrink-0" aria-label="פטור" />}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <Badge className={team.badge}>{teamLabel(cadet.team)}</Badge>
              <Badge className={level.badge}>{levelLabels[cadet.fitnessLevel]}</Badge>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4 text-center">
          <div className="rounded-xl bg-surface2 py-2">
            <div className="text-lg font-extrabold tabular-nums">{score}</div>
            <div className="text-[11px] text-ink3 font-semibold">ניקוד</div>
          </div>
          <div className="rounded-xl bg-surface2 py-2">
            <div className="text-lg font-extrabold tabular-nums">{attendancePercent}%</div>
            <div className="text-[11px] text-ink3 font-semibold">נוכחות</div>
          </div>
        </div>
        <ProgressBar value={attendancePercent} colorVar={team.chartVar} className="mt-3" />
      </Link>
    </motion.div>
  );
}
