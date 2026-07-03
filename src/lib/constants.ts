import type {
  AttendanceStatus,
  FitnessLevel,
  MetricKey,
  NoteType,
  ScoreEventType,
  TeamId,
  TestPeriod,
  TrainingType,
} from '../types';

export const TEAMS: TeamId[] = [1, 2, 3];

interface TeamMeta {
  name: string;
  colorName: string;
  chartVar: string;
  badge: string;
  cardBorder: string;
  avatarGradient: string;
  dot: string;
}

export const TEAM_META: Record<TeamId, TeamMeta> = {
  1: {
    name: 'צוות 1',
    colorName: 'ירוק',
    chartVar: 'var(--chart-team-1)',
    badge: 'bg-team1/10 text-team1 border border-team1/30',
    cardBorder: 'border-s-team1',
    avatarGradient: 'from-green-600 to-emerald-800',
    dot: 'bg-team1',
  },
  2: {
    name: 'צוות 2',
    colorName: 'כחול',
    chartVar: 'var(--chart-team-2)',
    badge: 'bg-team2/10 text-team2 border border-team2/30',
    cardBorder: 'border-s-team2',
    avatarGradient: 'from-blue-500 to-indigo-700',
    dot: 'bg-team2',
  },
  3: {
    name: 'צוות 3',
    colorName: 'כתום',
    chartVar: 'var(--chart-team-3)',
    badge: 'bg-team3/10 text-team3 border border-team3/30',
    cardBorder: 'border-s-team3',
    avatarGradient: 'from-orange-500 to-amber-700',
    dot: 'bg-team3',
  },
};

export function teamLabel(team: TeamId): string {
  return `${TEAM_META[team].name} · ${TEAM_META[team].colorName}`;
}

export const FITNESS_LEVELS: FitnessLevel[] = ['A', 'B', 'C'];

interface LevelMeta {
  chartVar: string;
  badge: string;
  activeButton: string;
  dot: string;
}

export const LEVEL_META: Record<FitnessLevel, LevelMeta> = {
  A: {
    chartVar: 'var(--chart-lvl-a)',
    badge: 'bg-lvla/10 text-lvla border border-lvla/30',
    activeButton: 'bg-lvla text-white border-lvla',
    dot: 'bg-lvla',
  },
  B: {
    chartVar: 'var(--chart-lvl-b)',
    badge: 'bg-lvlb/10 text-lvlb border border-lvlb/30',
    activeButton: 'bg-lvlb text-white border-lvlb',
    dot: 'bg-lvlb',
  },
  C: {
    chartVar: 'var(--chart-lvl-c)',
    badge: 'bg-lvlc/10 text-lvlc border border-lvlc/30',
    activeButton: 'bg-lvlc text-white border-lvlc',
    dot: 'bg-lvlc',
  },
};

export const ATTENDANCE_STATUSES: AttendanceStatus[] = ['present', 'listener', 'medical', 'absent'];

export const STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'נוכח',
  listener: 'מאזין',
  medical: 'פטור רפואי',
  absent: 'נעדר',
};

export const STATUS_ACTIVE_CLASSES: Record<AttendanceStatus, string> = {
  present: 'bg-lvla text-white border-lvla',
  listener: 'bg-accent text-white border-accent',
  medical: 'bg-ink3 text-white border-ink3',
  absent: 'bg-lvlc text-white border-lvlc',
};

export const SCORE_TYPE_LABELS: Record<ScoreEventType, string> = {
  attendance: 'נוכחות',
  mission: 'משימת סופ"ש',
  improvement: 'שיפור',
  helping: 'עזרה לחברים',
  leadership: 'מנהיגות',
  excellence: 'ביצוע מצטיין',
  manual: 'ניקוד ידני',
};

export const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  coach: 'הערת מאמן',
  general: 'הערה כללית',
  medical: 'הערה רפואית',
  pain: 'הערת כאב',
};

export const TRAINING_TYPES: TrainingType[] = [
  'run',
  'intervals',
  'tempo',
  'strength',
  'mobility',
  'stretching',
];

export const TEST_PERIODS: TestPeriod[] = ['opening', 'mid', 'final'];

export const PERIOD_LABELS: Record<TestPeriod, string> = {
  opening: 'מבחן פתיחה',
  mid: 'מבחן אמצע',
  final: 'מבחן סיום',
};

export interface MetricMeta {
  key: MetricKey;
  label: string;
  isTime: boolean;
  lowerIsBetter: boolean;
}

export const METRICS: MetricMeta[] = [
  { key: 'run3kSeconds', label: 'ריצת 3 ק"מ', isTime: true, lowerIsBetter: true },
  { key: 'pushups', label: 'שכיבות סמיכה', isTime: false, lowerIsBetter: false },
  { key: 'pullups', label: 'עליות מתח', isTime: false, lowerIsBetter: false },
  { key: 'plankSeconds', label: 'פלאנק (שניות)', isTime: true, lowerIsBetter: false },
  { key: 'burpees', label: 'ברפיז', isTime: false, lowerIsBetter: false },
];
