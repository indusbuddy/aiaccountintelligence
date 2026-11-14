/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Account } from '../types';
import * as Lucide from 'lucide-react';

interface ShareAccountModalProps {
  account: Account | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareAccountModal: React.FC<ShareAccountModalProps> = ({ account, isOpen, onClose }) => {
  const { allowedUsersList, shareAccount, user } = useApp();
  const [selectedEmails, setSelectedEmails] = useState<string[]>(
    account?.sharedWith && Array.isArray(account.sharedWith) ? [...account.sharedWith] : []
  );
  const [customEmail, setCustomEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Sync if account changes
  React.useEffect(() => {
    if (account?.sharedWith && Array.isArray(account.sharedWith)) {
      setSelectedEmails([...account.sharedWith]);
    } else {
      setSelectedEmails([]);
    }
  }, [account]);

  if (!isOpen || !account) return null;

  const currentSharedList: string[] = Array.from(new Set(selectedEmails.map(e => e.toLowerCase().trim()).filter(Boolean)));

  const handleAddEmail = (emailToAdd: string) => {
    const clean = emailToAdd.toLowerCase().trim();
    if (!clean || !clean.includes('@')) {
      setFeedback({ text: 'Please enter a valid email address.', type: 'error' });
      return;
    }
    if (clean === 'mahesh@intellifysolutions.com' || clean === 'srini@intellifysolutions.com') {
      setFeedback({ text: `${clean} already has universal access to all accounts.`, type: 'success' });
      setCustomEmail('');
      return;
    }
    if (currentSharedList.includes(clean)) {
      setFeedback({ text: 'This user already has access.', type: 'error' });
      return;
    }

    setSelectedEmails(prev => [...prev, clean]);
    setCustomEmail('');
    setFeedback(null);
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setSelectedEmails(prev => prev.filter(e => e.toLowerCase().trim() !== emailToRemove.toLowerCase().trim()));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const ok = await shareAccount(account.id, currentSharedList);
      if (ok) {
        setFeedback({ text: 'Account sharing settings updated successfully!', type: 'success' });
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setFeedback({ text: 'Failed to update sharing settings. Please try again.', type: 'error' });
      }
    } catch {
      setFeedback({ text: 'An unexpected error occurred.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Team members who can be added
  const availableTeamMembers = allowedUsersList.filter(u => {
    const email = u.email.toLowerCase();
    // Exclude executives who already see all accounts, the account creator, and already shared members
    if (email === 'mahesh@intellifysolutions.com' || email === 'srini@intellifysolutions.com' || email === 'mpbalshetwar@gmail.com') return false;
    if (account.createdByEmail && email === account.createdByEmail.toLowerCase()) return false;
    return !currentSharedList.includes(email);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-150 overflow-hidden animate-scale-in">
        
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-[#091540] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 text-[#2563FF] rounded-xl border border-white/10">
              <Lucide.Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Share Target Account</span>
                <span className="text-[10px] bg-white/10 text-slate-300 font-mono px-2 py-0.5 rounded">
                  Cloud SQL
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 truncate font-medium max-w-xs">{account.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <Lucide.X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Feedback Toast */}
          {feedback && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              feedback.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {feedback.type === 'success' ? (
                <Lucide.CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Lucide.AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Universal Executive Access Notice */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-150 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#091540]">
              <Lucide.ShieldCheck className="w-4 h-4 text-[#2563FF]" />
              <span>Universal Organization Visibility</span>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              By company policy, all accounts in the database are visible to{' '}
              <strong className="text-[#091540]">mahesh@intellifysolutions.com</strong> and{' '}
              <strong className="text-[#091540]">srini@intellifysolutions.com</strong>, as well as platform administrators.
            </p>
          </div>

          {/* Quick Select from Allowed Team Members */}
          {availableTeamMembers.length > 0 && (
            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block mb-2">
                Quick Add Team Member
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableTeamMembers.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => handleAddEmail(member.email)}
                    className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-blue-50 hover:text-[#2563FF] border border-gray-200 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Lucide.Plus className="w-3 h-3" />
                    <span>{member.name || member.email.split('@')[0]}</span>
                    <span className="text-[10px] text-gray-400 font-mono">({member.email.split('@')[0]})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Email Input */}
          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block mb-1.5">
              Add Collaborator by Email
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Lucide.Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  placeholder="colleague@intellifysolutions.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddEmail(customEmail);
                    }
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-hidden font-mono text-gray-800"
                />
              </div>
              <button
                type="button"
                onClick={() => handleAddEmail(customEmail)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer border border-gray-200"
              >
                Add
              </button>
            </div>
          </div>

          {/* Currently Shared Collaborators List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                Shared With ({currentSharedList.length})
              </label>
              {currentSharedList.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedEmails([])}
                  className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  Make Private
                </button>
              )}
            </div>

            <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded-xl bg-slate-50/40">
              {currentSharedList.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-400">
                  <Lucide.Lock className="w-5 h-5 mx-auto mb-1 text-gray-300" />
                  <span>Not shared with other individual team members yet.</span>
                </div>
              ) : (
                currentSharedList.map((email) => (
                  <div key={email} className="p-3 flex items-center justify-between gap-3 text-xs bg-white">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563FF] font-bold flex items-center justify-center text-xs shrink-0 border border-blue-100">
                        {email[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="font-mono text-gray-800 font-bold block truncate">{email}</span>
                        <span className="text-[10px] text-gray-400">Collaborator (View & Co-research)</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(email)}
                      className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                      title="Remove access"
                    >
                      <Lucide.Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[10px] text-gray-400">
            Real-time synchronization across Cloud SQL
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-white rounded-xl border border-gray-200 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 bg-[#091540] hover:bg-[#15276e] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <Lucide.Loader2 className="w-3.5 h-3.5 animate-spin text-[#2563FF]" />
              ) : (
                <Lucide.Check className="w-3.5 h-3.5" />
              )}
              <span>Save Sharing Access</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
