"use client"

import Sidebar from '../../components/layout/Sidebar';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        {/* ml-0 en móvil, ml-64 en desktop */}
        <main className="transition-all duration-300 lg:ml-64 p-4 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>

        <Toaster
          position='top-right'
          toastOptions={{
            duration: 3000,
            style: {
              background: '#0f172a',
              color: '#fff',
              borderRadius: '1rem',
              fontSize: '14px',
              fontWeight: '600'
            },
            success: {
              iconTheme: { primary: '#2563eb', secondary: '#fff' }
            }
          }}
        />
      </div>
    </ProtectedRoute>
  );
}