"use client";

import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-4 lg:p-8 lg:pl-4">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
