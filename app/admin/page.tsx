"use client";

import dynamic from "next/dynamic";

const AdminDashboard = dynamic(() => import("./AdminDashboard"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-[#E55956] border-t-transparent rounded-full" />
    </div>
  ),
});

export default function AdminPage() {
  return <AdminDashboard />;
}
