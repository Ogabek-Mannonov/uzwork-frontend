import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const getRole = () => {
  // 1) localStorage user dan
  try {
    const raw = localStorage.getItem("user");
    if (raw) {
      const u = JSON.parse(raw);
      const r = (u?.role || "").toLowerCase();
      if (r) return r;
    }
  } catch {}

  // 2) agar siz roleni alohida keyda saqlasangiz (opsional)
  const role2 = (localStorage.getItem("role") || "").toLowerCase();
  if (role2) return role2;

  return null;
};

export default function RoleRoute({ allow = [], redirectTo = "/home" }) {
  const role = getRole();

  if (!role) return <Navigate to={redirectTo} replace />;

  const ok = allow.map((x) => String(x).toLowerCase()).includes(role);
  if (!ok) return <Navigate to={redirectTo} replace />;

  return <Outlet />;
}
