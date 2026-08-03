export type TeamId = 1 | 2 | 3;
export type FitnessLevel = 'A' | 'B' | 'C';
export type AttendanceStatus = 'present' | 'listener' | 'medical' | 'absent';
export type TestPeriod = 'opening' | 'mid' | 'final';
export type NoteType = 'coach' | 'general' | 'medical' | 'pain';
export type TrainingType = 'run' | 'intervals' | 'tempo' | 'strength' | 'mobility' | 'stretching';
export type ScoreEventType =
  | 'attendance'
  | 'mission'
  | 'improvement'
  | 'helping'
  | 'leadership'
  | 'excellence'
  | 'manual';

export interface Cadet {
  id: string;
  fullName: string;
  team: TeamId;
  fitnessLevel: FitnessLevel;
  trainingGroup: string;
  medicalProfile: string;
  restrictions: string;
  painNotes: string;
  exempt: boolean;
  phone: string;
  email: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  joinDate: string;
}

export interface TrainingSession {
  id: string;
  date: string;
  name: string;
  description?: string;
  team?: TeamId;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  cadetId: string;
  status: AttendanceStatus;
  note?: string;
}

export interface FitnessTestResult {
  id: string;
  cadetId: string;
  period: TestPeriod;
  run3kSeconds?: number;
  pushups?: number;
  pullups?: number;
  plankSeconds?: number;
  burpees?: number;
}

export type MetricKey = 'run3kSeconds' | 'pushups' | 'pullups' | 'plankSeconds' | 'burpees';

export interface TrainingWeek {
  id: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  goals: string;
  types: TrainingType[];
  notes: string;
}

export interface MissionCompletion {
  cadetId: string;
  completed: boolean;
  completedAt?: string;
}

export interface WeekendMission {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  date: string;
  completions: MissionCompletion[];
}

export interface ScoreEvent {
  id: string;
  cadetId: string;
  date: string;
  type: ScoreEventType;
  points: number;
  note?: string;
  refId?: string;
}

export interface CadetNote {
  id: string;
  cadetId: string;
  date: string;
  type: NoteType;
  text: string;
}

export interface ScoringRules {
  present: number;
  listener: number;
  medical: number;
  absent: number;
  mission: number;
  improvement: number;
  helping: number;
  leadership: number;
  excellence: number;
}

export interface AppSettings {
  appName: string;
  subtitle: string;
  managerName: string;
  managerRole: string;
  courseStart: string;
  courseEnd: string;
  scoring: ScoringRules;
  levelLabels: Record<FitnessLevel, string>;
  trainingTypeLabels: Record<TrainingType, string>;
}

export interface DbShape {
  cadets: Cadet[];
  sessions: TrainingSession[];
  attendance: AttendanceRecord[];
  fitnessTests: FitnessTestResult[];
  trainingWeeks: TrainingWeek[];
  missions: WeekendMission[];
  scores: ScoreEvent[];
  notes: CadetNote[];
  settings: AppSettings;
}
