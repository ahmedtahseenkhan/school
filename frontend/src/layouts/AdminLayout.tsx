import React from 'react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Topbar } from '@/components/navigation/Topbar';
import { FooterBar } from '@/components/navigation/FooterBar';
import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = React.useState<boolean>(false);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 min-h-screen flex flex-col">
          <Topbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
          <main className="p-3 md:p-4 lg:p-5">
            <Outlet />
          </main>
          <FooterBar />
        </div>
      </div>
    </div>
  );
}
