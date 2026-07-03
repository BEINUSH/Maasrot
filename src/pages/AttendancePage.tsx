import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarCheck, CalendarPlus, Pencil, StickyNote, Trash2 } from 'lucide-react';
import type { AttendanceStatus, TeamId } from '../types';
import { useDb } from '../hooks/useDb';
import { useAttendance } from '../hooks/useAttendance';
import { attendanceStats } from '../lib/selectors';
import { ATTENDANCE_STATUSES, STATUS_ACTIVE_CLASSES, STATUS_LABELS, teamLabel } from '../lib/constants';
import { formatDate } from '../lib/date';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { TeamFilter } from '../components/ui/TeamFilter';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EmptyState } from '../components/ui/EmptyState';
import { SessionFormModal } from '../components/attendance/SessionFormModal';

export function AttendancePage() {
  const db = useDb();
  const { setAttendance, removeAttendance, setAttendanceNote, deleteSession } = useAttendance();
  const sessions = useMemo(
    () => [...db.sessions].sort((a, b) => b.date.localeCompare(a.date) || a.name.localeCompare(b.name, 'he')),
    [db.sessions],
  );

  const [selectedId, setSelectedId] = useState<string>(sessions[0]?.id ?? '');
  const [teamFilter, setTeamFilter] = useState<TeamId | 'all'>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('new')) {
      setEditing(false);
      setFormOpen(true);
      setSearchParams({}, { replace: true });
    }
    const fromSearch = searchParams.get('session');
    if (fromSearch && db.sessions.some((s) => s.id === fromSearch)) {
      setSelectedId(fromSearch);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, db.sessions]);

  const session = db.sessions.find((s) => s.id === selectedId) ?? sessions[0];
  const sessionRecords = useMemo(
    () => (session ? db.attendance.filter((a) => a.sessionId === session.id) : []),
    [db.attendance, session],
  );
  const stats = attendanceStats(sessionRecords);

  const visibleCadets = useMemo(() => {
    let cadets = db.cadets;
    if (session?.team) cadets = cadets.filter((c) => c.team === session.team);
    if (teamFilter !== 'all') cadets = cadets.filter((c) => c.team === teamFilter);
    return [...cadets].sort((a, b) => a.team - b.team || a.fullName.localeCompare(b.fullName, 'he'));
  }, [db.cadets, session, teamFilter]);

  const recordFor = (cadetId: string) => sessionRecords.find((r) => r.cadetId === cadetId);

  const pointsByStatus: Record<AttendanceStatus, number> = {
    present: db.settings.scoring.present,
    listener: db.settings.scoring.listener,
    medical: db.settings.scoring.medical,
    absent: db.settings.scoring.absent,
  };

  const toggleStatus = (cadetId: string, status: AttendanceStatus) => {
    if (!session) return;
    const record = recordFor(cadetId);
    if (record?.status === status) {
      removeAttendance(session.id, cadetId);
    } else {
      setAttendance(session.id, cadetId, status);
    }
  };

  const editNote = (cadetId: string) => {
    const record = recordFor(cadetId);
    if (!record) return;
    const next = window.prompt('הערה לרשומת הנוכחות (למשל: מאזין על הנשק)', record.note ?? '');
    if (next !== null) setAttendanceNote(record.id, next.trim());
  };

  const removeSession = () => {
    if (!session) return;
    if (window.confirm(`למחוק את המפגש "${session.name}"? כל רשומות הנוכחות והניקוד שלו יימחקו.`)) {
      deleteSession(session.id);
      setSelectedId('');
    }
  };

  return (
    <div>
      <PageHeader
        title="נוכחות"
        subtitle="ניהול נוכחות במפגשי אימון — כל שינוי מסנכרן אוטומטית את הניקוד"
        actions={
          <Button
            icon={CalendarPlus}
            onClick={() => {
              setEditing(false);
              setFormOpen(true);
            }}
          >
            מפגש חדש
          </Button>
        }
      />

      {sessions.length === 0 || !session ? (
        <Card>
          <EmptyState icon={CalendarCheck} title="אין מפגשי אימון" hint='לחץ על "מפגש חדש" כדי להתחיל' />
        </Card>
      ) : (
        <>
          <Card className="mb-5">
            <div className="flex flex-wrap items-center gap-3">
              <select
                className="input-base !w-auto min-w-56 font-semibold"
                value={session.id}
                onChange={(e) => setSelectedId(e.target.value)}
              >
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {formatDate(s.date)} · {s.name}
                    {s.team ? ` (${teamLabel(s.team)})` : ''}
                  </option>
                ))}
              </select>
              <Button
                variant="secondary"
                size="sm"
                icon={Pencil}
                onClick={() => {
                  setEditing(true);
                  setFormOpen(true);
                }}
              >
                עריכת מפגש
              </Button>
              <Button variant="danger" size="sm" icon={Trash2} onClick={removeSession}>
                מחיקה
              </Button>
              {session.team && <Badge className="bg-accent/10 text-accent border border-accent/30">{teamLabel(session.team)} בלבד</Badge>}
            </div>
            {session.description && <p className="text-sm text-ink2 mt-3 whitespace-pre-line">{session.description}</p>}
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <div className="flex-1 min-w-44">
                <ProgressBar value={stats.percent} colorVar="var(--chart-lvl-a)" />
              </div>
              <span className="text-sm font-bold tabular-nums">{stats.percent}% נוכחות</span>
              <span className="text-xs text-ink3 tabular-nums">
                נוכח {stats.present} · מאזין {stats.listener} · פטור {stats.medical} · נעדר {stats.absent} · סומנו{' '}
                {stats.total}/{visibleCadets.length}
              </span>
            </div>
          </Card>

          {!session.team && (
            <div className="mb-4">
              <TeamFilter value={teamFilter} onChange={setTeamFilter} />
            </div>
          )}

          <div className="space-y-2.5">
            {visibleCadets.map((cadet) => {
              const record = recordFor(cadet.id);
              return (
                <Card key={cadet.id} className="!p-3.5">
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <div className="flex items-center gap-3 min-w-0 md:w-64">
                      <Avatar name={cadet.fullName} team={cadet.team} />
                      <div className="min-w-0">
                        <div className="font-bold truncate">{cadet.fullName}</div>
                        <div className="text-xs text-ink3">{teamLabel(cadet.team)}</div>
                        {record?.note && (
                          <div className="text-[11px] text-accent font-semibold truncate mt-0.5">{record.note}</div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 flex-1">
                      {ATTENDANCE_STATUSES.map((status) => {
                        const active = record?.status === status;
                        const points = pointsByStatus[status];
                        return (
                          <button
                            key={status}
                            type="button"
                            onClick={() => toggleStatus(cadet.id, status)}
                            className={`min-h-14 rounded-xl border text-xs sm:text-sm font-bold transition-all leading-tight px-1 ${
                              active
                                ? STATUS_ACTIVE_CLASSES[status]
                                : 'bg-surface2 text-ink2 border-line hover:border-ink3'
                            }`}
                          >
                            {STATUS_LABELS[status]}
                            <span className={`block text-[11px] font-semibold tabular-nums ${active ? 'text-white/85' : 'text-ink3'}`} dir="ltr">
                              {points > 0 ? `+${points}` : points}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {record && (
                      <button
                        type="button"
                        onClick={() => editNote(cadet.id)}
                        className="self-start md:self-center p-2 rounded-lg text-ink3 hover:text-accent hover:bg-accent/10 transition-colors"
                        aria-label="הערה לרשומה"
                        title="הערה לרשומה"
                      >
                        <StickyNote size={17} />
                      </button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      <SessionFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        session={editing ? session : undefined}
        onSaved={(id) => setSelectedId(id)}
      />
    </div>
  );
}
