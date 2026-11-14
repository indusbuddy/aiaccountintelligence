/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LoadingStateProps {
  id: string;
  type?: 'card' | 'table' | 'dashboard' | 'detail';
  count?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  id,
  type = 'card',
  count = 3
}) => {
  const renderCardSkeleton = (idx: number) => (
    <div key={idx} className="p-6 border border-gray-100 rounded-xl bg-white shadow-sm space-y-4 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="h-4 bg-slate-100 rounded w-1/3" />
        <div className="h-8 w-8 bg-slate-100 rounded-lg" />
      </div>
      <div className="h-6 bg-slate-100 rounded w-1/2" />
      <div className="space-y-2 pt-2">
        <div className="h-3 bg-slate-100 rounded w-full" />
        <div className="h-3 bg-slate-100 rounded w-5/6" />
      </div>
    </div>
  );

  const renderTableSkeleton = () => (
    <div className="border border-gray-100 rounded-xl bg-white overflow-hidden shadow-sm animate-pulse">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex gap-4">
        <div className="h-4 bg-slate-200 rounded w-1/12" />
        <div className="h-4 bg-slate-200 rounded w-2/12" />
        <div className="h-4 bg-slate-200 rounded w-2/12" />
        <div className="h-4 bg-slate-200 rounded w-2/12" />
        <div className="h-4 bg-slate-200 rounded w-2/12" />
        <div className="h-4 bg-slate-200 rounded w-1/12" />
        <div className="h-4 bg-slate-200 rounded w-2/12" />
      </div>
      <div className="divide-y divide-gray-100 p-6 space-y-4">
        {[...Array(5)].map((_, idx) => (
          <div key={idx} className="flex gap-4 pt-2">
            <div className="h-3 bg-slate-100 rounded w-1/12" />
            <div className="h-3 bg-slate-100 rounded w-2/12" />
            <div className="h-3 bg-slate-100 rounded w-2/12" />
            <div className="h-3 bg-slate-100 rounded w-2/12" />
            <div className="h-3 bg-slate-100 rounded w-2/12" />
            <div className="h-3 bg-slate-100 rounded w-1/12" />
            <div className="h-3 bg-slate-100 rounded w-2/12" />
          </div>
        ))}
      </div>
    </div>
  );

  const renderDashboardSkeleton = () => (
    <div className="space-y-6">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, idx) => (
          <div key={idx} className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm flex items-center justify-between animate-pulse">
            <div className="space-y-2 flex-1">
              <div className="h-3 bg-slate-100 rounded w-1/2" />
              <div className="h-5 bg-slate-100 rounded w-1/3" />
            </div>
            <div className="h-10 w-10 bg-slate-100 rounded-full" />
          </div>
        ))}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 border border-gray-100 rounded-xl bg-white shadow-sm space-y-4 animate-pulse">
          <div className="h-4 bg-slate-100 rounded w-1/4" />
          <div className="h-48 bg-slate-50 rounded-lg w-full" />
        </div>
        <div className="p-6 border border-gray-100 rounded-xl bg-white shadow-sm space-y-4 animate-pulse">
          <div className="h-4 bg-slate-100 rounded w-1/3" />
          <div className="h-48 bg-slate-50 rounded-full w-48 mx-auto" />
        </div>
      </div>
    </div>
  );

  const renderDetailSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div className="space-y-2">
          <div className="h-6 bg-slate-200 rounded w-48" />
          <div className="h-3 bg-slate-100 rounded w-32" />
        </div>
        <div className="h-10 bg-slate-200 rounded-lg w-36" />
      </div>
      <div className="h-10 bg-slate-50 rounded-lg w-full flex gap-2 p-1">
        {[...Array(5)].map((_, idx) => (
          <div key={idx} className="h-full bg-slate-200 rounded flex-1" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 p-6 border border-gray-100 rounded-xl bg-white shadow-sm space-y-4">
          <div className="h-4 bg-slate-200 rounded w-1/2" />
          <div className="space-y-2">
            <div className="h-3 bg-slate-100 rounded w-full" />
            <div className="h-3 bg-slate-100 rounded w-5/6" />
          </div>
        </div>
        <div className="lg:col-span-2 p-6 border border-gray-100 rounded-xl bg-white shadow-sm space-y-4">
          <div className="h-4 bg-slate-200 rounded w-1/3" />
          <div className="h-32 bg-slate-50 rounded-lg w-full" />
        </div>
      </div>
    </div>
  );

  return (
    <div id={id} className="w-full">
      {type === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(count)].map((_, idx) => renderCardSkeleton(idx))}
        </div>
      )}
      {type === 'table' && renderTableSkeleton()}
      {type === 'dashboard' && renderDashboardSkeleton()}
      {type === 'detail' && renderDetailSkeleton()}
    </div>
  );
};
