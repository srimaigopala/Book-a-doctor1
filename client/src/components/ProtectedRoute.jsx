import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from './Loader.jsx';

// Maps a role to its home dashboard, used when a user hits a page they may not access.
const dashboardForRole = (role) => {
  if (role === 'admin') return '/admin-dashboard';
  if (role === 'doctor') return '/doctor-dashboard';
  return '/patient-dashboard';
};

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader fullPage={true} message="Verifying authentication session..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If this route is role-restricted and the user isn't allowed, send them home.
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={dashboardForRole(user.role)} replace />;
  }

  return children;
}
