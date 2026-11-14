import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: 'select_account'
});

export const getStoredMicrosoftTenant = (): string => {
  try {
    const saved = localStorage.getItem('iaip_ms_tenant')?.trim();
    if (saved) return saved;
  } catch {}
  return '';
};

export const setStoredMicrosoftTenant = (tenant: string): void => {
  try {
    const trimmed = tenant.trim();
    if (trimmed) {
      localStorage.setItem('iaip_ms_tenant', trimmed);
    } else {
      localStorage.removeItem('iaip_ms_tenant');
    }
  } catch {}
};

export const createMicrosoftAuthProvider = (tenantOverride?: string): OAuthProvider => {
  const provider = new OAuthProvider('microsoft.com');
  const customParams: Record<string, string> = {
    prompt: 'select_account'
  };

  const effectiveTenant = tenantOverride?.trim() || getStoredMicrosoftTenant();
  if (effectiveTenant) {
    customParams.tenant = effectiveTenant;
  }

  provider.setCustomParameters(customParams);
  provider.addScope('User.Read');
  provider.addScope('email');
  provider.addScope('openid');
  provider.addScope('profile');
  return provider;
};

export const microsoftAuthProvider = createMicrosoftAuthProvider(
  'intellifysolutions.com'  
);















