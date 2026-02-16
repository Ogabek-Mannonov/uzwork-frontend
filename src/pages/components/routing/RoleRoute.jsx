import React from "react";
import { Navigate, Outlet } from "react-router-dom";

// User info qayerda turishiga qarab moslashtirasan:
// masalan: localStorage.getItem("user") yoki "me" state.
const getRole = () => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const u = JSON.parse(raw);
    return (u?.role || "").toLowerCase();
  } catch {
    return null;
  }
};

export default function RoleRoute({ allow = [], redirectTo = "/home" }) {
  const role = getRole();

  if (!role) return <Navigate to={redirectTo} replace />;

  const ok = allow.map((x) => String(x).toLowerCase()).includes(role);
  if (!ok) return <Navigate to={redirectTo} replace />;

  return <Outlet />;
}
