import type { TeamId } from '../../types';
import { TEAM_META } from '../../lib/constants';

interface AvatarProps {
  name: string;
  team: TeamId;
  size?: 'md' | 'lg';
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2);
  return `${parts[0][0]}״${parts[parts.length - 1][0]}`;
}

export function Avatar({ name, team, size = 'md' }: AvatarProps) {
  const sizeClasses = size === 'lg' ? 'w-16 h-16 text-xl' : 'w-11 h-11 text-sm';
  return (
    <span
      className={`${sizeClasses} shrink-0 rounded-full bg-gradient-to-br ${TEAM_META[team].avatarGradient} text-white font-bold flex items-center justify-center shadow-sm`}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
