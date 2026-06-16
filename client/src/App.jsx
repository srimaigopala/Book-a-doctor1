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
import DashboardPage from './pages/DashboardPage.jsx';
import AddDoctorPage from './pages/AddDoctorPage.jsx';
import EditDoctorPage from './pages/EditDoctorPage.jsx';
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
              <Route path="/doctors" element={<DoctorsPage id="page-doctors" />} />
              <Route path="/doctors/:id" element={<DoctorDetailsPage id="page-doctor-details" />} />

              {/* Protected Routes */}
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
                  <ProtectedRoute>
                    <BookAppointmentPage id="page-book-appointment-base" />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/book-appointment/:doctorId" 
                element={
                  <ProtectedRoute>
                    <BookAppointmentPage id="page-book-appointment-id" />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage id="page-dashboard" />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/add-doctor" 
                element={
                  <ProtectedRoute>
                    <AddDoctorPage id="page-add-doctor" />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/edit-doctor/:id" 
                element={
                  <ProtectedRoute>
                    <EditDoctorPage id="page-edit-doctor" />
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
