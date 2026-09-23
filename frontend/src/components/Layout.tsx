import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import MobileNav from "./MobileNav";
import { useIsMobile } from "../hooks/useBreakpoint";
import { Outlet } from "react-router-dom";

export default function Layout() {
  const isMobile = useIsMobile();

  return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", flexDirection: "column" }}>
      <Header />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingBottom: isMobile ? 64 : 0 }}>
        <Outlet />
      </div>
      <Footer />
      <MobileNav />
    </div>
  );
}
