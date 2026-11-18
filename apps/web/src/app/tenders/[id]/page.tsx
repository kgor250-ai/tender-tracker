'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Bell, BellOff, Calendar, FileText, ShieldCheck, Download, ExternalLink, ArrowRight, CheckCircle2 } from 'lucide-react';
import Timeline from '@/components/Timeline';
import { format } from 'date-fns';

const DEMO_TENDER_DETAIL = {
  id: 'demo-tender-001',
  tenderNumber: 'DEMO/PWD/2026/001',
  sourceTenderRef: 'PORTAL-DEMO-2026-9901',
  title: 'Demonstration road maintenance and widening works - Sector 4 to 8 Corridor',
  organization: 'Demo Public Works Organization',
  department: 'Demo Public Works Department',
  status: 'AMENDED',
  publicationDate: '2026-11-10T09:00:00+05:30',
  submissionDeadline: '2026-11-25T17:00:00+05:30',
  estimatedValue: 5000000,
  currency: 'INR',
  category: 'Civil Works',
  location: 'Gujarat, India',
  sourceUrl: 'https://eprocure.demo.gov.in/notice/DEMO-PWD-2026-001',
  documents: [
    {
      id: 'doc-001',
      filename: 'NIT_DEMO_PWD_2026_001.pdf',
      filesize: '2.4 MB',
      sha256: '4a8b72e19036c843818e974e4c29d107a992bb3a5b066df42cb36a32cb28d11e',
      uploadedAt: '10 Nov 2026',
    },
    {
      id: 'doc-002',
      filename: 'Corrigendum_01_Deadline_Extension.pdf',
      filesize: '640 KB',
      sha256: '83f9c6d32115e4a86a0b2713dc258163f91572c478a05c364177d9f78328b9c1',
      uploadedAt: '13 Nov 2026',
    },
    {
      id: 'doc-003',
      filename: 'Corrigendum_02_Eligibility_Amendment.pdf',
      filesize: '512 KB',
      sha256: '19c8d4512e9873a4b65cd31289fe81628374a56c09b172a38459dfc1234987ba',
      uploadedAt: '16 Nov 2026',
    },
  ],
  timelineEvents: [
    {
      id: 'event-0',
      type: 'INITIAL_NOTICE',
      title: 'Original Notice Inviting Tender (NIT) Published',
      date: '2026-11-10T09:00:00+05:30',
      status: 'PUBLISHED',
      details: {
        initialDeadline: '2026-11-20T17:00:00+05:30',
        estimatedValue: 5000000,
        currency: 'INR',
      },
    },
    {
      id: 'event-1',
      type: 'CORRIGENDUM',
      amendmentNumber: 'Corrigendum 01',
      title: 'Extension of Online Bid Submission Deadline and Clarification on Pre-Bid Queries',
      date: '2026-11-13T11:00:00+05:30',
      status: 'APPROVED',
      amendmentType: 'DEADLINE_EXTENSION',
      changes: [
        {
          fieldKey: 'submissionDeadline',
          changeType: 'MODIFIED',
          oldValue: '20-Nov-2026, 17:00 IST',
          newValue: '25-Nov-2026, 17:00 IST',
          confidence: 0.985,
          evidenceJson: {
            pageNumber: 1,
            excerpt: 'Item 4: The last date of bid submission is hereby extended up to 25-Nov-2026, 17:00 Hrs IST.',
          },
        },
      ],
    },
    {
      id: 'event-2',
      type: 'CORRIGENDUM',
      amendmentNumber: 'Corrigendum 02',
      title: 'Amendment in Technical Qualification - Prior Road Experience Criterion',
      date: '2026-11-16T14:30:00+05:30',
      status: 'APPROVED',
      amendmentType: 'ELIGIBILITY_CRITERIA',
      changes: [
        {
          fieldKey: 'eligibilityExperienceYears',
          changeType: 'MODIFIED',
          oldValue: '5 years',
          newValue: '3 years',
          confidence: 0.94,
          evidenceJson: {
            pageNumber: 2,
            excerpt:
              'Clause 7.2 (Eligibility): Bidders possessing a minimum of 3 (three) years of continuous experience in bituminous road works shall be deemed eligible.',
          },
        },
      ],
    },
    {
      id: 'event-3',
      type: 'CORRIGENDUM',
      amendmentNumber: 'Corrigendum 03',
      title: 'Revision of Technical Specifications & BOQ Schedule B - Asphalt Grade',
      date: '2026-11-19T10:15:00+05:30',
      status: 'NEEDS_REVIEW',
      amendmentType: 'TECHNICAL_SPECIFICATION',
      changes: [
        {
          fieldKey: 'bituminousAsphaltGrade',
          changeType: 'MODIFIED',
          oldValue: 'Viscosity Grade VG-30 bitumen',
          newValue: 'Viscosity Grade VG-40 modified bitumen conforming to IS 73:2013',
          confidence: 0.91,
          evidenceJson: {
            pageNumber: 3,
            excerpt:
              'All wearing courses shall strictly deploy VG-40 paving grade bitumen in lieu of VG-30 specified earlier.',
          },
        },
      ],
    },
  ],
};

export default function TenderDetailPage() {
  const params = useParams();
  const [isFollowing, setIsFollowing] = useState(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'documents' | 'versions'>('timeline');

  const tender = DEMO_TENDER_DETAIL;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Tender Catalogue
      </Link>

      {/* Main Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-xs font-bold px-3 py-1 bg-slate-100 text-slate-800 rounded-lg border border-slate-200">
                {tender.tenderNumber}
              </span>
              <span className="text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                {tender.status}
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
                {tender.category}
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">
              {tender.title}
            </h1>

            <p className="text-xs text-slate-500 font-medium">
              Issued by <strong className="text-slate-700">{tender.organization}</strong> &bull; {tender.department}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                isFollowing
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {isFollowing ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Following Updates
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  Follow for Amendments
                </>
              )}
            </button>

            <a
              href={tender.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold transition-colors border border-slate-200"
            >
              Official Portal Notice
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Highlighted Deadlines & Values Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block font-medium">Active Submission Deadline</span>
            <span className="text-sm font-bold text-rose-600 block mt-0.5">
              {format(new Date(tender.submissionDeadline), 'dd MMM yyyy, HH:mm')}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">(Extended via Corrigendum 01)</span>
          </div>

          <div>
            <span className="text-slate-500 block font-medium">Original Publication Date</span>
            <span className="text-sm font-bold text-slate-800 block mt-0.5">
              {format(new Date(tender.publicationDate), 'dd MMM yyyy')}
            </span>
            <span className="text-[10px] text-slate-400">Notice Inviting Tender</span>
          </div>

          <div>
            <span className="text-slate-500 block font-medium">Estimated Tender Budget</span>
            <span className="text-sm font-bold text-slate-800 block mt-0.5">
              {tender.currency} {tender.estimatedValue.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400">Inclusive of taxes & royalties</span>
          </div>

          <div>
            <span className="text-slate-500 block font-medium">Audit Integrity</span>
            <span className="text-sm font-bold text-emerald-700 block mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              100% Immutable
            </span>
            <span className="text-[10px] text-slate-400">Preserved in 3 versions</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-8 text-sm font-bold text-slate-600">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'timeline'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          Corrigendum Timeline ({tender.timelineEvents.length})
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'documents'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          Document Vault ({tender.documents.length})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'timeline' ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Tender Journey & Amendment Chronology</h2>
              <p className="text-xs text-slate-500">Every published update, timeline alteration, and technical clarification.</p>
            </div>
            <Link
              href="/review/workbench"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              Open Review Workbench
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <Timeline events={tender.timelineEvents} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">Immutable Document Vault</h2>
          <p className="text-xs text-slate-500">
            Original and corrigenda documents preserved in private object storage with verified SHA-256 hashes.
          </p>

          <div className="divide-y divide-slate-100">
            {tender.documents.map((doc) => (
              <div key={doc.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{doc.filename}</p>
                    <p className="text-slate-500 text-[11px] font-mono mt-0.5">
                      SHA-256: <span className="text-slate-700">{doc.sha256}</span>
                    </p>
                    <p className="text-slate-400 text-[10px] mt-0.5">Uploaded {doc.uploadedAt} &bull; {doc.filesize}</p>
                  </div>
                </div>

                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md font-semibold shrink-0">
                  <Download className="w-3.5 h-3.5" />
                  Download Verified PDF
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

