/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PriorityType, ResearchDepthType } from '../types';
import * as Lucide from 'lucide-react';

export const NewAccountScreen: React.FC = () => {
  const { addAccount, triggerResearch, navigate } = useApp();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    industry: 'Technology & Cloud',
    country: 'United States',
    region: 'North America',
    priority: 'Medium' as PriorityType,
    owner: 'Sarah Jenkins (Enterprise Sales Director)',
    researchDepth: 'Deep' as ResearchDepthType,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Company Name is required';
    if (!formData.website.trim()) {
      newErrors.website = 'Website URL is required';
    } else if (!/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(formData.website.trim())) {
      newErrors.website = 'Enter a valid URL (e.g. https://company.com)';
    }
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.owner.trim()) newErrors.owner = 'Account Owner is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (startResearchImmediately: boolean) => {
    if (!validateForm()) return;

    // Standardize URL prefix
    let formattedWebsite = formData.website.trim();
    if (!/^https?:\/\//i.test(formattedWebsite)) {
      formattedWebsite = `https://${formattedWebsite}`;
    }

    const accountData = {
      name: formData.name.trim(),
      website: formattedWebsite,
      industry: formData.industry,
      country: formData.country.trim(),
      region: formData.region,
      priority: formData.priority,
      owner: formData.owner.trim(),
      researchDepth: formData.researchDepth,
    };

    const newId = addAccount(accountData);

    const fullAccount = {
      ...accountData,
      id: newId,
      lastUpdated: new Date().toISOString(),
      researchStatus: (startResearchImmediately ? 'In Progress' : 'Not Started') as any,
      opportunityScore: 0,
    };

    if (startResearchImmediately) {
      triggerResearch(newId, formData.researchDepth, fullAccount);
      navigate('accounts', newId, 'research'); // Jump to the active research console!
    } else {
      navigate('accounts'); // Return to accounts index
    }
  };

  const industriesList = [
    'Technology & Cloud',
    'Consumer Goods & Retail',
    'Pharmaceuticals & Biotech',
    'Semiconductors & Hardware',
    'Automotive & Energy',
    'Financial Services & Banking',
    'Industrial Manufacturing',
    'Healthcare Services',
    'Telecommunications',
    'Media & Entertainment'
  ];

  return (
    <div id="new-account-screen-root" className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
        <button
          onClick={() => navigate('accounts')}
          className="p-1.5 hover:bg-slate-50 text-gray-400 hover:text-gray-900 border border-gray-150 rounded-lg transition-colors cursor-pointer"
          title="Back to Target list"
        >
          <Lucide.ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#091540] sm:text-2xl">Register Target Company</h1>
          <p className="text-xs text-gray-500 mt-1">
            Log firmographic details and select AI agent depths to initiate automated co-innovation briefs.
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Company Name */}
          <div className="col-span-2 sm:col-span-1">
            <label className="text-[11px] uppercase font-bold tracking-wider text-gray-400 block mb-1.5">
              Company Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Acme Corporation"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full px-3.5 py-2 text-xs border rounded-lg focus:ring-1 focus:ring-blue-500 outline-hidden font-medium text-gray-800 ${errors.name ? 'border-rose-300 bg-rose-50/20' : 'border-gray-200'
                }`}
            />
            {errors.name && <p className="text-[10px] text-rose-500 mt-1 font-semibold">{errors.name}</p>}
          </div>

          {/* Website */}
          <div className="col-span-2 sm:col-span-1">
            <label className="text-[11px] uppercase font-bold tracking-wider text-gray-400 block mb-1.5">
              Website URL <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. acme.com"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              className={`w-full px-3.5 py-2 text-xs border rounded-lg focus:ring-1 focus:ring-blue-500 outline-hidden font-medium text-gray-800 ${errors.website ? 'border-rose-300 bg-rose-50/20' : 'border-gray-200'
                }`}
            />
            {errors.website && <p className="text-[10px] text-rose-500 mt-1 font-semibold">{errors.website}</p>}
          </div>

          {/* Industry Selection */}
          <div className="col-span-2 sm:col-span-1">
            <label className="text-[11px] uppercase font-bold tracking-wider text-gray-400 block mb-1.5">
              Industry Segment <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.industry}
              onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
              className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-hidden font-semibold text-gray-700"
            >
              {industriesList.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          {/* Account Owner */}
          <div className="col-span-2 sm:col-span-1">
            <label className="text-[11px] uppercase font-bold tracking-wider text-gray-400 block mb-1.5">
              Account Owner <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Sarah Jenkins"
              value={formData.owner}
              onChange={(e) => setFormData(prev => ({ ...prev, owner: e.target.value }))}
              className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-hidden font-medium text-gray-800"
            />
          </div>

          {/* Country */}
          <div className="col-span-2 sm:col-span-1">
            <label className="text-[11px] uppercase font-bold tracking-wider text-gray-400 block mb-1.5">
              Country Location <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. United States"
              value={formData.country}
              onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
              className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-hidden font-medium text-gray-800"
            />
          </div>

          {/* Region */}
          <div className="col-span-2 sm:col-span-1">
            <label className="text-[11px] uppercase font-bold tracking-wider text-gray-400 block mb-1.5">
              Geographic Region
            </label>
            <select
              value={formData.region}
              onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
              className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-hidden font-semibold text-gray-700"
            >
              <option value="North America">North America (NA)</option>
              <option value="EMEA">Europe, Middle East & Africa (EMEA)</option>
              <option value="APAC">Asia-Pacific (APAC)</option>
              <option value="LATAM">Latin America (LATAM)</option>
            </select>
          </div>

          {/* Priority */}
          <div className="col-span-2">
            <label className="text-[11px] uppercase font-bold tracking-wider text-gray-400 block mb-1.5">
              Account Urgency / Priority
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['Low', 'Medium', 'High'] as PriorityType[]).map((prio) => (
                <button
                  key={prio}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority: prio }))}
                  className={`py-2 px-4 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer ${formData.priority === prio
                    ? prio === 'High'
                      ? 'bg-rose-50 border-rose-200 text-rose-700 font-extrabold ring-1 ring-rose-300'
                      : prio === 'Medium'
                        ? 'bg-amber-50 border-amber-200 text-amber-700 font-extrabold ring-1 ring-amber-300'
                        : 'bg-slate-50 border-slate-200 text-slate-700 font-extrabold ring-1 ring-slate-300'
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-slate-50'
                    }`}
                >
                  {prio}
                </button>
              ))}
            </div>
          </div>

          {/* Research Depth */}
          <div className="col-span-2 pt-4 border-t border-gray-100">
            <label className="text-[11px] uppercase font-bold tracking-wider text-gray-400 block mb-2">
              Default AI Research Depth
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['Basic', 'Standard', 'Deep'] as ResearchDepthType[]).map((depth) => (
                <button
                  key={depth}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, researchDepth: depth }))}
                  className={`p-3.5 text-left rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-28 ${formData.researchDepth === depth
                    ? 'border-[#2563FF] bg-blue-50/20 text-[#091540] ring-1 ring-blue-300'
                    : 'border-gray-200 bg-white text-gray-500 hover:bg-slate-50'
                    }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${formData.researchDepth === depth ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                      {depth}
                    </span>
                    {formData.researchDepth === depth && <Lucide.CheckCircle2 className="w-4.5 h-4.5 text-[#2563FF]" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold mt-2 text-gray-900">
                      {depth === 'Basic' && 'Firmographics & News'}
                      {depth === 'Standard' && 'Technology & priorities'}
                      {depth === 'Deep' && 'Full ABM Alignment'}
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-snug line-clamp-1">
                      {depth === 'Basic' && 'Quick overview and metrics.'}
                      {depth === 'Standard' && 'Maps systems and buying signals.'}
                      {depth === 'Deep' && 'Bespoke co-innovation briefs.'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('accounts')}
            className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-slate-50 rounded-lg border border-gray-200 transition-colors order-2 sm:order-1 cursor-pointer"
          >
            Cancel & Return
          </button>

          <div className="flex flex-col sm:flex-row gap-3 order-1 sm:order-2">
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="px-4 py-2 text-xs font-semibold text-[#091540] bg-[#091540]/5 hover:bg-[#091540]/10 rounded-lg transition-colors cursor-pointer"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="px-5 py-2 text-xs font-bold text-white bg-[#091540] hover:bg-[#15276e] rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lucide.Cpu className="w-3.5 h-3.5" />
              Save & Start Research
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
