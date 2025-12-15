"use client";

import React, { useState } from "react";
import AdminSidebar from "../components/adminSidebar";
import AdminTopbar from "../components/adminTopBar";
import { AuthProvider } from "@/app/providers/AuthProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <AuthProvider>
      <div className="min-h-screen flex bg-white text-black">
        {/* Sidebar */}
        <AdminSidebar open={sidebarOpen} />

        {/* Main Content */}
        <div className="flex flex-col flex-1">
          <AdminTopbar
            sidebarOpen={sidebarOpen}
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />

          <main className="flex-1 p-4 md:p-6 bg-neutral-50">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}
