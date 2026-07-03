import type { TeamId } from '../../types';
import { TEAMS, TEAM_META } from '../../lib/constants';

interface TeamFilterProps {
  value: TeamId | 'all';
  onChange: (value: TeamId | 'all') => void;
}

export function TeamFilter({ value, onChange }: TeamFilterProps) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      <button
        type="button"
        onClick={() => onChange('all')}
        className={`px-3.5 py-2 rounded-xl text-sm font-semibold border transition-colors ${
          value === 'all'
            ? 'bg-ink text-page border-ink'
            : 'bg-surface text-ink2 border-line hover:border-ink3'
        }`}
      >
        הכל
      </button>
      {TEAMS.map((team) => {
        const active = value === team;
        const meta = TEAM_META[team];
        return (
          <button
            key={team}
            type="button"
            onClick={() => onChange(team)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold border transition-colors ${
              active ? 'text-white border-transparent' : 'bg-surface text-ink2 border-line hover:border-ink3'
            }`}
            style={active ? { background: meta.chartVar } : undefined}
          >
            <span className={`w-2 h-2 rounded-full ${active ? 'bg-white/80' : meta.dot}`} />
            {meta.name}
          </button>
        );
      })}
    </div>
  );
}
