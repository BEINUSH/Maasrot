import { useState } from 'react';
import { CloudOff, LogOut, ShieldCheck } from 'lucide-react';
import { useCloudAuth } from '../../hooks/useCloudAuth';
import { repository } from '../../lib/db/repository';
import type { FirebaseWebConfig } from '../../lib/db/repository';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { TextAreaField, TextField } from '../ui/Field';

function parseConfigInput(raw: string): FirebaseWebConfig | undefined {
  const trimmed = raw.trim();
  if (trimmed === '') return undefined;
  try {
    // תומך גם בהדבקה של קטע הקוד המלא מ-Firebase Console וגם ב-JSON טהור
    const jsonLike = trimmed
      .replace(/^[^{]*/, '')
      .replace(/;\s*$/, '')
      .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
      .replace(/'/g, '"');
    const parsed = JSON.parse(jsonLike) as FirebaseWebConfig;
    if (!parsed.apiKey || !parsed.projectId || !parsed.appId) return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

export function CloudSyncCard() {
  const auth = useCloudAuth();
  const [configText, setConfigText] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [configError, setConfigError] = useState('');
  const [busy, setBusy] = useState(false);

  const submitConfig = async () => {
    const parsed = parseConfigInput(configText);
    if (!parsed) {
      setConfigError('לא הצלחתי לקרוא את הקונפיג — ודאו שהדבקתם את בלוק ה-firebaseConfig המלא מ-Firebase Console');
      return;
    }
    setConfigError('');
    setBusy(true);
    await repository.cloud.configure(parsed);
    setBusy(false);
  };

  const submitSignIn = async () => {
    setBusy(true);
    await repository.cloud.signIn(email, password);
    setBusy(false);
  };

  const disable = () => {
    if (window.confirm('לבטל את סנכרון הענן ולחזור לנתונים מקומיים בדפדפן הזה בלבד?')) {
      repository.cloud.disable();
    }
  };

  if (auth.status === 'signed-in') {
    return (
      <Card>
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <ShieldCheck size={18} className="text-lvla" />
          סנכרון ענן
        </h3>
        <div className="rounded-xl bg-lvla/10 border border-lvla/30 px-4 py-3 text-sm font-semibold text-lvla mb-4">
          מחובר/ת לענן כ-{auth.email}. כל שינוי מסתנכרן בזמן אמת בין כל מי שמחובר.
        </div>
        <Button
          variant="danger"
          icon={LogOut}
          onClick={() => void repository.cloud.signOut()}
        >
          התנתקות
        </Button>
      </Card>
    );
  }

  if (auth.configured) {
    return (
      <Card>
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <ShieldCheck size={18} className="text-accent" />
          סנכרון ענן
        </h3>
        {auth.status === 'error' && auth.error && (
          <div className="rounded-xl bg-lvlc/10 border border-lvlc/30 px-4 py-3 text-sm font-semibold text-lvlc mb-4">
            {auth.error}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <TextField label='דוא"ל' type="email" dir="ltr" value={email} onChange={setEmail} />
          <TextField label="סיסמה" type="text" dir="ltr" value={password} onChange={setPassword} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => void submitSignIn()} disabled={busy || email.trim() === '' || password === ''}>
            {auth.status === 'signing-in' ? 'מתחבר…' : 'התחברות'}
          </Button>
          <Button variant="ghost" icon={CloudOff} onClick={disable}>
            ביטול סנכרון ענן
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="font-bold mb-2 flex items-center gap-2">
        <ShieldCheck size={18} className="text-ink3" />
        סנכרון ענן
      </h3>
      <p className="text-sm text-ink2 mb-4">
        כרגע הנתונים נשמרים רק בדפדפן הזה. כדי לשתף נתונים בזמן אמת עם עוד מישהו (למשל בין שני מכשירים),
        הדביקו כאן את קטע ה-<span dir="ltr" className="font-mono text-xs">firebaseConfig</span> שקיבלתם מ-
        Firebase Console (Project settings → Your apps).
      </p>
      <TextAreaField
        label="Firebase config"
        value={configText}
        onChange={setConfigText}
        rows={6}
        placeholder={'{ apiKey: "...", authDomain: "...", projectId: "...", appId: "..." }'}
      />
      {configError && <p className="text-sm font-semibold text-lvlc mt-2">{configError}</p>}
      <Button className="mt-3" onClick={() => void submitConfig()} disabled={busy || configText.trim() === ''}>
        חיבור
      </Button>
    </Card>
  );
}
