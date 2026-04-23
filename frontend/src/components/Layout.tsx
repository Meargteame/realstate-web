import React from "react";
import { Layout as AntLayout } from "antd";
import Header from "./Header";
import { Outlet } from "react-router-dom";

const { Content, Footer } = AntLayout;

export default function Layout() {
  return (
    <AntLayout style={{ minHeight: '100vh', background: 'white' }}>
      <Header />
      <Content style={{ display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </Content>
      <Footer style={{ textAlign: 'center', background: '#373a4b', color: 'white', padding: '40px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#b40101', marginBottom: '16px' }}>kw®</div>
          <div style={{ color: '#ccc', fontSize: '12px' }}>
            © 2026 Keller Williams Realty, Inc. Individual offices are independently owned and operated.
          </div>
        </div>
      </Footer>
    </AntLayout>
  );
}
