import React from "react";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="auth-layout-wrapper" style={{ width: '100%', minHeight: '100vh' }}>
      <Outlet />
    </div>
  );
}
