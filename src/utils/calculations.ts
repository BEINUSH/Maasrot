import type { MonthRecord, Donation, MonthSummary, GivingLevel } from '../types';

export function calcObligation(income: number, level: GivingLevel) {
  if (level === 'maaser') {
    const total = income * 0.1;
    return { total, family: total * 0.5, external: total * 0.5 };
  } else {
    // chomesh = 20%
    // first 10% (maaser portion): 50% family + 50% external
    // extra 10%: 100% family
    const total = income * 0.2;
    const maaserPart = income * 0.1;
    const extraPart = income * 0.1;
    return {
      total,
      family: maaserPart * 0.5 + extraPart,
      external: maaserPart * 0.5,
    };
  }
}

export function calcMonthSummary(
  record: MonthRecord,
  donations: Donation[]
): MonthSummary {
  const forMonth = donations.filter((d) => d.forMonth === record.id);
  const obligation = calcObligation(record.income, record.givingLevel);

  const givenFamily = forMonth
    .filter((d) => d.category === 'family')
    .reduce((s, d) => s + d.amount, 0);
  const givenExternal = forMonth
    .filter((d) => d.category === 'external')
    .reduce((s, d) => s + d.amount, 0);
  const givenTotal = givenFamily + givenExternal;

  return {
    record,
    obligation,
    given: { total: givenTotal, family: givenFamily, external: givenExternal },
    deficit: {
      total: obligation.total - givenTotal,
      family: obligation.family - givenFamily,
      external: obligation.external - givenExternal,
    },
  };
}

export function monthLabel(year: number, month: number): string {
  const months = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
  ];
  return `${months[month - 1]} ${year}`;
}

export function monthId(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function formatNIS(amount: number): string {
  return `₪${amount.toLocaleString('he-IL', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
