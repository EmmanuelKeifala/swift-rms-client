'use client';

import './dashboard.css';
import { Sidebar, Header } from '@/components/layout';
import { RouteGuard } from '@/components/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard>
      <div className="dashboard-layout">
        <Sidebar />
        <div className="main-content">
          <Header />
          <main className="page-content">
            {children}
          </main>
        </div>
      </div>
    </RouteGuard>
  );
}
