import React from "react";
import { Layout as AntLayout } from "antd";
import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

const { Content } = AntLayout;

export default function Layout() {
  return (
    <AntLayout style={{ minHeight: '100vh', background: 'white' }}>
      <Header />
      <Content style={{ display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </Content>
      <Footer />
    </AntLayout>
  );
}
