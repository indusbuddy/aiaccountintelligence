/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import * as Lucide from 'lucide-react';

export const TemplatesScreen: React.FC = () => {
  const { templates } = useApp();
  const [activeCategory, setActiveCategory] = useState<'All' | 'Email' | 'Workshop' | 'Meeting' | 'Prompt'>('All');

  const categories = ['All', 'Email', 'Workshop', 'Meeting', 'Prompt'] as const;

  const displayTemplates = templates.filter(t => {
    if (activeCategory === 'All') return true;
    return t.type === activeCategory;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'Email':
        return <Lucide.Mail className="w-4 h-4 text-blue-600" />;
      case 'Workshop':
        return <Lucide.Presentation className="w-4 h-4 text-purple-600" />;
      case 'Meeting':
        return <Lucide.Users className="w-4 h-4 text-emerald-600" />;
      case 'Prompt':
        return <Lucide.Terminal className="w-4 h-4 text-amber-500" />;
      default:
        return <Lucide.FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'Email':
        return 'bg-blue-50';
      case 'Workshop':
        return 'bg-purple-50';
      case 'Meeting':
        return 'bg-emerald-50';
      case 'Prompt':
        return 'bg-amber-50';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div id="templates-repository-page" className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="border-b border-gray-100 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-[#091540] sm:text-3xl">System Blueprints & Prompt Templates</h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Manage prompt frameworks, default workshop flow layouts, and sales outreach standards.
        </p>
      </div>

      {/* Categories filter tabs */}
      <div className="flex border-b border-gray-100">
        {categories.map((cat) => {
          const count = cat === 'All' ? templates.length : templates.filter(t => t.type === cat).length;
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`py-3 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'border-[#091540] text-[#091540]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {cat === 'All' ? 'All Frameworks' : `${cat} Blueprints`}
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                isActive ? 'bg-[#091540] text-white' : 'bg-slate-100 text-gray-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid displays */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayTemplates.map((tpl) => (
          <div
            key={tpl.id}
            className="p-5 bg-white border border-gray-100 rounded-xl shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start gap-4">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-transparent ${getBg(tpl.type)}`}>
                  {getIcon(tpl.type)}
                  <span className="text-gray-700">{tpl.type} Framework</span>
                </span>
                <span className="text-[10px] font-mono text-gray-400 font-bold uppercase">System Default</span>
              </div>

              <h4 className="text-sm font-bold text-gray-900 mt-4 leading-snug">
                {tpl.name}
              </h4>
              
              <p className="text-xs text-gray-400 mt-1 leading-normal font-medium">
                {tpl.description}
              </p>

              {/* Collapsible/Preview Box */}
              <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-lg max-h-40 overflow-y-auto">
                <pre className="text-[11px] font-mono font-semibold text-gray-500 whitespace-pre-wrap leading-relaxed">
                  {tpl.content}
                </pre>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 pt-4 border-t border-gray-50 flex justify-end gap-2.5">
              <button
                onClick={() => alert('Custom templates editing is locked during this UI sprint.')}
                className="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-slate-50 border border-gray-200 rounded-lg cursor-pointer transition-colors"
              >
                Edit Framework
              </button>
              <button
                onClick={() => alert('Variables compiled successfully')}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#091540] hover:bg-[#1a2d7c] rounded-lg cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Lucide.FileCode className="w-3.5 h-3.5" />
                Test Variables
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
