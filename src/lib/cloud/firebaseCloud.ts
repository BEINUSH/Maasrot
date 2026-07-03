export interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

const CONFIG_KEY = 'platoon-fitness-firebase-config';

export function loadCloudConfig(): FirebaseWebConfig | undefined {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as FirebaseWebConfig;
    if (!parsed.apiKey || !parsed.projectId || !parsed.appId) return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

export function saveCloudConfig(config: FirebaseWebConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function clearCloudConfig(): void {
  localStorage.removeItem(CONFIG_KEY);
}

/**
 * Firebase SDK is loaded lazily so devices that never enable cloud sync
 * (the default, local-only mode) don't pay for it in their bundle.
 */
async function loadFirebaseModules(config: FirebaseWebConfig) {
  const [{ initializeApp, getApps, getApp }, authMod, firestoreMod] = await Promise.all([
    import('firebase/app'),
    import('firebase/auth'),
    import('firebase/firestore'),
  ]);
  const app = getApps().length ? getApp() : initializeApp(config);
  const auth = authMod.getAuth(app);
  const db = firestoreMod.getFirestore(app);
  return { authMod, firestoreMod, auth, db };
}

let cached: Awaited<ReturnType<typeof loadFirebaseModules>> | undefined;

export async function getFirebase(config: FirebaseWebConfig) {
  if (!cached) cached = await loadFirebaseModules(config);
  return cached;
}

export function resetFirebaseCache(): void {
  cached = undefined;
}

export async function signInCloud(
  config: FirebaseWebConfig,
  email: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { authMod, auth } = await getFirebase(config);
    await authMod.signInWithEmailAndPassword(auth, email, password);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'שגיאת התחברות לא ידועה';
    return { ok: false, error: message };
  }
}

export async function signOutCloud(config: FirebaseWebConfig): Promise<void> {
  const { authMod, auth } = await getFirebase(config);
  await authMod.signOut(auth);
}

export async function watchCloudAuth(
  config: FirebaseWebConfig,
  onChange: (email: string | undefined) => void,
): Promise<() => void> {
  const { authMod, auth } = await getFirebase(config);
  return authMod.onAuthStateChanged(auth, (user) => onChange(user?.email ?? undefined));
}
