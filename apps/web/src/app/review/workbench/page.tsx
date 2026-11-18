'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, FileText, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import DiffViewer from '@/components/DiffViewer';

export default function ReviewWorkbenchPage() {
  const [decisionNotes, setDecisionNotes] = useState('');
  const [isApproved, setIsApproved] = useState(false);
  const [isRejected, setIsRejected] = useState(false);

  const pendingAmendment = {
    id: 'corr-03-pending',
    tenderNumber: 'DEMO/PWD/2026/001',
    tenderTitle: 'Demonstration road maintenance and widening works - Sector 4 to 8 Corridor',
    amendmentNumber: 'Corrigendum 03',
    amendmentType: 'TECHNICAL_SPECIFICATION',
    publicationDate: '19 Nov 2026',
    sourceUrl: 'https://eprocure.demo.gov.in/notice/DEMO-PWD-2026-001/corr3',
    extractedChanges: [
      {
        fieldKey: 'bituminousAsphaltGrade',
        changeType: 'MODIFIED',
        oldValue: 'Viscosity Grade VG-30 bitumen',
        newValue: 'Viscosity Grade VG-40 modified bitumen conforming to IS 73:2013',
        confidence: 0.91,
        evidence: {
          pageNumber: 3,
          excerpt:
            'All wearing courses shall strictly deploy VG-40 paving grade bitumen in lieu of VG-30 specified earlier.',
        },
        verificationStatus: 'PENDING',
      },
    ],
  };

  const handleApprove = () => {
    setIsApproved(true);
  };

  const handleReject = () => {
    setIsRejected(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Human-in-the-Loop Review Workbench
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Verify automated document diffs and machine extractions before public dissemination.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            1 Corrigendum Awaiting Review
          </span>
        </div>
      </div>

      {isApproved ? (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
            <Check className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-emerald-900">
            Corrigendum 03 Approved & Published!
          </h2>
          <p className="text-xs text-emerald-700 max-w-lg mx-auto">
            TenderVersion 4 has been created atomically. In-app notifications have been queued for all 864 contractors following tender <strong>{pendingAmendment.tenderNumber}</strong>.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setIsApproved(false)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold"
            >
              Reset Workbench Demo
            </button>
          </div>
        </div>
      ) : isRejected ? (
        <div className="bg-rose-50 border border-rose-300 rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 bg-rose-600 text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
            <XCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-rose-900">
            Corrigendum 03 Rejected
          </h2>
          <p className="text-xs text-rose-700 max-w-lg mx-auto">
            The candidate amendment has been marked as REJECTED in the audit trail with reviewer reason logged. No public version was committed.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setIsRejected(false)}
              className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-semibold"
            >
              Reset Workbench Demo
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Inspection Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-800 rounded border border-slate-200">
                  {pendingAmendment.tenderNumber}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Status: NEEDS_REVIEW
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-900 leading-snug">
                {pendingAmendment.amendmentNumber}: Revision of Technical Specifications & BOQ Schedule B - Asphalt Grade
              </h2>

              <p className="text-xs text-slate-600">
                Parent Tender: <span className="font-semibold text-slate-800">{pendingAmendment.tenderTitle}</span>
              </p>
            </div>

            {/* Diff Viewer Component */}
            <DiffViewer
              amendmentNumber={pendingAmendment.amendmentNumber}
              tenderNumber={pendingAmendment.tenderNumber}
              changes={pendingAmendment.extractedChanges}
            />
          </div>

          {/* Review Decision Panel (1 Col) */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 sticky top-24">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Reviewer Verification Actions
              </h3>

              <div className="space-y-2 text-xs">
                <span className="font-semibold text-slate-600 block">Reviewer Notes & Verification Basis:</span>
                <textarea
                  rows={4}
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder="Enter audit remarks or reference the specific executive order before publication..."
                  className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Machine Confidence:</span>
                  <strong className="text-slate-800">91%</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Classified Category:</span>
                  <strong className="text-slate-800">Technical Spec</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Subscribers to Notify:</span>
                  <strong className="text-slate-800">864 Users</strong>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={handleApprove}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve & Commit Version 4
                </button>

                <button
                  onClick={handleReject}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold rounded-lg transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Amendment Notice
                </button>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                All decisions are digitally signed and recorded in AuditLog.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

