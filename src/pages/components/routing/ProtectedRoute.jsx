import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const getToken = () => localStorage.getItem("accessToken");


export default function ProtectedRoute({ redirectTo = "/login" }) {
  const token = getToken();
  const location = useLocation();

  if (!token) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
