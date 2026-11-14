/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from './StatusBadge';
import * as Lucide from 'lucide-react';

export const StakeholdersScreen: React.FC = () => {
  const { stakeholders, accounts, navigate } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');

  const filteredStakeholders = stakeholders.filter(stk => {
    const acc = accounts.find(a => a.id === stk.accountId);
    const companyName = acc ? acc.name : '';

    const matchesSearch = stk.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          stk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          companyName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDept = deptFilter === 'All' || stk.department === deptFilter;
    const matchesRole = roleFilter === 'All' || stk.role === roleFilter;

    return matchesSearch && matchesDept && matchesRole;
  });

  const getAccountName = (accountId: string) => {
    const acc = accounts.find(a => a.id === accountId);
    return acc ? acc.name : 'Unknown';
  };

  const departments = ['All', ...Array.from(new Set(stakeholders.map(s => s.department)))];
  const roles = ['All', ...Array.from(new Set(stakeholders.map(s => s.role)))];

  return (
    <div id="stakeholder-master-directory" className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="border-b border-gray-100 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-[#091540] sm:text-3xl">Key Stakeholders Master Directory</h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Consolidated buying center directory. Review decision makers, influencers, and coaches across all registered accounts.
        </p>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-3.5">
        {/* Search */}
        <div className="relative md:col-span-6">
          <Lucide.Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search contact name, job title, account name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-hidden font-medium text-gray-800"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2 text-gray-400 hover:text-gray-600">
              <Lucide.X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dept Filter */}
        <div className="md:col-span-3">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-hidden font-semibold text-gray-600"
          >
            <option value="All">All Departments</option>
            {departments.filter(d => d !== 'All').map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Role Filter */}
        <div className="md:col-span-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-hidden font-semibold text-gray-600"
          >
            <option value="All">All Buying Center Roles</option>
            {roles.filter(r => r !== 'All').map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Directory Table */}
      {filteredStakeholders.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl">
          <Lucide.Users className="w-10 h-10 text-gray-300 mx-auto mb-2 animate-pulse" />
          <p className="text-xs font-bold text-gray-700">No contacts found</p>
          <p className="text-[10px] text-gray-400 mt-1">Adjust search parameters or select an account to add contacts.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4.5">Stakeholder</th>
                  <th className="px-6 py-4.5">Target Account</th>
                  <th className="px-6 py-4.5">Department</th>
                  <th className="px-6 py-4.5">LinkedIn</th>
                  <th className="px-6 py-4.5 text-center">Buying Center Role</th>
                  <th className="px-6 py-4.5 text-center">Influence</th>
                  <th className="px-6 py-4.5 text-center">Reach Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-700">
                {filteredStakeholders.map((stk) => (
                  <tr key={stk.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Name + Title */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8.5 w-8.5 rounded-full bg-slate-50 border border-gray-200 flex items-center justify-center font-bold text-[#091540] uppercase">
                          {stk.name.slice(0, 2)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{stk.name}</h4>
                          <p className="text-[10px] text-gray-400 font-medium mt-0.5">{stk.title}</p>
                        </div>
                      </div>
                    </td>

                    {/* Associated Account */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate('accounts', stk.accountId, 'stakeholders')}
                        className="text-[#2563FF] hover:text-[#0b43dd] hover:underline cursor-pointer font-bold inline-flex items-center gap-1.5"
                      >
                        <Lucide.Building className="w-3.5 h-3.5" />
                        {getAccountName(stk.accountId)}
                      </button>
                    </td>

                    {/* Department */}
                    <td className="px-6 py-4 text-gray-500">
                      {stk.department}
                    </td>

                    {/* LinkedIn */}
                    <td className="px-6 py-4">
                      <a
                        href={stk.linkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 font-medium hover:underline"
                      >
                        <Lucide.Linkedin className="w-3.5 h-3.5" />
                        <span>Profile</span>
                      </a>
                    </td>

                    {/* Buying Center Role */}
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 text-gray-600 border border-slate-100">
                        {stk.role}
                      </span>
                    </td>

                    {/* Influence level */}
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        stk.influence === 'High' 
                          ? 'text-rose-700 bg-rose-50' 
                          : stk.influence === 'Medium' 
                          ? 'text-amber-700 bg-amber-50' 
                          : 'text-slate-600 bg-slate-100'
                      }`}>
                        {stk.influence}
                      </span>
                    </td>

                    {/* Contact status */}
                    <td className="px-6 py-4 text-center">
                      <StatusBadge id={`dir-stk-status-${stk.id}`} type="stakeholder" value={stk.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
