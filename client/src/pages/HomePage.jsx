import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import DoctorCard from '../components/DoctorCard.jsx';
import Loader from '../components/Loader.jsx';
import { 
  Stethoscope, 
  Calendar, 
  Users, 
  Award, 
  ArrowRight, 
  HeartPulse, 
  ShieldCheck, 
  Activity, 
  Lock, 
  Plus, 
  Search, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  AlertCircle,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  
  // Platform overall stats
  const [stats, setStats] = useState({
    totalUsers: 25,
    totalDoctors: 4,
    totalAppointments: 18,
  });

  // Patient statistics calculated live
  const [userStats, setUserStats] = useState({
    total: 0,
    upcoming: 0,
    cancelled: 0
  });

  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [userAppointments, setUserAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Local clinic search
  const [localSearch, setLocalSearch] = useState('');
  
  // Interactive wellness dynamic tip
  const wellnessTips = [
    "Drink at least 3 liters of water today to bolster your immune and cellular cycles.",
    "A 15-minute walk post-lunch significantly boosts focus and balances glucose indexes.",
    "Ensure 30 minutes of natural evening screen wind-down to achieve deep restorative REM cycles.",
    "Routine physicals catch health trends early. Preventative checkups remain your best medicine."
  ];
  const [tipIndex] = useState(() => Math.floor(Math.random() * wellnessTips.length));

  const fetchHomeData = async () => {
    setLoading(true);
    setErrorMsg('');

    // 1. Featured doctors (public directory of approved doctors)
    try {
      const docRes = await api.get('/api/doctors/all');
      if (docRes.data.success && docRes.data.doctors) {
        const sorted = [...docRes.data.doctors].sort((a, b) => b.experience - a.experience);
        setFeaturedDoctors(sorted.slice(0, 3));
        setStats((prev) => ({
          ...prev,
          totalDoctors: docRes.data.count ?? docRes.data.doctors.length,
        }));
      }
    } catch (err) {
      console.warn('Featured doctors unavailable:', err);
    }

    // 2. Platform metrics — only admins can read these; best effort.
    if (isAdmin) {
      try {
        const statsRes = await api.get('/api/dashboard/stats');
        if (statsRes.data.success && statsRes.data.stats) {
          setStats(statsRes.data.stats);
        }
      } catch (err) {
        console.warn('Stats unavailable:', err);
      }
    }

    // 3. A signed-in patient's own appointments
    if (user && !isAdmin) {
      try {
        const aptRes = await api.get('/api/appointments/me');
        if (aptRes.data.success && aptRes.data.appointments) {
          const myApts = aptRes.data.appointments;
          const sortedApts = [...myApts].sort(
            (a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate)
          );
          setUserAppointments(sortedApts);

          const upcoming = myApts.filter((apt) => apt.status === 'Approved' || apt.status === 'Pending').length;
          const cancelled = myApts.filter((apt) => apt.status === 'Cancelled' || apt.status === 'Rejected').length;

          setUserStats({ total: myApts.length, upcoming, cancelled });
        }
      } catch (err) {
        console.warn('Appointments unavailable:', err);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchHomeData();
  }, [user]);

  const handleHomeSearchSubmit = (e) => {
    e.preventDefault();
    if (localSearch.trim()) {
      navigate(`/doctors?search=${encodeURIComponent(localSearch.trim())}`);
    } else {
      navigate('/doctors');
    }
  };

  // Status helper mapping
  const getStatusVisualBadge = (status) => {
    switch (status) {
      case 'Approved':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-100',
          dot: 'bg-emerald-500',
          text: 'Approved Visit'
        };
      case 'Pending':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-100',
          dot: 'bg-amber-500',
          text: 'Under Review'
        };
      case 'Rejected':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-100',
          dot: 'bg-rose-500',
          text: 'Rejected'
        };
      case 'Cancelled':
      default:
        return {
          bg: 'bg-slate-50 text-slate-500 border-slate-100',
          dot: 'bg-slate-400',
          text: 'Cancelled'
        };
    }
  };

  return (
    <div id="homepage-root" className="bg-slate-50 min-h-screen pb-16">
      
      {/* ==================== PANEL 1: CLIENT GUEST OR STUDENT WELCOME HEADLINE ==================== */}
      {/* ==================== PANEL 1: WELCOME HEADLINE ==================== */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 py-16 md:py-24">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-sky-300 to-blue-600 opacity-15 sm:left-[calc(50%-30rem)] sm:w-[72rem]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Promotional Block */}
            <div className="col-span-1 lg:col-span-7 space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                <HeartPulse className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
                24/7 Virtual Healthcare Services
              </span>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-none font-display">
                Your Trusted Partner <br />
                For <span className="text-blue-600 italic">Immediate Care</span>
              </h1>
              
              <p className="text-base text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Connect seamlessly with board-certified specialty medical experts. Create your patient health file to instantly browse wait schedules, book physical appointments, and manage clinical slips securely.
              </p>

              {/* Search Bar directly in Hero for premium usability */}
              <form onSubmit={handleHomeSearchSubmit} className="max-w-md mx-auto lg:mx-0 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-blue-600" />
                  <input 
                    type="text"
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    placeholder="Specialty (e.g., Cardiologist, Gynecologist)..."
                    className="w-full pl-10 pr-3 py-3 text-sm bg-transparent outline-none border-0 text-slate-900 placeholder-slate-400 font-medium"
                  />
                </div>
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-3 px-5 rounded-xl cursor-pointer transition-all shrink-0"
                >
                  Find
                </button>
              </form>
              
              {!user && (
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
                  <Link
                    to="/login"
                    className="px-8 py-4 text-center text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg shadow-blue-200 hover:shadow-xl transition-all cursor-pointer"
                  >
                    Sign In to Portal
                  </Link>
                  <Link
                    to="/register"
                    className="px-8 py-4 text-center text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-all cursor-pointer"
                  >
                    Register New Account
                  </Link>
                </div>
              )}

              {/* Direct Benefits Badges Row */}
              <div className="grid grid-cols-3 gap-4 pt-6 max-w-md mx-auto lg:mx-0 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">100% Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500 shrink-0" />
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Instant Booking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-sky-500 shrink-0" />
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Top Specialists</span>
                </div>
              </div>
            </div>

            {/* Right Teaser Representation Card (Patient dashboard locked visual) */}
            <div className="col-span-1 lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-sm">
                {/* Glowing blobs */}
                <div className="absolute top-0 -left-4 w-72 h-72 bg-sky-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-10 right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob [animation-delay:2s]"></div>
                
                {/* Blurred Lock Screen Card */}
                <div className="relative bg-white border border-slate-200 p-6 rounded-3xl shadow-xl shadow-blue-100/40 space-y-4 overflow-hidden">
                  
                  {/* Simulated locked screen header overlay */}
                  {!user && (
                    <div className="absolute inset-0 bg-white/55 backdrop-blur-xs flex flex-col items-center justify-center text-center p-6 z-10">
                      <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-md border border-slate-100 mb-3 animate-bounce">
                        <Lock className="h-5 w-5" />
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Patient Portal Locked</h4>
                      <p className="text-[11px] text-slate-500 max-w-[200px] mt-1.5 leading-relaxed">
                        Please sign in or register to schedule consultations and view your personal treatment logs.
                      </p>
                      <Link 
                        to="/login" 
                        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-extrabold uppercase tracking-widest rounded-full shadow-md transition-all"
                      >
                        Unlock Now <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  )}

                  {/* Unfocused Background placeholder */}
                  <div className={`space-y-4 ${!user ? 'opacity-35 select-none pointer-events-none' : ''}`}>
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">Clinic Active</span>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                        DR
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-base">Dr. Srimai Patel (MD)</h4>
                        <p className="text-[10px] font-extrabold text-sky-600 uppercase tracking-widest mt-0.5">Gynecologist</p>
                      </div>
                    </div>
                    
                    <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Wait Time</span>
                        <span className="text-slate-705">~15 Minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Reviews</span>
                        <span className="text-slate-700">★★★★★</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==================== PANEL 2: PLATFORM METRICS RIBBON (Always visible/Accented fallback) ==================== */}
      <section className="bg-gradient-to-r from-blue-600 to-sky-500 text-white py-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center text-xs md:text-sm font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 flex-wrap">
          <Stethoscope className="h-5 w-5 animate-pulse shrink-0" />
          <span><strong>Book-A-Doctor:</strong> Medical Scheduler Portal has synced {stats.totalAppointments || 18}+ successful consultations.</span>
        </div>
      </section>

      {/* ==================== PANEL 3: GENERAL STATISTICS DATA ==================== */}
      <section className="py-12 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-5 hover:shadow-md transition-all">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Registered Patients</span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">{stats.totalUsers || 25}+</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-5 hover:shadow-md transition-all">
            <div className="h-12 w-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Board-Certified Doctors</span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">{stats.totalDoctors || 4}+ Specialists</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-5 hover:shadow-md transition-all">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Appointments Booked</span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">{stats.totalAppointments || 18}+</h3>
            </div>
          </div>

        </div>
      </section>

      {/* ==================== PANEL 4: TOP FEATURED SPECIALISTS SCREEN ==================== */}
      <section className="py-12 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display italic">Our Top Specialists</h2>
            <p className="text-sm text-slate-500 mt-1.5 font-medium">Experienced Medical Physicians on duty this week</p>
          </div>
          <Link
            to="/doctors"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline"
          >
            Show All Doctors
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <Loader message="Loading certified specialists list..." />
        ) : featuredDoctors.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-100">
            <p className="text-slate-500 font-medium">No verified doctors are listed yet. Approved doctors will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDoctors.map((doc) => (
              <DoctorCard key={doc._id} doctor={doc} />
            ))}
          </div>
        )}
      </section>

      {/* ==================== PANEL 5: DYNAMIC PROMOTION / ADVICE ACTION FOOTER ==================== */}
      {!user && (
        <section className="py-16 bg-slate-900 text-white select-none">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Ready to consult with a certified physician?
            </h2>
            <p className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed">
              Register an account today, find your desired pediatrician, cardiologist, or neurologist, and schedule your appointment with extreme convenience.
            </p>
            <div className="flex gap-4 justify-center pt-2">
              <Link
                to="/register"
                className="px-6 py-3 font-semibold text-sm text-slate-950 bg-white hover:bg-slate-100 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Get Started Now
              </Link>
              <Link
                to="/doctors"
                className="px-6 py-3 font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all cursor-pointer border border-blue-500"
              >
                View Specialists
              </Link>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
