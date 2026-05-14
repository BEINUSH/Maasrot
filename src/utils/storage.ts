import type { MonthRecord, Recipient, Donation } from '../types';

const KEYS = {
  months: 'maasrot_months',
  recipients: 'maasrot_recipients',
  donations: 'maasrot_donations',
};

function load<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function save<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export const storage = {
  getMonths: (): MonthRecord[] => load<MonthRecord>(KEYS.months),
  saveMonths: (m: MonthRecord[]) => save(KEYS.months, m),

  getRecipients: (): Recipient[] => load<Recipient>(KEYS.recipients),
  saveRecipients: (r: Recipient[]) => save(KEYS.recipients, r),

  getDonations: (): Donation[] => load<Donation>(KEYS.donations),
  saveDonations: (d: Donation[]) => save(KEYS.donations, d),
};
