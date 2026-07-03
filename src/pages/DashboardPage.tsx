import {
  Activity,
  CalendarCheck,
  CalendarDays,
  ClipboardCheck,
  Dumbbell,
  ListTodo,
  StickyNote,
  Timer,
  Trophy,
  Users,
} from 'lucide-react';
import { useDb } from '../hooks/useDb';
import {
  attendanceTrend,
  courseProgress,
  cumulativeScoreTrend,
  levelDistribution,
  metricAverage,
  overallAttendancePercent,
  recentActivity,
  teamDistribution,
  totalMissionsCompleted,
  totalScore,
} from '../lib/selectors';
import { formatDate, formatSeconds, hebrewToday } from '../lib/date';
import { FITNESS_LEVELS, LEVEL_META } from '../lib/constants';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { LevelDonut } from '../components/charts/LevelDonut';
import { TeamBar } from '../components/charts/TeamBar';
import { TrendLine } from '../components/charts/TrendLine';

const activityIcons = {
  session: CalendarDays,
  score: Trophy,
  note: StickyNote,
  mission: ListTodo,
};

export function DashboardPage() {
  const db = useDb();
  const progress = courseProgress(db.settings);
  const levels = levelDistribution(db.cadets);
  const avgRun = metricAverage(db, 'run3kSeconds');
  const avgPushups = metricAverage(db, 'pushups');
  const avgPullups = metricAverage(db, 'pullups');
  const avgPlank = metricAverage(db, 'plankSeconds');
  const activity = recentActivity(db, 8);

  return (
    <div>
      <PageHeader
        title={db.settings.appName}
        subtitle={`${db.settings.subtitle} · ${hebrewToday()}`}
      />

      <Card className="mb-6 bg-gradient-to-l from-accent/10 to-accent2/10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <div className="font-bold">התקדמות הקורס</div>
            <div className="text-xs text-ink3 mt-0.5">
              {formatDate(db.settings.courseStart)} – {formatDate(db.settings.courseEnd)}
            </div>
          </div>
          <div className="text-sm font-semibold text-ink2">
            עברו <span className="text-ink font-extrabold tabular-nums">{progress.daysPassed}</span> ימים · נותרו{' '}
            <span className="text-ink font-extrabold tabular-nums">{progress.daysLeft}</span> ימים ·{' '}
            <span className="text-accent font-extrabold tabular-nums">{progress.percent}%</span>
          </div>
        </div>
        <ProgressBar value={progress.percent} />
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard label="סה״כ חניכים" value={db.cadets.length} icon={Users} />
        <StatCard
          label="נוכחות כללית"
          value={overallAttendancePercent(db)}
          suffix="%"
          icon={CalendarCheck}
          tintVar="var(--chart-lvl-a)"
        />
        <StatCard label="סה״כ ניקוד" value={totalScore(db.scores)} icon={Trophy} tintVar="var(--chart-lvl-b)" />
        <StatCard
          label="משימות סופ״ש שהושלמו"
          value={totalMissionsCompleted(db.missions)}
          icon={ClipboardCheck}
          tintVar="var(--chart-line-2)"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard
          label="ממוצע 3 ק״מ"
          value={avgRun}
          formatter={formatSeconds}
          icon={Timer}
          hint={avgRun === undefined ? 'טרם הוזנו מבחנים' : 'דקות:שניות'}
        />
        <StatCard
          label="ממוצע שכיבות סמיכה"
          value={avgPushups}
          icon={Dumbbell}
          hint={avgPushups === undefined ? 'טרם הוזנו מבחנים' : undefined}
          tintVar="var(--chart-team-3)"
        />
        <StatCard
          label="ממוצע עליות מתח"
          value={avgPullups}
          icon={Activity}
          hint={avgPullups === undefined ? 'טרם הוזנו מבחנים' : undefined}
          tintVar="var(--chart-line-2)"
        />
        <StatCard
          label="ממוצע פלאנק"
          value={avgPlank}
          formatter={(v) => `${Math.round(v)} שנ׳`}
          icon={Timer}
          hint={avgPlank === undefined ? 'טרם הוזנו מבחנים' : undefined}
          tintVar="var(--accent-2, var(--accent))"
        />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {FITNESS_LEVELS.map((level) => (
          <Card key={level} className="!p-4 flex items-center gap-3">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ background: LEVEL_META[level].chartVar }} />
            <div>
              <div className="text-xl font-extrabold tabular-nums leading-tight">{levels[level]}</div>
              <div className="text-[11px] text-ink3 font-semibold">רמה {db.settings.levelLabels[level]}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card>
          <h3 className="font-bold mb-3">התפלגות רמות כושר</h3>
          <LevelDonut distribution={levels} labels={db.settings.levelLabels} total={db.cadets.length} />
        </Card>
        <Card>
          <h3 className="font-bold mb-3">חניכים לפי צוות</h3>
          <TeamBar distribution={teamDistribution(db.cadets)} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card>
          <h3 className="font-bold mb-3">מגמת נוכחות</h3>
          <TrendLine data={attendanceTrend(db)} colorVar="var(--chart-line-1)" suffix="%" domain={[0, 100]} />
        </Card>
        <Card>
          <h3 className="font-bold mb-3">ניקוד מצטבר</h3>
          <TrendLine data={cumulativeScoreTrend(db)} colorVar="var(--chart-line-2)" suffix=" נק'" />
        </Card>
      </div>

      <Card>
        <h3 className="font-bold mb-3">פעילות אחרונה</h3>
        <ul className="divide-y divide-line">
          {activity.map((item) => {
            const Icon = activityIcons[item.kind];
            return (
              <li key={item.id} className="flex items-center gap-3 py-3">
                <span className="w-9 h-9 rounded-xl bg-surface2 border border-line flex items-center justify-center text-accent shrink-0">
                  <Icon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold truncate">{item.title}</div>
                  <div className="text-xs text-ink3 truncate">{item.detail}</div>
                </div>
                <span className="text-xs text-ink3 tabular-nums shrink-0">{formatDate(item.date)}</span>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
