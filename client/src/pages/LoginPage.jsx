import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Mail, Lock, Stethoscope, ArrowRight, CheckCircle, HelpCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await login(email, password);
      if (res.success) {
        setSuccessMsg('Successfully authenticated! Redirecting...');
        setTimeout(() => {
          if (res.user.role === 'admin') {
            navigate('/dashboard');
          } else {
            navigate('/');
          }
        }, 1000);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setErrorMsg('Authentication error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShortcutLogin = (userEmail, userPassword) => {
    setEmail(userEmail);
    setPassword(userPassword);
  };

  return (
    <div id="login-page-container" className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-150 shadow-sm">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-3">
            <Stethoscope className="h-6.5 w-6.5" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign in to Book-A-Doctor
          </h2>
          <p className="text-sm text-slate-500 mt-1.5">
            Access your medical appointments dashboard
          </p>
        </div>

        {/* Errors/Success toasts */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-lg bg-rose-50 border border-rose-150 text-red-700 text-sm font-semibold">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3.5 rounded-lg bg-emerald-50 border border-emerald-150 text-emerald-800 text-sm font-semibold flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
            {successMsg}
          </div>
        )}

        {/* Main form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="srimai@gmail.com"
                className="w-full pl-10.5 pr-4 py-3 text-sm bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-all duration-150"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full pl-10.5 pr-4 py-3 text-sm bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-all duration-150"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-xl shadow-xs transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? 'Signing in...' : 'Sign In Now'}
            <ArrowRight className="h-4 w-4" />
          </button>

        </form>

        <div className="text-center mt-6 text-sm text-slate-500">
          New to Book-A-Doctor?{' '}
          <Link to="/register" className="text-blue-600 hover:underline font-semibold">
            Create an account
          </Link>
        </div>

        {/* Demo shortcuts */}
        <div className="mt-8 pt-6 border-t border-slate-150 bg-slate-50/70 p-4 rounded-xl">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-650 flex items-center gap-1.5 text-slate-700 mb-3 select-none">
            <HelpCircle className="h-3.5 w-3.5 text-blue-500" /> Demo Credentials
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleShortcutLogin('srimai@gmail.com', '123456')}
              className="px-2.5 py-2 text-left bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg text-slate-700 font-semibold cursor-pointer transition-all"
            >
              <div className="text-[10px] uppercase text-blue-600 font-bold">Role: Patient</div>
              <div className="truncate">srimai@gmail.com</div>
              <div className="text-slate-400 text-[10px]">Pass: 123456</div>
            </button>
            <button
              type="button"
              onClick={() => handleShortcutLogin('admin@bookadoctor.com', 'admin123')}
              className="px-2.5 py-2 text-left bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-200 rounded-lg text-slate-700 font-semibold cursor-pointer transition-all"
            >
              <div className="text-[10px] uppercase text-purple-600 font-bold">Role: Admin</div>
              <div className="truncate">admin@bookadoctor.com</div>
              <div className="text-slate-400 text-[10px]">Pass: admin123</div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}