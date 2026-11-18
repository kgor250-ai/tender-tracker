'use client';

import React, { useState } from 'react';
import { Shield, Play, RefreshCw, CheckCircle2, AlertTriangle, Layers, Globe, Clock, Terminal } from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'sources' | 'jobs' | 'audit'>('sources');
  const [sources, setSources] = useState([
    {
      id: 'src-01',
      name: 'Central Public Procurement Portal (Demo)',
      baseUrl: 'https://eprocure.demo.gov.in',
      adapterKey: 'cppp-adapter',
      method: 'API Feed',
      schedule: 'Every 6 Hours',
      rateLimit: '2,500 ms',
      isEnabled: true,
      lastRun: '13 Nov 2026, 12:00',
      status: 'HEALTHY',
    },
    {
      id: 'src-02',
      name: 'State Infrastructure Procurement Board',
      baseUrl: 'https://state-infra.demo.gov.in',
      adapterKey: 'state-infra-adapter',
      method: 'RSS + Document Fetch',
      schedule: 'Daily at Midnight',
      rateLimit: '3,000 ms',
      isEnabled: true,
      lastRun: '13 Nov 2026, 00:00',
      status: 'HEALTHY',
    },
  ]);

  const collectionJobs = [
    {
      id: 'job-9812',
      source: 'Central Public Procurement Portal (Demo)',
      status: 'COMPLETED',
      startedAt: '13 Nov 2026, 12:00:15',
      duration: '42 seconds',
      fetchedItems: 14,
      newCorrigenda: 2,
    },
    {
      id: 'job-9811',
      source: 'State Infrastructure Procurement Board',
      status: 'COMPLETED',
      startedAt: '13 Nov 2026, 00:00:10',
      duration: '28 seconds',
      fetchedItems: 8,
      newCorrigenda: 0,
    },
  ];

  const auditEvents = [
    {
      id: 'aud-001',
      action: 'AMENDMENT_APPROVED',
      actor: 'reviewer@tender-tracker.local',
      resource: 'Amendment (Corrigendum 02)',
      timestamp: '16 Nov 2026, 14:30:12',
      ip: '192.168.1.45',
      details: 'Eligibility experience verified and approved; Version 3 committed.',
    },
    {
      id: 'aud-002',
      action: 'AMENDMENT_APPROVED',
      actor: 'reviewer@tender-tracker.local',
      resource: 'Amendment (Corrigendum 01)',
      timestamp: '13 Nov 2026, 11:00:04',
      ip: '192.168.1.45',
      details: 'Deadline extension verified and approved; Version 2 committed.',
    },
    {
      id: 'aud-003',
      action: 'TENDER_CREATED',
      actor: 'admin@tender-tracker.local',
      resource: 'Tender (DEMO/PWD/2026/001)',
      timestamp: '10 Nov 2026, 09:00:00',
      ip: '127.0.0.1',
      details: 'Initial Notice Inviting Tender published; Version 1 snapshot created.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Administration & Ingestion Control</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Configure portal adapters, monitor automated collection jobs, and review the append-only security audit trail.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-8 text-sm font-bold text-slate-600">
        <button
          onClick={() => setActiveTab('sources')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'sources' ? 'border-primary-600 text-primary-600' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Globe className="w-4 h-4" />
          Portal Sources ({sources.length})
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'jobs' ? 'border-primary-600 text-primary-600' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          Collection Job Monitor
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'audit' ? 'border-primary-600 text-primary-600' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Terminal className="w-4 h-4" />
          Immutable Audit Log ({auditEvents.length})
        </button>
      </div>

      {/* Panels */}
      {activeTab === 'sources' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Configured Procurement Portals</h2>
            <button className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold shadow-sm">
              + Register New Portal Source
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.map((src) => (
              <div key={src.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{src.name}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{src.baseUrl}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {src.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Adapter Engine:</span>
                    <span className="font-mono font-semibold text-slate-700">{src.adapterKey}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Schedule:</span>
                    <span className="font-semibold text-slate-700">{src.schedule}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Rate Limit Delay:</span>
                    <span className="font-semibold text-slate-700">{src.rateLimit}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Last Fetch:</span>
                    <span className="font-semibold text-slate-700">{src.lastRun}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition-colors">
                    <Play className="w-3 h-3 text-emerald-600" /> Run On-Demand Fetch
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900">Recent Collection Job Executions</h2>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {collectionJobs.map((job) => (
              <div key={job.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800">{job.id}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {job.status}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-700">{job.source}</p>
                  <p className="text-slate-400 text-[11px]">
                    Started at {job.startedAt} &bull; Finished in {job.duration}
                  </p>
                </div>
                <div className="text-right sm:text-right">
                  <span className="font-bold text-slate-900 block">{job.fetchedItems} items retrieved</span>
                  <span className="text-emerald-600 font-semibold text-[11px] block">
                    +{job.newCorrigenda} corrigenda queued
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900">Cryptographically Audited System Operations</h2>
            <p className="text-xs text-slate-500">Every privileged modification and approval decision is immutably logged.</p>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {auditEvents.map((aud) => (
              <div key={aud.id} className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                    {aud.action}
                  </span>
                  <span className="text-slate-400 text-[11px]">{aud.timestamp}</span>
                </div>
                <p className="text-slate-800 font-medium pt-1">
                  <strong>Actor:</strong> {aud.actor} &bull; <strong>Resource:</strong> {aud.resource}
                </p>
                <p className="text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-100 text-[11px]">
                  {aud.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

