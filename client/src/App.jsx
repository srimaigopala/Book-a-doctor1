import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';

// Import Pages
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DoctorsPage from './pages/DoctorsPage.jsx';
import DoctorDetailsPage from './pages/DoctorDetailsPage.jsx';
import BookAppointmentPage from './pages/BookAppointmentPage.jsx';
import AppointmentsPage from './pages/AppointmentsPage.jsx';
import PatientDashboard from './pages/PatientDashboard.jsx';
import DoctorDashboard from './pages/DoctorDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import DoctorOnboardingPage from './pages/DoctorOnboardingPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div id="app-root" className="min-h-screen flex flex-col bg-slate-50 text-slate-950 font-sans antialiased">
          <Navbar id="app-navbar" />
          
          <main id="app-main-content" className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage id="page-home" />} />
              <Route path="/login" element={<LoginPage id="page-login" />} />
              <Route path="/register" element={<RegisterPage id="page-register" />} />

              {/* Protected Routes */}
              <Route 
                path="/doctors" 
                element={
                  <ProtectedRoute>
                    <DoctorsPage id="page-doctors" />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/doctors/:id" 
                element={
                  <ProtectedRoute>
                    <DoctorDetailsPage id="page-doctor-details" />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/appointments" 
                element={
                  <ProtectedRoute>
                    <AppointmentsPage id="page-appointments" />
                  </ProtectedRoute>
                } 
              />
              <Route
                path="/book-appointment"
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <BookAppointmentPage id="page-book-appointment-base" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/book-appointment/:doctorId"
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <BookAppointmentPage id="page-book-appointment-id" />
                  </ProtectedRoute>
                }
              />
              
              {/* Specialized Dashboards */}
              <Route
                path="/patient-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <PatientDashboard id="page-patient-dashboard" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['doctor']}>
                    <DoctorDashboard id="page-doctor-dashboard" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard id="page-admin-dashboard" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute allowedRoles={['doctor']}>
                    <DoctorOnboardingPage id="page-doctor-onboarding" />
                  </ProtectedRoute>
                }
              />

              {/* Catch All */}
              <Route path="*" element={<NotFoundPage id="page-not-found" />} />
            </Routes>
          </main>

          <Footer id="app-footer" />
        </div>
      </AuthProvider>
    </Router>
  );
}
