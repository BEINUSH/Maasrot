import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { LogIn } from 'lucide-react';
import { useCloudAuth } from '../../hooks/useCloudAuth';
import { useDb } from '../../hooks/useDb';
import { repository } from '../../lib/db/repository';
import { Button } from '../ui/Button';
import { TextField } from '../ui/Field';

interface CloudLoginGateProps {
  children: ReactNode;
}

function LoginScreen() {
  const auth = useCloudAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    await repository.cloud.signIn(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" dir="rtl">
      <form onSubmit={(e) => void submit(e)} className="card w-full max-w-sm p-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-accent2 text-white flex items-center justify-center mb-4">
          <LogIn size={22} />
        </div>
        <h1 className="text-xl font-extrabold mb-1">התחברות לענן</h1>
        <p className="text-sm text-ink3 mb-5">מערך הכושר הפלוגתי — כניסה עם המשתמש שהוגדר ב-Firebase</p>
        {auth.status === 'error' && auth.error && (
          <div className="rounded-xl bg-lvlc/10 border border-lvlc/30 px-3 py-2 text-sm font-semibold text-lvlc mb-4">
            {auth.error}
          </div>
        )}
        <div className="space-y-3 mb-4">
          <TextField label='דוא"ל' type="email" dir="ltr" value={email} onChange={setEmail} />
          <TextField label="סיסמה" type="text" dir="ltr" value={password} onChange={setPassword} />
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={auth.status === 'signing-in' || email.trim() === '' || password === ''}
        >
          {auth.status === 'signing-in' ? 'מתחבר…' : 'התחברות'}
        </Button>
      </form>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" dir="rtl">
      <div className="flex flex-col items-center gap-3 text-ink3">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        <span className="text-sm font-semibold">טוען נתונים מהענן…</span>
      </div>
    </div>
  );
}

export function CloudLoginGate({ children }: CloudLoginGateProps) {
  const auth = useCloudAuth();
  useDb(); // subscribes so the component re-renders once cloud data finishes loading

  if (!auth.configured) return <>{children}</>;
  if (auth.status !== 'signed-in') return <LoginScreen />;
  if (!repository.isCloudDataReady()) return <LoadingScreen />;
  return <>{children}</>;
}
