import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import AppHeader from "../pages/components/AppHeader/AppHeader";
import Footer from "../pages/footer/Footer";

export default function MainLayout() {
  const { pathname } = useLocation();
  // Chat sahifasida footer va background kerak emas
  const isChatPage = pathname.startsWith("/messages");

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppHeader />
      <div
        style={{
          flex: 1,
          background: isChatPage ? "transparent" : "var(--bg)",
          color: "var(--text)",
          overflow: isChatPage ? "hidden" : undefined,
        }}
        className={isChatPage ? "" : "min-h-screen"}
      >
        <Outlet />
      </div>
      {!isChatPage && <Footer />}
    </div>
  );
}
