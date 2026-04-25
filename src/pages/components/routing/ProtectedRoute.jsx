import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const getToken = () => localStorage.getItem("accessToken");

export default function ProtectedRoute({ redirectTo = "/login" }) {
  const token = getToken();
  const location = useLocation();

  // 1. Not logged in → go to login
  if (!token) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }

  // 2. Get stored user
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch (e) {
    user = {};
  }

  const isFreelancer = user?.role === "freelancer";
  // Needs onboarding ONLY if freelancer AND category_id is null/undefined/0
  const needsOnboarding = isFreelancer && !user?.category_id;
  const isOnOnboarding = location.pathname === "/onboarding";

  // 3. Freelancer without category → redirect to onboarding
  if (needsOnboarding && !isOnOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  // 4. Freelancer with category visiting /onboarding → redirect away
  if (!needsOnboarding && isOnOnboarding) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
