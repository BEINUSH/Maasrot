import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CalendarCheck,
  ClipboardList,
  Dumbbell,
  Pencil,
  Phone,
  StickyNote,
  Trash2,
  Trophy,
  UserRound,
} from 'lucide-react';
import type { FitnessLevel, NoteType } from '../types';
import { useDb } from '../hooks/useDb';
import { useCadets } from '../hooks/useCadets';
import { useNotes } from '../hooks/useNotes';
import {
  cadetAttendanceStats,
  testFor,
  totalScoreFor,
} from '../lib/selectors';
import type { TrendPoint } from '../lib/selectors';
import {
  FITNESS_LEVELS,
  LEVEL_META,
  NOTE_TYPE_LABELS,
  PERIOD_LABELS,
  SCORE_TYPE_LABELS,
  STATUS_LABELS,
  TEAM_META,
  TEST_PERIODS,
  teamLabel,
} from '../lib/constants';
import { formatDate, todayISO } from '../lib/date';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs } from '../components/ui/Tabs';
import { Avatar } from '../components/ui/Avatar';
import { EmptyState } from '../components/ui/EmptyState';
import { SelectField, TextAreaField } from '../components/ui/Field';
import { TrendLine } from '../components/charts/TrendLine';
import { TestComparisonCard } from '../components/fitnessTests/TestComparisonCard';
import { CadetFormModal } from '../components/cadets/CadetFormModal';

type TabId = 'overview' | 'attendance' | 'fitness' | 'score' | 'notes';

function InfoField({ label, value, ltr = false }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="rounded-xl bg-surface2 px-3.5 py-2.5">
      <div className="text-[11px] font-semibold text-ink3">{label}</div>
      <div className="text-sm font-semibold mt-0.5 break-words" dir={ltr ? 'ltr' : undefined} style={ltr ? { textAlign: 'right' } : undefined}>
        {value.trim() === '' ? <span className="text-ink3">לא הוזן</span> : value}
      </div>
    </div>
  );
}

export function CadetProfilePage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const db = useDb();
  const { updateCadet, deleteCadet } = useCadets();
  const { notes, addNote, deleteNote } = useNotes(id);
  const [tab, setTab] = useState<TabId>('overview');
  const [editOpen, setEditOpen] = useState(false);
  const [noteType, setNoteType] = useState<NoteType>('coach');
  const [noteText, setNoteText] = useState('');

  const cadet = db.cadets.find((c) => c.id === id);

  const runTrend: TrendPoint[] = useMemo(() => {
    if (!cadet) return [];
    return TEST_PERIODS.flatMap((period) => {
      const value = testFor(db.fitnessTests, cadet.id, period)?.run3kSeconds;
      return value === undefined ? [] : [{ label: PERIOD_LABELS[period], value }];
    });
  }, [db.fitnessTests, cadet]);

  if (!cadet) {
    return <EmptyState icon={UserRound} title="החניך לא נמצא" hint="ייתכן שהחניך הוסר מהמערכת" />;
  }

  const stats = cadetAttendanceStats(db, cadet.id);
  const score = totalScoreFor(db.scores, cadet.id);
  const cadetScores = db.scores
    .filter((s) => s.cadetId === cadet.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const attendanceHistory = db.attendance
    .filter((a) => a.cadetId === cadet.id)
    .map((record) => ({ record, session: db.sessions.find((s) => s.id === record.sessionId) }))
    .filter((r) => r.session !== undefined)
    .sort((a, b) => (b.session?.date ?? '').localeCompare(a.session?.date ?? ''));

  const submitNote = () => {
    if (noteText.trim() === '') return;
    addNote({ cadetId: cadet.id, type: noteType, text: noteText.trim(), date: todayISO() });
    setNoteText('');
  };

  const removeCadet = () => {
    if (window.confirm(`למחוק את ${cadet.fullName} מהמערכת? כל הנתונים שלו יימחקו.`)) {
      deleteCadet(cadet.id);
      navigate('/cadets');
    }
  };

  return (
    <div>
      <PageHeader
        title={cadet.fullName}
        actions={
          <>
            <Button variant="secondary" icon={Pencil} onClick={() => setEditOpen(true)}>
              עריכה
            </Button>
            <Button variant="danger" icon={Trash2} onClick={removeCadet}>
              מחיקה
            </Button>
          </>
        }
      />

      <Card className="mb-5">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={cadet.fullName} team={cadet.team} size="lg" />
          <div className="min-w-0">
            <div className="flex flex-wrap gap-1.5">
              <Badge className={TEAM_META[cadet.team].badge}>{teamLabel(cadet.team)}</Badge>
              <Badge className={LEVEL_META[cadet.fitnessLevel].badge}>
                רמת כושר: {db.settings.levelLabels[cadet.fitnessLevel]}
              </Badge>
              {cadet.exempt && <Badge className="bg-lvlc/10 text-lvlc border border-lvlc/30">פטור</Badge>}
            </div>
            <div className="text-xs text-ink3 mt-1.5">הצטרף בתאריך {formatDate(cadet.joinDate)}</div>
          </div>
          <div className="flex gap-3 ms-auto">
            <div className="text-center rounded-xl bg-surface2 px-4 py-2">
              <div className="text-xl font-extrabold tabular-nums">{score}</div>
              <div className="text-[11px] text-ink3 font-semibold">ניקוד</div>
            </div>
            <div className="text-center rounded-xl bg-surface2 px-4 py-2">
              <div className="text-xl font-extrabold tabular-nums">{stats.percent}%</div>
              <div className="text-[11px] text-ink3 font-semibold">נוכחות</div>
            </div>
          </div>
        </div>
      </Card>

      <Tabs
        className="mb-5 w-fit max-w-full"
        active={tab}
        onChange={(next) => setTab(next as TabId)}
        tabs={[
          { id: 'overview', label: 'סקירה', icon: UserRound },
          { id: 'attendance', label: 'נוכחות', icon: CalendarCheck },
          { id: 'fitness', label: 'כושר', icon: Dumbbell },
          { id: 'score', label: 'ניקוד', icon: Trophy },
          { id: 'notes', label: 'הערות', icon: StickyNote },
        ]}
      />

      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <h3 className="font-bold mb-3">שינוי רמת כושר</h3>
            <div className="grid grid-cols-3 gap-2">
              {FITNESS_LEVELS.map((level: FitnessLevel) => {
                const active = cadet.fitnessLevel === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => updateCadet(cadet.id, { fitnessLevel: level })}
                    className={`py-4 rounded-2xl border-2 text-base font-extrabold transition-all ${
                      active
                        ? LEVEL_META[level].activeButton
                        : 'bg-surface2 text-ink2 border-line hover:border-ink3'
                    }`}
                  >
                    {db.settings.levelLabels[level]}
                  </button>
                );
              })}
            </div>
            <h3 className="font-bold mt-6 mb-3">פרטים אישיים</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <InfoField label="קבוצת אימון" value={cadet.trainingGroup} />
              <InfoField label="פרופיל רפואי" value={cadet.medicalProfile} />
              <InfoField label="הגבלות" value={cadet.restrictions} />
              <InfoField label="הערות כאב" value={cadet.painNotes} />
              <InfoField label="טלפון" value={cadet.phone} ltr />
              <InfoField label='דוא"ל' value={cadet.email} ltr />
              <InfoField label="איש קשר לחירום" value={cadet.emergencyContactName} />
              <InfoField label="טלפון איש קשר" value={cadet.emergencyContactPhone} ltr />
            </div>
            {cadet.phone.trim() !== '' && (
              <a
                href={`tel:${cadet.phone}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent mt-3 hover:underline"
              >
                <Phone size={14} />
                חיוג מהיר
              </a>
            )}
          </Card>
          <Card>
            <h3 className="font-bold mb-3">מגמת ריצת 3 ק"מ</h3>
            {runTrend.length === 0 ? (
              <EmptyState icon={Dumbbell} title="אין עדיין תוצאות ריצה" hint="הזן תוצאות במסך מבחני כושר" />
            ) : (
              <TrendLine data={runTrend} colorVar="var(--chart-line-1)" suffix=" שנ'" />
            )}
          </Card>
        </div>
      )}

      {tab === 'attendance' && (
        <Card>
          <div className="flex flex-wrap gap-3 mb-4">
            <Badge className="bg-lvla/10 text-lvla border border-lvla/30">נוכח: {stats.present}</Badge>
            <Badge className="bg-accent/10 text-accent border border-accent/30">מאזין: {stats.listener}</Badge>
            <Badge className="bg-surface2 text-ink2 border border-line">פטור רפואי: {stats.medical}</Badge>
            <Badge className="bg-lvlc/10 text-lvlc border border-lvlc/30">נעדר: {stats.absent}</Badge>
            <Badge className="bg-surface2 text-ink border border-line">אחוז נוכחות: {stats.percent}%</Badge>
          </div>
          {attendanceHistory.length === 0 ? (
            <EmptyState icon={CalendarCheck} title="אין רשומות נוכחות" />
          ) : (
            <ul className="divide-y divide-line">
              {attendanceHistory.map(({ record, session }) => (
                <li key={record.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold truncate">{session?.name}</div>
                    <div className="text-xs text-ink3">
                      {session ? formatDate(session.date) : ''}
                      {record.note ? ` · ${record.note}` : ''}
                    </div>
                  </div>
                  <Badge
                    className={
                      record.status === 'present'
                        ? 'bg-lvla/10 text-lvla border border-lvla/30'
                        : record.status === 'listener'
                          ? 'bg-accent/10 text-accent border border-accent/30'
                          : record.status === 'absent'
                            ? 'bg-lvlc/10 text-lvlc border border-lvlc/30'
                            : 'bg-surface2 text-ink2 border border-line'
                    }
                  >
                    {STATUS_LABELS[record.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {tab === 'fitness' && (
        <Card>
          <h3 className="font-bold mb-3">השוואת מבחנים</h3>
          <TestComparisonCard db={db} cadetId={cadet.id} />
        </Card>
      )}

      {tab === 'score' && (
        <Card>
          {cadetScores.length === 0 ? (
            <EmptyState icon={Trophy} title="אין אירועי ניקוד" />
          ) : (
            <ul className="divide-y divide-line">
              {cadetScores.map((event) => (
                <li key={event.id} className="flex items-center gap-3 py-3">
                  <span
                    className={`w-12 text-center rounded-lg py-1 text-sm font-extrabold tabular-nums ${
                      event.points >= 0 ? 'bg-lvla/10 text-lvla' : 'bg-lvlc/10 text-lvlc'
                    }`}
                    dir="ltr"
                  >
                    {event.points > 0 ? `+${event.points}` : event.points}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold">{SCORE_TYPE_LABELS[event.type]}</div>
                    {event.note && <div className="text-xs text-ink3 truncate">{event.note}</div>}
                  </div>
                  <span className="text-xs text-ink3 tabular-nums">{formatDate(event.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {tab === 'notes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <h3 className="font-bold mb-3">הוספת הערה</h3>
            <div className="space-y-3">
              <SelectField
                label="סוג הערה"
                value={noteType}
                onChange={(v) => setNoteType(v as NoteType)}
                options={(Object.keys(NOTE_TYPE_LABELS) as NoteType[]).map((t) => ({
                  value: t,
                  label: NOTE_TYPE_LABELS[t],
                }))}
              />
              <TextAreaField label="תוכן ההערה" value={noteText} onChange={setNoteText} />
              <Button icon={ClipboardList} onClick={submitNote} disabled={noteText.trim() === ''}>
                שמירת הערה
              </Button>
            </div>
          </Card>
          <Card>
            <h3 className="font-bold mb-3">הערות קיימות</h3>
            {notes.length === 0 ? (
              <EmptyState icon={StickyNote} title="אין הערות" />
            ) : (
              <ul className="divide-y divide-line">
                {notes.map((note) => (
                  <li key={note.id} className="py-3 flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-surface2 text-ink2 border border-line">
                          {NOTE_TYPE_LABELS[note.type]}
                        </Badge>
                        <span className="text-xs text-ink3 tabular-nums">{formatDate(note.date)}</span>
                      </div>
                      <p className="text-sm mt-1.5 whitespace-pre-line">{note.text}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteNote(note.id)}
                      className="p-1.5 rounded-lg text-ink3 hover:text-lvlc hover:bg-lvlc/10"
                      aria-label="מחיקת הערה"
                    >
                      <Trash2 size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}

      <CadetFormModal open={editOpen} onClose={() => setEditOpen(false)} cadet={cadet} />
    </div>
  );
}
