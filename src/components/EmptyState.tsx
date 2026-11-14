/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import * as Lucide from 'lucide-react';

interface EmptyStateProps {
  id: string;
  title: string;
  description: string;
  iconName: keyof typeof Lucide;
  action?: {
    label: string;
    onClick: () => void;
    icon?: keyof typeof Lucide;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  id,
  title,
  description,
  iconName,
  action
}) => {
  const IconComponent = Lucide[iconName] as React.ComponentType<{ className?: string }>;
  const ActionIcon = action?.icon ? (Lucide[action.icon] as React.ComponentType<{ className?: string }>) : null;

  return (
    <div
      id={id}
      className="flex flex-col items-center justify-center text-center p-8 border border-gray-100 rounded-2xl bg-white shadow-sm max-w-lg mx-auto"
    >
      <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-4">
        {IconComponent && <IconComponent className="w-8 h-8" />}
      </div>
      
      <h3 className="text-base font-bold text-[#091540]">{title}</h3>
      
      <p className="mt-2 text-xs text-gray-400 max-w-sm leading-relaxed">
        {description}
      </p>

      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#091540] hover:bg-[#15276e] rounded-lg transition-all duration-200 shadow-sm"
        >
          {ActionIcon && <ActionIcon className="w-3.5 h-3.5" />}
          {action.label}
        </button>
      )}
    </div>
  );
};
