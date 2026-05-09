/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import CommandLayout from "./components/CommandLayout";
import AdminLayout from "./components/AdminLayout";
import Home from "./pages/Home";
import AgentSearch from "./pages/AgentSearch";
import AgentProfile from "./pages/AgentProfile";
import AgentDashboard from "./pages/AgentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminAgents from "./pages/AdminAgents";
import AdminProperties from "./pages/AdminProperties";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import SavedSearches from "./pages/SavedSearches";
import OpenHouses from "./pages/OpenHouses";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import BecomeAgent from "./pages/BecomeAgent";
import LeadsPage from "./pages/LeadsPage";
import AgentListings from "./pages/AgentListings";
import Inbox from "./pages/Inbox";
import AgentSettings from "./pages/AgentSettings";
import Opportunities from "./pages/Opportunities";
import CityPage from "./pages/CityPage";
import MortgageCalculator from "./pages/MortgageCalculator";
import HomeValue from "./pages/HomeValue";
import NotFound from "./pages/NotFound";
import Calendar from "./pages/Calendar";
import BookAppointment from "./pages/BookAppointment";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import AffordabilityCalculator from "./pages/AffordabilityCalculator";
import Analytics from "./pages/Analytics";
import VideoCall from "./pages/VideoCall";
import StartVideoCall from "./pages/StartVideoCall";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="properties" element={<Properties />} />
          <Route path="properties/:id" element={<PropertyDetails />} />
          <Route path="saved-searches" element={<SavedSearches />} />
          <Route path="open-houses" element={<OpenHouses />} />
          <Route path="agents" element={<AgentSearch />} />
          <Route path="agents/:id" element={<AgentProfile />} />
          <Route path="become-agent" element={<BecomeAgent />} />
          <Route path="book-appointment/:agentId" element={<BookAppointment />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<BlogPost />} />
          <Route path="affordability-calculator" element={<AffordabilityCalculator />} />
          {/* SEO City Landing Template — generates thousands of pages from one component */}
          <Route path="homes/:city" element={<CityPage />} />
          {/* Lead Capture Micro-apps */}
          <Route path="home-value" element={<HomeValue />} />
          <Route path="mortgage-calculator" element={<MortgageCalculator />} />
          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/command" element={<CommandLayout />}>
          <Route index element={<AgentDashboard />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="listings" element={<AgentListings />} />
          <Route path="opportunities" element={<Opportunities />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="video/start" element={<StartVideoCall />} />
          <Route path="settings" element={<AgentSettings />} />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="agents" element={<AdminAgents />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="blog" element={<Blog />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<AgentSettings />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/video-call/:videoCallId" element={<VideoCall />} />
      </Routes>
    </Router>
  );
}
