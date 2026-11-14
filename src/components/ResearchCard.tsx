/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import * as Lucide from 'lucide-react';

interface ResearchCardProps {
  id: string;
  title: string;
  iconName: keyof typeof Lucide;
  isAvailable: boolean;
  onTriggerResearch?: () => void;
  isTriggering?: boolean;
  children: React.ReactNode;
}

export const ResearchCard: React.FC<ResearchCardProps> = ({
  id,
  title,
  iconName,
  isAvailable,
  onTriggerResearch,
  isTriggering = false,
  children
}) => {
  const IconComponent = Lucide[iconName] as React.ComponentType<{ className?: string }>;

  return (
    <div
      id={id}
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full"
    >
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50 bg-gray-50/50">
        <div className="p-1.5 rounded-lg bg-[#091540]/5 text-[#091540]">
          {IconComponent && <IconComponent className="w-4 h-4" />}
        </div>
        <h4 className="text-sm font-bold text-[#091540]">{title}</h4>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-center">
        {isAvailable ? (
          children
        ) : (
          <div className="text-center py-6 flex flex-col items-center justify-center h-full">
            <div className="p-3 bg-slate-50 rounded-full text-slate-300">
              <Lucide.SearchCode className="w-8 h-8" />
            </div>
            <p className="mt-3 text-sm font-semibold text-gray-700">No research available.</p>
            <p className="mt-1 text-xs text-gray-400 max-w-xs text-center leading-relaxed">
              Trigger the AI research agent to map this account's corporate structures and strategic directives.
            </p>
            {onTriggerResearch && (
              <button
                onClick={onTriggerResearch}
                disabled={isTriggering}
                className="mt-4 px-4 py-1.5 text-xs font-semibold text-white bg-[#091540] hover:bg-[#1a2d7c] rounded-lg transition-all duration-200 flex items-center shadow-sm disabled:opacity-50"
              >
                {isTriggering ? (
                  <>
                    <Lucide.Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Analyzing Account...
                  </>
                ) : (
                  <>
                    <Lucide.Cpu className="w-3.5 h-3.5 mr-1.5" />
                    Start Research
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
