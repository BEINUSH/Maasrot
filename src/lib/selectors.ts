import type {
  AppSettings,
  AttendanceRecord,
  Cadet,
  DbShape,
  FitnessLevel,
  FitnessTestResult,
  MetricKey,
  ScoreEvent,
  TeamId,
  TestPeriod,
  WeekendMission,
} from '../types';
import { TEST_PERIODS } from './constants';
import { daysBetween, formatDate, todayISO } from './date';

export interface AttendanceStats {
  present: number;
  listener: number;
  medical: number;
  absent: number;
  total: number;
  percent: number;
}

export function attendanceStats(records: AttendanceRecord[]): AttendanceStats {
  const stats = { present: 0, listener: 0, medical: 0, absent: 0 };
  records.forEach((r) => {
    stats[r.status] += 1;
  });
  const counted = stats.present + stats.listener + stats.absent;
  return {
    ...stats,
    total: records.length,
    percent: counted === 0 ? 100 : Math.round(((stats.present + stats.listener) / counted) * 100),
  };
}

export function cadetAttendanceStats(db: DbShape, cadetId: string): AttendanceStats {
  return attendanceStats(db.attendance.filter((a) => a.cadetId === cadetId));
}

export function sessionAttendanceStats(db: DbShape, sessionId: string): AttendanceStats {
  return attendanceStats(db.attendance.filter((a) => a.sessionId === sessionId));
}

export function overallAttendancePercent(db: DbShape): number {
  return attendanceStats(db.attendance).percent;
}

export function totalScoreFor(scores: ScoreEvent[], cadetId: string): number {
  return scores.filter((s) => s.cadetId === cadetId).reduce((sum, s) => sum + s.points, 0);
}

export function totalScore(scores: ScoreEvent[]): number {
  return scores.reduce((sum, s) => sum + s.points, 0);
}

export function levelDistribution(cadets: Cadet[]): Record<FitnessLevel, number> {
  const dist: Record<FitnessLevel, number> = { A: 0, B: 0, C: 0 };
  cadets.forEach((c) => {
    dist[c.fitnessLevel] += 1;
  });
  return dist;
}

export function teamDistribution(cadets: Cadet[]): Record<TeamId, number> {
  const dist: Record<TeamId, number> = { 1: 0, 2: 0, 3: 0 };
  cadets.forEach((c) => {
    dist[c.team] += 1;
  });
  return dist;
}

export interface CourseProgress {
  totalDays: number;
  daysPassed: number;
  daysLeft: number;
  percent: number;
}

export function courseProgress(settings: AppSettings, today = todayISO()): CourseProgress {
  const totalDays = Math.max(1, daysBetween(settings.courseStart, settings.courseEnd));
  const passed = Math.min(totalDays, Math.max(0, daysBetween(settings.courseStart, today)));
  return {
    totalDays,
    daysPassed: passed,
    daysLeft: totalDays - passed,
    percent: Math.round((passed / totalDays) * 100),
  };
}

export function testFor(
  tests: FitnessTestResult[],
  cadetId: string,
  period: TestPeriod,
): FitnessTestResult | undefined {
  return tests.find((t) => t.cadetId === cadetId && t.period === period);
}

function latestValue(tests: FitnessTestResult[], cadetId: string, key: MetricKey): number | undefined {
  for (const period of [...TEST_PERIODS].reverse()) {
    const value = testFor(tests, cadetId, period)?.[key];
    if (value !== undefined) return value;
  }
  return undefined;
}

export function metricAverage(db: DbShape, key: MetricKey): number | undefined {
  const values = db.cadets
    .map((c) => latestValue(db.fitnessTests, c.id, key))
    .filter((v): v is number => v !== undefined);
  if (values.length === 0) return undefined;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export type Trend = 'up' | 'down' | 'same';

export function metricTrend(
  first: number | undefined,
  last: number | undefined,
  lowerIsBetter: boolean,
): Trend | undefined {
  if (first === undefined || last === undefined) return undefined;
  if (first === last) return 'same';
  const improved = lowerIsBetter ? last < first : last > first;
  return improved ? 'up' : 'down';
}

export interface MetricComparison {
  key: MetricKey;
  opening?: number;
  mid?: number;
  final?: number;
  trend?: Trend;
}

export function cadetMetricComparisons(db: DbShape, cadetId: string, keys: { key: MetricKey; lowerIsBetter: boolean }[]): MetricComparison[] {
  return keys.map(({ key, lowerIsBetter }) => {
    const values: Record<TestPeriod, number | undefined> = {
      opening: testFor(db.fitnessTests, cadetId, 'opening')?.[key],
      mid: testFor(db.fitnessTests, cadetId, 'mid')?.[key],
      final: testFor(db.fitnessTests, cadetId, 'final')?.[key],
    };
    const series = TEST_PERIODS.map((p) => values[p]).filter((v): v is number => v !== undefined);
    return {
      key,
      opening: values.opening,
      mid: values.mid,
      final: values.final,
      trend:
        series.length >= 2
          ? metricTrend(series[0], series[series.length - 1], lowerIsBetter)
          : undefined,
    };
  });
}

export function run3kImprovementSeconds(db: DbShape, cadetId: string): number | undefined {
  const opening = testFor(db.fitnessTests, cadetId, 'opening')?.run3kSeconds;
  const final = testFor(db.fitnessTests, cadetId, 'final')?.run3kSeconds;
  if (opening === undefined || final === undefined) return undefined;
  return opening - final;
}

export function missionsCompletedBy(missions: WeekendMission[], cadetId: string): number {
  return missions.reduce(
    (count, m) => count + (m.completions.some((c) => c.cadetId === cadetId && c.completed) ? 1 : 0),
    0,
  );
}

export function totalMissionsCompleted(missions: WeekendMission[]): number {
  return missions.reduce((count, m) => count + m.completions.filter((c) => c.completed).length, 0);
}

export function missionProgressPercent(mission: WeekendMission): number {
  if (mission.completions.length === 0) return 0;
  const done = mission.completions.filter((c) => c.completed).length;
  return Math.round((done / mission.completions.length) * 100);
}

export interface LeaderboardRow {
  rank: number;
  cadet: Cadet;
  score: number;
  attendancePercent: number;
  improvementSeconds?: number;
  missionsCompleted: number;
}

export function leaderboard(db: DbShape): LeaderboardRow[] {
  const rows = db.cadets.map((cadet) => ({
    cadet,
    score: totalScoreFor(db.scores, cadet.id),
    attendancePercent: cadetAttendanceStats(db, cadet.id).percent,
    improvementSeconds: run3kImprovementSeconds(db, cadet.id),
    missionsCompleted: missionsCompletedBy(db.missions, cadet.id),
  }));
  rows.sort((a, b) => b.score - a.score || b.attendancePercent - a.attendancePercent);
  return rows.map((row, i) => ({ ...row, rank: i + 1 }));
}

export interface TrendPoint {
  label: string;
  value: number;
}

export function attendanceTrend(db: DbShape): TrendPoint[] {
  const dates = [...new Set(db.sessions.map((s) => s.date))].sort();
  return dates.map((date) => {
    const sessionIds = new Set(db.sessions.filter((s) => s.date === date).map((s) => s.id));
    const records = db.attendance.filter((a) => sessionIds.has(a.sessionId));
    return { label: formatDate(date).slice(0, 5), value: attendanceStats(records).percent };
  });
}

export function cumulativeScoreTrend(db: DbShape): TrendPoint[] {
  const byDate = new Map<string, number>();
  db.scores.forEach((s) => {
    byDate.set(s.date, (byDate.get(s.date) ?? 0) + s.points);
  });
  const dates = [...byDate.keys()].sort();
  let running = 0;
  return dates.map((date) => {
    running += byDate.get(date) ?? 0;
    return { label: formatDate(date).slice(0, 5), value: running };
  });
}

export interface ActivityItem {
  id: string;
  date: string;
  title: string;
  detail: string;
  kind: 'session' | 'score' | 'note' | 'mission';
}

export function recentActivity(db: DbShape, limit: number): ActivityItem[] {
  const cadetName = (id: string): string => db.cadets.find((c) => c.id === id)?.fullName ?? 'חניך';
  const items: ActivityItem[] = [
    ...db.sessions.map((s) => ({
      id: `session-${s.id}`,
      date: s.date,
      title: s.name,
      detail: `מפגש אימון · ${formatDate(s.date)}`,
      kind: 'session' as const,
    })),
    ...db.scores
      .filter((s) => s.type !== 'attendance')
      .map((s) => ({
        id: `score-${s.id}`,
        date: s.date,
        title: `${cadetName(s.cadetId)} · ${s.points > 0 ? '+' : ''}${s.points} נק'`,
        detail: s.note ?? 'עדכון ניקוד',
        kind: 'score' as const,
      })),
    ...db.notes.map((n) => ({
      id: `note-${n.id}`,
      date: n.date,
      title: cadetName(n.cadetId),
      detail: n.text,
      kind: 'note' as const,
    })),
    ...db.missions.map((m) => ({
      id: `mission-${m.id}`,
      date: m.date,
      title: m.title,
      detail: `משימת סופ"ש · ${missionProgressPercent(m)}% השלמה`,
      kind: 'mission' as const,
    })),
  ];
  items.sort((a, b) => b.date.localeCompare(a.date));
  return items.slice(0, limit);
}

export interface OverviewEntry {
  cadet: Cadet;
  value: string;
}

export interface CommanderOverview {
  strongest: OverviewEntry[];
  needsAttention: OverviewEntry[];
  mostImproved: OverviewEntry[];
  watchlist: OverviewEntry[];
  mostAbsences: OverviewEntry[];
  mostActive: OverviewEntry[];
}

export function commanderOverview(db: DbShape): CommanderOverview {
  const rows = leaderboard(db);

  const strongest = rows.slice(0, 5).map((r) => ({ cadet: r.cadet, value: `${r.score} נק'` }));

  const needsAttention = rows
    .filter((r) => r.cadet.fitnessLevel === 'C' || r.attendancePercent < 80)
    .sort((a, b) => a.attendancePercent - b.attendancePercent)
    .slice(0, 5)
    .map((r) => ({
      cadet: r.cadet,
      value: `${db.settings.levelLabels[r.cadet.fitnessLevel]} · ${r.attendancePercent}% נוכחות`,
    }));

  const mostImproved = rows
    .filter((r) => r.improvementSeconds !== undefined && r.improvementSeconds > 0)
    .sort((a, b) => (b.improvementSeconds ?? 0) - (a.improvementSeconds ?? 0))
    .slice(0, 5)
    .map((r) => ({ cadet: r.cadet, value: `שיפור ${r.improvementSeconds} שנ' ב-3 ק"מ` }));

  const watchlist = db.cadets
    .filter((c) => c.exempt || c.painNotes.trim() !== '' || c.restrictions.trim() !== '')
    .slice(0, 5)
    .map((c) => ({
      cadet: c,
      value: c.exempt ? 'פטור' : c.restrictions.trim() !== '' ? c.restrictions : c.painNotes,
    }));

  const mostAbsences = db.cadets
    .map((c) => ({ cadet: c, stats: cadetAttendanceStats(db, c.id) }))
    .filter((e) => e.stats.absent > 0)
    .sort((a, b) => b.stats.absent - a.stats.absent)
    .slice(0, 5)
    .map((e) => ({ cadet: e.cadet, value: `${e.stats.absent} היעדרויות` }));

  const mostActive = rows
    .map((r) => ({
      row: r,
      activity: r.missionsCompleted * 3 + cadetAttendanceStats(db, r.cadet.id).present,
    }))
    .sort((a, b) => b.activity - a.activity)
    .slice(0, 5)
    .map((e) => ({
      cadet: e.row.cadet,
      value: `${e.row.missionsCompleted} משימות · ${cadetAttendanceStats(db, e.row.cadet.id).present} נוכחויות`,
    }));

  return { strongest, needsAttention, mostImproved, watchlist, mostAbsences, mostActive };
}

export interface SearchResults {
  cadets: Cadet[];
  sessions: { id: string; name: string; date: string }[];
  missions: { id: string; title: string }[];
}

export function searchEverything(db: DbShape, query: string): SearchResults {
  const q = query.trim();
  if (q === '') return { cadets: [], sessions: [], missions: [] };
  return {
    cadets: db.cadets.filter((c) => c.fullName.includes(q)).slice(0, 6),
    sessions: db.sessions
      .filter((s) => s.name.includes(q))
      .slice(0, 4)
      .map((s) => ({ id: s.id, name: s.name, date: s.date })),
    missions: db.missions
      .filter((m) => m.title.includes(q))
      .slice(0, 4)
      .map((m) => ({ id: m.id, title: m.title })),
  };
}
