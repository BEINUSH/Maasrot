import { useState } from 'react';
import type { MonthRecord, Recipient, Donation } from './types';
import { storage } from './utils/storage';
import { calcMonthSummary } from './utils/calculations';
import Dashboard from './components/Dashboard';
import History from './components/History';
import Recipients from './components/Recipients';
import MonthForm from './components/MonthForm';
import DonationForm from './components/DonationForm';
import Modal from './components/Modal';
import './index.css';

type Tab = 'dashboard' | 'history' | 'recipients';

export default function App() {
  const [months, setMonths] = useState<MonthRecord[]>(() => storage.getMonths());
  const [recipients, setRecipients] = useState<Recipient[]>(() => storage.getRecipients());
  const [donations, setDonations] = useState<Donation[]>(() => storage.getDonations());
  const [tab, setTab] = useState<Tab>('dashboard');

  const [showMonthForm, setShowMonthForm] = useState(false);
  const [editingMonth, setEditingMonth] = useState<MonthRecord | undefined>();
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [donationForMonth, setDonationForMonth] = useState<string | undefined>();

  const summaries = months.map((m) => calcMonthSummary(m, donations));

  function saveMonth(r: MonthRecord) {
    const updated = months.some((m) => m.id === r.id)
      ? months.map((m) => (m.id === r.id ? r : m))
      : [...months, r];
    setMonths(updated);
    storage.saveMonths(updated);
    setShowMonthForm(false);
    setEditingMonth(undefined);
  }

  function deleteMonth(id: string) {
    if (!confirm('למחוק את החודש הזה? תרומות הקשורות אליו לא יימחקו.')) return;
    const updated = months.filter((m) => m.id !== id);
    setMonths(updated);
    storage.saveMonths(updated);
  }

  function saveDonation(d: Donation) {
    let finalDonation = d;
    if (d.recipientId.startsWith('new:')) {
      const name = d.recipientId.slice(4);
      const existing = recipients.find((r) => r.name === name && r.type === d.category);
      if (!existing) {
        const newR: Recipient = { id: Date.now().toString(), name, type: d.category };
        const updatedR = [...recipients, newR];
        setRecipients(updatedR);
        storage.saveRecipients(updatedR);
        finalDonation = { ...d, recipientId: newR.id };
      } else {
        finalDonation = { ...d, recipientId: existing.id };
      }
    }
    const updated = [...donations, finalDonation];
    setDonations(updated);
    storage.saveDonations(updated);
    setShowDonationForm(false);
    setDonationForMonth(undefined);
  }

  function deleteDonation(id: string) {
    if (!confirm('למחוק תרומה זו?')) return;
    const updated = donations.filter((d) => d.id !== id);
    setDonations(updated);
    storage.saveDonations(updated);
  }

  function addRecipient(r: Recipient) {
    const updated = [...recipients, r];
    setRecipients(updated);
    storage.saveRecipients(updated);
  }

  function deleteRecipient(id: string) {
    if (!confirm('למחוק מקבל זה?')) return;
    const updated = recipients.filter((r) => r.id !== id);
    setRecipients(updated);
    storage.saveRecipients(updated);
  }

  function openAddDonation(forMonth?: string) {
    setDonationForMonth(forMonth);
    setShowDonationForm(true);
  }

  function openEditMonth(r: MonthRecord) {
    setEditingMonth(r);
    setShowMonthForm(true);
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'dashboard', label: 'לוח ראשי' },
    { id: 'history', label: 'היסטוריה' },
    { id: 'recipients', label: 'מקבלים' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#f5f4ef' }}>
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-xl font-bold text-gray-800" style={{ margin: 0 }}>מעשרות וחומש</h1>
          <p className="text-xs text-gray-400" style={{ margin: 0 }}>ניהול הפרשות לצדקה</p>
        </div>
      </header>

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-5 pb-24">
        {tab === 'dashboard' && (
          <Dashboard
            summaries={summaries}
            onAddMonth={() => { setEditingMonth(undefined); setShowMonthForm(true); }}
            onAddDonation={() => openAddDonation()}
          />
        )}
        {tab === 'history' && (
          <History
            summaries={summaries}
            donations={donations}
            recipients={recipients}
            onEditMonth={openEditMonth}
            onDeleteMonth={deleteMonth}
            onDeleteDonation={deleteDonation}
            onAddDonation={openAddDonation}
          />
        )}
        {tab === 'recipients' && (
          <Recipients
            recipients={recipients}
            onAdd={addRecipient}
            onDelete={deleteRecipient}
          />
        )}
      </main>

      {tab !== 'recipients' && (
        <div className="fixed bottom-6 left-1/2 flex gap-3 z-10" style={{ transform: 'translateX(50%)' }}>
          <button
            onClick={() => { setEditingMonth(undefined); setShowMonthForm(true); }}
            className="bg-emerald-600 text-white px-5 py-3 rounded-full shadow-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            + חודש
          </button>
          <button
            onClick={() => openAddDonation()}
            className="bg-blue-600 text-white px-5 py-3 rounded-full shadow-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + תרומה
          </button>
        </div>
      )}

      <Modal open={showMonthForm} onClose={() => { setShowMonthForm(false); setEditingMonth(undefined); }}>
        <MonthForm
          existing={editingMonth}
          onSave={saveMonth}
          onCancel={() => { setShowMonthForm(false); setEditingMonth(undefined); }}
        />
      </Modal>

      <Modal open={showDonationForm} onClose={() => { setShowDonationForm(false); setDonationForMonth(undefined); }}>
        <DonationForm
          months={months}
          recipients={recipients}
          defaultForMonth={donationForMonth}
          onSave={saveDonation}
          onCancel={() => { setShowDonationForm(false); setDonationForMonth(undefined); }}
        />
      </Modal>
    </div>
  );
}
