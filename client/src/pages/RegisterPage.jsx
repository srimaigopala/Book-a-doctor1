import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { User, Mail, Lock, Stethoscope, ArrowRight, CheckCircle2, Shield } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient'); // 'patient' or 'doctor' (admins are seeded, not self-registered)

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Theme switches by selected role
  const isPatient = role === 'patient';
  const isDoctor = role === 'doctor';
  const primaryBg = isPatient ? 'bg-blue-600' : 'bg-teal-600';
  const primaryHover = isPatient ? 'hover:bg-blue-700' : 'hover:bg-teal-700';
  const primaryText = isPatient ? 'text-blue-600' : 'text-teal-600';
  const focusRing = isPatient ? 'focus:border-blue-500 focus:ring-blue-500' : 'focus:border-teal-500 focus:ring-teal-500';
  const focusRingOutline = isPatient ? 'focus:ring-blue-500/20' : 'focus:ring-teal-500/20';
  const iconColor = isPatient ? 'text-blue-500' : 'text-teal-500';
  const badgeBg = isPatient ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-teal-50 text-teal-700 border-teal-200';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('Please prefill all form fields.');
      return;
    }
    
    if (password.length < 4) {
      setErrorMsg('Password should be at least 4 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await register(name, email, password, role);
      if (res.success) {
        setSuccessMsg(`${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully! Redirecting to login...`);
        setName('');
        setEmail('');
        setPassword('');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please try a different email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="register-page-container" className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-slate-50 transition-colors duration-300">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden transition-all duration-300">
        
        {/* Dynamic theme accent line at the top */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 transition-all duration-300 ${primaryBg}`} />

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl mb-3 transition-colors duration-300 ${badgeBg} border`}>
            {isPatient ? (
              <Stethoscope className="h-6 w-6" />
            ) : (
              <Shield className="h-6 w-6" />
            )}
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight font-display">
            Create Your Account
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isPatient
              ? 'Join as a Patient to book instant appointments'
              : 'Join as a Doctor — submit your details for admin verification'}
          </p>
        </div>

        {/* ROLE SELECTION BUTTONS */}
        <div className="mb-6">
          <span className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 text-center mb-2.5">
            Select Registration Type
          </span>
          <div className="grid grid-cols-2 gap-3" id="role-selector-group">
            {/* Patient Option */}
            <button
              type="button"
              id="role-patient-btn"
              onClick={() => {
                setRole('patient');
                setErrorMsg('');
              }}
              className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-2xl font-bold text-[10px] uppercase tracking-wider border-2 transition-all duration-200 cursor-pointer ${
                role === 'patient'
                  ? 'bg-blue-50 text-blue-700 border-blue-600 shadow-xs'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <User className={`h-4 w-4 shrink-0 ${role === 'patient' ? 'text-blue-600' : 'text-slate-400'}`} />
              Patient
            </button>
            {/* Doctor Option */}
            <button
              type="button"
              id="role-doctor-btn"
              onClick={() => {
                setRole('doctor');
                setErrorMsg('');
              }}
              className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-2xl font-bold text-[10px] uppercase tracking-wider border-2 transition-all duration-200 cursor-pointer ${
                role === 'doctor'
                  ? 'bg-teal-50 text-teal-700 border-teal-600 shadow-xs'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Stethoscope className={`h-4 w-4 shrink-0 ${role === 'doctor' ? 'text-teal-600' : 'text-slate-400'}`} />
              Doctor
            </button>
          </div>
        </div>

        {/* Messaging Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold animate-in fade-in duration-200" id="registration-error-toast">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200" id="registration-success-toast">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Register submission form */}
        <form className="space-y-4" onSubmit={handleSubmit} id="registration-submission-form">
          
          {/* Full Name field */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Full Name</label>
            <div className="relative">
              <User className={`absolute left-3.5 top-3.5 h-4 w-4 ${iconColor} transition-colors duration-300`} />
              <input
                type="text"
                required
                value={name}
                id="reg-input-name"
                onChange={(e) => setName(e.target.value)}
                placeholder={isPatient ? "Srimai" : "Rajesh Patel"}
                className={`w-full pl-10 pr-4 py-3 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 rounded-xl border border-slate-200 outline-none outline-hidden focus:ring-2 ${focusRing} ${focusRingOutline} transition-all duration-200`}
              />
            </div>
          </div>

          {/* Email address field */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Email Address</label>
            <div className="relative">
              <Mail className={`absolute left-3.5 top-3.5 h-4 w-4 ${iconColor} transition-colors duration-300`} />
              <input
                type="email"
                required
                value={email}
                id="reg-input-email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isPatient ? "srimai@gmail.com" : "dr.rajesh@clinic.com"}
                className={`w-full pl-10 pr-4 py-3 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 rounded-xl border border-slate-200 outline-none outline-hidden focus:ring-2 ${focusRing} ${focusRingOutline} transition-all duration-200`}
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Password</label>
            <div className="relative">
              <Lock className={`absolute left-3.5 top-3.5 h-4 w-4 ${iconColor} transition-colors duration-300`} />
              <input
                type="password"
                required
                value={password}
                id="reg-input-password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-3 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 rounded-xl border border-slate-200 outline-none outline-hidden focus:ring-2 ${focusRing} ${focusRingOutline} transition-all duration-200`}
              />
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            id="reg-submit-btn"
            disabled={isLoading}
            className={`w-full py-3.5 mt-3 font-extrabold text-xs uppercase tracking-wider text-white ${primaryBg} ${primaryHover} disabled:opacity-50 rounded-xl shadow-xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer`}
          >
            <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
            <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-200 hover:translate-x-0.5" />
          </button>

        </form>

        {/* Bottom Switch link */}
        <div className="text-center mt-6 text-xs text-slate-500">
          Already have a clinical account?{' '}
          <Link to="/login" id="link-to-login" className={`font-extrabold ${primaryText} hover:underline`}>
            Sign in
          </Link>
        </div>

      </div>
    </div>
  );
}
