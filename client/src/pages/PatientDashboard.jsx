import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Stethoscope, 
  Calendar, 
  Plus, 
  Sparkles, 
  ChevronRight
} from 'lucide-react';
import Loader from '../components/Loader.jsx';

export default function PatientDashboard() {
  const { user } = useAuth();
  
  const [userStats, setUserStats] = useState({
    total: 0,
    upcoming: 0,
    cancelled: 0
  });

  const [userAppointments, setUserAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const wellnessTips = [
    "Drink at least 3 liters of water today to bolster your immune and cellular cycles.",
    "A 15-minute walk post-lunch significantly boosts focus and balances glucose indexes.",
    "Ensure 30 minutes of natural evening screen wind-down to achieve deep restorative REM cycles.",
    "Routine physicals catch health trends early. Preventative checkups remain your best medicine."
  ];
  const [tipIndex] = useState(() => Math.floor(Math.random() * wellnessTips.length));

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        if (user) {
          const aptRes = await api.get('/api/appointments/me');
          if (aptRes.data.success && aptRes.data.appointments) {
            const myApts = aptRes.data.appointments;
            const sortedApts = [...myApts].sort((a, b) => {
              return new Date(b.appointmentDate) - new Date(a.appointmentDate);
            });
            
            setUserAppointments(sortedApts);

            const upcoming = myApts.filter(apt => apt.status === 'Approved' || apt.status === 'Pending').length;
            const cancelled = myApts.filter(apt => apt.status === 'Cancelled' || apt.status === 'Rejected').length;
            
            setUserStats({
              total: myApts.length,
              upcoming,
              cancelled
            });
          }
        }
      } catch (err) {
        console.error('Error fetching patient data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [user]);

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

  if (loading) {
    return <Loader message="Loading your health dashboard..." />;
  }

  return (
    <div id="patient-dashboard-root" className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Sleek Theme Welcome Banner Section Component */}
        <div className="bg-gradient-to-r from-blue-600 to-sky-500 rounded-3xl p-6 md:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between text-white shadow-lg shadow-blue-200/40 gap-6 relative overflow-hidden mb-10">
          
          <div className="space-y-1.5 relative z-10">
            <span className="text-[10px] uppercase tracking-widest font-black bg-white/20 border border-white/30 px-3 py-1 rounded-full text-white">
              Interactive Patient Desk
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold italic tracking-tight font-display mt-2 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-yellow-300 fill-yellow-300 animate-pulse shrink-0" />
              Welcome back, {user?.name || 'Valued Patient'}
            </h1>
            <p className="opacity-90 text-xs md:text-sm max-w-xl font-medium">
              We've calculated your clinic records. Review upcoming specialist appointments, search online wait times, or request new consultations.
            </p>

            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/15 rounded-xl px-4 py-2 text-xs mt-3 max-w-md">
              <span className="font-extrabold text-yellow-300 uppercase tracking-widest shrink-0">Daily Advice:</span>
              <span className="opacity-95 text-[11px] leading-snug">{wellnessTips[tipIndex]}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 relative z-10 w-full lg:w-auto justify-start sm:justify-end">
            <div className="bg-white/15 backdrop-blur px-5 py-3 rounded-2xl text-center border border-white/25 flex-1 sm:flex-initial min-w-[110px]">
              <p className="text-[9px] uppercase tracking-widest font-black opacity-80">Total Visits</p>
              <p className="text-xl md:text-3xl font-black mt-0.5">{userStats.total}</p>
            </div>
            
            <div className="bg-white/15 backdrop-blur px-5 py-3 rounded-2xl text-center border border-white/25 flex-1 sm:flex-initial min-w-[110px]">
              <p className="text-[9px] uppercase tracking-widest font-black opacity-85 text-emerald-300">Upcoming</p>
              <p className="text-xl md:text-3xl font-black text-emerald-300 mt-0.5">{userStats.upcoming}</p>
            </div>

            <div className="bg-white/15 backdrop-blur px-5 py-3 rounded-2xl text-center border border-white/25 flex-1 sm:flex-initial min-w-[110px]">
              <p className="text-[9px] uppercase tracking-widest font-black opacity-85 text-rose-300">Cancelled</p>
              <p className="text-xl md:text-3xl font-black text-rose-300 mt-0.5 text-rose-300">{userStats.cancelled}</p>
            </div>
          </div>
          
          <div className="absolute right-[-10px] bottom-[-20px] text-white/5 pointer-events-none select-none">
            <Stethoscope className="h-52 w-52 stroke-[1px]" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Link 
            to="/doctors" 
            className="bg-white hover:bg-blue-600 hover:text-white border border-slate-100 hover:border-blue-600 p-6 rounded-3xl shadow-xs flex justify-between items-center group transition-all duration-200 cursor-pointer"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 group-hover:text-white group-hover:opacity-85">Appointment booking</span>
              <h4 className="text-lg font-extrabold text-slate-900 group-hover:text-white leading-tight">Book New Visit</h4>
              <p className="text-xs text-slate-500 group-hover:text-blue-100 font-medium">Select specialists, slot times, or consults.</p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-white/25 group-hover:text-white shrink-0 shadow-xs">
              <Plus className="h-5 w-5 stroke-[3px]" />
            </div>
          </Link>

          <Link 
            to="/appointments" 
            className="bg-white hover:bg-blue-600 hover:text-white border border-slate-100 hover:border-blue-600 p-6 rounded-3xl shadow-xs flex justify-between items-center group transition-all duration-200 cursor-pointer"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 group-hover:text-white group-hover:opacity-85">Personal Planner</span>
              <h4 className="text-lg font-extrabold text-slate-900 group-hover:text-white leading-tight">View My Bookings</h4>
              <p className="text-xs text-slate-500 group-hover:text-blue-100 font-medium">Track approvals, consult slips, and cancel slots.</p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-white/25 group-hover:text-white shrink-0 shadow-xs">
              <Calendar className="h-5 w-5" />
            </div>
          </Link>

          <Link 
            to="/doctors" 
            className="bg-white hover:bg-blue-600 hover:text-white border border-slate-100 hover:border-blue-600 p-6 rounded-3xl shadow-xs flex justify-between items-center group transition-all duration-200 cursor-pointer"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 group-hover:text-white group-hover:opacity-85">Verified Directory</span>
              <h4 className="text-lg font-extrabold text-slate-900 group-hover:text-white leading-tight">Browse Doctors</h4>
              <p className="text-xs text-slate-500 group-hover:text-blue-100 font-medium">Check pediatricians, cardiologists, and neurologists.</p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-white/25 group-hover:text-white shrink-0 shadow-xs">
              <Stethoscope className="h-5 w-5" />
            </div>
          </Link>

        </div>

        {userAppointments.length > 0 ? (
          <div className="mt-10 border-t border-slate-100 pt-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Active Treatment Timelines</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">Live tracking status of your recent appointment reservation slips</p>
              </div>
              <Link 
                to="/appointments" 
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider"
              >
                View All Registry <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userAppointments.slice(0, 2).map((apt) => {
                const statusConfig = getStatusVisualBadge(apt.status);
                return (
                  <div key={apt._id} className="bg-white border border-slate-100 p-5 rounded-3xl shadow-xs hover:shadow-sm transition-all space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm">{apt.doctor?.name || 'General Practice Specialist'}</h4>
                          <p className="text-[11px] text-slate-500 font-medium">{apt.appointmentDate} • {apt.appointmentTime}</p>
                        </div>
                      </div>
                      
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-extrabold rounded-full border ${statusConfig.bg}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`}></span>
                        {statusConfig.text}
                      </span>
                    </div>

                    <div className="pt-2">
                      <div className="relative flex items-center justify-between text-[11px] font-bold text-slate-500 tracking-tight select-none">
                        <div className="absolute left-0 right-0 top-1.5 h-0.5 bg-slate-200 -z-0"></div>
                        
                        <div className="flex flex-col items-center gap-1.5 relative z-10">
                          <span className="h-4.5 w-4.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-black">✓</span>
                          <span className="text-[10px] uppercase text-emerald-600 font-extrabold">Registered</span>
                        </div>

                        <div className="flex flex-col items-center gap-1.5 relative z-10">
                          <span className={`h-4.5 w-4.5 rounded-full flex items-center justify-center text-[9px] font-black ${
                            apt.status === 'Approved' || apt.status === 'Rejected'
                              ? 'bg-emerald-500 text-white'
                              : apt.status === 'Pending'
                              ? 'bg-blue-600 text-white animate-pulse'
                              : 'bg-slate-200 text-slate-400'
                          }`}>
                            {apt.status === 'Approved' || apt.status === 'Rejected' ? '✓' : '●'}
                          </span>
                          <span className={`text-[10px] uppercase font-extrabold ${
                            apt.status === 'Pending' ? 'text-blue-600 font-black' : 'text-slate-400'
                          }`}>Reviewed</span>
                        </div>

                        <div className="flex flex-col items-center gap-1.5 relative z-10">
                          <span className={`h-4.5 w-4.5 rounded-full flex items-center justify-center text-[9px] font-black ${
                            apt.status === 'Approved'
                              ? 'bg-emerald-500 text-white'
                              : apt.status === 'Rejected' || apt.status === 'Cancelled'
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-200 text-slate-400'
                          }`}>
                            {apt.status === 'Approved' ? '✓' : (apt.status === 'Rejected' || apt.status === 'Cancelled') ? '✕' : '○'}
                          </span>
                          <span className={`text-[10px] uppercase font-extrabold ${
                            apt.status === 'Approved' ? 'text-emerald-600' : (apt.status === 'Rejected' || apt.status === 'Cancelled') ? 'text-rose-600' : 'text-slate-400'
                          }`}>
                            {apt.status === 'Approved' ? 'Approved' : (apt.status === 'Rejected' || apt.status === 'Cancelled') ? 'Closed' : 'Ready'}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-10 py-10 bg-white border border-slate-100 rounded-3xl text-center shadow-xs">
             <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-3" />
             <h3 className="font-extrabold text-slate-900 text-lg">No appointments yet</h3>
             <p className="text-slate-500 text-sm mt-1 mb-4">You haven't scheduled any clinical visits.</p>
             <Link to="/doctors" className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-md transition-all hover:bg-blue-700">
               Book Your First Visit
             </Link>
          </div>
        )}

      </div>
    </div>
  );
}
