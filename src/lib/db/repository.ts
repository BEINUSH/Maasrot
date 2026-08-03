import type {
  AppSettings,
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
import { FirestoreRepository } from './firestoreRepository';
import type { FirebaseWebConfig } from '../cloud/firebaseCloud';
import {
  clearCloudConfig,
  loadCloudConfig,
  saveCloudConfig,
  signInCloud,
  signOutCloud,
  watchCloudAuth,
} from '../cloud/firebaseCloud';
import { AnonymousCloudRepository } from './anonymousCloudRepository';
import {
  clearAnonymousSyncId,
  createAnonymousStore,
  loadAnonymousSyncId,
  readSyncIdFromUrl,
  saveAnonymousSyncId,
  shareLinkFor,
} from '../cloud/anonymousCloud';

export interface SyncState {
  mode: 'local' | 'anonymous' | 'firebase';
  status: 'idle' | 'connecting' | 'connected' | 'signed-out' | 'error';
  email?: string;
  shareLink?: string;
  error?: string;
}

const STORAGE_KEY = 'platoon-fitness-db-v1';

/**
 * Local-only backend. Same public method surface as FirestoreRepository
 * so RepositoryFacade can swap between them without any other file
 * (hooks, components) knowing which one is active.
 */
class LocalStorageRepository {
  private db: DbShape;
  private listeners = new Set<() => void>();

  constructor() {
    this.db = this.load();
  }

  private load(): DbShape {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as DbShape;
    } catch {
      // נתונים פגומים — נאתחל מחדש מנתוני הדמו
    }
    const seed = createSeed();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  private commit(next: DbShape): void {
    this.db = next;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    this.listeners.forEach((listener) => listener());
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): DbShape => this.db;
  isReady = (): boolean => true;

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
    const record = existing
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

type Backend = LocalStorageRepository | FirestoreRepository | AnonymousCloudRepository;

/**
 * Public facade. Every hook in the app talks to `repository` and never
 * knows which backend is active — the facade swaps it in place and
 * re-notifies subscribers, and exposes a `cloud` namespace to drive the
 * Settings UI and the login gate.
 *
 * Priority on startup: an explicitly configured Firebase project (real
 * auth, real security rules) always wins if present. Otherwise, to
 * satisfy "zero setup, shared by default", the app auto-provisions an
 * unauthenticated shared jsonblob.com store the very first time it runs
 * anywhere with nothing configured — the resulting id is what needs to
 * reach a second device (via the share link, e.g. pasted to Claude to
 * forward). If that provisioning fails (offline, blocked network), it
 * falls back to plain LocalStorage rather than breaking the app.
 */
class RepositoryFacade {
  private active: Backend = new LocalStorageRepository();
  private dbListeners = new Set<() => void>();
  private syncListeners = new Set<() => void>();
  private syncState: SyncState = { mode: 'local', status: 'idle' };
  private firebaseConfig: FirebaseWebConfig | undefined = loadCloudConfig();
  private unwatchFirebaseAuth: (() => void) | undefined;
  private unsubActiveBackend: (() => void) | undefined;

  constructor() {
    this.unsubActiveBackend = this.active.subscribe(() => this.notifyDb());
    if (this.firebaseConfig) {
      this.syncState = { mode: 'firebase', status: 'connecting' };
      void this.attachFirebaseAuthWatcher(this.firebaseConfig);
      return;
    }

    const urlSyncId = readSyncIdFromUrl();
    const existingAnonId = loadAnonymousSyncId();
    if (urlSyncId && urlSyncId !== existingAnonId) {
      saveAnonymousSyncId(urlSyncId);
      this.switchToAnonymous(urlSyncId);
    } else if (existingAnonId) {
      this.switchToAnonymous(existingAnonId);
    } else {
      void this.bootstrapAnonymousStore();
    }
  }

  private async bootstrapAnonymousStore(): Promise<void> {
    this.syncState = { mode: 'anonymous', status: 'connecting' };
    this.notifySync();
    try {
      const seed = this.active.getSnapshot();
      const id = await createAnonymousStore(seed);
      saveAnonymousSyncId(id);
      this.switchToAnonymous(id);
    } catch (err) {
      // No network / blocked / offline: keep working locally rather than break the app.
      this.syncState = {
        mode: 'local',
        status: 'error',
        error: err instanceof Error ? err.message : 'שגיאת חיבור לענן',
      };
      this.notifySync();
    }
  }

  private notifyDb(): void {
    this.dbListeners.forEach((l) => l());
  }

  private notifySync(): void {
    this.syncListeners.forEach((l) => l());
  }

  private async attachFirebaseAuthWatcher(config: FirebaseWebConfig): Promise<void> {
    try {
      this.unwatchFirebaseAuth = await watchCloudAuth(config, (email) => {
        if (email) {
          this.syncState = { mode: 'firebase', status: 'connected', email };
          this.switchBackend(new FirestoreRepository(config, (message) => this.reportError(message)));
        } else {
          this.syncState = { mode: 'firebase', status: 'signed-out' };
          this.switchBackend(new LocalStorageRepository());
        }
        this.notifySync();
      });
    } catch (err) {
      this.syncState = {
        mode: 'firebase',
        status: 'error',
        error: err instanceof Error ? err.message : 'שגיאת חיבור לענן',
      };
      this.notifySync();
    }
  }

  private reportError(message: string): void {
    this.syncState = { ...this.syncState, status: 'error', error: message };
    this.notifySync();
  }

  private switchToAnonymous(id: string): void {
    this.switchBackend(new AnonymousCloudRepository(id, (message) => this.reportError(message)));
    this.syncState = { mode: 'anonymous', status: 'connected', shareLink: shareLinkFor(id) };
    this.notifySync();
  }

  private switchBackend(next: Backend): void {
    this.unsubActiveBackend?.();
    if (this.active instanceof FirestoreRepository || this.active instanceof AnonymousCloudRepository) {
      this.active.dispose();
    }
    this.active = next;
    this.unsubActiveBackend = this.active.subscribe(() => this.notifyDb());
    this.notifyDb();
  }

  // ---- data API (delegates to whichever backend is active) ----

  subscribe = (listener: () => void): (() => void) => {
    this.dbListeners.add(listener);
    return () => {
      this.dbListeners.delete(listener);
    };
  };

  getSnapshot = (): DbShape => this.active.getSnapshot();
  isCloudDataReady = (): boolean => this.active.isReady();

  addCadet: LocalStorageRepository['addCadet'] = (input) => this.active.addCadet(input);
  updateCadet: LocalStorageRepository['updateCadet'] = (id, patch) => this.active.updateCadet(id, patch);
  deleteCadet: LocalStorageRepository['deleteCadet'] = (id) => this.active.deleteCadet(id);
  addSession: LocalStorageRepository['addSession'] = (input) => this.active.addSession(input);
  updateSession: LocalStorageRepository['updateSession'] = (id, patch) => this.active.updateSession(id, patch);
  deleteSession: LocalStorageRepository['deleteSession'] = (id) => this.active.deleteSession(id);
  setAttendance: LocalStorageRepository['setAttendance'] = (sessionId, cadetId, status, note) =>
    this.active.setAttendance(sessionId, cadetId, status, note);
  removeAttendance: LocalStorageRepository['removeAttendance'] = (sessionId, cadetId) =>
    this.active.removeAttendance(sessionId, cadetId);
  setAttendanceNote: LocalStorageRepository['setAttendanceNote'] = (recordId, note) =>
    this.active.setAttendanceNote(recordId, note);
  upsertFitnessTest: LocalStorageRepository['upsertFitnessTest'] = (cadetId, period, values) =>
    this.active.upsertFitnessTest(cadetId, period, values);
  addTrainingWeek: LocalStorageRepository['addTrainingWeek'] = (input) => this.active.addTrainingWeek(input);
  updateTrainingWeek: LocalStorageRepository['updateTrainingWeek'] = (id, patch) =>
    this.active.updateTrainingWeek(id, patch);
  deleteTrainingWeek: LocalStorageRepository['deleteTrainingWeek'] = (id) => this.active.deleteTrainingWeek(id);
  addMission: LocalStorageRepository['addMission'] = (input) => this.active.addMission(input);
  updateMission: LocalStorageRepository['updateMission'] = (id, patch) => this.active.updateMission(id, patch);
  deleteMission: LocalStorageRepository['deleteMission'] = (id) => this.active.deleteMission(id);
  setMissionCompletion: LocalStorageRepository['setMissionCompletion'] = (missionId, cadetId, completed) =>
    this.active.setMissionCompletion(missionId, cadetId, completed);
  addScoreEvent: LocalStorageRepository['addScoreEvent'] = (input) => this.active.addScoreEvent(input);
  deleteScoreEvent: LocalStorageRepository['deleteScoreEvent'] = (id) => this.active.deleteScoreEvent(id);
  addNote: LocalStorageRepository['addNote'] = (input) => this.active.addNote(input);
  deleteNote: LocalStorageRepository['deleteNote'] = (id) => this.active.deleteNote(id);
  updateSettings: LocalStorageRepository['updateSettings'] = (settings) => this.active.updateSettings(settings);
  exportJson = (): string => this.active.exportJson();
  importJson = (json: string): boolean => this.active.importJson(json);
  resetToSeed = (): void => this.active.resetToSeed();

  // ---- cloud sync control (drives Settings UI + login gate) ----

  cloud = {
    subscribe: (listener: () => void): (() => void) => {
      this.syncListeners.add(listener);
      return () => this.syncListeners.delete(listener);
    },
    getSnapshot: (): SyncState => this.syncState,

    /** Switch from the default anonymous store to a properly authenticated Firebase project. */
    configureFirebase: async (config: FirebaseWebConfig): Promise<void> => {
      clearAnonymousSyncId();
      saveCloudConfig(config);
      this.firebaseConfig = config;
      this.syncState = { mode: 'firebase', status: 'connecting' };
      this.notifySync();
      this.unwatchFirebaseAuth?.();
      await this.attachFirebaseAuthWatcher(config);
    },

    signIn: async (email: string, password: string): Promise<{ ok: true } | { ok: false; error: string }> => {
      if (!this.firebaseConfig) return { ok: false, error: 'לא הוגדר חיבור לענן' };
      this.syncState = { ...this.syncState, status: 'connecting' };
      this.notifySync();
      const result = await signInCloud(this.firebaseConfig, email, password);
      if (!result.ok) {
        this.syncState = { mode: 'firebase', status: 'error', error: result.error };
        this.notifySync();
      }
      return result;
    },

    signOut: async (): Promise<void> => {
      if (!this.firebaseConfig) return;
      await signOutCloud(this.firebaseConfig);
    },

    /** Drop the Firebase project and fall back to (re-)provisioning the zero-setup shared store. */
    disableFirebase: (): void => {
      this.unwatchFirebaseAuth?.();
      clearCloudConfig();
      this.firebaseConfig = undefined;
      this.switchBackend(new LocalStorageRepository());
      void this.bootstrapAnonymousStore();
    },

    /** Stop sharing entirely and keep only this device's local copy. */
    disableAnonymous: (): void => {
      clearAnonymousSyncId();
      this.switchBackend(new LocalStorageRepository());
      this.syncState = { mode: 'local', status: 'idle' };
      this.notifySync();
    },
  };
}

export const repository = new RepositoryFacade();
export type { FirebaseWebConfig } from '../cloud/firebaseCloud';
