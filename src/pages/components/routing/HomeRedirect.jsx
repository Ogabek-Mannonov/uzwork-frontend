import React from "react";
import { Navigate } from "react-router-dom";

export default function HomeRedirect() {
  const getRole = () => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        return (u?.role || "").toLowerCase();
      }
    } catch {}
    return localStorage.getItem("role")?.toLowerCase() || null;
  };

  const role = getRole();

  if (role === "client") {
    return <Navigate to="/client/landing" replace />;
  }

  // Standart holatda (freelancer yoki noma'lum bo'lsa) find-work'ga
  return <Navigate to="/find-work" replace />;
}
