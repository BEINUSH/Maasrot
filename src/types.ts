export type Tab = 'dashboard' | 'guests' | 'budget' | 'vendors' | 'tasks' | 'timeline' | 'seating' | 'setup';

export type RSVPStatus = 'pending' | 'confirmed' | 'declined';
export type MealPreference = 'regular' | 'vegetarian' | 'vegan' | 'gluten_free' | 'kosher';
export type GuestGroup = 'family_bride' | 'family_groom' | 'friends_bride' | 'friends_groom' | 'work' | 'other';

export interface Guest {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  rsvp: RSVPStatus;
  seats: number;
  mealPreference: MealPreference;
  group: GuestGroup;
  tableId?: string;
  isChild?: boolean;
  notes?: string;
}

export type ExpenseCategory =
  | 'venue' | 'catering' | 'music' | 'photography' | 'videography'
  | 'flowers' | 'invitations' | 'dress' | 'groom_attire' | 'rings'
  | 'makeup' | 'honeymoon' | 'transportation' | 'accommodation'
  | 'decoration' | 'cake' | 'other';

export interface BudgetItem {
  id: string;
  name: string;
  category: ExpenseCategory;
  estimatedAmount: number;
  actualAmount: number;
  paidAmount: number;
  vendorId?: string;
  notes?: string;
}

export type VendorCategory =
  | 'venue' | 'catering' | 'music' | 'photography' | 'videography'
  | 'flowers' | 'makeup' | 'transportation' | 'decoration'
  | 'invitations' | 'cake' | 'rabbi' | 'other';

export type VendorStatus = 'researching' | 'contacted' | 'meeting' | 'contracted' | 'deposit_paid' | 'fully_paid';

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  contactName?: string;
  phone?: string;
  email?: string;
  website?: string;
  status: VendorStatus;
  totalPrice?: number;
  depositAmount?: number;
  depositPaid: boolean;
  fullyPaid: boolean;
  notes?: string;
  rating?: number;
}

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskCategory =
  | 'venue' | 'guests' | 'budget' | 'vendors' | 'attire'
  | 'ceremony' | 'reception' | 'honeymoon' | 'legal' | 'beauty'
  | 'music' | 'flowers' | 'food' | 'other';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  completedDate?: string;
}

export interface TimelineEvent {
  id: string;
  time: string;
  endTime?: string;
  title: string;
  location?: string;
  description?: string;
  category: 'ceremony' | 'reception' | 'preparation' | 'transport' | 'photo' | 'other';
}

export interface SeatingTable {
  id: string;
  name: string;
  capacity: number;
  shape: 'round' | 'rectangular';
  notes?: string;
}

export interface WeddingDetails {
  brideName: string;
  groomName: string;
  weddingDate?: string;
  ceremonyTime?: string;
  venue?: string;
  city?: string;
  totalBudget: number;
}

export interface AppData {
  weddingDetails: WeddingDetails;
  guests: Guest[];
  budgetItems: BudgetItem[];
  vendors: Vendor[];
  tasks: Task[];
  timelineEvents: TimelineEvent[];
  tables: SeatingTable[];
}
