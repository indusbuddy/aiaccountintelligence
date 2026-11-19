/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { DashboardScreen } from './components/DashboardScreen';
import { AccountsScreen } from './components/AccountsScreen';
import { NewAccountScreen } from './components/NewAccountScreen';
import { AccountDetailsScreen } from './components/AccountDetailsScreen';
import { ResearchScreen } from './components/ResearchScreen';
import { StakeholdersScreen } from './components/StakeholdersScreen';
import { CommunicationScreen } from './components/CommunicationScreen';
import { TemplatesScreen } from './components/TemplatesScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { SignalsRefreshModal } from './components/SignalsRefreshModal';
import * as Lucide from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    currentTab, isCreatingAccount, selectedAccountId, navigate,
    searchQuery, setSearchQuery, notifications, markAllNotificationsRead, clearNotifications,
    user, userRole, authLoading, isUnauthorized, isSigningIn, authError, clearAuthError,
    signInWithGoogle, signInWithMicrosoft, signOutUser
  } = useApp();

  // Local state for toggles
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSignalsModal, setShowSignalsModal] = useState(false);
  const [signalsModalAccountId, setSignalsModalAccountId] = useState<string | null>(null);

  if (authLoading) {
    return (
      <div id="iaip-platform-loader" className="min-h-screen bg-[#091540] flex flex-col items-center justify-center font-sans text-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(#2563FF_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-10" />
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-4 bg-white/10 border border-white/20 rounded-2xl shadow-xl backdrop-blur-xs">
            <img src="/intellify-logo-white.png" alt="Intellify Solutions" className="h-10 w-auto object-contain" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight block">Intellify Solutions</span>
            <span className="text-xs uppercase font-bold tracking-widest text-[#2563FF]">ABM AI Intelligence</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Lucide.Loader2 className="w-4 h-4 animate-spin text-[#2563FF]" />
            Initializing Secure Vault Connection...
          </div>
        </div>
      </div>
    );
  }

  if (user && isUnauthorized) {
    return (
      <div id="iaip-platform-unauthorized-gate" className="min-h-screen bg-[#091540] flex flex-col items-center justify-center font-sans text-white relative p-4">
        <div className="absolute inset-0 bg-[radial-gradient(#EF4444_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-15" />

        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-150 p-8 text-[#091540] relative z-10 flex flex-col items-center animate-fade-in">
          {/* Brand & Security Warning */}
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl shadow-sm mb-5">
            <Lucide.ShieldAlert className="w-8 h-8" />
          </div>

          <div className="text-center mb-6">
            <span className="text-[10px] uppercase font-black tracking-widest text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              Access Restricted
            </span>
            <h1 className="text-xl font-black text-[#091540] tracking-tight mt-3">Unauthorized Account</h1>
            <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
              Your Google account is not on the authorized user whitelist for this ABM AI Intelligence platform.
            </p>
          </div>

          {/* User Email Box */}
          <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-5 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Signed In As</span>
            <span className="text-xs font-mono font-bold text-slate-800 break-all">{user.email}</span>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800 mb-6 text-center leading-relaxed">
            <p className="font-semibold mb-1">Approval Required</p>
            Access is restricted to authorized team members (<span className="font-mono font-bold text-[#091540]">@intellifysolutions.com</span> & verified administrators). Please contact an administrator to approve your email.
          </div>

          <div className="w-full space-y-2.5">
            <button
              onClick={async () => {
                await signOutUser();
                await signInWithMicrosoft();
              }}
              disabled={isSigningIn}
              className="w-full py-3 px-4 bg-[#091540] hover:bg-[#132a6e] disabled:opacity-60 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              {isSigningIn ? (
                <>
                  <Lucide.Loader2 className="w-4 h-4 animate-spin text-[#2563FF]" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 23 23">
                    <path fill="#f35325" d="M1 1h10v10H1z" />
                    <path fill="#81bc06" d="M12 1h10v10H12z" />
                    <path fill="#05a6f0" d="M1 12h10v10H1z" />
                    <path fill="#ffba08" d="M12 12h10v10H12z" />
                  </svg>
                  <span>Sign In with Microsoft Account</span>
                </>
              )}
            </button>

            <button
              onClick={async () => {
                await signOutUser();
                await signInWithGoogle();
              }}
              disabled={isSigningIn}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign In with Google Account</span>
            </button>

            <button
              onClick={() => signOutUser()}
              disabled={isSigningIn}
              className="w-full py-2 px-4 text-slate-500 hover:text-slate-700 text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Lucide.LogOut className="w-3.5 h-3.5" />
              <span>Cancel & Sign Out</span>
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-slate-500 text-[10px] font-semibold select-none">
          STRICT CLOUD SQL ROW-LEVEL & ROLE-BASED ACCESS CONTROL ENFORCED
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div id="iaip-platform-login-gate" className="min-h-screen bg-[#091540] flex flex-col items-center justify-center font-sans text-white relative p-4">
        <div className="absolute inset-0 bg-[radial-gradient(#2563FF_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-15" />

        {/* Sign In Card */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-150 p-8 text-[#091540] relative z-10 flex flex-col items-center animate-fade-in">
          {/* Brand Identity */}
          <div className="flex flex-col items-center gap-2 mb-6 text-center">
            <img src="/intellify-logo.png" alt="Intellify Solutions" className="h-12 w-auto object-contain" />
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#2563FF] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              ABM AI Intelligence Platform
            </span>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-xl font-black text-[#091540] tracking-tight">Enterprise Secure Sign-In</h1>
            <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
              Welcome to the Partner Intelligence Cockpit. Sign in with your corporate Microsoft 365 or authorized Google account to synchronize targets with your regional Cloud SQL vault.
            </p>
          </div>

          {/* Auth Error Banner if popup was blocked or failed */}
          {authError && (
            <div className="w-full bg-rose-50 border border-rose-200 rounded-xl p-3.5 mb-5 flex items-start gap-2.5 text-xs text-rose-800">
              <Lucide.AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block mb-0.5">Authentication Notice</span>
                <span>{authError}</span>
              </div>
              <button
                onClick={clearAuthError}
                className="text-rose-500 hover:text-rose-700 p-0.5 rounded cursor-pointer"
              >
                <Lucide.X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Sign In Buttons */}
          <div className="w-full space-y-3">
            {/* Primary Microsoft SSO */}
            <button
              onClick={() => signInWithMicrosoft()}
              disabled={isSigningIn}
              className="w-full py-3.5 px-5 bg-[#091540] hover:bg-[#132a6e] active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer border border-[#091540]"
            >
              {isSigningIn ? (
                <>
                  <Lucide.Loader2 className="w-4 h-4 animate-spin text-[#2563FF]" />
                  <span>Connecting to Microsoft...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 23 23">
                    <path fill="#f35325" d="M1 1h10v10H1z" />
                    <path fill="#81bc06" d="M12 1h10v10H12z" />
                    <path fill="#05a6f0" d="M1 12h10v10H1z" />
                    <path fill="#ffba08" d="M12 12h10v10H12z" />
                  </svg>
                  <span>Sign in with Microsoft 365 Account</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-gray-400">or</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Google SSO */}
            <button
              onClick={() => signInWithGoogle()}
              disabled={isSigningIn}
              className="w-full py-3 px-5 bg-white hover:bg-slate-50 active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none text-slate-700 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer border border-gray-250"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google Account</span>
            </button>
          </div>

          {/* Secure Indicators */}
          <div className="mt-8 flex items-center justify-center gap-6 border-t border-slate-100 pt-6 w-full text-slate-400 font-mono text-[9px] uppercase tracking-wider font-bold">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Cloud SQL Active
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              mTLS AES-256
            </span>
          </div>
        </div>

        {/* Floating Developer Info / Simple Credits */}
        <div className="mt-8 text-center text-slate-500 text-[10px] font-semibold select-none">
          SECURE CONNECTION ENFORCED BY PARTNER PROTOCOLS
        </div>
      </div>
    );
  }

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // If the user searches and is not on the accounts or stakeholders page, we jump to accounts so they see instant results!
    if (currentTab !== 'accounts' && currentTab !== 'stakeholders') {
      navigate('accounts');
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { id: 'accounts', label: 'Target Accounts', icon: 'Building2' },
    { id: 'research', label: 'Research Cockpit', icon: 'Cpu' },
    { id: 'stakeholders', label: 'Stakeholders', icon: 'Users2' },
    { id: 'communication', label: 'Communication', icon: 'Mail' },
    { id: 'templates', label: 'Templates', icon: 'FileText' },
    ...(userRole === 'admin' ? [{ id: 'users', label: 'User Management', icon: 'Users' }] : []),
    { id: 'settings', label: 'Platform Settings', icon: 'Sliders' },
  ];

  const getPageTitle = () => {
    if (isCreatingAccount) return 'Register Account';
    if (selectedAccountId) return 'Account Workspace';
    if (currentTab === 'users') return 'User Management & Team Directory';
    const active = menuItems.find(m => m.id === currentTab);
    return active ? active.label : 'ABM AI Intelligence';
  };

  return (
    <div id="iaip-platform-root" className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">

      {/* Dynamic Background Grid Pattern to fit Premium McKinsey aesthetic */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none opacity-40 z-0" />

      {/* Main Split Screen Frame */}
      <div className="flex flex-1 relative z-10">

        {/* ======================================================== SIDEBAR (DESKTOP) */}
        <aside id="sidebar-desktop" className="hidden lg:flex flex-col w-64 bg-[#091540] text-white shrink-0 border-r border-[#091540]/20 min-h-screen">
          {/* Brand Identity Header */}
          <div className="p-5 border-b border-white/10 flex flex-col">
            <div className="flex flex-col items-start gap-1">
              <img src="/intellify-logo-white.png" alt="Intellify Solutions" className="h-8 w-auto object-contain" />
              <span className="text-[9px] uppercase font-bold tracking-widest text-[#2563FF] mt-0.5">
                ABM AI Intelligence
              </span>
            </div>
            <div className="mt-3 px-2 py-0.5 border border-white/10 rounded-md bg-white/5 text-center">
              <span className="text-[10px] font-medium text-slate-300">Enterprise Edition</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {menuItems.map((item) => {
              const IconComponent = Lucide[item.icon as keyof typeof Lucide] as React.ComponentType<{ className?: string }>;
              const isActive = currentTab === item.id && !selectedAccountId && !isCreatingAccount;

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${isActive
                    ? 'bg-[#2563FF] text-white shadow-md ring-1 ring-blue-400'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {IconComponent && <IconComponent className="w-4.5 h-4.5 shrink-0" />}
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-white/10 bg-[#060e2d]/60 text-center">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Research. Understand. Engage.</span>
            <span className="text-[9px] text-slate-500 mt-0.5 block">© 2026 Intellify Solutions • ABM Intelligence</span>
          </div>
        </aside>

        {/* ======================================================== CONTENT SPLIT BODY */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* ======================================================== TOP BAR NAVIGATION */}
          <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-4 sm:px-6 shrink-0 relative z-30 shadow-xs">
            {/* Left Segment: Mobile menu toggle + Context indicator */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                title="Open Navigation"
              >
                <Lucide.Menu className="w-5 h-5" />
              </button>

              {/* Context indicator */}
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">IAIP Engine</span>
                <span className="text-xs text-gray-300">/</span>
                <span className="text-xs font-extrabold text-[#091540] bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-md">
                  {getPageTitle()}
                </span>
              </div>
            </div>

            {/* Middle Segment: Search Box */}
            <div className="flex-1 max-w-md mx-4 sm:mx-8 relative">
              <Lucide.Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Global search target accounts, owners, sectors..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-4 py-2 text-xs border border-gray-150 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-hidden font-semibold text-gray-600 transition-all"
              />
            </div>

            {/* Right Segment: Tool controllers & profile */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 relative">

              {/* Global Refresh Signals & Notify Button */}
              <button
                type="button"
                onClick={() => {
                  setSignalsModalAccountId(null);
                  setShowSignalsModal(true);
                }}
                className="px-2.5 py-1.5 bg-[#091540] hover:bg-[#162768] text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer border border-[#162768]"
                title="Refresh target accounts for new buying signals and notify respective account owners, Mahesh & Srini"
              >
                <Lucide.Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="hidden sm:inline">Refresh Signals</span>
              </button>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowUserDropdown(false);
                  }}
                  className={`p-2 rounded-full hover:bg-slate-50 transition-colors border border-gray-100 text-gray-500 hover:text-gray-900 cursor-pointer ${showNotifications ? 'bg-slate-50 text-[#091540]' : ''
                    }`}
                  title="Notifications Panel"
                >
                  <Lucide.Bell className="w-4.5 h-4.5" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#2563FF] ring-2 ring-white animate-pulse" />
                  )}
                </button>

                {/* Notifications Dropdown Drawer */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2.5 w-84 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center bg-slate-50/50">
                      <span className="text-xs font-black text-[#091540] uppercase tracking-wider">Alerts Console ({notifications.length})</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowSignalsModal(true);
                            setShowNotifications(false);
                          }}
                          className="text-[10px] font-bold text-amber-600 hover:text-amber-800 flex items-center gap-0.5 cursor-pointer"
                        >
                          <Lucide.Radio className="w-3 h-3 text-amber-500" />
                          <span>Scan</span>
                        </button>
                        {unreadNotificationsCount > 0 && (
                          <button
                            onClick={() => markAllNotificationsRead()}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                      {notifications.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-xs">No notifications logged.</div>
                      ) : (
                        notifications.map((not) => (
                          <div
                            key={not.id}
                            onClick={() => {
                              if (not.accountId) {
                                navigate('accounts', not.accountId, 'research');
                                setShowNotifications(false);
                              }
                            }}
                            className={`p-3 text-xs transition-colors hover:bg-slate-50 flex items-start gap-2.5 ${!not.read ? 'bg-blue-50/15' : ''
                              } ${not.accountId ? 'cursor-pointer' : ''}`}
                          >
                            <div className="pt-0.5 shrink-0">
                              {not.type === 'signal' && (
                                <div className="p-1 rounded-md bg-amber-50 text-amber-600 border border-amber-200">
                                  <Lucide.Radio className="w-3.5 h-3.5 animate-pulse" />
                                </div>
                              )}
                              {not.type === 'research' && <Lucide.Cpu className="w-4 h-4 text-blue-500" />}
                              {not.type === 'success' && <Lucide.CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                              {not.type === 'info' && <Lucide.Info className="w-4 h-4 text-indigo-500" />}
                              {not.type === 'warning' && <Lucide.AlertCircle className="w-4 h-4 text-amber-500" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <p className={`text-[11px] text-gray-900 ${!not.read ? 'font-bold' : 'font-medium'}`}>{not.title}</p>
                                {not.type === 'signal' && (
                                  <span className="text-[8px] font-mono uppercase px-1 rounded bg-amber-100 text-amber-800 font-bold shrink-0">
                                    Signal
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">{not.description}</p>

                              {not.recipients && not.recipients.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1 text-[8px]">
                                  {not.recipients.map((r, i) => (
                                    <span key={i} className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                                      ✓ {r.includes('@') ? r.split('@')[0] : r.split(' ')[0]}
                                    </span>
                                  ))}
                                </div>
                              )}

                              <span className="text-[8px] text-gray-400 font-mono mt-1 block">
                                {new Date(not.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="px-4 py-1.5 border-t border-gray-50 text-center bg-slate-50/50 flex justify-between gap-2">
                      <button
                        onClick={() => clearNotifications()}
                        className="text-[9px] font-bold text-rose-500 hover:text-rose-700 hover:underline mx-auto"
                      >
                        Clear All Log
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar & Profile Drawer */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowUserDropdown(!showUserDropdown);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-50 transition-colors border border-gray-100 shrink-0 cursor-pointer"
                  title="Profile settings"
                >
                  <div className="h-7 w-7 rounded-full bg-[#091540] text-white flex items-center justify-center font-bold text-xs shadow-inner">
                    {user.displayName ? user.displayName.split(' ').map((n: string) => n[0]).join('') : user.email?.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-gray-600 hidden sm:inline">{user.email}</span>
                  <Lucide.ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {/* User Dropdown */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2.5 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in text-xs font-semibold text-gray-700">
                    <div className="px-4 py-3 border-b border-gray-50 bg-slate-50/50">
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Session Active</p>
                      <p className="font-bold text-[#091540] truncate mt-1">{user.displayName || user.email}</p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded mt-1.5 inline-block uppercase tracking-wider ${userRole === 'admin'
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                        {userRole === 'admin' ? 'Administrator' : 'Team Member'}
                      </span>
                    </div>

                    {userRole === 'admin' && (
                      <button
                        onClick={() => {
                          navigate('users');
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors flex items-center gap-2 cursor-pointer text-gray-700 font-semibold"
                      >
                        <Lucide.Users className="w-4 h-4 text-[#2563FF]" />
                        User Management & Roles
                      </button>
                    )}

                    <button
                      onClick={() => {
                        navigate('settings');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer text-gray-600"
                    >
                      <Lucide.Sliders className="w-4 h-4 text-gray-400" />
                      Configure Engine
                    </button>

                    <button
                      onClick={() => {
                        alert('System is integrated via Google AI Studio context. Credentials locked.');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer text-gray-600"
                    >
                      <Lucide.KeyRound className="w-4 h-4 text-gray-400" />
                      Credentials Panel
                    </button>

                    <div className="border-t border-gray-50 mt-1 pt-1">
                      <button
                        onClick={() => signOutUser()}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors flex items-center gap-2 text-rose-500 cursor-pointer"
                      >
                        <Lucide.LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </header>

          {/* ======================================================== MAIN BODY CANVAS */}
          <main id="iaip-workspace-canvas" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative z-20">
            {/* Simple SPA Router */}
            {isCreatingAccount ? (
              <NewAccountScreen />
            ) : selectedAccountId ? (
              <AccountDetailsScreen />
            ) : (
              <>
                {currentTab === 'dashboard' && <DashboardScreen />}
                {currentTab === 'accounts' && <AccountsScreen />}
                {currentTab === 'research' && <ResearchScreen />}
                {currentTab === 'stakeholders' && <StakeholdersScreen />}
                {currentTab === 'communication' && <CommunicationScreen />}
                {currentTab === 'templates' && <TemplatesScreen />}
                {currentTab === 'users' && (
                  userRole === 'admin' ? (
                    <SettingsScreen initialTab="users" />
                  ) : (
                    <div className="max-w-md mx-auto my-12 p-8 text-center bg-white rounded-2xl border border-gray-200 shadow-sm animate-fade-in">
                      <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
                        <Lucide.ShieldAlert className="w-6 h-6" />
                      </div>
                      <h2 className="text-base font-bold text-[#091540]">Administrator Access Required</h2>
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                        The User Management directory is restricted to Platform Administrators. Please contact an administrator if you require elevated permissions.
                      </p>
                      <button
                        onClick={() => navigate('dashboard')}
                        className="mt-5 px-4 py-2 bg-[#091540] hover:bg-[#132a6e] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Return to Dashboard
                      </button>
                    </div>
                  )
                )}
                {currentTab === 'settings' && <SettingsScreen initialTab="general" />}
              </>
            )}
          </main>

        </div>
      </div>

      {/* ======================================================== MOBILE SIDEBAR OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex lg:hidden animate-fade-in">
          <div className="w-64 bg-[#091540] text-white flex flex-col h-full shadow-2xl relative">

            {/* Close trigger button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute right-4 top-4 p-1 bg-white/10 hover:bg-white/20 text-white rounded-lg cursor-pointer"
              title="Close Navigation"
            >
              <Lucide.X className="w-5 h-5" />
            </button>

            {/* Header Brand */}
            <div className="p-5 border-b border-white/10 flex flex-col">
              <div className="flex flex-col items-start gap-1">
                <img src="/intellify-logo-white.png" alt="Intellify Solutions" className="h-8 w-auto object-contain" />
                <span className="text-[9px] uppercase font-bold tracking-widest text-[#2563FF] mt-0.5">
                  ABM AI Intelligence
                </span>
              </div>
            </div>

            {/* Menu Links */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {menuItems.map((item) => {
                const IconComponent = Lucide[item.icon as keyof typeof Lucide] as React.ComponentType<{ className?: string }>;
                const isActive = currentTab === item.id && !selectedAccountId && !isCreatingAccount;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${isActive
                      ? 'bg-[#2563FF] text-white shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {IconComponent && <IconComponent className="w-4.5 h-4.5" />}
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Footer brand */}
            <div className="p-4 border-t border-white/10 text-center">
              <span className="text-[9px] text-slate-500">© 2026 Intellify Solutions • ABM Intelligence</span>
            </div>
          </div>
        </div>
      )}

      {/* Signals Refresh & Notification Modal */}
      <SignalsRefreshModal
        isOpen={showSignalsModal}
        onClose={() => setShowSignalsModal(false)}
        targetAccountId={signalsModalAccountId}
      />

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
