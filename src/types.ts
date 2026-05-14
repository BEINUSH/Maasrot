export type GivingLevel = 'maaser' | 'chomesh';
export type RecipientType = 'family' | 'external';

export interface MonthRecord {
  id: string; // "YYYY-MM"
  year: number;
  month: number; // 1-12
  income: number;
  givingLevel: GivingLevel;
  notes?: string;
}

export interface Recipient {
  id: string;
  name: string;
  type: RecipientType;
  notes?: string;
}

export interface Donation {
  id: string;
  date: string; // ISO date
  recipientId: string;
  amount: number;
  category: RecipientType;
  forMonth: string; // "YYYY-MM" - which month this covers
  notes?: string;
}

export interface MonthSummary {
  record: MonthRecord;
  obligation: {
    total: number;
    family: number;
    external: number;
  };
  given: {
    total: number;
    family: number;
    external: number;
  };
  deficit: {
    total: number;
    family: number;
    external: number;
  };
}
