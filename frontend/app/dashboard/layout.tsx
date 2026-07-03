import type { ReactNode } from 'react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardTopbar from '@/components/dashboard/DashboardTopbar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export const metadata = {
  title: 'Dashboard | Hospitality Hub',
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          background: '#0A0F1E',
        }}
      >
        {/* Fixed Sidebar */}
        <DashboardSidebar />

        {/* Main content area with left margin for sidebar */}
        <div
          style={{
            marginLeft: '256px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            minWidth: 0,
          }}
        >
          {/* Sticky Topbar */}
          <DashboardTopbar />

          {/* Page Content */}
          <main
            style={{
              flex: 1,
              padding: '1.75rem',
              overflowY: 'auto',
            }}
          >
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
