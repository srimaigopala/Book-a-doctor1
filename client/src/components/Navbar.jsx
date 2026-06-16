import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Stethoscope, LogOut, Menu, X, Calendar, LayoutDashboard, Shield, PlusCircle, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'text-blue-600 font-bold text-sm' : 'text-slate-600 hover:text-blue-600 font-medium text-sm transition-colors duration-150';
  };

  return (
    <nav id="navbar-container" className="sticky top-0 z-40 bg-white border-b border-slate-200 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo */}
          <Link id="nav-logo" to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-xs">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-800">Book-A-<span className="text-blue-600">Doctor</span></span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={isActive('/')}>Home</Link>
            <Link to="/doctors" className={isActive('/doctors')}>Doctors</Link>
            
            {user && (
              <>
                <Link to="/appointments" className={isActive('/appointments')}>Appointments</Link>
                {isAdmin && (
                  <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
                )}
              </>
            )}
          </div>

          {/* Auth State & Logout */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-slate-800">{user.name}</span>
                  <div className="flex items-center gap-1">
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        <Shield className="h-2.5 w-2.5" /> Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-blue-50 text-blue-750 border border-blue-200">
                        <User className="h-2.5 w-2.5" /> Patient
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="bg-blue-50 text-blue-600 px-5 py-2 rounded-full text-sm font-semibold hover:bg-blue-100 transition-colors flex items-center gap-1.5 cursor-pointer border border-blue-100"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors duration-150"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-500 hover:text-blue-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors duration-150"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div id="mobile-nav-menu" className="md:hidden bg-white border-t border-slate-100 px-4 py-3 space-y-2 shadow-lg animate-in fade-in slide-in-from-top-4 duration-200">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600"
          >
            Home
          </Link>
          <Link
            to="/doctors"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600"
          >
            Find Doctors
          </Link>

          {user && (
            <>
              <Link
                to="/appointments"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600"
              >
                My Appointments
              </Link>
              {isAdmin && (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  >
                    Admin Dashboard
                  </Link>
                  <Link
                    to="/add-doctor"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  >
                    Add Doctor
                  </Link>
                </>
              )}
            </>
          )}

          <div className="border-t border-slate-100 pt-3 mt-2">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-1 flex items-center justify-between">
                  <div>
                    <div className="text-base font-semibold text-slate-800">{user.name}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </div>
                  {isAdmin ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-purple-100 text-purple-700">Admin</span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-blue-100 text-blue-700">Patient</span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-base font-semibold text-red-650 hover:bg-red-50 text-red-600"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 p-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-center text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-center text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}