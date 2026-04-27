import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import ATSAnalysis from "./pages/ATSAnalysis";
import ResumeBuilder from "./pages/ResumeBuilder";
import ResumeView from "./pages/ResumeView";
import ResumeEdit from "./pages/ResumeEdit";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import PricingPage from "./pages/PricingPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./styles/layout.css";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return isAuthenticated
    ? children
    : <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
};

// Public Route component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
};

// Auth layout for login/register pages (no navbar/footer)
const AuthLayout = ({ children }) => (
  <>
    {children}
  </>
);

// Main layout for other pages (with navbar and footer)
const MainLayout = ({ children }) => (
  <div className="app-shell">
    <Navbar />
    <main className="app-main">
      {children}
    </main>
    <Footer />
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes without layout */}
      <Route path="/login" element={
        <PublicRoute>
          <AuthLayout>
            <Login />
          </AuthLayout>
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <AuthLayout>
            <Register />
          </AuthLayout>
        </PublicRoute>
      } />
      <Route path="/forgot-password" element={
        <PublicRoute>
          <AuthLayout>
            <ForgotPassword />
          </AuthLayout>
        </PublicRoute>
      } />
      <Route path="/reset-password" element={
        <AuthLayout>
          <ResetPassword />
        </AuthLayout>
      } />
      
      {/* All other routes with main layout */}
      <Route path="/" element={
        <MainLayout>
          <Home />
        </MainLayout>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/resume-builder" element={
        <ProtectedRoute>
          <MainLayout>
            <ResumeBuilder />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/ats-analysis" element={
        <ProtectedRoute>
          <MainLayout>
            <ATSAnalysis />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/resume-view/:id" element={
        <ProtectedRoute>
          <MainLayout>
            <ResumeView />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/resume-edit/:id" element={
        <ProtectedRoute>
          <MainLayout>
            <ResumeEdit />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/about" element={
        <MainLayout>
          <AboutUs />
        </MainLayout>
      } />
      <Route path="/contact" element={
        <MainLayout>
          <Contact />
        </MainLayout>
      } />
      <Route path="/pricing" element={
        <MainLayout>
          <PricingPage />
        </MainLayout>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
