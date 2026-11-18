'use client';

import React from 'react';
import { Calendar, CheckCircle2, Clock, FileText, AlertCircle, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  amendmentNumber?: string;
  date: string;
  status: string;
  amendmentType?: string;
  changes?: any[];
  details?: any;
}

export default function Timeline({ events }: { events: TimelineEvent[] }) {
  if (!events || events.length === 0) {
    return <div className="p-8 text-center text-slate-500">No events found in timeline.</div>;
  }

  return (
    <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-8 my-6">
      {events.map((event, idx) => {
        const isInitial = event.type === 'INITIAL_NOTICE';
        const isApproved = event.status === 'APPROVED';
        const isNeedsReview = event.status === 'NEEDS_REVIEW';

        return (
          <div key={event.id} className="relative group">
            {/* Timeline Marker Icon */}
            <div
              className={`absolute -left-[35px] top-1 w-8 h-8 rounded-full border-2 flex items-center justify-center bg-white shadow-sm transition-transform group-hover:scale-110 ${
                isInitial
                  ? 'border-blue-600 text-blue-600'
                  : isApproved
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-amber-500 text-amber-500'
              }`}
            >
              {isInitial ? (
                <FileText className="w-4 h-4" />
              ) : isApproved ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
            </div>

            {/* Event Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-base">
                    {event.amendmentNumber || 'Initial Publication'}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                      isInitial
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : isApproved
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {event.status}
                  </span>
                  {event.amendmentType && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
                      {event.amendmentType.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  {event.date ? format(new Date(event.date), 'dd MMM yyyy, HH:mm') : 'Date Unknown'}
                </div>
              </div>

              <p className="text-sm text-slate-700 font-medium mb-3">{event.title}</p>

              {/* Initial Notice Details */}
              {isInitial && event.details && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg text-xs border border-slate-100">
                  <div>
                    <span className="text-slate-500 block">Initial Submission Deadline:</span>
                    <span className="font-semibold text-slate-800">
                      {event.details.initialDeadline
                        ? format(new Date(event.details.initialDeadline), 'dd MMM yyyy, HH:mm')
                        : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Estimated Tender Value:</span>
                    <span className="font-semibold text-slate-800">
                      {event.details.currency} {Number(event.details.estimatedValue || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Corrigendum Changes Delta List */}
              {event.changes && event.changes.length > 0 && (
                <div className="space-y-2 mt-3 pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                    Detected Modifications ({event.changes.length})
                  </span>
                  {event.changes.map((change: any, cIdx: number) => (
                    <div
                      key={cIdx}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800 font-mono">
                          {change.fieldKey}
                        </span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded font-medium">
                          Confidence: {(Number(change.confidence || 0) * 100).toFixed(0)}%
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded line-through">
                          {change.oldValue || 'None'}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-semibold">
                          {change.newValue}
                        </span>
                      </div>

                      {change.evidenceJson && change.evidenceJson.excerpt && (
                        <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded border border-slate-200 mt-1">
                          &ldquo;{change.evidenceJson.excerpt}&rdquo;
                          {change.evidenceJson.pageNumber && (
                            <span className="font-semibold not-italic text-slate-400 ml-1">
                              (Page {change.evidenceJson.pageNumber})
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

