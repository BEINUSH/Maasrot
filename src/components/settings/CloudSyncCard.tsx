import { useState } from 'react';
import { Check, CloudOff, Copy, LogOut, ShieldCheck, Users } from 'lucide-react';
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

function AnonymousSyncStatus() {
  const auth = useCloudAuth();
  const [copied, setCopied] = useState(false);
  const [showFirebaseForm, setShowFirebaseForm] = useState(false);

  const copyLink = async () => {
    if (!auth.shareLink) return;
    await navigator.clipboard.writeText(auth.shareLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const stop = () => {
    if (window.confirm('להפסיק לשתף נתונים ולעבור למכשיר הזה בלבד?')) {
      repository.cloud.disableAnonymous();
    }
  };

  return (
    <Card>
      <h3 className="font-bold mb-2 flex items-center gap-2">
        <Users size={18} className="text-accent" />
        סנכרון ענן — שיתוף מיידי
      </h3>
      {auth.status === 'connecting' && <p className="text-sm text-ink3">מקים מסד נתונים משותף…</p>}
      {auth.status === 'connected' && auth.shareLink && (
        <>
          <p className="text-sm text-ink2 mb-3">
            הנתונים כאן משותפים אוטומטית ללא צורך בהרשמה. כדי שמישהו נוסף (כמו אריאל) יראה ויערוך את
            אותם הנתונים, שילחו לו את הקישור הזה פעם אחת — הוא יכנס אליו וייכנס אוטומטית לאותו מסד נתונים.
          </p>
          <div className="flex items-center gap-2 rounded-xl bg-surface2 border border-line px-3 py-2 mb-3">
            <code dir="ltr" className="text-xs flex-1 truncate">
              {auth.shareLink}
            </code>
            <Button size="sm" variant="secondary" icon={copied ? Check : Copy} onClick={() => void copyLink()}>
              {copied ? 'הועתק' : 'העתקה'}
            </Button>
          </div>
          <div className="rounded-xl bg-lvlb/10 border border-lvlb/30 px-3 py-2 text-xs font-semibold text-lvlb mb-4">
            שימו לב: זהו שיתוף ללא סיסמה — כל מי שמחזיק בקישור הזה יכול לראות ולערוך את הנתונים. למי
            שרוצה הגנה עם משתמש/סיסמה אמיתיים, אפשר לעבור ל-Firebase למטה.
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" icon={CloudOff} onClick={stop}>
              הפסקת שיתוף
            </Button>
            <Button variant="secondary" onClick={() => setShowFirebaseForm((v) => !v)}>
              {showFirebaseForm ? 'סגירה' : 'עבור להתחברות מאובטחת (Firebase)'}
            </Button>
          </div>
        </>
      )}
      {auth.status === 'error' && (
        <div className="rounded-xl bg-lvlc/10 border border-lvlc/30 px-4 py-3 text-sm font-semibold text-lvlc">
          לא הצלחתי להקים סנכרון ענן אוטומטי ({auth.error}). האפליקציה ממשיכה לעבוד עם נתונים מקומיים בלבד.
        </div>
      )}
      {auth.status === 'idle' && (
        <p className="text-sm text-ink3">
          השיתוף הופסק — הנתונים נשמרים רק במכשיר הזה. אפשר להפעיל מחדש ע"י רענון העמוד.
        </p>
      )}
      {showFirebaseForm && <FirebaseConfigureForm />}
    </Card>
  );
}

function FirebaseConfigureForm() {
  const [configText, setConfigText] = useState('');
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
    await repository.cloud.configureFirebase(parsed);
    setBusy(false);
  };

  return (
    <div className="mt-4 pt-4 border-t border-line">
      <p className="text-sm text-ink2 mb-3">
        הדביקו כאן את קטע ה-<span dir="ltr" className="font-mono text-xs">firebaseConfig</span> שקיבלתם מ-Firebase
        Console (Project settings → Your apps).
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
    </div>
  );
}

function FirebaseSyncStatus() {
  const auth = useCloudAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submitSignIn = async () => {
    await repository.cloud.signIn(email, password);
  };

  const disable = () => {
    if (window.confirm('לחזור לסנכרון ענן הבסיסי (ללא סיסמה) במקום Firebase?')) {
      repository.cloud.disableFirebase();
    }
  };

  if (auth.status === 'connected') {
    return (
      <Card>
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <ShieldCheck size={18} className="text-lvla" />
          סנכרון ענן מאובטח
        </h3>
        <div className="rounded-xl bg-lvla/10 border border-lvla/30 px-4 py-3 text-sm font-semibold text-lvla mb-4">
          מחובר/ת ל-Firebase כ-{auth.email}. כל שינוי מסתנכרן בזמן אמת בין כל מי שמחובר.
        </div>
        <Button variant="danger" icon={LogOut} onClick={() => void repository.cloud.signOut()}>
          התנתקות
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="font-bold mb-4 flex items-center gap-2">
        <ShieldCheck size={18} className="text-accent" />
        סנכרון ענן מאובטח (Firebase)
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
        <Button
          onClick={() => void submitSignIn()}
          disabled={auth.status === 'connecting' || email.trim() === '' || password === ''}
        >
          {auth.status === 'connecting' ? 'מתחבר…' : 'התחברות'}
        </Button>
        <Button variant="ghost" icon={CloudOff} onClick={disable}>
          ביטול והחזרה לשיתוף הבסיסי
        </Button>
      </div>
    </Card>
  );
}

export function CloudSyncCard() {
  const auth = useCloudAuth();
  if (auth.mode === 'firebase') return <FirebaseSyncStatus />;
  return <AnonymousSyncStatus />;
}
