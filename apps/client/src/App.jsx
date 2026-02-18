import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

// Public layout
import Navbar  from './components/Navbar';
import Footer  from './components/Footer';

// Public pages
import Home        from './Pages/Home';
import CountryPage from './Pages/CountryPage';
import Contact     from './Pages/Contact';
import InquiryForm from './Pages/InquiryForm';
import AboutUs     from './Pages/About';
import PackageDetailPage from './Pages/PackageDetailPage';

// Country data
import { kenyaData }    from './data/kenyaData';
import { tanzaniaData } from './data/tanzaniaData';
import { zanzibarData } from './data/zanzibarData';
import { ugandaData }   from './data/ugandaData';

// Admin
import { AdminDataProvider } from './context/AdminDataContext';
import AdminLayout    from './layouts/AdminDashboard';
import Dashboard      from './Pages/Admin/Dashboard';
import InquiriesPage  from './Pages/Admin/InquiriesPage';
import CountryEditorPage  from './Pages/Admin/PackageEditorPage';


const PublicPage = ({ children }) => (
  <>
    <Navbar />
    <div className="pt-32">{children}</div>
    <Footer />
  </>
);

const ProtectedRoute = ({ children }) => {
  const { isLoaded, isSignedIn } = useUser();
  if (!isLoaded) return null;
  return isSignedIn ? children : <Navigate to="/" replace />;
};


const AdminRoute = ({ children }) => {
  const { isLoaded, isSignedIn, user } = useUser();
  if (!isLoaded) return null;
  if (!isSignedIn) return <Navigate to="/" replace />;
  return user?.publicMetadata?.role === 'admin'
    ? children
    : <Navigate to="/" replace />;
};


function App() {
  return (
    <BrowserRouter>
        <Routes>

          {/* ── Public routes */}
          <Route path="/"         element={<PublicPage><Home /></PublicPage>} />
          <Route path="/kenya"    element={<PublicPage><CountryPage countryData={{ ...kenyaData,    country: 'Kenya'    }} /></PublicPage>} />
          <Route path="/tanzania" element={<PublicPage><CountryPage countryData={{ ...tanzaniaData, country: 'Tanzania' }} /></PublicPage>} />
          <Route path="/zanzibar" element={<PublicPage><CountryPage countryData={{ ...zanzibarData, country: 'Zanzibar' }} /></PublicPage>} />
          <Route path="/uganda"   element={<PublicPage><CountryPage countryData={{ ...ugandaData,   country: 'Uganda'   }} /></PublicPage>} />
          <Route path="/about-us" element={<PublicPage><AboutUs /></PublicPage>} />
          <Route path="/contact"  element={<PublicPage><Contact /></PublicPage>} />
          <Route path="/packages/:id" element={<PackageDetailPage />} />

          <Route path="/inquiry-form" element={
            <PublicPage>
              <ProtectedRoute><InquiryForm /></ProtectedRoute>
            </PublicPage>
          } />
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
            
            <Route index element={<Navigate to="dashboard" replace />} />

            <Route path="dashboard"  element={<Dashboard />} />
            <Route path="inquiries"  element={<InquiriesPage />} />
             <Route path="country/:country"   element={<CountryEditorPage />} />
          </Route>
          <Route path="*" element={
            <PublicPage>
              <div className="text-center py-20">
                <h1 className="text-4xl font-bold mb-4">404 – Page Not Found</h1>
                <p>The page you're looking for doesn't exist.</p>
              </div>
            </PublicPage>
          } />

        </Routes>
      </BrowserRouter>
  );
}

export default App;