'use client';

import React, { useState } from 'react';
import { ArrowLeftRight, Check, X, FileText, ExternalLink } from 'lucide-react';

interface ChangeItem {
  fieldKey: string;
  changeType: string;
  oldValue: string | null;
  newValue: string | null;
  confidence: number;
  evidence: any;
  verificationStatus: string;
}

export default function DiffViewer({
  amendmentNumber,
  tenderNumber,
  changes,
}: {
  amendmentNumber: string;
  tenderNumber: string;
  changes: ChangeItem[];
}) {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'unified'>('side-by-side');

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header Bar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Document Version Comparison: {amendmentNumber}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Comparing against base tender notice for <span className="font-semibold text-slate-700">{tenderNumber}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              viewMode === 'side-by-side'
                ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
            }`}
          >
            Side-by-Side
          </button>
          <button
            onClick={() => setViewMode('unified')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              viewMode === 'unified'
                ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
            }`}
          >
            Unified List
          </button>
        </div>
      </div>

      {/* Changes Comparison Content */}
      <div className="p-6 space-y-6">
        {changes.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No structured field modifications extracted for this version.
          </div>
        ) : viewMode === 'side-by-side' ? (
          <div className="space-y-4">
            {changes.map((item, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-slate-100/70 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 font-mono">{item.fieldKey}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">
                      Confidence: {(Number(item.confidence || 0) * 100).toFixed(0)}%
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-semibold text-[10px] uppercase ${
                        item.verificationStatus === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.verificationStatus}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 text-xs font-mono">
                  {/* Previous State */}
                  <div className="p-4 bg-rose-50/30">
                    <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block mb-1">
                      Original / Baseline Notice
                    </span>
                    <p className="text-rose-900 bg-rose-100/60 p-2.5 rounded border border-rose-200/80 leading-relaxed">
                      {item.oldValue || '— None / Not Specified —'}
                    </p>
                  </div>

                  {/* Revised State */}
                  <div className="p-4 bg-emerald-50/30">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                      Corrigendum Revised State
                    </span>
                    <p className="text-emerald-900 bg-emerald-100/60 p-2.5 rounded border border-emerald-200/80 font-bold leading-relaxed">
                      {item.newValue}
                    </p>
                  </div>
                </div>

                {/* Evidence Excerpt */}
                {item.evidence && item.evidence.excerpt && (
                  <div className="bg-slate-50 p-3 border-t border-slate-200 text-xs">
                    <span className="font-semibold text-slate-500 block mb-0.5">Source Evidence Citation:</span>
                    <p className="italic text-slate-700 bg-white p-2 rounded border border-slate-200">
                      &ldquo;{item.evidence.excerpt}&rdquo;
                      {item.evidence.pageNumber && (
                        <span className="ml-2 font-bold not-italic text-primary-600">
                          [Page {item.evidence.pageNumber}]
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {changes.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 font-mono">{item.fieldKey}</span>
                  <span className="font-semibold text-emerald-700">{item.verificationStatus}</span>
                </div>
                <div className="space-y-1 font-mono">
                  <div className="text-rose-700 line-through bg-rose-50 p-2 rounded border border-rose-200">
                    - {item.oldValue || 'None'}
                  </div>
                  <div className="text-emerald-700 font-bold bg-emerald-50 p-2 rounded border border-emerald-200">
                    + {item.newValue}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

