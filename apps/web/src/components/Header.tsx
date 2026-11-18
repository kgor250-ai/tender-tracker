import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Bell, FileSearch, CheckCircle2, User, LayoutDashboard } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-primary-600 text-white p-2 rounded-lg shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900 tracking-tight block">Tender Tracker</span>
            <span className="text-xs text-slate-500 font-medium block -mt-1">Corrigendum & Amendment Audit System</span>
          </div>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-primary-600 flex items-center gap-1.5 transition-colors">
            <FileSearch className="w-4 h-4" />
            Tenders
          </Link>
          <Link href="/review/workbench" className="hover:text-primary-600 flex items-center gap-1.5 transition-colors">
            <CheckCircle2 className="w-4 h-4 text-amber-600" />
            Review Workbench
          </Link>
          <Link href="/dashboard" className="hover:text-primary-600 flex items-center gap-1.5 transition-colors">
            <Bell className="w-4 h-4" />
            My Watchlist
          </Link>
          <Link href="/admin" className="hover:text-primary-600 flex items-center gap-1.5 transition-colors">
            <LayoutDashboard className="w-4 h-4 text-purple-600" />
            Admin & Sources
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 pl-4 border-l border-slate-200 text-xs text-slate-600">
            <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-semibold">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="font-semibold text-slate-800 leading-tight">Reviewer Mode</p>
              <p className="text-[10px] text-emerald-600 font-medium">RBAC Verified</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

