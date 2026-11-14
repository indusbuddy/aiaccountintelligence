/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Cpu } from 'lucide-react';

interface TechnologyBadgeProps {
  id: string;
  name: string;
}

export const TechnologyBadge: React.FC<TechnologyBadgeProps> = ({
  id,
  name
}) => {
  // Try to find a specific color scheme based on known technologies
  const getTechStyle = (tech: string) => {
    const t = tech.toLowerCase();
    if (t.includes('azure') || t.includes('microsoft')) return 'bg-sky-50 text-sky-800 border-sky-100';
    if (t.includes('aws') || t.includes('amazon')) return 'bg-amber-50 text-amber-800 border-amber-200';
    if (t.includes('salesforce')) return 'bg-blue-50 text-blue-800 border-blue-100';
    if (t.includes('openai') || t.includes('copilot') || t.includes('ai') || t.includes('llm')) return 'bg-purple-50 text-purple-800 border-purple-100';
    if (t.includes('snowflake') || t.includes('data')) return 'bg-cyan-50 text-cyan-800 border-cyan-100';
    if (t.includes('sap') || t.includes('oracle')) return 'bg-red-50 text-red-800 border-red-100';
    return 'bg-gray-50 text-gray-700 border-gray-150';
  };

  return (
    <span
      id={id}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-medium border transition-colors ${getTechStyle(name)}`}
    >
      <Cpu className="w-3.5 h-3.5 opacity-70" />
      {name}
    </span>
  );
};
