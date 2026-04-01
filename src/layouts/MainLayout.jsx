import React from "react";
import { Outlet } from "react-router-dom";
import AppHeader from "../pages/components/AppHeader/AppHeader";
import Footer from "../pages/footer/Footer";

export default function MainLayout() {
  return (
    <div>
      <AppHeader />
      <div className="min-h-screen bg-gray-50">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
