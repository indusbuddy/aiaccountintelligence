/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AppSettings, ResearchDepthType } from '../types';
import { AllowedUser } from '../context/AppContext';
import * as Lucide from 'lucide-react';

interface SettingsScreenProps {
  initialTab?: 'general' | 'users';
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ initialTab = 'users' }) => {
  const { 
    settings, updateSettings, user, userRole, 
    allowedUsersList, addAllowedUser, updateAllowedUser, removeAllowedUser, fetchAllowedUsers
  } = useApp();

  const defaultTab = (initialTab === 'users' && userRole !== 'admin') ? 'general' : initialTab;
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'users'>(defaultTab);

  // Sync tab if parent navigation changes or if user role changes
  useEffect(() => {
    if (userRole !== 'admin') {
      setActiveSubTab('general');
    } else if (initialTab) {
      setActiveSubTab(initialTab);
    }
  }, [initialTab, userRole]);

  const [form, setForm] = useState<AppSettings>({ ...settings });

  // New allowed user form state
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'member'>('member');
  const [showAddUserCard, setShowAddUserCard] = useState(false);
  
  // Dedicated Edit User Modal state
  const [modalUser, setModalUser] = useState<AllowedUser | null>(null);
  const [modalName, setModalName] = useState('');
  const [modalEmail, setModalEmail] = useState('');
  const [modalRole, setModalRole] = useState<'admin' | 'member'>('member');
  const [modalStatus, setModalStatus] = useState<'active' | 'suspended'>('active');

  // Inline edit state
  const [inlineEditingUserId, setInlineEditingUserId] = useState<number | null>(null);
  const [inlineName, setInlineName] = useState('');
  const [inlineEmail, setInlineEmail] = useState('');
  const [inlineRole, setInlineRole] = useState<'admin' | 'member'>('member');
  const [inlineStatus, setInlineStatus] = useState<'active' | 'suspended'>('active');

  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [searchUserFilter, setSearchUserFilter] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'suspended' | 'admin' | 'member'>('all');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setActionMessage({ text: 'Platform settings saved successfully!', type: 'success' });
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      setActionMessage({ text: 'Please enter a valid email address.', type: 'error' });
      return;
    }
    setActionLoading(true);
    setActionMessage(null);
    try {
      const ok = await addAllowedUser(newEmail.trim().toLowerCase(), newName.trim(), newRole);
      if (ok) {
        setActionMessage({ text: `Granted access to ${newEmail}`, type: 'success' });
        setNewEmail('');
        setNewName('');
        setNewRole('member');
        setShowAddUserCard(false);
      } else {
        setActionMessage({ text: 'Failed to add user. Please check your permissions.', type: 'error' });
      }
    } catch (err: any) {
      setActionMessage({ text: err?.message || 'An error occurred while adding user.', type: 'error' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  // Open Edit Modal
  const openEditModal = (item: AllowedUser) => {
    setModalUser(item);
    setModalName(item.name || '');
    setModalEmail(item.email || '');
    setModalRole(item.role || 'member');
    setModalStatus(item.status || 'active');
  };

  const closeEditModal = () => {
    setModalUser(null);
  };

  // Submit Edit Modal Changes
  const handleSaveModalUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalUser) return;
    if (!modalEmail || !modalEmail.includes('@')) {
      setActionMessage({ text: 'Please enter a valid email address.', type: 'error' });
      return;
    }

    setActionLoading(true);
    try {
      await updateAllowedUser(modalUser.id, {
        name: modalName.trim(),
        email: modalEmail.trim().toLowerCase(),
        role: modalRole,
        status: modalStatus,
      });
      setActionMessage({ text: `User "${modalEmail}" updated successfully!`, type: 'success' });
      setModalUser(null);
    } catch (err: any) {
      setActionMessage({ text: err?.message || 'Failed to update user. Please try again.', type: 'error' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  // Quick 1-click status toggle
  const handleToggleStatus = async (item: AllowedUser) => {
    if (item.email === 'samarth.patki@indushealthplus.com') {
      setActionMessage({ text: 'The primary platform owner cannot be suspended.', type: 'error' });
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }

    const nextStatus = item.status === 'active' ? 'suspended' : 'active';
    setActionLoading(true);
    try {
      await updateAllowedUser(item.id, {
        status: nextStatus
      });
      setActionMessage({ 
        text: `Account status for ${item.email} changed to ${nextStatus.toUpperCase()}`, 
        type: 'success' 
      });
    } catch (err: any) {
      setActionMessage({ text: err?.message || 'Failed to update status.', type: 'error' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  // Quick 1-click role toggle
  const handleToggleRole = async (item: AllowedUser) => {
    if (item.email === 'samarth.patki@indushealthplus.com') {
      setActionMessage({ text: 'The primary platform owner must remain an Administrator.', type: 'error' });
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }

    const nextRole = item.role === 'admin' ? 'member' : 'admin';
    setActionLoading(true);
    try {
      await updateAllowedUser(item.id, {
        role: nextRole
      });
      setActionMessage({ 
        text: `Role for ${item.email} updated to ${nextRole.toUpperCase()}`, 
        type: 'success' 
      });
    } catch (err: any) {
      setActionMessage({ text: err?.message || 'Failed to update role.', type: 'error' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  // Inline edit handlers
  const startInlineEdit = (item: AllowedUser) => {
    setInlineEditingUserId(item.id);
    setInlineName(item.name || '');
    setInlineEmail(item.email || '');
    setInlineRole(item.role || 'member');
    setInlineStatus(item.status || 'active');
  };

  const cancelInlineEdit = () => {
    setInlineEditingUserId(null);
  };

  const handleSaveInlineEdit = async (id: number) => {
    if (!inlineEmail || !inlineEmail.includes('@')) {
      setActionMessage({ text: 'Please enter a valid email address.', type: 'error' });
      return;
    }
    setActionLoading(true);
    try {
      await updateAllowedUser(id, {
        name: inlineName.trim(),
        email: inlineEmail.trim().toLowerCase(),
        role: inlineRole,
        status: inlineStatus,
      });
      setActionMessage({ text: 'User details updated successfully!', type: 'success' });
      setInlineEditingUserId(null);
    } catch (err: any) {
      setActionMessage({ text: err?.message || 'Failed to update user.', type: 'error' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const handleRemoveUser = async (id: number, email: string) => {
    if (email === 'samarth.patki@indushealthplus.com') {
      setActionMessage({ text: 'The primary platform owner cannot be removed.', type: 'error' });
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }
    if (!confirm(`Are you sure you want to revoke platform access for ${email}?`)) {
      return;
    }
    setActionLoading(true);
    try {
      const ok = await removeAllowedUser(id);
      if (ok) {
        setActionMessage({ text: `Revoked access for ${email}`, type: 'success' });
      } else {
        setActionMessage({ text: 'Failed to remove user.', type: 'error' });
      }
    } catch (err: any) {
      setActionMessage({ text: err?.message || 'An error occurred.', type: 'error' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  // Filter users
  const filteredUsers = allowedUsersList.filter(u => {
    const q = searchUserFilter.toLowerCase().trim();
    const matchesSearch = !q || (
      u.email.toLowerCase().includes(q) ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      u.role.toLowerCase().includes(q) ||
      u.status.toLowerCase().includes(q)
    );

    if (!matchesSearch) return false;

    if (userStatusFilter === 'active') return u.status === 'active';
    if (userStatusFilter === 'suspended') return u.status === 'suspended';
    if (userStatusFilter === 'admin') return u.role === 'admin';
    if (userStatusFilter === 'member') return u.role === 'member';
    return true;
  });

  const activeCount = allowedUsersList.filter(u => u.status === 'active').length;
  const suspendedCount = allowedUsersList.filter(u => u.status === 'suspended').length;
  const adminCount = allowedUsersList.filter(u => u.role === 'admin').length;

  return (
    <div id="settings-page" className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#091540] sm:text-3xl flex items-center gap-2.5">
            {activeSubTab === 'users' ? (
              <>
                <Lucide.Users className="w-7 h-7 text-[#2563FF]" />
                <span>User Management & Access</span>
              </>
            ) : (
              <>
                <Lucide.Sliders className="w-7 h-7 text-[#091540]" />
                <span>Platform Settings</span>
              </>
            )}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            {activeSubTab === 'users' 
              ? 'View, edit, add, and update authorized team members, security roles, and account access permissions.'
              : 'Configure AI engine models, default intelligence depths, API keys, and workspace theming.'}
          </p>
        </div>

        {/* Sub-tabs Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200 shrink-0">
          {userRole === 'admin' && (
            <button
              type="button"
              onClick={() => setActiveSubTab('users')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'users'
                  ? 'bg-white text-[#091540] shadow-xs ring-1 ring-black/5'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Lucide.Users className="w-4 h-4 text-[#2563FF]" />
              <span>User Management ({allowedUsersList.length})</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveSubTab('general')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'general'
                ? 'bg-white text-[#091540] shadow-xs ring-1 ring-black/5'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Lucide.Cpu className="w-4 h-4 text-[#091540]" />
            <span>AI & Engine</span>
          </button>
        </div>
      </div>

      {/* Action Notification Message Toast */}
      {actionMessage && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 shadow-md animate-fade-in ${
          actionMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
            : 'bg-rose-50 text-rose-900 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {actionMessage.type === 'success' ? (
              <Lucide.CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <Lucide.AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionMessage(null)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded"
          >
            <Lucide.X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ======================================================== ACCESS RESTRICTION IF NOT ADMIN */}
      {activeSubTab === 'users' && userRole !== 'admin' && (
        <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 shadow-sm animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 border border-amber-100">
            <Lucide.ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-[#091540]">Administrator Access Required</h2>
          <p className="text-xs text-gray-500 mt-1.5">
            User management and role assignments are restricted to administrators.
          </p>
          <button
            type="button"
            onClick={() => setActiveSubTab('general')}
            className="mt-4 px-4 py-2 bg-[#091540] hover:bg-[#132a6e] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Go to Platform Settings
          </button>
        </div>
      )}

      {/* ======================================================== TAB 1: USER MANAGEMENT */}
      {activeSubTab === 'users' && userRole === 'admin' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Total Users</span>
                <div className="p-1.5 bg-blue-50 rounded-lg text-[#2563FF]">
                  <Lucide.Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-[#091540] mt-2">{allowedUsersList.length}</p>
              <span className="text-[10px] text-gray-400 font-medium">Provisioned in Cloud SQL</span>
            </div>

            <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Active</span>
                <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                  <Lucide.UserCheck className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-emerald-600 mt-2">{activeCount}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Access Granted</span>
            </div>

            <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Suspended</span>
                <div className="p-1.5 bg-rose-50 rounded-lg text-rose-600">
                  <Lucide.UserX className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-rose-600 mt-2">{suspendedCount}</p>
              <span className="text-[10px] text-rose-600 font-medium">Access Blocked</span>
            </div>

            <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Administrators</span>
                <div className="p-1.5 bg-purple-50 rounded-lg text-purple-600">
                  <Lucide.Shield className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-[#091540] mt-2">{adminCount}</p>
              <span className="text-[10px] text-purple-600 font-medium">Full Permissions</span>
            </div>
          </div>

          {/* Access Control Security Banner & Authentication Info */}
          <div className="bg-[#091540] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-[#2563FF]/20 rounded-full blur-2xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-white/10 rounded-xl border border-white/10 text-[#2563FF] shadow-inner">
                  <Lucide.ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Google Workspace OAuth & Whitelist Protocol</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      Live
                    </span>
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Authentication is passwordless and secured via Google OAuth. To grant or update team members' access, edit their profile below or add their company email. Users sign in seamlessly with their Google Workspace credentials.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddUserCard(!showAddUserCard)}
                  className="px-4 py-2 bg-[#2563FF] hover:bg-blue-600 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Lucide.UserPlus className="w-4 h-4" />
                  <span>{showAddUserCard ? 'Close Add Form' : 'Add New User'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => fetchAllowedUsers()}
                  disabled={actionLoading}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-semibold rounded-xl border border-white/15 transition-all flex items-center gap-2 cursor-pointer"
                  title="Reload users from Cloud SQL"
                >
                  <Lucide.RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Current Session Account Status */}
            <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Your Current Session:</span>
                <span className="font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded border border-white/10">
                  {user?.email}
                </span>
                <span className="text-[10px] uppercase font-black bg-[#2563FF] text-white px-2 py-0.5 rounded">
                  {userRole}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Cloud SQL Protected • Real-time DB Sync
              </span>
            </div>
          </div>

          {/* Add New User Collapsible Form */}
          {showAddUserCard && (
            <div className="bg-white border-2 border-blue-200 shadow-md rounded-2xl p-6 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 text-[#2563FF] rounded-lg">
                    <Lucide.UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#091540]">Add New Authorized User</h3>
                    <p className="text-xs text-gray-500">Provide their company email. They can sign in instantly without creating a password.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddUserCard(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <Lucide.X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                  <div className="md:col-span-5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-gray-600 block mb-1">
                      Google Workspace Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. colleague@company.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden text-gray-800 font-mono transition-all"
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-gray-600 block mb-1">
                      Full Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sarah Connor"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden text-gray-800 transition-all"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-gray-600 block mb-1">
                      Platform Role
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as 'admin' | 'member')}
                      className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden text-gray-800 font-semibold transition-all"
                    >
                      <option value="member">Member (Standard Access)</option>
                      <option value="admin">Administrator (Full Admin)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-[11px] text-gray-500">
                    No password required — credentials verified via Google Workspace.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddUserCard(false)}
                      className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading || !newEmail}
                      className="px-5 py-2.5 bg-[#091540] hover:bg-[#15276e] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                    >
                      {actionLoading ? (
                        <Lucide.Loader2 className="w-4 h-4 animate-spin text-[#2563FF]" />
                      ) : (
                        <Lucide.UserCheck className="w-4 h-4" />
                      )}
                      <span>Grant Platform Access</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* User Directory Table Card */}
          <div className="bg-white border border-gray-200 shadow-xs rounded-2xl overflow-hidden">
            
            {/* Header, Search & Filter Tabs */}
            <div className="p-4 sm:p-5 border-b border-gray-100 bg-slate-50/70 space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Lucide.Users className="w-4 h-4 text-[#091540]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#091540]">
                    Authorized Team Directory ({filteredUsers.length})
                  </h3>
                </div>

                <div className="relative sm:w-72">
                  <Lucide.Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or role..."
                    value={searchUserFilter}
                    onChange={(e) => setSearchUserFilter(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:ring-1 focus:ring-blue-500 outline-hidden text-gray-800"
                  />
                  {searchUserFilter && (
                    <button
                      type="button"
                      onClick={() => setSearchUserFilter('')}
                      className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      <Lucide.X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {(
                  [
                    { id: 'all', label: `All Users (${allowedUsersList.length})` },
                    { id: 'active', label: `Active (${activeCount})` },
                    { id: 'suspended', label: `Suspended (${suspendedCount})` },
                    { id: 'admin', label: `Admins (${adminCount})` },
                    { id: 'member', label: `Members (${allowedUsersList.length - adminCount})` },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setUserStatusFilter(tab.id)}
                    className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      userStatusFilter === tab.id
                        ? 'bg-[#091540] text-white shadow-2xs'
                        : 'bg-white text-gray-600 hover:bg-slate-200/70 border border-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Directory Table Rows */}
            <div className="divide-y divide-gray-100 overflow-x-auto">
              {filteredUsers.length === 0 ? (
                <div className="p-12 text-center text-xs text-gray-400 space-y-2">
                  <Lucide.Users className="w-8 h-8 text-gray-300 mx-auto" />
                  <p className="font-semibold text-gray-500">No users match your criteria.</p>
                  <p className="text-[11px]">Try adjusting your search query or status filter.</p>
                </div>
              ) : (
                filteredUsers.map((item) => {
                  const isInlineEditing = inlineEditingUserId === item.id;
                  const isOwner = item.email === 'samarth.patki@indushealthplus.com';

                  return (
                    <div
                      key={item.id}
                      className={`p-4 transition-colors ${
                        isInlineEditing 
                          ? 'bg-blue-50/40 border-l-4 border-l-[#2563FF]' 
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {isInlineEditing ? (
                        /* INLINE EDIT MODE (Quick on-page editor) */
                        <div className="space-y-3.5 animate-fade-in">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#091540] font-mono flex items-center gap-1.5">
                              <Lucide.Edit3 className="w-3.5 h-3.5 text-[#2563FF]" />
                              Quick Editing: {item.email}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">Row ID #{item.id}</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div>
                              <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
                                Full Name
                              </label>
                              <input
                                type="text"
                                value={inlineName}
                                onChange={(e) => setInlineName(e.target.value)}
                                placeholder="Full Name"
                                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-800 outline-hidden focus:ring-1 focus:ring-blue-500 font-medium"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
                                Email Address
                              </label>
                              <input
                                type="email"
                                value={inlineEmail}
                                onChange={(e) => setInlineEmail(e.target.value)}
                                disabled={isOwner}
                                placeholder="email@company.com"
                                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-800 outline-hidden focus:ring-1 focus:ring-blue-500 font-mono disabled:opacity-50"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
                                Security Role
                              </label>
                              <select
                                value={inlineRole}
                                onChange={(e) => setInlineRole(e.target.value as 'admin' | 'member')}
                                disabled={isOwner}
                                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-800 outline-hidden focus:ring-1 focus:ring-blue-500 font-semibold disabled:opacity-50"
                              >
                                <option value="member">Member (Standard)</option>
                                <option value="admin">Admin (Full Access)</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
                                Access Status
                              </label>
                              <select
                                value={inlineStatus}
                                onChange={(e) => setInlineStatus(e.target.value as 'active' | 'suspended')}
                                disabled={isOwner}
                                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-800 outline-hidden focus:ring-1 focus:ring-blue-500 font-semibold disabled:opacity-50"
                              >
                                <option value="active">Active (Access Allowed)</option>
                                <option value="suspended">Suspended (Access Denied)</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-1 border-t border-blue-100">
                            <button
                              type="button"
                              onClick={cancelInlineEdit}
                              disabled={actionLoading}
                              className="px-3.5 py-1.5 border border-gray-200 text-gray-600 hover:bg-white text-xs font-semibold rounded-lg transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveInlineEdit(item.id)}
                              disabled={actionLoading}
                              className="px-4 py-1.5 bg-[#2563FF] hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              {actionLoading ? <Lucide.Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lucide.Check className="w-3.5 h-3.5" />}
                              <span>Save Updates</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* NORMAL DISPLAY ROW WITH CLEAR EDIT & UPDATE BUTTONS */
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* User Avatar Initials */}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 shadow-xs border ${
                              item.role === 'admin'
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
                                : 'bg-slate-100 border-slate-200 text-[#091540]'
                            }`}>
                              {item.name ? item.name[0].toUpperCase() : item.email[0].toUpperCase()}
                            </div>
                            
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-[#091540] truncate font-mono">
                                  {item.email}
                                </span>
                                {isOwner && (
                                  <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 rounded-full border border-purple-200">
                                    Platform Owner
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                                <span className="font-semibold text-gray-700">{item.name || 'Unnamed Member'}</span>
                                <span>•</span>
                                <span className="capitalize font-medium text-gray-600">{item.role} Role</span>
                                {item.addedBy && (
                                  <>
                                    <span>•</span>
                                    <span className="text-[10px] text-gray-400">Added by {item.addedBy}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Controllers: Status Toggle, Role Toggle, Edit Modal Button, Revoke */}
                          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                            {/* Quick Status Toggle Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(item)}
                              disabled={actionLoading || isOwner}
                              title={isOwner ? "Owner cannot be suspended" : `Click to ${item.status === 'active' ? 'Suspend' : 'Activate'}`}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                                item.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              } ${isOwner ? 'cursor-not-allowed opacity-80' : ''}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              <span>{item.status === 'active' ? 'Active' : 'Suspended'}</span>
                              {!isOwner && <Lucide.ArrowUpDown className="w-2.5 h-2.5 opacity-60 ml-0.5" />}
                            </button>

                            {/* Role Badge / Toggle */}
                            <button
                              type="button"
                              onClick={() => handleToggleRole(item)}
                              disabled={actionLoading || isOwner}
                              title={isOwner ? "Owner must remain admin" : `Click to toggle role (${item.role === 'admin' ? 'Demote to Member' : 'Promote to Admin'})`}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 border ${
                                item.role === 'admin'
                                  ? 'bg-blue-50 text-[#2563FF] border-blue-200 hover:bg-blue-100 cursor-pointer'
                                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 cursor-pointer'
                              } ${isOwner ? 'cursor-not-allowed opacity-80' : ''}`}
                            >
                              <span>{item.role}</span>
                              {!isOwner && <Lucide.ArrowUpDown className="w-2.5 h-2.5 opacity-60 ml-0.5" />}
                            </button>

                            {/* PRIMARY PROMINENT "EDIT USER" BUTTON */}
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              disabled={actionLoading}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 text-xs font-bold rounded-lg border border-gray-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                              title="Update User Details (Full Dialog)"
                            >
                              <Lucide.Edit2 className="w-3.5 h-3.5 text-[#2563FF]" />
                              <span>Update</span>
                            </button>

                            {/* Quick Inline Edit Toggle Icon */}
                            <button
                              type="button"
                              onClick={() => startInlineEdit(item)}
                              disabled={actionLoading}
                              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Quick Inline Edit"
                            >
                              <Lucide.SlidersHorizontal className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete / Revoke Access Button (Protected for Owner) */}
                            {!isOwner && (
                              <button
                                type="button"
                                onClick={() => handleRemoveUser(item.id, item.email)}
                                disabled={actionLoading}
                                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Revoke Platform Access"
                              >
                                <Lucide.Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* DEDICATED "UPDATE USER" MODAL DIALOG */}
          {modalUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
              <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-scale-in">
                {/* Modal Header */}
                <div className="px-6 py-4 bg-[#091540] text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-xl">
                      <Lucide.UserCheck className="w-5 h-5 text-[#2563FF]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Update User Profile & Access</h3>
                      <p className="text-[11px] text-slate-300 font-mono">{modalUser.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <Lucide.X className="w-4 h-4" />
                  </button>
                </div>

                {/* Modal Form Body */}
                <form onSubmit={handleSaveModalUser} className="p-6 space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-wider text-gray-600 block mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <Lucide.User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="e.g. Jane Doe"
                        value={modalName}
                        onChange={(e) => setModalName(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-gray-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden font-medium text-gray-800"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-wider text-gray-600 block mb-1">
                      Google Workspace Email Address *
                    </label>
                    <div className="relative">
                      <Lucide.Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="email"
                        required
                        disabled={modalUser.email === 'samarth.patki@indushealthplus.com'}
                        placeholder="user@company.com"
                        value={modalEmail}
                        onChange={(e) => setModalEmail(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-gray-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden font-mono text-gray-800 disabled:opacity-60"
                      />
                    </div>
                    {modalUser.email === 'samarth.patki@indushealthplus.com' && (
                      <p className="text-[10px] text-purple-600 font-semibold mt-1">
                        Primary account owner email is locked for platform security.
                      </p>
                    )}
                  </div>

                  {/* Security Role Selector */}
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-wider text-gray-600 block mb-1.5">
                      Platform Security Role
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setModalRole('member')}
                        disabled={modalUser.email === 'samarth.patki@indushealthplus.com'}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          modalRole === 'member'
                            ? 'border-[#2563FF] bg-blue-50/50 ring-2 ring-blue-500/20'
                            : 'border-gray-200 hover:bg-slate-50'
                        } ${modalUser.email === 'samarth.patki@indushealthplus.com' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#091540]">Member</span>
                          {modalRole === 'member' && <Lucide.CheckCircle2 className="w-4 h-4 text-[#2563FF]" />}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1 leading-tight">
                          Can explore accounts, trigger researches, and access templates.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setModalRole('admin')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          modalRole === 'admin'
                            ? 'border-[#2563FF] bg-blue-50/50 ring-2 ring-blue-500/20'
                            : 'border-gray-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#091540]">Administrator</span>
                          {modalRole === 'admin' && <Lucide.CheckCircle2 className="w-4 h-4 text-[#2563FF]" />}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1 leading-tight">
                          Full admin rights: user management, AI engines, settings, and database.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Account Access Status */}
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-wider text-gray-600 block mb-1.5">
                      Account Status
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setModalStatus('active')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          modalStatus === 'active'
                            ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                            : 'border-gray-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-800">Active</span>
                          {modalStatus === 'active' && <Lucide.CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1 leading-tight">
                          Access permitted via Google OAuth sign-in.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setModalStatus('suspended')}
                        disabled={modalUser.email === 'samarth.patki@indushealthplus.com'}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          modalStatus === 'suspended'
                            ? 'border-rose-500 bg-rose-50/50 ring-2 ring-rose-500/20'
                            : 'border-gray-200 hover:bg-slate-50'
                        } ${modalUser.email === 'samarth.patki@indushealthplus.com' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-rose-800">Suspended</span>
                          {modalStatus === 'suspended' && <Lucide.AlertCircle className="w-4 h-4 text-rose-600" />}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1 leading-tight">
                          Access denied. Login and API sync requests rejected.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Password / Access explanation info box */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#091540] text-[11px]">
                      <Lucide.KeyRound className="w-3.5 h-3.5 text-[#2563FF]" />
                      <span>Password & Credential Protocol</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-normal">
                      Users log in securely using their existing Google Workspace Account credentials. There are no platform passwords to manage, email, or reset.
                    </p>
                  </div>

                  {/* Modal Action Buttons */}
                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={closeEditModal}
                      disabled={actionLoading}
                      className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading || !modalEmail}
                      className="px-5 py-2.5 bg-[#091540] hover:bg-[#132a6e] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {actionLoading ? (
                        <Lucide.Loader2 className="w-4 h-4 animate-spin text-[#2563FF]" />
                      ) : (
                        <Lucide.Save className="w-4 h-4" />
                      )}
                      <span>Save & Update User</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ======================================================== TAB 2: GENERAL AI & ENGINE SETTINGS */}
      {activeSubTab === 'general' && (
        <form onSubmit={handleSave} className="space-y-6 animate-fade-in">
          
          {/* 1. AI PROVIDER & KEYS */}
          <div className="bg-white border border-gray-200 shadow-xs rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Lucide.Cpu className="w-5 h-5 text-[#091540]" />
              <h3 className="text-sm font-bold text-[#091540] uppercase tracking-wider text-[11px]">AI Model Provider</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['Gemini', 'OpenAI', 'Claude'] as const).map((provider) => (
                <button
                  key={provider}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, aiProvider: provider }))}
                  className={`p-4 border rounded-xl font-bold text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                    form.aiProvider === provider
                      ? 'border-[#091540] bg-slate-50 text-[#091540] ring-1 ring-[#091540]'
                      : 'border-gray-200 bg-white text-gray-400 hover:bg-slate-50'
                  }`}
                >
                  {provider === 'Gemini' && <Lucide.Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />}
                  {provider === 'OpenAI' && <Lucide.Zap className="w-5 h-5 text-emerald-600" />}
                  {provider === 'Claude' && <Lucide.Compass className="w-5 h-5 text-amber-500" />}
                  <span className="text-xs">{provider} Integration</span>
                </button>
              ))}
            </div>

            {/* API Key Status - Unified & Immutable for All Users */}
            {form.aiProvider === 'Gemini' && (
              <div className="space-y-4 pt-3">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lucide.KeyRound className="w-4 h-4 text-[#2563FF]" />
                      <span className="text-xs font-bold text-[#091540]">
                        Centralized Google Gemini API Key
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      Active & Locked
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs bg-white px-3 py-2 rounded-lg border border-slate-200 text-slate-600">
                    <Lucide.ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="flex-1 tracking-widest text-[11px]">••••••••••••••••••••••••••••••••</span>
                    <span className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wider">
                      Shared Platform Key
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    The Gemini API key is centrally enforced across all existing and new team members. It is managed on the server to prevent discrepancies, protect credentials, and guarantee consistent research intelligence for everyone.
                  </p>
                </div>

                {/* Model Select */}
                <div>
                  <label className="text-[10px] uppercase font-black tracking-wider text-gray-400 block mb-1.5">
                    Model Selection
                  </label>
                  <select
                    value={form.modelSelection}
                    onChange={(e) => setForm(p => ({ ...p, modelSelection: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-1 focus:ring-blue-500 outline-hidden font-semibold text-gray-700 text-xs bg-white"
                  >
                    <option value="gemini-3.5-flash">Gemini 3.5 Flash (Default - Highly Optimized)</option>
                    <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Precision Context Mapping)</option>
                    <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (High Speed)</option>
                  </select>
                </div>
              </div>
            )}

            {form.aiProvider !== 'Gemini' && (
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center text-xs text-gray-400">
                {form.aiProvider} configuration is blocked during this Gemini-First local UI sprint.
              </div>
            )}
          </div>

          {/* 2. RESEARCH SETTINGS */}
          <div className="bg-white border border-gray-200 shadow-xs rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Lucide.SearchCode className="w-5 h-5 text-[#091540]" />
              <h3 className="text-sm font-bold text-[#091540] uppercase tracking-wider text-[11px]">Research Operations</h3>
            </div>

            <div>
              <label className="text-[10px] uppercase font-black tracking-wider text-gray-400 block mb-2">
                Default Target Analysis Depth
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['Basic', 'Standard', 'Deep'] as ResearchDepthType[]).map((depth) => (
                  <button
                    key={depth}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, defaultResearchDepth: depth }))}
                    className={`py-2.5 px-4 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                      form.defaultResearchDepth === depth
                        ? 'border-[#091540] bg-slate-50 text-[#091540] font-extrabold ring-1 ring-[#091540]'
                        : 'bg-white border-gray-200 text-gray-400 hover:bg-slate-50'
                    }`}
                  >
                    {depth} Depth
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-2 font-medium leading-normal">
                Deep depth executes comprehensive stakeholder alignment sweeps. Standard focuses on system architecture and priorities. Basic reviews firmographics and financials.
              </p>
            </div>
          </div>

          {/* 3. WORKSPACE THEMING */}
          <div className="bg-white border border-gray-200 shadow-xs rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Lucide.SlidersHorizontal className="w-5 h-5 text-[#091540]" />
              <h3 className="text-sm font-bold text-[#091540] uppercase tracking-wider text-[11px]">Visual Theme</h3>
            </div>

            <div>
              <div className="grid grid-cols-2 gap-3">
                {(['Light', 'Dark'] as const).map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, theme: theme }))}
                    className={`py-2.5 px-4 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      form.theme === theme
                        ? 'border-[#091540] bg-slate-50 text-[#091540] font-extrabold ring-1 ring-[#091540]'
                        : 'bg-white border-gray-200 text-gray-400 hover:bg-slate-50'
                    }`}
                  >
                    {theme === 'Light' ? <Lucide.Sun className="w-4 h-4 text-amber-500" /> : <Lucide.Moon className="w-4 h-4 text-blue-500" />}
                    {theme} Mode
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-3 text-xs font-bold text-white bg-[#091540] hover:bg-[#15276e] rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <Lucide.Save className="w-4 h-4" />
              <span>Save Platform Settings</span>
            </button>
          </div>
        </form>
      )}

    </div>
  );
};
