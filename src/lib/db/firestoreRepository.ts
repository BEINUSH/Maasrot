import type {
  AppSettings,
  AttendanceRecord,
  AttendanceStatus,
  Cadet,
  CadetNote,
  DbShape,
  FitnessTestResult,
  ScoreEvent,
  TestPeriod,
  TrainingSession,
  TrainingWeek,
  WeekendMission,
} from '../../types';
import { uid } from '../id';
import { todayISO } from '../date';
import { STATUS_LABELS } from '../constants';
import { createSeed } from './seed';
import type { FirebaseWebConfig } from '../cloud/firebaseCloud';
import { getFirebase } from '../cloud/firebaseCloud';

const DOC_PATH = { collection: 'platoons', doc: 'main' } as const;

/**
 * Firestore-backed twin of LocalStorageRepository. Same public method
 * surface, same "whole-document" write model, so the swap in
 * repository.ts needs no changes anywhere else in the app. Realtime
 * sync comes from onSnapshot — every connected client (e.g. the two
 * course officers) sees the other's changes live.
 */
export class FirestoreRepository {
  private db: DbShape = createSeed();
  private ready = false;
  private listeners = new Set<() => void>();
  private unsubscribeSnapshot: (() => void) | undefined;
  private firestoreMod: Awaited<ReturnType<typeof getFirebase>>['firestoreMod'] | undefined;
  private firestore: Awaited<ReturnType<typeof getFirebase>>['db'] | undefined;

  constructor(private config: FirebaseWebConfig, private onFatalError: (message: string) => void) {
    void this.init();
  }

  private async init(): Promise<void> {
    try {
      const { firestoreMod, db } = await getFirebase(this.config);
      this.firestoreMod = firestoreMod;
      this.firestore = db;
      const ref = firestoreMod.doc(db, DOC_PATH.collection, DOC_PATH.doc);
      this.unsubscribeSnapshot = firestoreMod.onSnapshot(
        ref,
        async (snap) => {
          if (snap.exists()) {
            this.db = snap.data() as DbShape;
            this.ready = true;
            this.notify();
          } else {
            const seed = createSeed();
            await firestoreMod.setDoc(ref, seed);
          }
        },
        (err) => this.onFatalError(err.message),
      );
    } catch (err) {
      this.onFatalError(err instanceof Error ? err.message : 'שגיאת חיבור לענן');
    }
  }

  dispose(): void {
    this.unsubscribeSnapshot?.();
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  private commit(next: DbShape): void {
    this.db = next;
    this.notify();
    if (!this.firestoreMod || !this.firestore) return;
    const ref = this.firestoreMod.doc(this.firestore, DOC_PATH.collection, DOC_PATH.doc);
    this.firestoreMod.setDoc(ref, next).catch((err: Error) => this.onFatalError(err.message));
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): DbShape => this.db;
  isReady = (): boolean => this.ready;

  addCadet = (input: Omit<Cadet, 'id'>): Cadet => {
    const cadet: Cadet = { ...input, id: uid('cadet') };
    this.commit({ ...this.db, cadets: [...this.db.cadets, cadet] });
    return cadet;
  };

  updateCadet = (id: string, patch: Partial<Omit<Cadet, 'id'>>): void => {
    this.commit({
      ...this.db,
      cadets: this.db.cadets.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });
  };

  deleteCadet = (id: string): void => {
    this.commit({
      ...this.db,
      cadets: this.db.cadets.filter((c) => c.id !== id),
      attendance: this.db.attendance.filter((a) => a.cadetId !== id),
      fitnessTests: this.db.fitnessTests.filter((t) => t.cadetId !== id),
      scores: this.db.scores.filter((s) => s.cadetId !== id),
      notes: this.db.notes.filter((n) => n.cadetId !== id),
      missions: this.db.missions.map((m) => ({
        ...m,
        completions: m.completions.filter((c) => c.cadetId !== id),
      })),
    });
  };

  addSession = (input: Omit<TrainingSession, 'id'>): TrainingSession => {
    const session: TrainingSession = { ...input, id: uid('session') };
    this.commit({ ...this.db, sessions: [...this.db.sessions, session] });
    return session;
  };

  updateSession = (id: string, patch: Partial<Omit<TrainingSession, 'id'>>): void => {
    this.commit({
      ...this.db,
      sessions: this.db.sessions.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  };

  deleteSession = (id: string): void => {
    const recordIds = new Set(this.db.attendance.filter((a) => a.sessionId === id).map((a) => a.id));
    this.commit({
      ...this.db,
      sessions: this.db.sessions.filter((s) => s.id !== id),
      attendance: this.db.attendance.filter((a) => a.sessionId !== id),
      scores: this.db.scores.filter((s) => !s.refId || !recordIds.has(s.refId)),
    });
  };

  setAttendance = (sessionId: string, cadetId: string, status: AttendanceStatus, note?: string): void => {
    const session = this.db.sessions.find((s) => s.id === sessionId);
    if (!session) return;
    const existing = this.db.attendance.find((a) => a.sessionId === sessionId && a.cadetId === cadetId);
    const record: AttendanceRecord = existing
      ? { ...existing, status, note: note !== undefined ? note : existing.note }
      : { id: uid('att'), sessionId, cadetId, status, note };
    const attendance = existing
      ? this.db.attendance.map((a) => (a.id === existing.id ? record : a))
      : [...this.db.attendance, record];

    const scoring = this.db.settings.scoring;
    const points: Record<AttendanceStatus, number> = {
      present: scoring.present,
      listener: scoring.listener,
      medical: scoring.medical,
      absent: scoring.absent,
    };
    const scoreEvent: ScoreEvent = {
      id: uid('score'),
      cadetId,
      date: session.date,
      type: 'attendance',
      points: points[status],
      note: `${session.name} – ${STATUS_LABELS[status]}`,
      refId: record.id,
    };
    const existingScore = this.db.scores.find((s) => s.refId === record.id);
    const scores = existingScore
      ? this.db.scores.map((s) =>
          s.refId === record.id ? { ...scoreEvent, id: existingScore.id } : s,
        )
      : [...this.db.scores, scoreEvent];

    this.commit({ ...this.db, attendance, scores });
  };

  removeAttendance = (sessionId: string, cadetId: string): void => {
    const existing = this.db.attendance.find((a) => a.sessionId === sessionId && a.cadetId === cadetId);
    if (!existing) return;
    this.commit({
      ...this.db,
      attendance: this.db.attendance.filter((a) => a.id !== existing.id),
      scores: this.db.scores.filter((s) => s.refId !== existing.id),
    });
  };

  setAttendanceNote = (recordId: string, note: string): void => {
    this.commit({
      ...this.db,
      attendance: this.db.attendance.map((a) => (a.id === recordId ? { ...a, note } : a)),
    });
  };

  upsertFitnessTest = (
    cadetId: string,
    period: TestPeriod,
    values: Partial<Omit<FitnessTestResult, 'id' | 'cadetId' | 'period'>>,
  ): void => {
    const existing = this.db.fitnessTests.find((t) => t.cadetId === cadetId && t.period === period);
    const fitnessTests = existing
      ? this.db.fitnessTests.map((t) => (t.id === existing.id ? { ...t, ...values } : t))
      : [...this.db.fitnessTests, { id: uid('test'), cadetId, period, ...values }];
    this.commit({ ...this.db, fitnessTests });
  };

  addTrainingWeek = (input: Omit<TrainingWeek, 'id'>): void => {
    this.commit({
      ...this.db,
      trainingWeeks: [...this.db.trainingWeeks, { ...input, id: uid('week') }],
    });
  };

  updateTrainingWeek = (id: string, patch: Partial<Omit<TrainingWeek, 'id'>>): void => {
    this.commit({
      ...this.db,
      trainingWeeks: this.db.trainingWeeks.map((w) => (w.id === id ? { ...w, ...patch } : w)),
    });
  };

  deleteTrainingWeek = (id: string): void => {
    this.commit({ ...this.db, trainingWeeks: this.db.trainingWeeks.filter((w) => w.id !== id) });
  };

  addMission = (input: Omit<WeekendMission, 'id' | 'completions'>): void => {
    const mission: WeekendMission = {
      ...input,
      id: uid('mission'),
      completions: this.db.cadets.map((c) => ({ cadetId: c.id, completed: false })),
    };
    this.commit({ ...this.db, missions: [...this.db.missions, mission] });
  };

  updateMission = (id: string, patch: Partial<Omit<WeekendMission, 'id' | 'completions'>>): void => {
    this.commit({
      ...this.db,
      missions: this.db.missions.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    });
  };

  deleteMission = (id: string): void => {
    this.commit({
      ...this.db,
      missions: this.db.missions.filter((m) => m.id !== id),
      scores: this.db.scores.filter((s) => !s.refId || !s.refId.startsWith(`${id}:`)),
    });
  };

  setMissionCompletion = (missionId: string, cadetId: string, completed: boolean): void => {
    const mission = this.db.missions.find((m) => m.id === missionId);
    if (!mission) return;
    const hasEntry = mission.completions.some((c) => c.cadetId === cadetId);
    const completions = hasEntry
      ? mission.completions.map((c) =>
          c.cadetId === cadetId
            ? { ...c, completed, completedAt: completed ? todayISO() : undefined }
            : c,
        )
      : [...mission.completions, { cadetId, completed, completedAt: completed ? todayISO() : undefined }];

    const refId = `${missionId}:${cadetId}`;
    let scores = this.db.scores.filter((s) => s.refId !== refId);
    if (completed) {
      scores = [
        ...scores,
        {
          id: uid('score'),
          cadetId,
          date: todayISO(),
          type: 'mission',
          points: this.db.settings.scoring.mission,
          note: `משימת סופ"ש: ${mission.title}`,
          refId,
        },
      ];
    }

    this.commit({
      ...this.db,
      missions: this.db.missions.map((m) => (m.id === missionId ? { ...m, completions } : m)),
      scores,
    });
  };

  addScoreEvent = (input: Omit<ScoreEvent, 'id'>): void => {
    this.commit({ ...this.db, scores: [...this.db.scores, { ...input, id: uid('score') }] });
  };

  deleteScoreEvent = (id: string): void => {
    this.commit({ ...this.db, scores: this.db.scores.filter((s) => s.id !== id) });
  };

  addNote = (input: Omit<CadetNote, 'id'>): void => {
    this.commit({ ...this.db, notes: [...this.db.notes, { ...input, id: uid('note') }] });
  };

  deleteNote = (id: string): void => {
    this.commit({ ...this.db, notes: this.db.notes.filter((n) => n.id !== id) });
  };

  updateSettings = (settings: AppSettings): void => {
    this.commit({ ...this.db, settings });
  };

  exportJson = (): string => JSON.stringify(this.db, null, 2);

  importJson = (json: string): boolean => {
    try {
      const parsed = JSON.parse(json) as DbShape;
      if (!Array.isArray(parsed.cadets) || !parsed.settings || !Array.isArray(parsed.sessions)) {
        return false;
      }
      this.commit(parsed);
      return true;
    } catch {
      return false;
    }
  };

  resetToSeed = (): void => {
    this.commit(createSeed());
  };
}
