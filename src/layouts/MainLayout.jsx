import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../pages/components/FreeNavbar/FreeNavbar";
import Footer from "../pages/footer/Footer";

export default function MainLayout() {
  return (
    <div>
      <Navbar/>
      <div className="min-h-screen bg-gray-50">
        {/* Header keyin qo‘shamiz */}
        <Outlet />
        {/* Footer keyin qo‘shamiz */}
      </div>
      <Footer/>
    </div>
  );
}
