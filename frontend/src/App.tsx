import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import CommandLayout from "./components/CommandLayout";
import AdminLayout from "./components/AdminLayout";

// Dynamic Route Code-Splitting
const Home = lazy(() => import("./pages/Home"));
const AgentSearch = lazy(() => import("./pages/AgentSearch"));
const AgentProfile = lazy(() => import("./pages/AgentProfile"));
const AgentDashboard = lazy(() => import("./pages/AgentDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminAgents = lazy(() => import("./pages/AdminAgents"));
const AdminProperties = lazy(() => import("./pages/AdminProperties"));
const AdminBlog = lazy(() => import("./pages/AdminBlog"));
const AdminDocuments = lazy(() => import("./pages/AdminDocuments"));
const Properties = lazy(() => import("./pages/Properties"));
const PropertyDetails = lazy(() => import("./pages/PropertyDetails"));
const SavedSearches = lazy(() => import("./pages/SavedSearches"));
const OpenHouses = lazy(() => import("./pages/OpenHouses"));
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const BecomeAgent = lazy(() => import("./pages/BecomeAgent"));
const LeadsPage = lazy(() => import("./pages/LeadsPage"));
const AgentListings = lazy(() => import("./pages/AgentListings"));
const Inbox = lazy(() => import("./pages/Inbox"));
const AgentSettings = lazy(() => import("./pages/AgentSettings"));
const Opportunities = lazy(() => import("./pages/Opportunities"));
const CityPage = lazy(() => import("./pages/CityPage"));
const MortgageCalculator = lazy(() => import("./pages/MortgageCalculator"));
const HomeValue = lazy(() => import("./pages/HomeValue"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Calendar = lazy(() => import("./pages/Calendar"));
const BookAppointment = lazy(() => import("./pages/BookAppointment"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const AffordabilityCalculator = lazy(() => import("./pages/AffordabilityCalculator"));
const Analytics = lazy(() => import("./pages/Analytics"));
const VideoCall = lazy(() => import("./pages/VideoCall"));
const StartVideoCall = lazy(() => import("./pages/StartVideoCall"));
const UserAccount = lazy(() => import("./pages/UserAccount"));

// Crisp Light Theme Page Loader Fallback
const PageLoader = () => (
  <div style={{
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ffffff',
    padding: '40px'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '3px solid #e5e7eb',
      borderTopColor: '#b40101',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

export default function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="account" element={<UserAccount />} />
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
              <Route path="terms" element={<Terms />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="homes/:city" element={<CityPage />} />
              <Route path="home-value" element={<HomeValue />} />
              <Route path="mortgage-calculator" element={<MortgageCalculator />} />
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
              <Route path="blog" element={<AdminBlog />} />
              <Route path="documents" element={<AdminDocuments />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<AgentSettings />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/video-call/:videoCallId" element={<VideoCall />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Router>
  );
}

