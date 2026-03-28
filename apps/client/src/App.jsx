import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Package, Sparkles, FileText } from "lucide-react";

import ScrollToTop    from "./components/ScrollToTop";
import SignInPrompt   from "./components/shared/SignInPrompt";

// Layout
import Navbar  from "./components/Navbar";
import Footer  from "./components/Footer";

// Public pages
import Home              from "./Pages/Home";
import CountryPage       from "./Pages/CountryPage";
import Contact           from "./Pages/Contact";
import InquiryForm       from "./Pages/InquiryForm";
import AboutUs           from "./Pages/About";
import PackageDetailPage from "./Pages/PackageDetailPage";
import BookingPage       from "./Pages/BookingPage";
import CustomQuotePage   from "./Pages/CustomQuotePage";

// Country data
import { kenyaData }    from "./data/kenyaData";
import { tanzaniaData } from "./data/tanzaniaData";
import { zanzibarData } from "./data/zanzibarData";
import { ugandaData }   from "./data/ugandaData";

// User dashboard
import UserDashboard     from "./Pages/UserDashboard";

// Admin
import { AdminDataProvider } from "./context/AdminDataContext";
import AdminLayout       from "./layouts/AdminDashboard";
import Dashboard         from "./Pages/Admin/Dashboard";
import InquiriesPage     from "./Pages/Admin/InquiriesPage";
import BookingsPage      from "./Pages/Admin/BookingsPage";
import CustomQuotesPage  from "./Pages/Admin/CustomQuotesPage";
import CountryEditorPage from "./Pages/Admin/PackageEditorPage";
import UsersPage         from "./Pages/Admin/UsersPage";
import SettingsPage      from "./Pages/Admin/SettingsPage";
import DeparturesPage    from "./Pages/Admin/DeparturesPage";
import AnalyticsPage     from "./Pages/Admin/AnalyticsPage";
import ActivityPage      from "./Pages/Admin/ActivityPage";

// ── Wrappers ──────────────────────────────────────────────────────────────────

/**
 * Public pages: Navbar on top, content pushed down by nav height, Footer below.
 * pt-32 accounts for the fixed two-tier navbar (top-bar + main-nav ≈ 128px).
 */
const PublicPage = ({ children }) => (
  <>
    <Navbar />
    <div className="pt-32">{children}</div>
    <Footer />
  </>
);

/**
 * Requires the user to be signed in.
 * Shows a branded sign-in prompt instead of the page content when not authed.
 */
const ProtectedRoute = ({ children, promptProps }) => {
  const { isLoaded, isSignedIn } = useUser();
  if (!isLoaded) return null;
  return isSignedIn ? children : <SignInPrompt {...promptProps} />;
};

/**
 * Admin-only route guard.
 * Redirects non-admins (and unauthenticated users) to home.
 */
const AdminRoute = ({ children }) => {
  const { isLoaded, isSignedIn, user } = useUser();
  if (!isLoaded) return null;
  if (!isSignedIn) return <Navigate to="/" replace />;
  return user?.publicMetadata?.role === "admin"
    ? children
    : <Navigate to="/" replace />;
};

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      {/* ScrollToTop must be inside BrowserRouter so it can read useLocation */}
      <ScrollToTop />

      <Routes>

        {/* ── Public routes ── */}
        <Route path="/"         element={<PublicPage><Home /></PublicPage>} />
        <Route path="/about-us" element={<PublicPage><AboutUs /></PublicPage>} />
        <Route path="/contact"  element={<PublicPage><Contact /></PublicPage>} />

        {/* Country pages */}
        <Route path="/kenya"    element={<PublicPage><CountryPage countryData={{ ...kenyaData,    country: "Kenya"    }} /></PublicPage>} />
        <Route path="/tanzania" element={<PublicPage><CountryPage countryData={{ ...tanzaniaData, country: "Tanzania" }} /></PublicPage>} />
        <Route path="/zanzibar" element={<PublicPage><CountryPage countryData={{ ...zanzibarData, country: "Zanzibar" }} /></PublicPage>} />
        <Route path="/uganda"   element={<PublicPage><CountryPage countryData={{ ...ugandaData,   country: "Uganda"   }} /></PublicPage>} />

        {/*
          PackageDetailPage has its own full-bleed hero that starts at the very
          top of the viewport — it must be wrapped in PublicPage so Navbar and
          Footer are present. The previous version omitted PublicPage here which
          meant no Navbar appeared on the package detail page.
          The page's own hero image sits behind the transparent fixed Navbar.
        */}
        <Route
          path="/packages/:id"
          element={
            <PublicPage>
              <PackageDetailPage />
            </PublicPage>
          }
        />

        {/* Protected: User dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              promptProps={{
                title:        "My Account",
                message:      "Sign in to view your bookings, quote requests, and profile.",
                illustration: Package,
              }}
            >
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected: Inquiry form */}
        <Route
          path="/inquiry-form"
          element={
            <PublicPage>
              <ProtectedRoute
                promptProps={{
                  title:        "Inquiry Submission",
                  message:      "Sign in to send your inquiry and keep track of your conversation with our team.",
                  illustration: FileText,
                }}
              >
                <InquiryForm />
              </ProtectedRoute>
            </PublicPage>
          }
        />

        {/* Protected: Booking */}
        <Route
          path="/booking"
          element={
            <PublicPage>
              <ProtectedRoute
                promptProps={{
                  title:        "Unlock Your Journey",
                  message:      "Sign in to complete your booking and secure your safari adventure.",
                  illustration: Package,
                }}
              >
                <BookingPage />
              </ProtectedRoute>
            </PublicPage>
          }
        />

        {/* Protected: Custom quote */}
        <Route
          path="/request-quote"
          element={
            <PublicPage>
              <ProtectedRoute
                promptProps={{
                  title:        "Bespoke Safari Planning",
                  message:      "Sign in to request a custom quote and collaborate with our destination experts.",
                  illustration: Sparkles,
                }}
              >
                <CustomQuotePage />
              </ProtectedRoute>
            </PublicPage>
          }
        />

        {/* ── Admin routes ── */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDataProvider>
                <AdminLayout />
              </AdminDataProvider>
            </AdminRoute>
          }
        >
          <Route index                      element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"           element={<Dashboard />} />
          <Route path="inquiries"           element={<InquiriesPage />} />
          <Route path="bookings"            element={<BookingsPage />} />
          <Route path="custom-quotes"       element={<CustomQuotesPage />} />
          <Route path="departures"          element={<DeparturesPage />} />
          <Route path="users"               element={<UsersPage />} />
          <Route path="settings"            element={<SettingsPage />} />
          <Route path="analytics"           element={<AnalyticsPage />} />
          <Route path="activity"            element={<ActivityPage />} />
          <Route path="country/:country"    element={<CountryEditorPage />} />
        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={
            <PublicPage>
              <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
                <p className="text-8xl font-bold text-stone-200 mb-4">404</p>
                <h1 className="text-2xl font-bold text-stone-800 mb-2">Page Not Found</h1>
                <p className="text-stone-500 mb-8">The page you're looking for doesn't exist.</p>
                <a
                  href="/"
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors"
                >
                  ← Back to Home
                </a>
              </div>
            </PublicPage>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;