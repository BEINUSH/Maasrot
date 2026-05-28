import { useState } from 'react';
import { Plus, Edit2, Trash2, Users, UserMinus } from 'lucide-react';
import Modal from './Modal';
import type { Guest, SeatingTable } from '../types';

interface Props {
  tables: SeatingTable[];
  guests: Guest[];
  onAddTable: (t: Omit<SeatingTable, 'id'>) => void;
  onUpdateTable: (id: string, updates: Partial<SeatingTable>) => void;
  onDeleteTable: (id: string) => void;
  onAssignGuest: (guestId: string, tableId: string | undefined) => void;
}

const TABLE_EMPTY: Omit<SeatingTable, 'id'> = { name: '', capacity: 10, shape: 'round', notes: '' };

export default function Seating({ tables, guests, onAddTable, onUpdateTable, onDeleteTable, onAssignGuest }: Props) {
  const [showTableModal, setShowTableModal] = useState(false);
  const [editingTable, setEditingTable] = useState<SeatingTable | null>(null);
  const [tableForm, setTableForm] = useState<Omit<SeatingTable, 'id'>>(TABLE_EMPTY);
  const [deleteTableId, setDeleteTableId] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [assignSearch, setAssignSearch] = useState('');

  const setT = <K extends keyof typeof tableForm>(k: K, v: (typeof tableForm)[K]) =>
    setTableForm(prev => ({ ...prev, [k]: v }));

  const openAddTable = () => { setEditingTable(null); setTableForm(TABLE_EMPTY); setShowTableModal(true); };
  const openEditTable = (t: SeatingTable) => { setEditingTable(t); setTableForm({ name: t.name, capacity: t.capacity, shape: t.shape, notes: t.notes ?? '' }); setShowTableModal(true); };

  const handleSaveTable = () => {
    if (!tableForm.name.trim()) return;
    if (editingTable) onUpdateTable(editingTable.id, tableForm);
    else onAddTable(tableForm);
    setShowTableModal(false);
  };

  const guestsForTable = (tableId: string) =>
    guests.filter(g => g.tableId === tableId);

  const unassignedGuests = guests.filter(g => !g.tableId && g.rsvp !== 'declined');

  const seatsUsed = (tableId: string) =>
    guestsForTable(tableId).reduce((s, g) => s + g.seats, 0);

  const totalAssigned = guests.filter(g => g.tableId && g.rsvp !== 'declined').reduce((s, g) => s + g.seats, 0);

  const searchedUnassigned = unassignedGuests.filter(g =>
    !assignSearch || g.name.includes(assignSearch)
  );

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-white rounded-2xl border border-rose-100 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700">סידור ישיבה</h3>
          <button onClick={openAddTable} className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1">
            <Plus size={16} />הוסף שולחן
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-blue-50 rounded-xl p-2.5">
            <div className="text-lg font-bold text-blue-700">{tables.length}</div>
            <div className="text-xs text-blue-500">שולחנות</div>
          </div>
          <div className="bg-green-50 rounded-xl p-2.5">
            <div className="text-lg font-bold text-green-700">{totalAssigned}</div>
            <div className="text-xs text-green-500">מוקצים</div>
          </div>
          <div className={`rounded-xl p-2.5 ${unassignedGuests.length > 0 ? 'bg-orange-50' : 'bg-gray-50'}`}>
            <div className={`text-lg font-bold ${unassignedGuests.length > 0 ? 'text-orange-700' : 'text-gray-500'}`}>{unassignedGuests.length}</div>
            <div className={`text-xs ${unassignedGuests.length > 0 ? 'text-orange-500' : 'text-gray-400'}`}>ממתינים</div>
          </div>
        </div>
      </div>

      {tables.length === 0 ? (
        <div className="bg-white rounded-2xl border border-rose-100 p-8 text-center shadow-sm">
          <Users size={32} className="text-rose-200 mx-auto mb-2" />
          <p className="text-gray-500">עוד לא הוספתם שולחנות</p>
          <button onClick={openAddTable} className="mt-3 bg-rose-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-rose-600 transition-colors">הוסף שולחן ראשון</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {tables.map(table => {
            const used = seatsUsed(table.id);
            const tGuests = guestsForTable(table.id);
            const pct = table.capacity > 0 ? Math.min(100, Math.round(used / table.capacity * 100)) : 0;
            const isSelected = selectedTable === table.id;
            const isFull = used >= table.capacity;

            return (
              <div key={table.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${isSelected ? 'border-rose-400 ring-2 ring-rose-200' : 'border-rose-100 hover:border-rose-200'}`}>
                <div className="p-3 cursor-pointer" onClick={() => setSelectedTable(isSelected ? null : table.id)}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{table.shape === 'round' ? '⭕' : '🟦'}</span>
                      <span className="font-semibold text-gray-800">{table.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={e => { e.stopPropagation(); openEditTable(table); }} className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-50 transition-colors"><Edit2 size={12} /></button>
                      <button onClick={e => { e.stopPropagation(); setDeleteTableId(table.id); }} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"><Trash2 size={12} /></button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className={`font-medium ${isFull ? 'text-red-600' : 'text-gray-700'}`}>{used}/{table.capacity} מקומות</span>
                    <span className={`text-xs ${isFull ? 'text-red-500' : 'text-gray-400'}`}>{isFull ? 'מלא' : `${table.capacity - used} פנויים`}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${isFull ? 'bg-red-400' : pct > 80 ? 'bg-amber-400' : 'bg-green-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>

                {/* Guest chips */}
                {tGuests.length > 0 && (
                  <div className="px-3 pb-2 flex flex-wrap gap-1">
                    {tGuests.map(g => (
                      <span key={g.id} className="text-xs bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                        {g.name}{g.seats > 1 ? `+${g.seats - 1}` : ''}
                        <button onClick={() => onAssignGuest(g.id, undefined)} className="text-rose-400 hover:text-red-500 transition-colors">×</button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Assign panel */}
                {isSelected && !isFull && (
                  <div className="border-t border-rose-50 p-3">
                    <div className="text-xs font-medium text-gray-500 mb-2">הוסף מוזמן לשולחן זה:</div>
                    <input
                      className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-rose-400 mb-2"
                      placeholder="חפש שם..."
                      value={assignSearch}
                      onChange={e => setAssignSearch(e.target.value)}
                      onClick={e => e.stopPropagation()}
                    />
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {searchedUnassigned.length === 0 ? (
                        <div className="text-xs text-gray-400 text-center py-2">אין מוזמנים זמינים</div>
                      ) : searchedUnassigned.map(g => (
                        <button
                          key={g.id}
                          onClick={e => { e.stopPropagation(); onAssignGuest(g.id, table.id); setAssignSearch(''); }}
                          className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-rose-50 text-xs transition-colors"
                        >
                          <span className="text-gray-700">{g.name}</span>
                          <span className="text-gray-400">{g.seats} מקומות</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Unassigned guests list */}
      {unassignedGuests.length > 0 && tables.length > 0 && (
        <div className="bg-white rounded-2xl border border-orange-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <UserMinus size={16} className="text-orange-500" />
            <h3 className="font-semibold text-gray-700">מוזמנים ללא שולחן ({unassignedGuests.length})</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {unassignedGuests.map(g => (
              <span key={g.id} className="text-sm bg-orange-50 text-orange-700 px-3 py-1 rounded-full">
                {g.name}{g.seats > 1 ? ` (${g.seats})` : ''}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">לחץ על שולחן כדי להוסיף מוזמנים</p>
        </div>
      )}

      {/* Table modal */}
      <Modal open={showTableModal} onClose={() => setShowTableModal(false)} title={editingTable ? 'עריכת שולחן' : 'הוספת שולחן'}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שם השולחן *</label>
            <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400" value={tableForm.name} onChange={e => setT('name', e.target.value)} placeholder="שולחן 1, שולחן משפחה, VIP..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">קיבולת (מקומות)</label>
              <input type="number" min={1} max={50} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400" value={tableForm.capacity} onChange={e => setT('capacity', Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">צורה</label>
              <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400" value={tableForm.shape} onChange={e => setT('shape', e.target.value as SeatingTable['shape'])}>
                <option value="round">⭕ עגול</option>
                <option value="rectangular">🟦 מלבני</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">הערות</label>
            <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400" value={tableForm.notes ?? ''} onChange={e => setT('notes', e.target.value)} placeholder="ליד הבמה, קרוב לדלת..." />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleSaveTable} disabled={!tableForm.name.trim()} className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-200 text-white font-semibold py-2.5 rounded-xl transition-colors">שמור</button>
            <button onClick={() => setShowTableModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">ביטול</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteTableId} onClose={() => setDeleteTableId(null)} title="מחיקת שולחן" size="sm">
        <p className="text-gray-600 mb-1">האם למחוק שולחן זה?</p>
        <p className="text-xs text-gray-400 mb-4">המוזמנים שהוקצו לשולחן זה יהיו ללא שולחן</p>
        <div className="flex gap-2">
          <button onClick={() => {
            if (deleteTableId) {
              guests.filter(g => g.tableId === deleteTableId).forEach(g => onAssignGuest(g.id, undefined));
              onDeleteTable(deleteTableId);
              setDeleteTableId(null);
              if (selectedTable === deleteTableId) setSelectedTable(null);
            }
          }} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl hover:bg-red-600 transition-colors">מחק</button>
          <button onClick={() => setDeleteTableId(null)} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">ביטול</button>
        </div>
      </Modal>
    </div>
  );
}
