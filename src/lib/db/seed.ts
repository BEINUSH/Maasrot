import type {
  AppSettings,
  AttendanceRecord,
  AttendanceStatus,
  Cadet,
  DbShape,
  FitnessLevel,
  ScoreEvent,
  TeamId,
  TrainingSession,
  TrainingWeek,
  WeekendMission,
} from '../../types';
import { addDays, daysBetween, todayISO } from '../date';
import { STATUS_LABELS } from '../constants';

export const DEFAULT_SETTINGS: AppSettings = {
  appName: 'מערך הכושר הפלוגתי',
  subtitle: 'מערכת ניהול הכושר של קורס הקצינים',
  managerName: 'אריאל בן עמי',
  managerRole: 'קה"ג – מתרגל פלוגה א\'',
  courseStart: '2026-06-28',
  courseEnd: '2026-08-05',
  scoring: {
    present: 5,
    listener: 2,
    medical: 0,
    absent: -5,
    mission: 5,
    improvement: 10,
    helping: 5,
    leadership: 10,
    excellence: 15,
  },
  levelLabels: { A: 'ירוק', B: 'צהוב', C: 'אדום' },
  trainingTypeLabels: {
    run: 'ריצה',
    intervals: 'אינטרוולים',
    tempo: 'טמפו',
    strength: 'כוח',
    mobility: 'מוביליטי',
    stretching: 'מתיחות',
  },
};

interface SeedCadet {
  name: string;
  team: TeamId;
  level: FitnessLevel;
}

// רמות הכושר נקבעו כחלוקה התחלתית קבועה; איתי צפאני ברמה ירוקה (A) לפי תיקון מפורש של הקה"ג
const SEED_CADETS: SeedCadet[] = [
  { name: 'יאיר סויסה', team: 1, level: 'A' },
  { name: 'משה מלכה', team: 1, level: 'B' },
  { name: 'ניר ויטור', team: 1, level: 'B' },
  { name: 'שי יאראק', team: 1, level: 'A' },
  { name: 'אתי צור', team: 1, level: 'B' },
  { name: 'אלעד זכריה', team: 1, level: 'C' },
  { name: 'אליעזר ברויאר', team: 1, level: 'B' },
  { name: 'איתן אורנשטיין', team: 1, level: 'A' },
  { name: 'אוהד קונוביץ', team: 1, level: 'B' },
  { name: 'נתנאל שפיגלמן', team: 1, level: 'C' },
  { name: 'ברוך קרסיק', team: 1, level: 'B' },
  { name: 'יורם ישראל ביטון', team: 1, level: 'C' },
  { name: 'ארי גוטהלף', team: 1, level: 'B' },
  { name: 'שלום ערד', team: 1, level: 'A' },
  { name: 'אריאל בן עמי', team: 2, level: 'A' },
  { name: 'יחיאל זוהר', team: 2, level: 'B' },
  { name: 'נתנאל שלזינגר', team: 2, level: 'B' },
  { name: 'גוטליב', team: 2, level: 'B' },
  { name: 'הורביץ', team: 2, level: 'C' },
  { name: 'עמר', team: 2, level: 'B' },
  { name: 'קרליבך', team: 2, level: 'A' },
  { name: 'הראל', team: 2, level: 'B' },
  { name: 'אלמוג אבי', team: 2, level: 'B' },
  { name: 'אבי ברובסקי', team: 2, level: 'C' },
  { name: 'משה טובינה', team: 2, level: 'B' },
  { name: 'שלמה קינן', team: 2, level: 'A' },
  { name: 'אורן מועלם', team: 2, level: 'B' },
  { name: 'אשר סיני', team: 3, level: 'B' },
  { name: 'יחיאל שיינפלד', team: 3, level: 'B' },
  { name: 'יאיר בן אליעזר', team: 3, level: 'A' },
  { name: 'איתי צפאני', team: 3, level: 'A' },
  { name: 'יוסי אלבז', team: 3, level: 'B' },
  { name: 'יצחק שגיא', team: 3, level: 'C' },
  { name: 'מוטי ברלב', team: 3, level: 'B' },
  { name: 'יצחק ליקסנבורג', team: 3, level: 'C' },
  { name: 'אלי גרוס', team: 3, level: 'B' },
  { name: 'צבי מנדלסון', team: 3, level: 'B' },
  { name: 'דניאל עידן', team: 3, level: 'A' },
  { name: 'חיעד', team: 3, level: 'B' },
  { name: 'יצחק סבח', team: 3, level: 'B' },
];

const DAILY_TABLE_START = '2026-06-29';
const DAILY_TABLE_END = '2026-08-01';

export function dailyFitnessTable(dateIso: string): { pushups: number; pullups: number; plankSeconds: number } {
  const total = daysBetween(DAILY_TABLE_START, DAILY_TABLE_END);
  const t = Math.min(1, Math.max(0, daysBetween(DAILY_TABLE_START, dateIso) / total));
  return {
    pushups: Math.round(3 + t * 27),
    pullups: Math.round(1 + t * 5),
    plankSeconds: Math.round(10 + t * 50),
  };
}

export function createSeed(): DbShape {
  const cadets: Cadet[] = SEED_CADETS.map((c, i) => ({
    id: `cadet-${String(i + 1).padStart(2, '0')}`,
    fullName: c.name,
    team: c.team,
    fitnessLevel: c.level,
    trainingGroup: `קבוצת אימון ${c.level === 'A' ? '1' : c.level === 'B' ? '2' : '3'}`,
    medicalProfile: '',
    restrictions: '',
    painNotes: '',
    exempt: false,
    phone: '',
    email: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    joinDate: '2026-06-28',
  }));

  const byName = new Map(cadets.map((c) => [c.fullName, c]));
  const cadetId = (name: string): string => {
    const found = byName.get(name);
    if (!found) throw new Error(`seed cadet not found: ${name}`);
    return found.id;
  };

  const scoring = DEFAULT_SETTINGS.scoring;
  const statusPoints: Record<AttendanceStatus, number> = {
    present: scoring.present,
    listener: scoring.listener,
    medical: scoring.medical,
    absent: scoring.absent,
  };

  const sessions: TrainingSession[] = [];
  const attendance: AttendanceRecord[] = [];
  const scores: ScoreEvent[] = [];

  const mark = (session: TrainingSession, cadet: Cadet, status: AttendanceStatus, note?: string): void => {
    const recordId = `att-${session.id}-${cadet.id}`;
    attendance.push({ id: recordId, sessionId: session.id, cadetId: cadet.id, status, note });
    scores.push({
      id: `score-${recordId}`,
      cadetId: cadet.id,
      date: session.date,
      type: 'attendance',
      points: statusPoints[status],
      note: `${session.name} – ${STATUS_LABELS[status]}`,
      refId: recordId,
    });
  };

  const intro: TrainingSession = {
    id: 'session-intro',
    date: '2026-06-28',
    name: 'אימון היכרות עם הבה"ד',
    description: 'אימון פתיחה והיכרות עם הבה"ד. השתתפות מלאה של כל 40 החניכים.',
  };
  sessions.push(intro);
  cadets.forEach((c) => mark(intro, c, 'present'));

  const masa: TrainingSession = {
    id: 'session-masa-tagiot',
    date: '2026-06-29',
    name: 'מסע תגיות',
    description:
      'הליכה 5.5 ק"מ עם ווסטים ואלונקות (16:00–20:30). בסיום המסע, בשעות הלילה, התקיים טקס בפסגת הגבעה של התצפתניות בנוכחות משפחות החניכים עד השעה 22:00.',
  };
  sessions.push(masa);
  cadets.forEach((c) => mark(masa, c, 'present'));

  const today = todayISO();
  const lastDaily = today < DAILY_TABLE_END ? today : DAILY_TABLE_END;
  for (let d = DAILY_TABLE_START; d <= lastDaily; d = addDays(d, 1)) {
    const table = dailyFitnessTable(d);
    const daily: TrainingSession = {
      id: `session-daily-${d}`,
      date: d,
      name: 'כושר יומי',
      description: `טבלה יומית עולה של הקה"ג: ${table.pushups} שכיבות סמיכה · ${table.pullups} עליות מתח · ${table.plankSeconds} שניות בטן סטטית.`,
    };
    sessions.push(daily);
    cadets.forEach((c) => mark(daily, c, 'present'));
  }

  const mads: TrainingSession = {
    id: 'session-mads',
    date: '2026-06-30',
    name: 'מד"ס',
    team: 2,
    description: 'מסלול דרישות סמכות – צוות 2 (כחול) בלבד.',
  };
  sessions.push(mads);
  cadets
    .filter((c) => c.team === 2)
    .forEach((c) => {
      if (c.fullName === 'משה טובינה') {
        mark(mads, c, 'listener', 'מאזין על הנשק – תורנות שמירה על הנשק');
      } else {
        mark(mads, c, 'present');
      }
    });

  const run: TrainingSession = {
    id: 'session-run',
    date: '2026-06-30',
    name: 'אימון ריצה',
    description: 'אימון ריצה פלוגתי לכל הצוותים.',
  };
  sessions.push(run);
  cadets.forEach((c) => {
    if (c.fullName === 'נתנאל שפיגלמן') {
      mark(run, c, 'absent', 'היעדרות ללא הצדקה');
    } else if (c.fullName === 'משה טובינה' || c.fullName === 'אלי גרוס') {
      mark(run, c, 'listener', 'מאזין על הנשק – תורנות שמירה על הנשק');
    } else {
      mark(run, c, 'present');
    }
  });

  const surveyCompleted = [
    'יאיר בן אליעזר',
    'יחיאל שיינפלד',
    'דניאל עידן',
    'יצחק סבח',
    'מוטי ברלב',
    'יוסי אלבז',
    'חיעד',
  ];
  const surveyNotCompleted = ['אשר סיני', 'יצחק ליקסנבורג', 'אלי גרוס', 'צבי מנדלסון', 'יצחק שגיא'];

  const missionId = 'mission-team3-survey';
  const survey: WeekendMission = {
    id: missionId,
    title: 'אימונים קלים עצמאיים בסוף השבוע',
    description:
      'סקר צוותי שהעביר איתי צפאני בקבוצת צוות 3 (29/06/2026): מי ביצע אימונים קלים עצמאיים בסוף השבוע. איתי עצמו העביר את הסקר ולכן לא נכלל בהצבעה.',
    date: '2026-06-29',
    completions: [
      ...surveyCompleted.map((name) => ({
        cadetId: cadetId(name),
        completed: true,
        completedAt: '2026-06-29',
      })),
      ...surveyNotCompleted.map((name) => ({ cadetId: cadetId(name), completed: false })),
    ],
  };

  surveyCompleted.forEach((name) => {
    const id = cadetId(name);
    scores.push({
      id: `score-mission-${missionId}-${id}`,
      cadetId: id,
      date: '2026-06-29',
      type: 'mission',
      points: scoring.mission,
      note: `משימת סופ"ש: ${survey.title}`,
      refId: `${missionId}:${id}`,
    });
  });

  const trainingWeeks: TrainingWeek[] = [
    {
      id: 'week-1',
      weekNumber: 1,
      startDate: '2026-06-28',
      endDate: '2026-07-04',
      goals: 'קליטה והיכרות, בניית בסיס גופני אחיד לכלל הפלוגה',
      types: ['run', 'strength'],
      notes:
        'כושר יומי לפי טבלה עולה של הקה"ג: מ-3 שכיבות סמיכה / 1 מתח / 10 שניות בטן ביום הראשון, בעלייה הדרגתית עד 30 שכיבות / 6 מתח / דקה בטן בסיום הקורס (1.8).',
    },
  ];

  return {
    cadets,
    sessions,
    attendance,
    fitnessTests: [],
    trainingWeeks,
    missions: [survey],
    scores,
    notes: [],
    settings: { ...DEFAULT_SETTINGS, scoring: { ...scoring }, levelLabels: { ...DEFAULT_SETTINGS.levelLabels }, trainingTypeLabels: { ...DEFAULT_SETTINGS.trainingTypeLabels } },
  };
}
