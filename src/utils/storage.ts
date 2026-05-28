import type { AppData, Task } from '../types';

const STORAGE_KEY = 'wedding_planner_v1';

function defaultTasks(): Task[] {
  const t = (id: string, title: string, category: Task['category'], priority: Task['priority'], dueMonths?: number): Task => ({
    id,
    title,
    category,
    priority,
    status: 'todo',
    dueDate: dueMonths !== undefined
      ? new Date(Date.now() + dueMonths * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      : undefined,
  });

  return [
    t('t1', 'קבעו תאריך לחתונה', 'venue', 'urgent', 0),
    t('t2', 'הגדירו תקציב כולל', 'budget', 'urgent', 0),
    t('t3', 'הכינו רשימת מוזמנים ראשונית', 'guests', 'high', 1),
    t('t4', 'הזמינו אולם אירועים', 'venue', 'urgent', 1),
    t('t5', 'בחרו צלם/ת', 'photography' as Task['category'], 'high', 2),
    t('t6', 'הזמינו להקה / DJ', 'music', 'high', 2),
    t('t7', 'בחרו קייטרינג', 'food', 'high', 3),
    t('t8', 'בחרו שמלת כלה', 'attire', 'high', 3),
    t('t9', 'בחרו חליפת חתן', 'attire', 'medium', 3),
    t('t10', 'שלחו save-the-date', 'guests', 'high', 3),
    t('t11', 'הזמינו רב לחתונה', 'ceremony', 'high', 4),
    t('t12', 'בחרו מעצב/ת פרחים', 'flowers', 'medium', 4),
    t('t13', 'הזמינו צלם וידאו', 'vendors', 'medium', 4),
    t('t14', 'שלחו הזמנות', 'guests', 'high', 5),
    t('t15', 'הזמינו עיצוב ואיפור לכלה', 'beauty', 'medium', 5),
    t('t16', 'הזמינו הסעות לאורחים', 'vendors', 'medium', 6),
    t('t17', 'קבעו לינה לאורחים מרחוק', 'vendors', 'low', 6),
    t('t18', 'תכננו את סידור הישיבה', 'guests', 'high', 7),
    t('t19', 'תכננו לוח זמנים ליום החתונה', 'ceremony', 'high', 7),
    t('t20', 'אשרו עם כל הספקים', 'vendors', 'urgent', 8),
    t('t21', 'הכינו מתנות לשושבינים', 'reception', 'low', 8),
    t('t22', 'ניסיון שמלה/חליפה סופי', 'attire', 'high', 9),
    t('t23', 'רשמו את הנישואין ברשות המוסמכת', 'legal', 'urgent', 9),
    t('t24', 'תכננו ירח דבש', 'honeymoon', 'medium', 9),
    t('t25', 'ארזו למסע הכלות', 'honeymoon', 'low', 10),
  ];
}

const defaultData: AppData = {
  weddingDetails: {
    brideName: '',
    groomName: '',
    totalBudget: 0,
  },
  guests: [],
  budgetItems: [],
  vendors: [],
  tasks: defaultTasks(),
  timelineEvents: [],
  tables: [],
};

export function loadData(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { ...defaultData };
    const parsed = JSON.parse(stored) as Partial<AppData>;
    return {
      weddingDetails: { ...defaultData.weddingDetails, ...parsed.weddingDetails },
      guests: parsed.guests ?? [],
      budgetItems: parsed.budgetItems ?? [],
      vendors: parsed.vendors ?? [],
      tasks: parsed.tasks ?? defaultTasks(),
      timelineEvents: parsed.timelineEvents ?? [],
      tables: parsed.tables ?? [],
    };
  } catch {
    return { ...defaultData };
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
