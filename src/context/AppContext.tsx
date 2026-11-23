/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Account, Stakeholder, Research, Document, Opportunity, Template, Activity, AppSettings,
  PriorityType, ResearchDepthType, ResearchStatusType, OrchestratedResearch, ResearchEvidence,
  BuyingSignal
} from '../types';
import { auth, googleAuthProvider, microsoftAuthProvider } from '../lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import {
  INITIAL_ACCOUNTS, INITIAL_STAKEHOLDERS, MOCK_OPPORTUNITIES,
  MOCK_DOCUMENTS, INITIAL_TEMPLATES, INITIAL_ACTIVITIES, MOCK_RESEARCH_TEMPLATES, INITIAL_EVIDENCE
} from '../data';
import {
  INITIAL_ORCHESTRATED_RESEARCH, getNotStartedPipeline, getCompletedPipeline, getInProgressPipeline
} from '../orchestratedData';
import {
  RefreshSignalsSummary, SignalDispatchResult, getFreshSignalsForAccount, createAccountSignalDispatch, LEADERSHIP_EMAILS, deriveOwnerEmail, isAuthorizedForMarketSignals
} from '../lib/signalsEngine';

interface AppContextType {
  accounts: Account[];
  stakeholders: Stakeholder[];
  opportunities: Opportunity[];
  documents: Document[];
  templates: Template[];
  activities: Activity[];
  settings: AppSettings;
  currentTab: string;
  selectedAccountId: string | null;
  currentDetailSubTab: string;
  isCreatingAccount: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  notifications: NotificationItem[];
  orchestratedResearches: Record<string, OrchestratedResearch>;
  evidence: ResearchEvidence[];

  // Navigation
  navigate: (tab: string, accountId?: string | null, detailSubTab?: string, isCreating?: boolean) => void;

  // Account Actions
  addAccount: (account: Omit<Account, 'id' | 'lastUpdated' | 'researchStatus' | 'opportunityScore'>) => string;
  updateAccount: (account: Account) => void;
  deleteAccount: (accountId: string) => void;
  shareAccount: (accountId: string, emails: string[]) => Promise<boolean>;
  triggerResearch: (accountId: string, depth: ResearchDepthType, accountOverride?: Account) => void;
  rerunSingleModule: (accountId: string, moduleId: string) => void;

  // Stakeholder Actions
  addStakeholder: (stakeholder: Omit<Stakeholder, 'id'>) => string;
  updateStakeholder: (stakeholder: Stakeholder) => void;
  deleteStakeholder: (id: string) => void;
  researchStakeholder: (id: string) => Promise<void>;

  // Opportunity Actions
  addOpportunity: (opportunity: Omit<Opportunity, 'id'>) => void;
  deleteOpportunity: (id: string) => void;

  // Document Actions
  uploadDocument: (accountId: string, file: { name: string; size: string; type: string }) => void;
  deleteDocument: (id: string) => void;

  // Settings Actions
  updateSettings: (settings: AppSettings) => void;

  // Notifications Actions
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // Evidence Actions
  addEvidence: (ev: Omit<ResearchEvidence, 'id'>) => void;
  deleteEvidence: (id: string) => void;
  updateEvidence: (ev: ResearchEvidence) => void;
  addManualNote: (accountId: string, title: string, content: string, category: string) => void;
  triggerSourceIngestion: (accountId: string, sourceType: string) => Promise<void>;

  // Research retrieval
  getResearchForAccount: (accountId: string) => Research | null;

  // Auth States & Handlers
  user: any;
  authLoading: boolean;
  isSigningIn: boolean;
  authError: string | null;
  clearAuthError: () => void;
  isUnauthorized: boolean;
  userRole: string;
  allowedUsersList: AllowedUser[];
  fetchAllowedUsers: () => Promise<void>;
  addAllowedUser: (email: string, name?: string, role?: string) => Promise<boolean>;
  updateAllowedUser: (id: number, updates: { email?: string; name?: string; role?: 'admin' | 'member'; status?: 'active' | 'suspended' }) => Promise<boolean>;
  removeAllowedUser: (id: number) => Promise<boolean>;
  signInWithGoogle: () => Promise<void>;
  signInWithMicrosoft: () => Promise<void>;
  signOutUser: () => Promise<void>;

  // Signals Refresh & Notification Dispatch
  refreshAccountSignals: (targetAccountIds?: string[]) => Promise<RefreshSignalsSummary>;
  isRefreshingSignals: boolean;
  lastSignalsRefreshSummary: RefreshSignalsSummary | null;
  clearSignalsRefreshSummary: () => void;
}

export interface AllowedUser {
  id: number;
  email: string;
  name?: string;
  role: 'admin' | 'member';
  status: 'active' | 'suspended';
  addedAt?: string;
  addedBy?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  read: boolean;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'research' | 'signal';
  accountId?: string;
  accountName?: string;
  recipients?: string[];
  signals?: BuyingSignal[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_SETTINGS: AppSettings = {
  aiProvider: 'Gemini',
  geminiApiKey: 'SERVER_MANAGED_KEY',
  modelSelection: 'gemini-3.5-flash',
  defaultResearchDepth: 'Deep',
  theme: 'Light',
};

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'not_1',
    title: 'Deep Research Completed',
    description: 'AI intelligence summary generated successfully for Microsoft Corporation.',
    read: false,
    timestamp: '2026-06-29T14:31:00Z',
    type: 'research'
  },
  {
    id: 'not_2',
    title: 'New Account Created',
    description: 'Target Corporation has been registered on the platform.',
    read: true,
    timestamp: '2026-06-26T10:01:00Z',
    type: 'success'
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication & Database Sync States
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>('member');
  const [allowedUsersList, setAllowedUsersList] = useState<AllowedUser[]>([]);

  const clearAuthError = () => setAuthError(null);

  const signInWithGoogle = async () => {
    if (isSigningIn) {
      console.log('[Auth] Google Sign-In already in progress, ignoring duplicate call.');
      return;
    }

    setIsSigningIn(true);
    setAuthError(null);

    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (error: any) {
      const errorCode = error?.code || '';
      // Normal cancellations that happen when user closes the window or replaces a request
      if (errorCode === 'auth/cancelled-popup-request') {
        console.log('[Auth] Popup request was replaced by a newer request or cancelled.');
      } else if (errorCode === 'auth/popup-closed-by-user') {
        console.log('[Auth] Sign-in popup was closed by user.');
      } else if (errorCode === 'auth/popup-blocked') {
        console.warn('[Auth] Sign-in popup was blocked by browser.');
        setAuthError('Sign-in popup was blocked by your browser. Please allow popups for this site and try again.');
      } else {
        console.error('Error signing in with Google:', error);
        setAuthError(error?.message || 'Failed to authenticate with Google. Please try again.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const signInWithMicrosoft = async () => {
    if (isSigningIn) {
      console.log('[Auth] Microsoft Sign-In already in progress, ignoring duplicate call.');
      return;
    }

    setIsSigningIn(true);
    setAuthError(null);

    try {
      await signInWithPopup(auth, microsoftAuthProvider);
    } catch (error: any) {
      const errorCode = error?.code || '';
      if (errorCode === 'auth/cancelled-popup-request') {
        console.log('[Auth] Popup request was replaced by a newer request or cancelled.');
      } else if (errorCode === 'auth/popup-closed-by-user') {
        console.log('[Auth] Sign-in popup was closed by user.');
      } else if (errorCode === 'auth/popup-blocked') {
        console.warn('[Auth] Sign-in popup was blocked by browser.');
        setAuthError('Sign-in popup was blocked by your browser. Please allow popups for this site and try again.');
      } else if (errorCode === 'auth/operation-not-allowed' || errorCode === 'auth/configuration-not-found') {
        console.error('[Auth] Microsoft identity provider is not enabled in Firebase Console:', error);
        setAuthError('Microsoft sign-in is not yet enabled in the Firebase Console. An admin must enable Microsoft under Firebase Console > Authentication > Sign-in method.');
      } else {
        console.error('Error signing in with Microsoft:', error);
        setAuthError(error?.message || 'Failed to authenticate with Microsoft. Please try again.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setIsUnauthorized(false);
      setAuthError(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    if (!auth.currentUser) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      const response = await fetch(url, { ...options, headers });
      if (response.status === 403) {
        setIsUnauthorized(true);
      }
      return response;
    } catch (err) {
      console.error('fetchWithAuth Token Error:', err);
    }
  };

  const fetchAllowedUsers = async () => {
    try {
      const res = await fetchWithAuth('/api/allowed-users');
      if (res && res.ok) {
        const data = await res.json();
        setAllowedUsersList(data);
      }
    } catch (err) {
      console.error('Error fetching allowed users:', err);
    }
  };

  const addAllowedUser = async (email: string, name?: string, role: string = 'member'): Promise<boolean> => {
    try {
      const res = await fetchWithAuth('/api/allowed-users', {
        method: 'POST',
        body: JSON.stringify({ email, name, role })
      });
      if (res && res.ok) {
        await fetchAllowedUsers();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding allowed user:', err);
      return false;
    }
  };

  const updateAllowedUser = async (
    id: number,
    updates: { email?: string; name?: string; role?: 'admin' | 'member'; status?: 'active' | 'suspended' }
  ): Promise<boolean> => {
    try {
      const res = await fetchWithAuth(`/api/allowed-users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      if (res && res.ok) {
        await fetchAllowedUsers();
        return true;
      }
      if (res) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Update failed with status ${res.status}`);
      }
      return false;
    } catch (err) {
      console.error('Error updating allowed user:', err);
      throw err;
    }
  };

  const removeAllowedUser = async (id: number): Promise<boolean> => {
    try {
      const res = await fetchWithAuth(`/api/allowed-users/${id}`, {
        method: 'DELETE'
      });
      if (res && res.ok) {
        await fetchAllowedUsers();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting allowed user:', err);
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          const res = await fetch('/api/sync', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (res.status === 403) {
            setIsUnauthorized(true);
            setAuthLoading(false);
            return;
          }

          if (res.ok) {
            setIsUnauthorized(false);

            // Fetch User Role & Allowed Users
            fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } })
              .then(r => r.ok ? r.json() : null)
              .then(d => {
                if (d?.role) setUserRole(d.role);
              })
              .catch(() => { });

            fetch('/api/allowed-users', { headers: { 'Authorization': `Bearer ${token}` } })
              .then(r => r.ok ? r.json() : null)
              .then(list => {
                if (Array.isArray(list)) setAllowedUsersList(list);
              })
              .catch(() => { });

            const dbData = await res.json();
            if (dbData.settings) {
              // Existing user - sync down from DB
              setAccounts(dbData.accounts || []);
              setStakeholders(dbData.stakeholders || []);
              setOpportunities(dbData.opportunities || []);
              setDocuments(dbData.documents || []);
              setTemplates(dbData.templates || []);
              setActivities(dbData.activities || []);
              setNotifications(dbData.notifications || []);
              setEvidence(dbData.evidence || []);
              setCustomResearches(dbData.customResearches || {});
              setOrchestratedResearches(dbData.orchestratedResearches || {});
              setSettings(dbData.settings);
            } else {
              // Brand new database/user - push local state up to seed the database
              const seedData = async () => {
                try {
                  // 1. Save Settings
                  await fetch('/api/settings', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(settings)
                  });

                  // 2. Save Accounts
                  for (const acc of accounts) {
                    await fetch('/api/accounts', {
                      method: 'POST',
                      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                      body: JSON.stringify(acc)
                    });
                  }

                  // 3. Save Stakeholders
                  for (const stk of stakeholders) {
                    await fetch('/api/stakeholders', {
                      method: 'POST',
                      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                      body: JSON.stringify(stk)
                    });
                  }

                  // 4. Save Opportunities
                  for (const opp of opportunities) {
                    await fetch('/api/opportunities', {
                      method: 'POST',
                      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                      body: JSON.stringify(opp)
                    });
                  }

                  // 5. Save Documents
                  for (const doc of documents) {
                    await fetch('/api/documents', {
                      method: 'POST',
                      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                      body: JSON.stringify(doc)
                    });
                  }

                  // 6. Save Templates
                  for (const temp of templates) {
                    await fetch('/api/templates', {
                      method: 'POST',
                      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                      body: JSON.stringify(temp)
                    });
                  }

                  // 7. Save Activities
                  for (const act of activities) {
                    await fetch('/api/activities', {
                      method: 'POST',
                      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                      body: JSON.stringify(act)
                    });
                  }

                  // 8. Save Notifications
                  for (const notif of notifications) {
                    await fetch('/api/notifications', {
                      method: 'POST',
                      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                      body: JSON.stringify(notif)
                    });
                  }

                  // 9. Save Evidence
                  for (const evItem of evidence) {
                    await fetch('/api/evidence', {
                      method: 'POST',
                      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                      body: JSON.stringify(evItem)
                    });
                  }

                  // 10. Save Custom Researches
                  for (const cr of Object.values(customResearches)) {
                    await fetch('/api/custom-researches', {
                      method: 'POST',
                      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                      body: JSON.stringify(cr)
                    });
                  }

                  // 11. Save Orchestrated Researches
                  for (const or of Object.values(orchestratedResearches)) {
                    await fetch('/api/orchestrated-researches', {
                      method: 'POST',
                      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                      body: JSON.stringify(or)
                    });
                  }
                } catch (err) {
                  console.error('Error seeding database:', err);
                }
              };
              seedData();
            }
          }
        } catch (err) {
          console.error("Failed to sync database data:", err);
        }
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Navigation State
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [currentDetailSubTab, setCurrentDetailSubTab] = useState<string>('overview');
  const [isCreatingAccount, setIsCreatingAccount] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Core Data States with LocalStorage Hydration
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('iaip_accounts');
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [stakeholders, setStakeholders] = useState<Stakeholder[]>(() => {
    const saved = localStorage.getItem('iaip_stakeholders');
    return saved ? JSON.parse(saved) : INITIAL_STAKEHOLDERS;
  });

  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => {
    const saved = localStorage.getItem('iaip_opportunities');
    return saved ? JSON.parse(saved) : MOCK_OPPORTUNITIES;
  });

  const [documents, setDocuments] = useState<Document[]>(() => {
    const saved = localStorage.getItem('iaip_documents');
    return saved ? JSON.parse(saved) : MOCK_DOCUMENTS;
  });

  const [templates, setTemplates] = useState<Template[]>(() => {
    const saved = localStorage.getItem('iaip_templates');
    return saved ? JSON.parse(saved) : INITIAL_TEMPLATES;
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem('iaip_activities');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('iaip_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('iaip_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [customResearches, setCustomResearches] = useState<Record<string, Research>>(() => {
    const saved = localStorage.getItem('iaip_researches');
    return saved ? JSON.parse(saved) : MOCK_RESEARCH_TEMPLATES;
  });

  const [orchestratedResearches, setOrchestratedResearches] = useState<Record<string, OrchestratedResearch>>(() => {
    const saved = localStorage.getItem('iaip_orchestrated_researches');
    return saved ? JSON.parse(saved) : INITIAL_ORCHESTRATED_RESEARCH;
  });

  const [evidence, setEvidence] = useState<ResearchEvidence[]>(() => {
    const saved = localStorage.getItem('iaip_evidence');
    return saved ? JSON.parse(saved) : INITIAL_EVIDENCE;
  });

  // Persist states to LocalStorage on updates
  useEffect(() => {
    localStorage.setItem('iaip_evidence', JSON.stringify(evidence));
  }, [evidence]);
  useEffect(() => {
    localStorage.setItem('iaip_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('iaip_stakeholders', JSON.stringify(stakeholders));
  }, [stakeholders]);

  useEffect(() => {
    localStorage.setItem('iaip_opportunities', JSON.stringify(opportunities));
  }, [opportunities]);

  useEffect(() => {
    localStorage.setItem('iaip_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('iaip_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('iaip_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('iaip_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('iaip_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('iaip_researches', JSON.stringify(customResearches));
  }, [customResearches]);

  useEffect(() => {
    localStorage.setItem('iaip_orchestrated_researches', JSON.stringify(orchestratedResearches));
  }, [orchestratedResearches]);

  // Unified Navigator
  const navigate = (tab: string, accountId: string | null = null, detailSubTab: string = 'overview', isCreating: boolean = false) => {
    setCurrentTab(tab);
    setSelectedAccountId(accountId);
    setCurrentDetailSubTab(detailSubTab);
    setIsCreatingAccount(isCreating);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper helper to log activities
  const addActivity = (
    type: Activity['type'],
    description: string,
    accountId?: string,
    accountName?: string
  ) => {
    const newAct: Activity = {
      id: `act_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type,
      description,
      accountId,
      accountName,
    };
    setActivities(prev => [newAct, ...prev].slice(0, 50)); // Keep last 50
    fetchWithAuth('/api/activities', {
      method: 'POST',
      body: JSON.stringify(newAct)
    });
  };

  // Helper helper to add notification
  const addNotification = (
    title: string,
    description: string,
    type: NotificationItem['type'],
    meta?: Partial<NotificationItem>
  ) => {
    const newNot: NotificationItem = {
      id: `not_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      description,
      read: false,
      timestamp: new Date().toISOString(),
      type,
      ...meta
    };
    setNotifications(prev => [newNot, ...prev]);
    fetchWithAuth('/api/notifications', {
      method: 'POST',
      body: JSON.stringify({
        id: newNot.id,
        title: newNot.title,
        description: newNot.description,
        read: newNot.read,
        timestamp: newNot.timestamp,
        type: newNot.type
      })
    });
  };

  // Account Operations
  const addAccount = (newAccData: Omit<Account, 'id' | 'lastUpdated' | 'researchStatus' | 'opportunityScore'>) => {
    const newId = `acc_${newAccData.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;
    const newAcc: Account = {
      ...newAccData,
      id: newId,
      lastUpdated: new Date().toISOString(),
      researchStatus: 'Not Started',
      opportunityScore: 0,
      createdByEmail: user?.email || '',
      sharedWith: newAccData.sharedWith || [],
    };

    setAccounts(prev => [newAcc, ...prev]);
    addActivity('account_created', `Target account "${newAcc.name}" registered under ownership of ${newAcc.owner}.`, newAcc.id, newAcc.name);
    addNotification('Account Created', `"${newAcc.name}" has been registered successfully. Ready for research.`, 'success');
    fetchWithAuth('/api/accounts', {
      method: 'POST',
      body: JSON.stringify(newAcc)
    });
    return newId;
  };

  const shareAccount = async (accountId: string, emails: string[]): Promise<boolean> => {
    try {
      const res = await fetchWithAuth(`/api/accounts/${accountId}/share`, {
        method: 'POST',
        body: JSON.stringify({ emails })
      });
      if (res && res.ok) {
        const data = await res.json();
        const updatedSharedWith = data.sharedWith || emails;
        setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, sharedWith: updatedSharedWith } : a));
        addNotification('Account Shared', `Account sharing updated with ${emails.length} team member(s).`, 'success');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error sharing account:', err);
      return false;
    }
  };

  const updateAccount = (updatedAcc: Account) => {
    const updated = { ...updatedAcc, lastUpdated: new Date().toISOString() };
    setAccounts(prev => prev.map(a => a.id === updated.id ? updated : a));
    fetchWithAuth('/api/accounts', {
      method: 'POST',
      body: JSON.stringify(updated)
    });
  };

  const deleteAccount = (accountId: string) => {
    const target = accounts.find(a => a.id === accountId);
    if (target) {
      setAccounts(prev => prev.filter(a => a.id !== accountId));
      setStakeholders(prev => prev.filter(s => s.accountId !== accountId));
      setOpportunities(prev => prev.filter(o => o.accountId !== accountId));
      setDocuments(prev => prev.filter(d => d.accountId !== accountId));
      addActivity('account_created', `Account "${target.name}" and associated resources removed.`, accountId, target.name);
      fetchWithAuth(`/api/accounts/${accountId}`, {
        method: 'DELETE'
      });
      if (selectedAccountId === accountId) {
        navigate('accounts');
      }
    }
  };

  // Trigger Research (Simulated AI Agent Execution via 11-Stage Pipeline)
  const triggerResearch = (accountId: string, depth: ResearchDepthType, accountOverride?: Account) => {
    // 1. Update status to In Progress (or include accountOverride if not yet committed to state)
    setAccounts(prev => {
      const exists = prev.some(a => a.id === accountId);
      if (exists) {
        return prev.map(a => a.id === accountId ? { ...a, researchStatus: 'In Progress', researchDepth: depth, lastUpdated: new Date().toISOString() } : a);
      } else if (accountOverride) {
        return [{ ...accountOverride, researchStatus: 'In Progress', researchDepth: depth, lastUpdated: new Date().toISOString() }, ...prev];
      }
      return prev;
    });

    const account = accountOverride || accounts.find(a => a.id === accountId);
    const accountName = account ? account.name : 'Unknown';

    addActivity('research_started', `Sarah Jenkins triggered ${depth} 11-stage AI Research Pipeline for ${accountName}.`, accountId, accountName);
    addNotification('Research Started', `Executing the 11-stage AI intelligence orchestration pipeline for ${accountName}...`, 'research');

    // Initialize all modules to 'Not Started'
    const cleanPipeline = getNotStartedPipeline();

    setOrchestratedResearches(prev => ({
      ...prev,
      [accountId]: {
        accountId,
        pipeline: cleanPipeline,
        scoring: {
          overallScore: 0,
          factors: {
            technologyFit: 0,
            businessTransformation: 0,
            cloudAdoption: 0,
            aiInvestments: 0,
            hiringTrends: 0,
            dataModernization: 0,
            buyingSignals: 0,
            recentNews: 0,
            financialGrowth: 0,
            leadershipDirection: 0,
          }
        },
        coverage: {
          website: 'Partial',
          leadership: 'Missing',
          technology: 'Missing',
          news: 'Missing',
          hiring: 'Missing',
          financials: 'Missing',
          overallScore: 10,
        },
        data: {}
      }
    }));

    const moduleKeys = [
      'company', 'business', 'technology', 'news', 'hiring',
      'financial', 'strategic', 'signals', 'maturity', 'opportunities', 'executive'
    ];

    let currentStepIndex = 0;
    let apiData: any = null;
    let apiError: string | null = null;
    let apiCompleted = false;

    // Trigger backend Gemini Research API call
    fetchWithAuth('/api/research', {
      method: 'POST',
      body: JSON.stringify({
        accountName,
        website: account ? account.website : '',
        industry: account ? account.industry : '',
        apiKey: settings.geminiApiKey,
        model: settings.modelSelection
      })
    })
      .then(async res => {
        if (!res) throw new Error("Authentication error or connection dropped.");
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `HTTP error ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        apiData = data;
        apiCompleted = true;
      })
      .catch(err => {
        console.error("Gemini API Error:", err);
        apiError = err.message || String(err);
        apiCompleted = true;
      });

    const executeNextStep = () => {
      if (currentStepIndex >= moduleKeys.length) {
        // If the API call hasn't finished yet, wait and check again in 500ms
        if (!apiCompleted) {
          setTimeout(executeNextStep, 500);
          return;
        }

        // If we have real API data, use it! Otherwise, fallback gracefully to mock template data
        let finalData: OrchestratedResearch;

        if (apiData) {
          const overallScore = apiData.scoringFactors?.technologyFit || Math.floor(Math.random() * 21) + 75;

          finalData = {
            accountId,
            pipeline: getCompletedPipeline(new Date().toISOString()),
            scoring: {
              overallScore: overallScore,
              factors: {
                technologyFit: apiData.scoringFactors?.technologyFit || 80,
                businessTransformation: apiData.scoringFactors?.businessTransformation || 80,
                cloudAdoption: apiData.scoringFactors?.cloudAdoption || 80,
                aiInvestments: apiData.scoringFactors?.aiInvestments || 80,
                hiringTrends: apiData.scoringFactors?.hiringTrends || 80,
                dataModernization: apiData.scoringFactors?.dataModernization || 80,
                buyingSignals: apiData.scoringFactors?.buyingSignals || 80,
                recentNews: apiData.scoringFactors?.recentNews || 80,
                financialGrowth: apiData.scoringFactors?.financialGrowth || 80,
                leadershipDirection: apiData.scoringFactors?.leadershipDirection || 80,
              }
            },
            coverage: {
              website: 95,
              leadership: 90,
              products: 90,
              technology: 90,
              hiring: 85,
              annualReport: 95,
              quarterlyReport: 90,
              investorPresentation: 90,
              uploadedDocuments: 80,
              manualNotes: 80,
              news: 90,
              overallScore: 92,
            },
            data: {
              company: {
                legalName: apiData.company?.legalName || `${accountName} Corp`,
                founded: apiData.company?.founded || "N/A",
                employees: apiData.company?.employees || "N/A",
                headquarters: apiData.company?.headquarters || "N/A",
                description: apiData.company?.description || "Description",
                sectors: apiData.company?.sectors || [],
                competitors: apiData.company?.competitors || []
              },
              business: {
                marketPosition: apiData.business?.marketPosition || "Market Leader",
                swot: {
                  strengths: apiData.business?.swot?.strengths || [],
                  weaknesses: apiData.business?.swot?.weaknesses || [],
                  opportunities: apiData.business?.swot?.opportunities || [],
                  threats: apiData.business?.swot?.threats || []
                },
                keyOfferings: apiData.business?.keyOfferings || []
              },
              technology: {
                summary: apiData.technology?.summary || "Systems overview",
                findings: apiData.technology?.findings?.map((f: any) => ({
                  technology: f.technology,
                  category: f.category,
                  confidence: f.confidence,
                  businessImpact: f.businessImpact,
                  evidence: f.evidence?.map((e: any) => ({
                    source: e.source,
                    credibility: e.credibility
                  })) || []
                })) || []
              },
              news: apiData.news?.map((n: any, i: number) => ({
                id: `news_gen_${i}_${Date.now()}`,
                title: n.title,
                date: n.date,
                source: n.source,
                sentiment: n.sentiment,
                impact: n.impact
              })) || [],
              hiring: {
                openRoleCount: apiData.hiring?.openRoleCount || 0,
                focusAreas: apiData.hiring?.focusAreas || [],
                skillsInDemand: apiData.hiring?.skillsInDemand || [],
                trends: apiData.hiring?.trends || [],
                evidence: apiData.hiring?.evidence?.map((e: any) => ({
                  source: e.source,
                  credibility: e.credibility
                })) || []
              },
              financial: {
                fiscalYear: apiData.financial?.fiscalYear || "FY2026",
                revenue: apiData.financial?.revenue || "N/A",
                netIncome: apiData.financial?.netIncome || "N/A",
                growthRate: apiData.financial?.growthRate || "N/A",
                rdSpend: apiData.financial?.rdSpend || "N/A",
                digitalBudgetEst: apiData.financial?.digitalBudgetEst || "N/A",
                metrics: apiData.financial?.metrics || []
              },
              strategic: apiData.strategic?.map((s: any) => ({
                priority: s.priority,
                timeline: s.timeline,
                impactLevel: s.impactLevel,
                details: s.details,
                evidence: s.evidence?.map((e: any) => ({
                  source: e.source,
                  credibility: e.credibility
                })) || []
              })) || [],
              signals: apiData.signals?.map((sig: any) => ({
                signal: sig.signal,
                urgency: sig.urgency,
                confidence: sig.confidence,
                businessImpact: sig.businessImpact,
                evidence: sig.evidence?.map((e: any) => ({
                  source: e.source,
                  credibility: e.credibility
                })) || []
              })) || [],
              maturity: {
                scores: apiData.maturity?.scores || { cloud: 70, ai: 50, dataPlatform: 65, security: 70, devops: 60 },
                overall: apiData.maturity?.overall || 65,
                assessment: apiData.maturity?.assessment || "Analysis completed."
              },
              opportunities: apiData.opportunities?.map((opp: any) => ({
                opportunity: opp.opportunity,
                confidence: opp.confidence,
                priority: opp.priority,
                recommendedOffering: opp.recommendedOffering,
                estimatedBusinessValue: opp.estimatedBusinessValue,
                suggestedWorkshop: opp.suggestedWorkshop,
                suggestedAccelerator: opp.suggestedAccelerator,
                suggestedDiscoveryQuestions: opp.suggestedDiscoveryQuestions || []
              })) || [],
              executive: {
                businessSummary: apiData.executive?.businessSummary || "Business stands as a key partner target.",
                technologySummary: apiData.executive?.technologySummary || "Technology initiatives represent major integration channels.",
                currentInitiatives: apiData.executive?.currentInitiatives || [],
                keyRisks: apiData.executive?.keyRisks || [],
                keyOpportunities: apiData.executive?.keyOpportunities || [],
                recommendedStrategy: apiData.executive?.recommendedStrategy || "Lead with co-innovation consults.",
                recommendedIndusServices: apiData.executive?.recommendedIndusServices || [],
                overallConfidence: apiData.executive?.overallConfidence || 85
              }
            }
          };

          addNotification('Deep Research Completed', `Real-time AI research completed successfully for ${accountName}!`, 'success');
        } else {
          // Fallback to empty data (No data found) if no key or error occurred
          const finalScore = 0;
          const hasFullData = false;
          const baseResearch = {
            accountId,
            pipeline: getCompletedPipeline(new Date().toISOString()),
            scoring: {
              overallScore: 0,
              factors: {
                technologyFit: 0,
                businessTransformation: 0,
                cloudAdoption: 0,
                aiInvestments: 0,
                hiringTrends: 0,
                dataModernization: 0,
                buyingSignals: 0,
                recentNews: 0,
                financialGrowth: 0,
                leadershipDirection: 0,
              }
            },
            coverage: {
              website: 0,
              leadership: 0,
              products: 0,
              technology: 0,
              hiring: 0,
              annualReport: 0,
              quarterlyReport: 0,
              investorPresentation: 0,
              uploadedDocuments: 0,
              manualNotes: 0,
              news: 0,
              overallScore: 0,
            },
            researchQuality: 'D' as const,
            data: {
              company: {
                legalName: accountName,
                founded: 'No data found',
                employees: 'No data found',
                headquarters: 'No data found',
                description: 'No research data found. Please ensure your Google Gemini API Key is configured in settings and run a live research scan to retrieve company details.',
                sectors: [],
                competitors: [],
              },
              business: {
                marketPosition: 'No data found',
                swot: {
                  strengths: [],
                  weaknesses: [],
                  opportunities: [],
                  threats: []
                },
                keyOfferings: [],
              },
              technology: {
                summary: 'No technology detection data found. Run a real-time scan with an API key to discover infrastructure, cloud, and database profiles.',
                findings: []
              },
              news: [],
              hiring: {
                openRoleCount: 0,
                focusAreas: [],
                skillsInDemand: [],
                trends: [],
                evidence: []
              },
              financial: {
                fiscalYear: 'N/A',
                revenue: 'No data found',
                netIncome: 'No data found',
                growthRate: 'No data found',
                rdSpend: 'No data found',
                digitalBudgetEst: 'No data found',
                metrics: []
              },
              strategic: [],
              signals: [],
              maturity: {
                scores: { cloud: 0, ai: 0, dataPlatform: 0, security: 0, devops: 0 },
                overall: 0,
                assessment: 'No digital maturity assessment available. Run live research to evaluate capabilities.',
              },
              opportunities: [],
              executive: {
                businessSummary: 'No data found.',
                technologySummary: 'No data found.',
                currentInitiatives: [],
                keyRisks: [],
                keyOpportunities: [],
                recommendedStrategy: 'Configure your Google Gemini API Key in settings and launch research to generate a tailored enterprise strategy.',
                recommendedIndusServices: [],
                overallConfidence: 0,
              }
            }
          };

          finalData = {
            ...baseResearch,
            pipeline: getCompletedPipeline(new Date().toISOString()),
          };

          if (apiError) {
            addNotification('Research Offline', `Executed pipeline for ${accountName}. No database records returned due to error: ${apiError}`, 'warning');
          } else {
            addNotification('Deep Research Completed', `Research completed. No real data found for ${accountName}.`, 'info');
          }
        }

        setOrchestratedResearches(prev => ({
          ...prev,
          [accountId]: finalData
        }));

        setAccounts(prev => prev.map(a => {
          if (a.id === accountId) {
            const updated = {
              ...a,
              researchStatus: 'Completed',
              opportunityScore: finalData.scoring.overallScore,
              lastUpdated: new Date().toISOString()
            };
            fetchWithAuth('/api/accounts', {
              method: 'POST',
              body: JSON.stringify(updated)
            });
            return updated;
          }
          return a;
        }));

        setOpportunities(prev => {
          const existing = prev.some(o => o.accountId === accountId);
          if (existing) return prev;

          const opps = finalData.data.opportunities?.map((opp, i) => ({
            id: `opp_gen_${Date.now()}_${i}`,
            accountId,
            title: opp.opportunity,
            description: opp.recommendedOffering + ': ' + opp.suggestedWorkshop,
            service: opp.recommendedOffering,
            value: opp.estimatedBusinessValue,
            probability: opp.confidence,
          })) || [];

          opps.forEach(opp => {
            fetchWithAuth('/api/opportunities', {
              method: 'POST',
              body: JSON.stringify(opp)
            });
          });

          return [...prev, ...opps];
        });

        fetchWithAuth('/api/orchestrated-researches', {
          method: 'POST',
          body: JSON.stringify(finalData)
        });

        addActivity('research_completed', `AI Pipeline completed Account Intelligence synthesis for ${accountName}. Rating: ${finalData.scoring.overallScore}%`, accountId, accountName);
        return;
      }

      const currentKey = moduleKeys[currentStepIndex];

      setOrchestratedResearches(prev => {
        const currentRes = prev[accountId];
        if (!currentRes) return prev;

        const updatedPipeline = { ...currentRes.pipeline };

        if (currentStepIndex > 0) {
          const prevKey = moduleKeys[currentStepIndex - 1];
          const shouldFail = accountId === 'acc_target' && (prevKey === 'financial' || prevKey === 'signals');

          updatedPipeline[prevKey] = {
            ...updatedPipeline[prevKey],
            status: shouldFail ? 'Failed' : 'Completed',
            confidence: shouldFail ? 0 : Math.floor(Math.random() * 15) + 80,
            error: shouldFail ? `API Rate limit exceeded or access to SEC filing server for Target Corporation timed out after 3 retries.` : undefined,
            updatedAt: new Date().toISOString(),
          };
        }

        updatedPipeline[currentKey] = {
          ...updatedPipeline[currentKey],
          status: 'Running',
          updatedAt: new Date().toISOString(),
        };

        const completedCount = Object.keys(updatedPipeline).map(k => updatedPipeline[k]).filter(p => p.status === 'Completed').length;
        const coverageScore = Math.min(100, Math.floor((completedCount / moduleKeys.length) * 90) + 10);

        const coverage = {
          website: completedCount > 0 ? 'Complete' as const : 'Partial' as const,
          leadership: completedCount > 1 ? 'Complete' as const : 'Partial' as const,
          technology: completedCount > 3 ? 'Complete' as const : 'Missing' as const,
          news: completedCount > 4 ? 'Complete' as const : 'Missing' as const,
          hiring: completedCount > 5 ? 'Complete' as const : 'Missing' as const,
          financials: completedCount > 6 ? 'Complete' as const : 'Missing' as const,
          overallScore: coverageScore,
        };

        return {
          ...currentRes,
          coverage,
          pipeline: updatedPipeline
        };
      });

      currentStepIndex++;
      setTimeout(executeNextStep, 300);
    };

    executeNextStep();
  };

  const rerunSingleModule = (accountId: string, moduleId: string) => {
    setOrchestratedResearches(prev => {
      const currentRes = prev[accountId];
      if (!currentRes) return prev;

      const updatedPipeline = { ...currentRes.pipeline };
      updatedPipeline[moduleId] = {
        ...updatedPipeline[moduleId],
        status: 'Running',
        error: undefined,
        updatedAt: new Date().toISOString()
      };

      return {
        ...currentRes,
        pipeline: updatedPipeline
      };
    });

    addActivity('research_started', `Sarah Jenkins triggered manual re-run for ${moduleId} module on account.`, accountId);

    setTimeout(() => {
      setOrchestratedResearches(prev => {
        const currentRes = prev[accountId];
        if (!currentRes) return prev;

        const updatedPipeline = { ...currentRes.pipeline };
        updatedPipeline[moduleId] = {
          ...updatedPipeline[moduleId],
          status: 'Completed',
          confidence: Math.floor(Math.random() * 10) + 85,
          error: undefined,
          updatedAt: new Date().toISOString()
        };

        const allCompleted = Object.keys(updatedPipeline).map(k => updatedPipeline[k]).every(m => m.status === 'Completed' || m.status === 'Skipped');
        if (allCompleted) {
          setAccounts(prevAccs => prevAccs.map(a => {
            if (a.id === accountId) {
              return {
                ...a,
                researchStatus: 'Completed',
                lastUpdated: new Date().toISOString()
              };
            }
            return a;
          }));
        }

        const targetData = { ...currentRes.data };
        const hasTemplateData = INITIAL_ORCHESTRATED_RESEARCH[accountId]?.data &&
          Object.keys(INITIAL_ORCHESTRATED_RESEARCH[accountId]?.data || {}).length > 0;
        const templateData = hasTemplateData ? INITIAL_ORCHESTRATED_RESEARCH[accountId]?.data : INITIAL_ORCHESTRATED_RESEARCH['acc_microsoft']?.data;

        if (templateData && templateData[moduleId as keyof typeof templateData]) {
          (targetData as any)[moduleId] = templateData[moduleId as keyof typeof templateData];
        }

        return {
          ...currentRes,
          data: targetData,
          pipeline: updatedPipeline
        };
      });

      addActivity('research_completed', `Manual re-run of ${moduleId} module completed successfully.`, accountId);
      addNotification('Module Updated', `Intelligence module "${moduleId}" completed compilation.`, 'success');
    }, 1500);
  };

  // Stakeholder Operations
  const addStakeholder = (stkData: Omit<Stakeholder, 'id'>): string => {
    const newStk: Stakeholder = {
      ...stkData,
      id: `stk_${Date.now()}`,
    };
    setStakeholders(prev => [...prev, newStk]);

    const account = accounts.find(a => a.id === stkData.accountId);
    const accountName = account ? account.name : '';
    addActivity('stakeholder_added', `Stakeholder ${newStk.name} (${newStk.title}) added to ${accountName}.`, stkData.accountId, accountName);

    fetchWithAuth('/api/stakeholders', {
      method: 'POST',
      body: JSON.stringify(newStk)
    });
    return newStk.id;
  };

  const updateStakeholder = (updatedStk: Stakeholder) => {
    setStakeholders(prev => prev.map(s => s.id === updatedStk.id ? updatedStk : s));
    fetchWithAuth('/api/stakeholders', {
      method: 'POST',
      body: JSON.stringify(updatedStk)
    });
  };

  const deleteStakeholder = (id: string) => {
    const target = stakeholders.find(s => s.id === id);
    if (target) {
      setStakeholders(prev => prev.filter(s => s.id !== id));
      const account = accounts.find(a => a.id === target.accountId);
      addActivity('stakeholder_added', `Stakeholder ${target.name} removed.`, target.accountId, account?.name);
      fetchWithAuth(`/api/stakeholders/${id}`, {
        method: 'DELETE'
      });
    }
  };

  const researchStakeholder = async (id: string) => {
    const stk = stakeholders.find(s => s.id === id);
    if (!stk) return;

    const account = accounts.find(a => a.id === stk.accountId);
    const research = getResearchForAccount(stk.accountId);

    const companyResearch = {
      companyName: account?.name || '',
      description: research?.overview || '',
      strategicPriorities: research?.strategicPriorities || [],
      techLandscape: research?.techLandscape || [],
      challenges: research?.challenges || [],
      buyingSignals: research?.buyingSignals || [],
    };

    // Set temporary status
    setStakeholders(prev => prev.map(s => s.id === id ? { ...s, status: 'Contacted' } : s));
    addActivity('research_started', `AI analysis started for stakeholder ${stk.name} (${stk.title}).`, stk.accountId, account?.name);

    try {
      const response = await fetchWithAuth('/api/stakeholder/research', {
        method: 'POST',
        body: JSON.stringify({
          stakeholder: stk,
          companyResearch,
          apiKey: settings.geminiApiKey,
          model: settings.modelSelection,
        }),
      });

      if (!response) {
        throw new Error('Authentication required to execute stakeholder research.');
      }

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to complete stakeholder research.');
      }

      const intelligence = await response.json();

      const updatedStk = {
        ...stk,
        role: (intelligence.roleAssessment?.persona || stk.role) as any,
        influence: (intelligence.influenceScore >= 75 ? 'High' : intelligence.influenceScore >= 40 ? 'Medium' : 'Low') as any,
        status: 'Engaged' as const,
        intelligence,
        lastUpdated: new Date().toISOString(),
      };

      setStakeholders(prev => prev.map(s => s.id === id ? updatedStk : s));
      fetchWithAuth('/api/stakeholders', {
        method: 'POST',
        body: JSON.stringify(updatedStk)
      });

      addActivity('evidence_collected', `AI ABM analysis completed for stakeholder ${stk.name}. Added target persona: ${intelligence.roleAssessment?.persona}.`, stk.accountId, account?.name);
      addNotification('Stakeholder Analyzed', `AI compiled intelligence profile for ${stk.name}.`, 'success');

    } catch (error: any) {
      console.error(error);
      setStakeholders(prev => prev.map(s => s.id === id ? { ...s, status: 'No Contact' } : s));
      addNotification('Analysis Failed', error.message || 'Failed to analyze stakeholder.', 'warning');
    }
  };

  // Opportunity Operations
  const addOpportunity = (oppData: Omit<Opportunity, 'id'>) => {
    const newOpp: Opportunity = {
      ...oppData,
      id: `opp_${Date.now()}`,
    };
    setOpportunities(prev => [...prev, newOpp]);

    const account = accounts.find(a => a.id === oppData.accountId);
    const accountName = account ? account.name : '';
    addActivity('opportunity_created', `New opportunity "${newOpp.title}" created for ${accountName}.`, oppData.accountId, accountName);
    fetchWithAuth('/api/opportunities', {
      method: 'POST',
      body: JSON.stringify(newOpp)
    });
  };

  const deleteOpportunity = (id: string) => {
    setOpportunities(prev => prev.filter(o => o.id !== id));
    fetchWithAuth(`/api/opportunities/${id}`, {
      method: 'DELETE'
    });
  };

  // Document Operations
  const uploadDocument = (accountId: string, file: { name: string; size: string; type: string }) => {
    const docId = `doc_${Date.now()}`;
    const newDoc: Document = {
      id: docId,
      accountId,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      status: 'Uploading',
    };
    setDocuments(prev => [newDoc, ...prev]);

    const account = accounts.find(a => a.id === accountId);
    const accountName = account ? account.name : '';
    addActivity('document_uploaded', `Document "${file.name}" uploaded to ${accountName}.`, accountId, accountName);

    // Simulate extraction pipeline
    setTimeout(() => {
      setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'Queued' } : d));
    }, 1000);

    setTimeout(() => {
      setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'Processing' } : d));
    }, 2050);

    setTimeout(() => {
      const parsedTopics = ['Strategy', 'Enterprise Tech', file.name.split('.').slice(0, -1).join('.')];
      const parsedTech = ['React', 'TypeScript', 'Google Cloud', 'AI Models'];
      const parsedPriorities = ['Enterprise Integration', 'Cost Optimization', 'Operational Excellence'];
      const text = `This is the extracted content of the uploaded document "${file.name}". It contains comprehensive strategies regarding standard enterprise integrations, cloud orchestration systems, and modern AI capability setups. Analysis confirms that the target company is actively transitioning their Core Enterprise Systems to a next-generation stack. Specific focus is on accelerating client delivery, optimizing cost structures, and ensuring 99.99% infrastructure uptime metrics across all regional sectors.`;
      const summary = `Extracted intelligence from "${file.name}". The document outlines strategic plans for core systems modernization with a strong emphasis on scalable developer environments, unified multi-cloud frameworks, and secure data storage.`;

      const updatedDoc: Document = {
        id: docId,
        accountId,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        status: 'Completed',
        extractedText: text,
        aiSummary: summary,
        detectedTopics: parsedTopics,
        detectedTechnologies: parsedTech,
        detectedBusinessPriorities: parsedPriorities,
        metadata: {
          author: 'System Extractor',
          pageCount: Math.ceil(parseInt(file.size || '30') / 10) || 3,
          fileSize: file.size,
          sections: [
            { heading: 'Executive Summary', content: 'Modernization of regional infrastructure and system layers.' },
            { heading: 'Operational Framework', content: 'Integrating modern software architectures with cloud resources.' }
          ]
        }
      };

      setDocuments(prev => prev.map(d => d.id === docId ? updatedDoc : d));
      fetchWithAuth('/api/documents', {
        method: 'POST',
        body: JSON.stringify(updatedDoc)
      });

      // Also automatically convert and save as ResearchEvidence item!
      const newEv: ResearchEvidence = {
        id: `ev_doc_${Date.now()}`,
        accountId,
        title: `Doc: ${file.name}`,
        source: 'Uploaded Document',
        sourceType: 'Document',
        date: new Date().toISOString().split('T')[0],
        category: 'Document Analysis',
        content: text,
        summary: summary,
        confidence: 95,
        status: 'Completed',
        tags: parsedTopics,
        freshness: 'High',
        reliability: 'High',
        overallQuality: 'A'
      };
      setEvidence(prev => [newEv, ...prev]);
      fetchWithAuth('/api/evidence', {
        method: 'POST',
        body: JSON.stringify(newEv)
      });

      // Update account coverage uploadedDocuments score!
      setOrchestratedResearches(prev => {
        const res = prev[accountId];
        if (!res) return prev;
        const updatedCoverage = {
          ...res.coverage,
          uploadedDocuments: Math.min(100, (res.coverage.uploadedDocuments || 0) + 30),
        };
        // recompute overallScore
        const values = Object.keys(updatedCoverage)
          .filter(k => k !== 'overallScore')
          .map(k => (updatedCoverage as any)[k] as number);
        const avg = Math.floor(values.reduce((sum, v) => sum + v, 0) / values.length);
        updatedCoverage.overallScore = avg;

        const updatedRes = {
          ...res,
          coverage: updatedCoverage,
          researchQuality: getQualityGrade(avg),
        };
        fetchWithAuth('/api/orchestrated-researches', {
          method: 'POST',
          body: JSON.stringify(updatedRes)
        });

        return {
          ...prev,
          [accountId]: updatedRes
        };
      });

      addNotification('Extraction Complete', `Successfully extracted structured data from "${file.name}".`, 'success');
    }, 4500);
  };

  const getQualityGrade = (score: number): 'A+' | 'A' | 'B' | 'C' | 'D' => {
    if (score >= 95) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 70) return 'B';
    if (score >= 55) return 'C';
    return 'D';
  };

  // Evidence Operations Implementation
  const addEvidence = (evData: Omit<ResearchEvidence, 'id'>) => {
    const newEv: ResearchEvidence = {
      ...evData,
      id: `ev_${Date.now()}`,
    };
    setEvidence(prev => [newEv, ...prev]);
    addActivity('evidence_collected', `New evidence source added: "${newEv.title}"`, evData.accountId);
    fetchWithAuth('/api/evidence', {
      method: 'POST',
      body: JSON.stringify(newEv)
    });
  };

  const deleteEvidence = (id: string) => {
    setEvidence(prev => prev.filter(e => e.id !== id));
    fetchWithAuth(`/api/evidence/${id}`, {
      method: 'DELETE'
    });
  };

  const updateEvidence = (updated: ResearchEvidence) => {
    setEvidence(prev => prev.map(e => e.id === updated.id ? updated : e));
    fetchWithAuth('/api/evidence', {
      method: 'POST',
      body: JSON.stringify(updated)
    });
  };

  const addManualNote = (accountId: string, title: string, content: string, category: string) => {
    const newNote: ResearchEvidence = {
      id: `ev_note_${Date.now()}`,
      accountId,
      title,
      source: 'User Manual Entry',
      sourceType: 'Manual Note',
      date: new Date().toISOString().split('T')[0],
      category: category || 'General Context',
      content,
      summary: content.slice(0, 100) + (content.length > 100 ? '...' : ''),
      confidence: 100,
      status: 'Completed',
      tags: ['Manual Note', category].filter(Boolean),
      freshness: 'High',
      reliability: 'High',
      overallQuality: 'A+'
    };
    setEvidence(prev => [newNote, ...prev]);
    fetchWithAuth('/api/evidence', {
      method: 'POST',
      body: JSON.stringify(newNote)
    });

    // Update account coverage manual notes score!
    setOrchestratedResearches(prev => {
      const res = prev[accountId];
      if (!res) return prev;
      const updatedCoverage = {
        ...res.coverage,
        manualNotes: Math.min(100, (res.coverage.manualNotes || 0) + 25),
      };
      // recompute overallScore
      const values = Object.keys(updatedCoverage)
        .filter(k => k !== 'overallScore')
        .map(k => (updatedCoverage as any)[k] as number);
      const avg = Math.floor(values.reduce((sum, v) => sum + v, 0) / values.length);
      updatedCoverage.overallScore = avg;

      const updatedRes = {
        ...res,
        coverage: updatedCoverage,
        researchQuality: getQualityGrade(avg),
      };
      fetchWithAuth('/api/orchestrated-researches', {
        method: 'POST',
        body: JSON.stringify(updatedRes)
      });

      return {
        ...prev,
        [accountId]: updatedRes
      };
    });

    addActivity('evidence_collected', `Added manual note: "${title}"`, accountId);
    addNotification('Note Added', `Manual note "${title}" added as core research evidence.`, 'success');
  };

  const triggerSourceIngestion = async (accountId: string, sourceType: string) => {
    const account = accounts.find(a => a.id === accountId);
    const accountName = account ? account.name : 'Unknown';
    addNotification('Ingestion Triggered', `Connecting to source: ${sourceType} for ${accountName}...`, 'info');

    // Simulate standard scraping delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate specific mock evidence based on sourceType
    let title = '';
    let content = '';
    let category = '';
    let tags: string[] = [];

    if (sourceType === 'Website') {
      title = `${accountName} Products & Marketing Directory Ingestion`;
      content = `Ingested the core product pages of ${accountName}. Detected primary revenue generators: Enterprise SaaS subscription pipelines, cloud consulting accelerators, and dedicated developer training courses. Corporate blog emphasizes rapid client onboarding and low integration friction strategies.`;
      category = 'Products & Services';
      tags = ['Scraped Website', 'Products', 'Marketing'];
    } else if (sourceType === 'SEC EDGAR') {
      title = `${accountName} Form 10-Q (Quarterly Report)`;
      content = `Quarterly financial results ingested from SEC filing. Total operational expenses slightly lowered due to server optimization, while custom cloud solution spend saw a 12% bump. Active investments in AI workflow pilots are noted under Strategic Outlays.`;
      category = 'Financial Report';
      tags = ['SEC Filing', 'Quarterly Report', 'EDGAR'];
    } else if (sourceType === 'Careers') {
      title = `${accountName} Talent Portal Ingestion`;
      content = `Active hiring trends point to a high count of open roles in solutions engineering. Skills requested include React, TypeScript, and Docker, with a heavy emphasis on client-facing technical presentation and pilot co-design.`;
      category = 'Hiring Profile';
      tags = ['Careers Scraped', 'Hiring Trends', 'Tech Stack'];
    } else {
      title = `${accountName} External News feed Sync`;
      content = `Discovered recent press briefings indicating that ${accountName} is entering a strategic collaboration with local tech consortiums to fast-track digital automation tools in customer service branches.`;
      category = 'Recent News';
      tags = ['News Ingested', 'PR Feed'];
    }

    const newEv: ResearchEvidence = {
      id: `ev_ing_${Date.now()}`,
      accountId,
      title,
      source: sourceType === 'SEC EDGAR' ? 'SEC EDGAR' : `Automated ${sourceType} Scraper`,
      sourceType: sourceType as any,
      date: new Date().toISOString().split('T')[0],
      category,
      content,
      summary: content.slice(0, 100) + '...',
      confidence: 96,
      status: 'Completed',
      tags,
      freshness: 'High',
      reliability: 'High',
      overallQuality: 'A'
    };

    setEvidence(prev => [newEv, ...prev]);
    fetchWithAuth('/api/evidence', {
      method: 'POST',
      body: JSON.stringify(newEv)
    });

    // Update coverage scores dynamically!
    setOrchestratedResearches(prev => {
      const res = prev[accountId];
      if (!res) return prev;

      const updatedCoverage = { ...res.coverage };
      if (sourceType === 'Website') {
        updatedCoverage.website = 100;
        updatedCoverage.products = 100;
      } else if (sourceType === 'SEC EDGAR') {
        updatedCoverage.annualReport = 100;
        updatedCoverage.quarterlyReport = 100;
        updatedCoverage.investorPresentation = 100;
      } else if (sourceType === 'Careers') {
        updatedCoverage.hiring = 100;
      } else {
        updatedCoverage.news = 100;
      }

      const values = Object.keys(updatedCoverage)
        .filter(k => k !== 'overallScore')
        .map(k => (updatedCoverage as any)[k] as number);
      const avg = Math.floor(values.reduce((sum, v) => sum + v, 0) / values.length);
      updatedCoverage.overallScore = avg;

      const updatedRes = {
        ...res,
        coverage: updatedCoverage,
        researchQuality: getQualityGrade(avg)
      };
      fetchWithAuth('/api/orchestrated-researches', {
        method: 'POST',
        body: JSON.stringify(updatedRes)
      });

      return {
        ...prev,
        [accountId]: updatedRes
      };
    });

    addActivity('evidence_collected', `Automated ingestion successfully synchronized for ${sourceType}.`, accountId);
    addNotification('Ingestion Completed', `Added "${title}" as verified research evidence.`, 'success');
  };

  const deleteDocument = (id: string) => {
    const target = documents.find(d => d.id === id);
    if (target) {
      setDocuments(prev => prev.filter(d => d.id !== id));
      const account = accounts.find(a => a.id === target.accountId);
      addActivity('document_uploaded', `Document "${target.name}" deleted.`, target.accountId, account?.name);
      fetchWithAuth(`/api/documents/${id}`, {
        method: 'DELETE'
      });
    }
  };

  // Settings
  const updateSettings = (updatedSettings: AppSettings) => {
    const standardized: AppSettings = {
      ...updatedSettings,
      geminiApiKey: 'SERVER_MANAGED_KEY',
    };
    setSettings(standardized);
    addActivity('settings_updated', 'System configuration parameters updated locally.', undefined, undefined);
    addNotification('Settings Saved', 'Platform configurations have been successfully updated.', 'info');
    fetchWithAuth('/api/settings', {
      method: 'POST',
      body: JSON.stringify(standardized)
    });
  };

  // Notifications: filtered so Market Signals are informed to account owners and Indus Health Plus leadership
  const visibleNotifications = useMemo(() => {
    const userEmail = (user?.email || '').toLowerCase().trim();
    if (!userEmail) return [];

    const isLeadership =
      userEmail === 'shailesh.thakare@indushealthplus.com' ||
      userEmail === 'shashaank.d@indushealthplus.com' ||
      userEmail === 'balaji.hadole@indushealthplus.com' ||
      userEmail === 'samarth.patki@indushealthplus.com' ||
      userEmail === 'ecomm.indus@gmail.com' ||
      userRole === 'admin';

    return notifications.filter(n => {
      // Non-signal notifications (e.g. general alerts, system events) are normal
      if (n.type !== 'signal' && !(n.title && n.title.includes('Signals'))) {
        return true;
      }

      // Leadership members are informed of all market signals
      if (isLeadership) {
        return true;
      }

      // Check explicit recipients array if present
      if (n.recipients && Array.isArray(n.recipients)) {
        if (n.recipients.some(r => String(r).toLowerCase().trim() === userEmail)) {
          return true;
        }
      }

      // Check if user is the Indus Health Plus Account Owner for this target account
      if (n.accountId) {
        const acc = accounts.find(a => a.id === n.accountId);
        if (acc) {
          const ownerEmail = deriveOwnerEmail(acc.owner, acc.createdByEmail).toLowerCase().trim();
          if (ownerEmail === userEmail) return true;
          if (acc.createdByEmail && acc.createdByEmail.toLowerCase().trim() === userEmail) return true;
          if (acc.owner && acc.owner.toLowerCase().includes(userEmail.split('@')[0])) return true;
        }
      }

      // If user is not leadership and not the account owner, do not inform
      return false;
    });
  }, [notifications, user, accounts, userRole]);

  const markAllNotificationsRead = () => {
    const visibleIds = new Set(visibleNotifications.map(n => n.id));
    const updated = notifications.map(n => {
      if (visibleIds.has(n.id)) {
        return { ...n, read: true };
      }
      return n;
    });
    setNotifications(updated);
    visibleNotifications.forEach(n => {
      fetchWithAuth('/api/notifications', {
        method: 'POST',
        body: JSON.stringify({ ...n, read: true })
      });
    });
  };

  const clearNotifications = () => {
    const visibleIds = new Set(visibleNotifications.map(n => n.id));
    visibleNotifications.forEach(n => {
      fetchWithAuth(`/api/notifications/${n.id}`, {
        method: 'DELETE'
      });
    });
    setNotifications(prev => prev.filter(n => !visibleIds.has(n.id)));
  };

  // Retrieve Research for Account
  const getResearchForAccount = (accountId: string): Research | null => {
    const oRes = orchestratedResearches[accountId];
    if (!oRes || !oRes.data || !oRes.data.company) {
      return customResearches[accountId] || null;
    }
    return {
      accountId,
      overview: oRes.data.company.description || oRes.data.executive?.businessSummary || '',
      techLandscape: oRes.data.technology?.findings.map(f => f.technology) || [],
      strategicPriorities: oRes.data.strategic?.map(p => p.priority) || [],
      hiringTrends: oRes.data.hiring?.trends || [],
      latestNews: oRes.data.news?.map(n => ({ id: n.id, title: n.title, date: n.date, source: n.source })) || [],
      financialHighlights: oRes.data.financial?.metrics.map(m => ({ id: m.metric, metric: m.metric, value: m.value })) || [],
      challenges: oRes.data.business?.swot.weaknesses || [],
      buyingSignals: oRes.data.signals?.map(s => s.signal) || [],
      summary: oRes.data.executive?.recommendedStrategy || '',
    };
  };

  // Signals Refresh & Notification Dispatch Engine
  const [isRefreshingSignals, setIsRefreshingSignals] = useState(false);
  const [lastSignalsRefreshSummary, setLastSignalsRefreshSummary] = useState<RefreshSignalsSummary | null>(null);

  const clearSignalsRefreshSummary = () => {
    setLastSignalsRefreshSummary(null);
  };

  const refreshAccountSignals = async (targetAccountIds?: string[]): Promise<RefreshSignalsSummary> => {
    setIsRefreshingSignals(true);

    const accountIdsToRefresh = targetAccountIds && targetAccountIds.length > 0
      ? targetAccountIds
      : accounts.map(a => a.id);

    const dispatches: SignalDispatchResult[] = [];
    const timestamp = new Date().toISOString();

    let updatedAccounts = [...accounts];
    let updatedOrchestrations = { ...orchestratedResearches };
    let newNotificationsToAdd: NotificationItem[] = [];

    for (const accId of accountIdsToRefresh) {
      const account = updatedAccounts.find(a => a.id === accId);
      if (!account) continue;

      // 1. Get fresh buying signals & create dispatch
      const freshSignals = getFreshSignalsForAccount(account);
      const dispatch = createAccountSignalDispatch(account, freshSignals);
      dispatches.push(dispatch);

      // 2. Update Account score & lastUpdated
      const newUpdatedAccount: Account = {
        ...account,
        opportunityScore: dispatch.newScore,
        lastUpdated: timestamp
      };
      updatedAccounts = updatedAccounts.map(a => a.id === accId ? newUpdatedAccount : a);

      // 3. Update Orchestrated Research
      const currentOrch = updatedOrchestrations[accId] || {
        accountId: accId,
        pipeline: getCompletedPipeline(timestamp),
        scoring: {
          overallScore: dispatch.newScore,
          factors: {
            technologyFit: 90, businessTransformation: 90, cloudAdoption: 90,
            aiInvestments: 90, hiringTrends: 90, dataModernization: 90,
            buyingSignals: 95, recentNews: 90, financialGrowth: 90,
            leadershipDirection: 90
          }
        },
        coverage: {
          website: 100, leadership: 100, products: 100, technology: 100,
          hiring: 100, annualReport: 100, quarterlyReport: 100,
          investorPresentation: 100, uploadedDocuments: 100, manualNotes: 100,
          news: 100, overallScore: 100
        },
        researchQuality: 'A+' as const,
        data: {}
      };

      const existingSignals = currentOrch.data?.signals || [];
      const signalTexts = new Set(freshSignals.map(s => s.signal));
      const filteredExisting = existingSignals.filter((s: any) => !signalTexts.has(s.signal));
      const combinedSignals = [...freshSignals, ...filteredExisting];

      const newOrch: OrchestratedResearch = {
        ...currentOrch,
        scoring: {
          ...currentOrch.scoring,
          overallScore: dispatch.newScore,
          factors: {
            ...currentOrch.scoring?.factors,
            buyingSignals: Math.min(99, ((currentOrch.scoring?.factors?.buyingSignals || 85) + 8))
          }
        },
        pipeline: {
          ...currentOrch.pipeline,
          signals: {
            id: 'signals',
            name: 'Buying Signals',
            status: 'Completed',
            confidence: 96,
            estimatedDuration: 0,
            updatedAt: timestamp
          }
        },
        data: {
          ...currentOrch.data,
          signals: combinedSignals
        }
      };
      updatedOrchestrations[accId] = newOrch;

      // 4. Create Notification item - Exclusively informed to Indus Health Plus Account Owner & Leadership
      const accountNotif: NotificationItem = {
        id: `sig_notif_${accId}_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        title: `🚨 Fresh Signals: ${account.name}`,
        description: `Discovered ${freshSignals.length} new market signals. Dispatched to Account Owner ${dispatch.ownerName} (${dispatch.ownerEmail}) and Indus Health Plus leadership.`,
        read: false,
        timestamp,
        type: 'signal',
        accountId: accId,
        accountName: account.name,
        recipients: dispatch.allRecipients,
        signals: freshSignals
      };
      newNotificationsToAdd.push(accountNotif);

      // 5. Add Activity
      addActivity(
        'evidence_collected',
        `Refreshed market signals for ${account.name} (+${dispatch.scoreDelta} momentum pts). Dispatched to ${dispatch.ownerName} and Indus Health Plus leadership.`,
        accId,
        account.name
      );

      // 6. Sync to server in background
      fetchWithAuth('/api/accounts', {
        method: 'POST',
        body: JSON.stringify(newUpdatedAccount)
      });
      fetchWithAuth('/api/orchestrated-researches', {
        method: 'POST',
        body: JSON.stringify(newOrch)
      });
      fetchWithAuth('/api/notifications', {
        method: 'POST',
        body: JSON.stringify({
          id: accountNotif.id,
          title: accountNotif.title,
          description: accountNotif.description,
          read: accountNotif.read,
          timestamp: accountNotif.timestamp,
          type: accountNotif.type,
          accountId: accountNotif.accountId,
          accountName: accountNotif.accountName,
          recipients: accountNotif.recipients
        })
      });
    }

    // Overarching summary notification
    const totalSignalsCount = dispatches.reduce((acc, d) => acc + d.newSignals.length, 0);
    const summaryNotif: NotificationItem = {
      id: `sig_summary_${Date.now()}`,
      title: `⚡ Signals Refreshed & Dispatched (${dispatches.length} Accounts)`,
      description: `Synchronized ${totalSignalsCount} market intent vectors. Informed to Indus Health Plus account owners and leadership.`,
      read: false,
      timestamp,
      type: 'signal',
      recipients: Array.from(new Set([
        ...LEADERSHIP_EMAILS,
        ...dispatches.map(d => d.ownerEmail)
      ]))
    };
    newNotificationsToAdd.unshift(summaryNotif);

    fetchWithAuth('/api/notifications', {
      method: 'POST',
      body: JSON.stringify({
        id: summaryNotif.id,
        title: summaryNotif.title,
        description: summaryNotif.description,
        read: summaryNotif.read,
        timestamp: summaryNotif.timestamp,
        type: summaryNotif.type,
        recipients: summaryNotif.recipients
      })
    });

    setAccounts(updatedAccounts);
    setOrchestratedResearches(updatedOrchestrations);
    setNotifications(prev => [...newNotificationsToAdd, ...prev]);

    localStorage.setItem('iaip_accounts', JSON.stringify(updatedAccounts));
    localStorage.setItem('iaip_orchestrated_researches', JSON.stringify(updatedOrchestrations));

    const resultSummary: RefreshSignalsSummary = {
      refreshedCount: dispatches.length,
      totalNewSignalsCount: totalSignalsCount,
      dispatches,
      timestamp
    };

    setLastSignalsRefreshSummary(resultSummary);
    setIsRefreshingSignals(false);

    return resultSummary;
  };

  return (
    <AppContext.Provider value={{
      accounts,
      stakeholders,
      opportunities,
      documents,
      templates,
      activities,
      settings,
      currentTab,
      selectedAccountId,
      currentDetailSubTab,
      isCreatingAccount,
      searchQuery,
      setSearchQuery,
      notifications: visibleNotifications,
      orchestratedResearches,
      evidence,

      navigate,
      addAccount,
      updateAccount,
      deleteAccount,
      shareAccount,
      triggerResearch,
      rerunSingleModule,

      addStakeholder,
      updateStakeholder,
      deleteStakeholder,
      researchStakeholder,

      addOpportunity,
      deleteOpportunity,

      uploadDocument,
      deleteDocument,

      updateSettings,

      markAllNotificationsRead,
      clearNotifications,

      addEvidence,
      deleteEvidence,
      updateEvidence,
      addManualNote,
      triggerSourceIngestion,

      getResearchForAccount,

      // Signals Refresh & Notification Dispatch
      refreshAccountSignals,
      isRefreshingSignals,
      lastSignalsRefreshSummary,
      clearSignalsRefreshSummary,

      // Auth
      user,
      authLoading,
      isSigningIn,
      authError,
      clearAuthError,
      isUnauthorized,
      userRole,
      allowedUsersList,
      fetchAllowedUsers,
      addAllowedUser,
      updateAllowedUser,
      removeAllowedUser,
      signInWithGoogle,
      signInWithMicrosoft,
      signOutUser,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
