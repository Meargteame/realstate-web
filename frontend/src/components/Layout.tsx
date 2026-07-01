import React from "react";
import { Layout as AntLayout } from "antd";
import Header from "./Header";
import Footer from "./Footer";
import MobileNav from "./MobileNav";
import { useIsMobile } from "../hooks/useBreakpoint";
import { Outlet } from "react-router-dom";

const { Content } = AntLayout;

export default function Layout() {
  const isMobile = useIsMobile();

  return (
    <AntLayout style={{ minHeight: '100vh', background: 'white' }}>
      <Header />
      <Content style={{ display: 'flex', flexDirection: 'column', paddingBottom: isMobile ? 64 : 0 }}>
        <Outlet />
      </Content>
      <Footer />
      <MobileNav />
    </AntLayout>
  );
}
