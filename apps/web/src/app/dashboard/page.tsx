'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bell, Check, Clock, FileText, ArrowRight, Trash2, Shield } from 'lucide-react';
import { format } from 'date-fns';

export default function UserDashboardPage() {
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Deadline Extended to 25-Nov-2026',
      tenderNumber: 'DEMO/PWD/2026/001',
      amendment: 'Corrigendum 01',
      date: '13 Nov 2026, 11:00',
      isRead: false,
    },
    {
      id: 'notif-2',
      title: 'Eligibility Experience Requirement Reduced to 3 Years',
      tenderNumber: 'DEMO/PWD/2026/001',
      amendment: 'Corrigendum 02',
      date: '16 Nov 2026, 14:30',
      isRead: true,
    },
  ]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Contractor Watchlist & Alerts</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Monitor your followed procurement notices and stay informed of official corrigenda in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Followed Tenders (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Followed Tenders (1)</h2>
            <Link href="/" className="text-xs text-primary-600 font-semibold hover:underline">
              + Browse More Tenders
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-800 rounded">
                DEMO/PWD/2026/001
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                AMENDED (2 Corrigenda)
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900">
              Demonstration road maintenance and widening works - Sector 4 to 8 Corridor
            </h3>

            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>
                Active Deadline: <strong className="text-rose-600">25 Nov 2026, 17:00</strong>
              </span>
              <span>&bull;</span>
              <span>Value: INR 5,000,000</span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Subscribed to in-app & email alerts
              </span>

              <Link
                href="/tenders/demo-tender-001"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
              >
                View Live Timeline <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* In-App Alerts Inbox (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary-600" />
              In-App Alerts
            </h2>
            <button
              onClick={markAllRead}
              className="text-xs text-slate-500 hover:text-primary-600 font-medium"
            >
              Mark all as read
            </button>
          </div>

          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-xl border text-xs space-y-1.5 transition-colors ${
                  notif.isRead ? 'bg-white border-slate-200 text-slate-600' : 'bg-primary-50/50 border-primary-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-slate-500">{notif.tenderNumber}</span>
                  <span className="text-[10px] text-slate-400">{notif.date}</span>
                </div>
                <p className="font-bold text-slate-900">{notif.title}</p>
                <p className="text-[11px] text-slate-500">Official update: {notif.amendment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

