import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  CalendarCheck,
  CalendarX,
  ClipboardList,
  Dumbbell,
  Eye,
  FileDown,
  FileSpreadsheet,
  FileText,
  Flame,
  Printer,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useDb } from '../hooks/useDb';
import {
  cadetAttendanceStats,
  commanderOverview,
  leaderboard,
  run3kImprovementSeconds,
  sessionAttendanceStats,
  testFor,
} from '../lib/selectors';
import type { OverviewEntry } from '../lib/selectors';
import { teamLabel } from '../lib/constants';
import { addDays, formatDate, formatSeconds, todayISO } from '../lib/date';
import type { ReportTable } from '../lib/export';
import { exportCsv, exportExcel, exportPdf } from '../lib/export';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { Avatar } from '../components/ui/Avatar';
import { EmptyState } from '../components/ui/EmptyState';

type ReportId = 'attendance' | 'fitness' | 'score' | 'plan' | 'weekly' | 'overview';

function OverviewCard({ title, icon: Icon, entries, tint }: { title: string; icon: LucideIcon; entries: OverviewEntry[]; tint: string }) {
  return (
    <Card>
      <h3 className="font-bold mb-3 flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: tint }}>
          <Icon size={15} />
        </span>
        {title}
      </h3>
      {entries.length === 0 ? (
        <div className="text-sm text-ink3">אין נתונים להצגה</div>
      ) : (
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li key={entry.cadet.id}>
              <Link to={`/cadets/${entry.cadet.id}`} className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-surface2 transition-colors">
                <Avatar name={entry.cadet.fullName} team={entry.cadet.team} />
                <span className="min-w-0">
                  <span className="block text-sm font-bold truncate">{entry.cadet.fullName}</span>
                  <span className="block text-xs text-ink3 truncate">{entry.value}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function ReportsPage() {
  const db = useDb();
  const [report, setReport] = useState<ReportId>('attendance');

  const table: ReportTable | undefined = useMemo(() => {
    if (report === 'attendance') {
      return {
        title: 'דוח נוכחות',
        columns: ['שם', 'צוות', 'נוכח', 'מאזין', 'פטור רפואי', 'נעדר', 'אחוז נוכחות'],
        rows: db.cadets.map((c) => {
          const s = cadetAttendanceStats(db, c.id);
          return [c.fullName, teamLabel(c.team), s.present, s.listener, s.medical, s.absent, `${s.percent}%`];
        }),
      };
    }
    if (report === 'fitness') {
      return {
        title: 'דוח כושר',
        columns: ['שם', 'צוות', 'רמה', '3 ק"מ פתיחה', '3 ק"מ סיום', 'שיפור (שנ\')', 'שכיבות (פתיחה)', 'מתח (פתיחה)', 'פלאנק (פתיחה)'],
        rows: db.cadets.map((c) => {
          const opening = testFor(db.fitnessTests, c.id, 'opening');
          const final = testFor(db.fitnessTests, c.id, 'final');
          const improvement = run3kImprovementSeconds(db, c.id);
          return [
            c.fullName,
            teamLabel(c.team),
            db.settings.levelLabels[c.fitnessLevel],
            opening?.run3kSeconds !== undefined ? formatSeconds(opening.run3kSeconds) : '—',
            final?.run3kSeconds !== undefined ? formatSeconds(final.run3kSeconds) : '—',
            improvement ?? '—',
            opening?.pushups ?? '—',
            opening?.pullups ?? '—',
            opening?.plankSeconds ?? '—',
          ];
        }),
      };
    }
    if (report === 'score') {
      return {
        title: 'דוח ניקוד',
        columns: ['דירוג', 'שם', 'צוות', 'ניקוד', 'אחוז נוכחות', 'משימות שהושלמו'],
        rows: leaderboard(db).map((r) => [
          r.rank,
          r.cadet.fullName,
          teamLabel(r.cadet.team),
          r.score,
          `${r.attendancePercent}%`,
          r.missionsCompleted,
        ]),
      };
    }
    if (report === 'plan') {
      return {
        title: 'דוח תוכנית אימונים',
        columns: ['שבוע', 'התחלה', 'סיום', 'מטרות', 'סוגי אימון', 'הערות'],
        rows: [...db.trainingWeeks]
          .sort((a, b) => a.weekNumber - b.weekNumber)
          .map((w) => [
            w.weekNumber,
            formatDate(w.startDate),
            formatDate(w.endDate),
            w.goals,
            w.types.map((t) => db.settings.trainingTypeLabels[t]).join(', '),
            w.notes,
          ]),
      };
    }
    if (report === 'weekly') {
      const weekAgo = addDays(todayISO(), -7);
      return {
        title: 'דוח שבועי',
        columns: ['תאריך', 'מפגש', 'שיוך', 'נוכח', 'מאזין', 'פטור רפואי', 'נעדר', 'אחוז נוכחות'],
        rows: [...db.sessions]
          .filter((s) => s.date >= weekAgo)
          .sort((a, b) => b.date.localeCompare(a.date))
          .map((s) => {
            const stats = sessionAttendanceStats(db, s.id);
            return [
              formatDate(s.date),
              s.name,
              s.team ? teamLabel(s.team) : 'כל הפלוגה',
              stats.present,
              stats.listener,
              stats.medical,
              stats.absent,
              `${stats.percent}%`,
            ];
          }),
      };
    }
    return undefined;
  }, [db, report]);

  const overview = useMemo(() => (report === 'overview' ? commanderOverview(db) : undefined), [db, report]);
  const exportSubtitle = `${db.settings.appName} · הופק בתאריך ${formatDate(todayISO())} · ${db.settings.managerName}, ${db.settings.managerRole}`;

  return (
    <div>
      <PageHeader title="דוחות" subtitle="הפקה וייצוא של דוחות מערך הכושר" />

      <Tabs
        className="mb-5 max-w-full w-fit"
        active={report}
        onChange={(r) => setReport(r as ReportId)}
        tabs={[
          { id: 'attendance', label: 'נוכחות', icon: CalendarCheck },
          { id: 'fitness', label: 'כושר', icon: Dumbbell },
          { id: 'score', label: 'ניקוד', icon: Trophy },
          { id: 'plan', label: 'תוכנית אימונים', icon: ClipboardList },
          { id: 'weekly', label: 'דוח שבועי', icon: FileText },
          { id: 'overview', label: 'תמונת מצב מפקדים', icon: Eye },
        ]}
      />

      {table && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button variant="secondary" size="sm" icon={FileSpreadsheet} onClick={() => void exportExcel(table)}>
              ייצוא Excel
            </Button>
            <Button variant="secondary" size="sm" icon={FileDown} onClick={() => exportCsv(table)}>
              ייצוא CSV
            </Button>
            <Button variant="secondary" size="sm" icon={Printer} onClick={() => exportPdf(table, exportSubtitle)}>
              ייצוא PDF
            </Button>
          </div>
          <Card className="!p-0 overflow-hidden">
            {table.rows.length === 0 ? (
              <EmptyState icon={FileText} title="אין נתונים לדוח" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="text-xs text-ink3 border-b border-line bg-surface2/60">
                      {table.columns.map((col) => (
                        <th key={col} className="text-start py-3 px-3 font-semibold whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row, i) => (
                      <tr key={i} className="border-b border-line last:border-0 hover:bg-surface2/40">
                        {row.map((cell, j) => (
                          <td key={j} className="py-2.5 px-3 tabular-nums">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <OverviewCard title="החזקים ביותר" icon={Trophy} entries={overview.strongest} tint="var(--chart-lvl-b)" />
          <OverviewCard title="דורשים תשומת לב" icon={AlertTriangle} entries={overview.needsAttention} tint="var(--chart-lvl-c)" />
          <OverviewCard title="המשתפרים ביותר" icon={TrendingUp} entries={overview.mostImproved} tint="var(--chart-lvl-a)" />
          <OverviewCard title="דורשים מעקב" icon={Eye} entries={overview.watchlist} tint="var(--chart-team-2)" />
          <OverviewCard title="הכי הרבה היעדרויות" icon={CalendarX} entries={overview.mostAbsences} tint="var(--chart-team-3)" />
          <OverviewCard title="הכי פעילים" icon={Flame} entries={overview.mostActive} tint="var(--chart-line-2)" />
        </div>
      )}
    </div>
  );
}
