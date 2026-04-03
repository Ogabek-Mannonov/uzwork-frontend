import React from "react";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen theme-auth-bg flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-md theme-auth-card rounded-2xl shadow p-6" style={{ background: 'var(--surface)', color: 'var(--text)' }}>
        <Outlet />
      </div>
    </div>
  );
}
