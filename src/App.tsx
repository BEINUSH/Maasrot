import { useState, useEffect } from 'react';
import {
  Heart, LayoutDashboard, Users, Wallet, Store,
  CheckSquare, Clock, Grid3x3, Settings,
} from 'lucide-react';
import type {
  Tab, AppData, Guest, BudgetItem, Vendor, Task, TimelineEvent, SeatingTable, WeddingDetails,
} from './types';
import { loadData, saveData, generateId } from './utils/storage';
import Dashboard from './components/Dashboard';
import Guests from './components/Guests';
import Budget from './components/Budget';
import Vendors from './components/Vendors';
import Tasks from './components/Tasks';
import Timeline from './components/Timeline';
import Seating from './components/Seating';
import WeddingSetup from './components/WeddingSetup';
import './index.css';

const NAV = [
  { id: 'dashboard' as Tab, label: 'ראשי', icon: LayoutDashboard },
  { id: 'guests' as Tab, label: 'מוזמנים', icon: Users },
  { id: 'budget' as Tab, label: 'תקציב', icon: Wallet },
  { id: 'vendors' as Tab, label: 'ספקים', icon: Store },
  { id: 'tasks' as Tab, label: 'משימות', icon: CheckSquare },
  { id: 'timeline' as Tab, label: 'לוח יום', icon: Clock },
  { id: 'seating' as Tab, label: 'ישיבה', icon: Grid3x3 },
  { id: 'setup' as Tab, label: 'הגדרות', icon: Settings },
];

export default function App() {
  const [data, setData] = useState<AppData>(() => loadData());
  const [tab, setTab] = useState<Tab>('dashboard');
  const isFirstTime = !data.weddingDetails.brideName;

  useEffect(() => {
    saveData(data);
  }, [data]);

  const update = (patch: Partial<AppData>) =>
    setData(prev => ({ ...prev, ...patch }));

  // Wedding details
  const saveWeddingDetails = (details: WeddingDetails) => {
    update({ weddingDetails: details });
    if (tab === 'setup') setTab('dashboard');
  };

  // Guests
  const addGuest = (g: Omit<Guest, 'id'>) =>
    update({ guests: [...data.guests, { ...g, id: generateId() }] });
  const updateGuest = (id: string, patch: Partial<Guest>) =>
    update({ guests: data.guests.map(g => g.id === id ? { ...g, ...patch } : g) });
  const deleteGuest = (id: string) =>
    update({ guests: data.guests.filter(g => g.id !== id) });

  // Budget
  const addBudgetItem = (item: Omit<BudgetItem, 'id'>) =>
    update({ budgetItems: [...data.budgetItems, { ...item, id: generateId() }] });
  const updateBudgetItem = (id: string, patch: Partial<BudgetItem>) =>
    update({ budgetItems: data.budgetItems.map(b => b.id === id ? { ...b, ...patch } : b) });
  const deleteBudgetItem = (id: string) =>
    update({ budgetItems: data.budgetItems.filter(b => b.id !== id) });
  const updateTotalBudget = (amount: number) =>
    update({ weddingDetails: { ...data.weddingDetails, totalBudget: amount } });

  // Vendors
  const addVendor = (v: Omit<Vendor, 'id'>) =>
    update({ vendors: [...data.vendors, { ...v, id: generateId() }] });
  const updateVendor = (id: string, patch: Partial<Vendor>) =>
    update({ vendors: data.vendors.map(v => v.id === id ? { ...v, ...patch } : v) });
  const deleteVendor = (id: string) =>
    update({ vendors: data.vendors.filter(v => v.id !== id) });

  // Tasks
  const addTask = (t: Omit<Task, 'id'>) =>
    update({ tasks: [...data.tasks, { ...t, id: generateId() }] });
  const updateTask = (id: string, patch: Partial<Task>) =>
    update({ tasks: data.tasks.map(t => t.id === id ? { ...t, ...patch } : t) });
  const deleteTask = (id: string) =>
    update({ tasks: data.tasks.filter(t => t.id !== id) });

  // Timeline
  const addEvent = (e: Omit<TimelineEvent, 'id'>) =>
    update({ timelineEvents: [...data.timelineEvents, { ...e, id: generateId() }] });
  const updateEvent = (id: string, patch: Partial<TimelineEvent>) =>
    update({ timelineEvents: data.timelineEvents.map(e => e.id === id ? { ...e, ...patch } : e) });
  const deleteEvent = (id: string) =>
    update({ timelineEvents: data.timelineEvents.filter(e => e.id !== id) });

  // Tables
  const addTable = (t: Omit<SeatingTable, 'id'>) =>
    update({ tables: [...data.tables, { ...t, id: generateId() }] });
  const updateTable = (id: string, patch: Partial<SeatingTable>) =>
    update({ tables: data.tables.map(t => t.id === id ? { ...t, ...patch } : t) });
  const deleteTable = (id: string) =>
    update({ tables: data.tables.filter(t => t.id !== id) });
  const assignGuest = (guestId: string, tableId: string | undefined) =>
    updateGuest(guestId, { tableId });

  if (isFirstTime) {
    return (
      <div className="min-h-screen" style={{ background: '#fdf2f8' }}>
        <div className="max-w-lg mx-auto px-4 py-6">
          <WeddingSetup details={data.weddingDetails} onSave={saveWeddingDetails} isFirstTime />
        </div>
      </div>
    );
  }

  const { brideName, groomName, weddingDate } = data.weddingDetails;

  return (
    <div className="min-h-screen pb-20" style={{ background: '#fdf2f8' }}>
      {/* Header */}
      <header className="bg-white border-b border-rose-100 shadow-sm sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart size={20} className="text-rose-500 fill-rose-500" />
            <div>
              <div className="font-bold text-gray-800 text-sm leading-tight">
                {brideName} & {groomName}
              </div>
              {weddingDate && (
                <div className="text-xs text-gray-400">
                  {new Date(weddingDate).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setTab('setup')}
            className={`p-2 rounded-xl transition-colors ${tab === 'setup' ? 'bg-rose-100 text-rose-600' : 'text-gray-400 hover:bg-rose-50'}`}
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-4">
        {tab === 'dashboard' && (
          <Dashboard
            weddingDetails={data.weddingDetails}
            guests={data.guests}
            budgetItems={data.budgetItems}
            vendors={data.vendors}
            tasks={data.tasks}
            onNavigate={setTab}
          />
        )}
        {tab === 'guests' && (
          <Guests
            guests={data.guests}
            tables={data.tables}
            onAdd={addGuest}
            onUpdate={updateGuest}
            onDelete={deleteGuest}
          />
        )}
        {tab === 'budget' && (
          <Budget
            budgetItems={data.budgetItems}
            totalBudget={data.weddingDetails.totalBudget}
            onAdd={addBudgetItem}
            onUpdate={updateBudgetItem}
            onDelete={deleteBudgetItem}
            onUpdateBudget={updateTotalBudget}
          />
        )}
        {tab === 'vendors' && (
          <Vendors
            vendors={data.vendors}
            onAdd={addVendor}
            onUpdate={updateVendor}
            onDelete={deleteVendor}
          />
        )}
        {tab === 'tasks' && (
          <Tasks
            tasks={data.tasks}
            onAdd={addTask}
            onUpdate={updateTask}
            onDelete={deleteTask}
          />
        )}
        {tab === 'timeline' && (
          <Timeline
            events={data.timelineEvents}
            weddingDate={data.weddingDetails.weddingDate}
            onAdd={addEvent}
            onUpdate={updateEvent}
            onDelete={deleteEvent}
          />
        )}
        {tab === 'seating' && (
          <Seating
            tables={data.tables}
            guests={data.guests}
            onAddTable={addTable}
            onUpdateTable={updateTable}
            onDeleteTable={deleteTable}
            onAssignGuest={assignGuest}
          />
        )}
        {tab === 'setup' && (
          <WeddingSetup details={data.weddingDetails} onSave={saveWeddingDetails} />
        )}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-rose-100 z-20 shadow-lg">
        <div className="max-w-2xl mx-auto px-2">
          <div className="flex">
            {NAV.slice(0, 7).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-1 flex flex-col items-center py-2 pt-2.5 transition-colors ${
                  tab === id ? 'text-rose-600' : 'text-gray-400 hover:text-rose-400'
                }`}
              >
                <Icon size={20} strokeWidth={tab === id ? 2.5 : 1.8} />
                <span className={`text-[10px] mt-0.5 font-medium ${tab === id ? 'text-rose-600' : ''}`}>{label}</span>
                {tab === id && <div className="w-4 h-0.5 bg-rose-500 rounded-full mt-0.5" />}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
