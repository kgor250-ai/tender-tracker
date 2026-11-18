'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, ShieldCheck, Clock, Layers, ArrowUpRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

// Sample preloaded tenders for immediate client interactivity
const INITIAL_TENDERS = [
  {
    id: 'demo-tender-001',
    tenderNumber: 'DEMO/PWD/2026/001',
    title: 'Demonstration road maintenance and widening works - Sector 4 to 8 Corridor',
    department: 'Demo Public Works Department',
    organization: 'Demo Public Works Organization',
    status: 'AMENDED',
    publicationDate: '2026-11-10T09:00:00Z',
    submissionDeadline: '2026-11-25T17:00:00Z',
    estimatedValue: 5000000,
    currency: 'INR',
    category: 'Civil Works',
    amendmentsCount: 3,
    latestAmendment: 'Corrigendum 02 (Approved)',
  },
  {
    id: 'demo-tender-002',
    tenderNumber: 'IRCTC/CATER/2026/042',
    title: 'Supply and installation of smart water purification kiosks across Western Railway zones',
    department: 'Commercial Catering Division',
    organization: 'Indian Railway Catering & Tourism',
    status: 'PUBLISHED',
    publicationDate: '2026-11-12T10:30:00Z',
    submissionDeadline: '2026-11-30T15:00:00Z',
    estimatedValue: 12500000,
    currency: 'INR',
    category: 'Equipment & Services',
    amendmentsCount: 0,
    latestAmendment: 'Original Notice',
  },
  {
    id: 'demo-tender-003',
    tenderNumber: 'GUJ/HEALTH/MED/2026/119',
    title: 'Procurement of neonatal intensive care units (NICU) and ultrasound diagnostic apparatus',
    department: 'Medical Services Directorate',
    organization: 'Gujarat State Health Department',
    status: 'AMENDED',
    publicationDate: '2026-11-08T14:00:00Z',
    submissionDeadline: '2026-11-28T18:00:00Z',
    estimatedValue: 34000000,
    currency: 'INR',
    category: 'Medical Equipment',
    amendmentsCount: 1,
    latestAmendment: 'Corrigendum 01 (Pre-bid queries answered)',
  },
];

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredTenders = INITIAL_TENDERS.filter((tender) => {
    const matchesQuery =
      tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tender.tenderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tender.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || tender.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Hero & Value Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-xs font-semibold border border-primary-500/30">
            <ShieldCheck className="w-4 h-4 text-primary-400" />
            Audit-Verified Procurement Tracker
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            Never Miss a Tender Amendment or Deadline Extension
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Centralizing corrigenda, addenda, and specification revisions across public procurement portals with
            automated document diffing, verifiable page evidence, and immutable audit history.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Tracked Tenders</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">1,482</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">&uarr; 14 new this week</p>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Recorded Corrigenda</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">3,209</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">100% checksum verifiable</p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Pending Review</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">1</p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Corrigendum 03 (Tech Spec)</p>
          </div>
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Active Watchers</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">864</p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Automated alert dispatch</p>
          </div>
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by tender #, keywords, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <Filter className="w-4 h-4 text-slate-400" />
            Status:
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-primary-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="AMENDED">Amended (Has Corrigenda)</option>
            <option value="PUBLISHED">Published (Initial)</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Tender List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center justify-between">
          <span>Active Tenders & Amendments ({filteredTenders.length})</span>
          <span className="text-xs font-normal text-slate-500">Sorted by Latest Update</span>
        </h2>

        {filteredTenders.map((tender) => (
          <div
            key={tender.id}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md border border-slate-200">
                  {tender.tenderNumber}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    tender.status === 'AMENDED'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  {tender.status}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200">
                  {tender.category}
                </span>
                {tender.amendmentsCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                    {tender.amendmentsCount} Corrigenda Issued
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">
                <Link href={`/tenders/${tender.id}`} className="hover:text-primary-600 transition-colors">
                  {tender.title}
                </Link>
              </h3>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                <span>
                  <strong className="text-slate-700">Dept:</strong> {tender.department}
                </span>
                <span>&bull;</span>
                <span>
                  <strong className="text-slate-700">Est. Value:</strong> {tender.currency}{' '}
                  {tender.estimatedValue.toLocaleString()}
                </span>
                <span>&bull;</span>
                <span>
                  <strong className="text-slate-700">Submission Deadline:</strong>{' '}
                  <span className="font-semibold text-rose-600">
                    {format(new Date(tender.submissionDeadline), 'dd MMM yyyy, HH:mm')}
                  </span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href={`/tenders/${tender.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-lg text-xs font-semibold hover:bg-primary-700 transition-colors shadow-sm"
              >
                View Timeline & History
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

