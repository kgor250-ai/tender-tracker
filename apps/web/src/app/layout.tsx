import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Tender Corrigendum & Amendment Tracker',
  description: 'Track procurement changes, tender amendments, corrigenda, and version histories.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4">
            Tender Corrigendum & Amendment Tracker &bull; Standalone Procurement Information System &bull; Version 1.0
          </div>
        </footer>
      </body>
    </html>
  );
}

