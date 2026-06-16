import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Stethoscope, Calendar, IndianRupee, Briefcase, ChevronLeft, ShieldCheck, ArrowRight, Clock, ToggleLeft } from 'lucide-react';
import api from '../api/axios.js';
import Loader from '../components/Loader.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function DoctorDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        setLoading(true);
        setErrorMsg('');
        const res = await api.get(`/api/doctors/${id}`);
        if (res.data.success && res.data.doctor) {
          setDoctor(res.data.doctor);
        } else {
          setErrorMsg('Doctor profile details could not be parsed.');
        }
      } catch (err) {
        console.error('Error fetching doctor details:', err);
        setErrorMsg('The requested doctor profile does not exist or is currently offline.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [id]);

  if (loading) {
    return <Loader message="Retrieving practitioner credentials from clinic..." fullPage={true} />;
  }

  if (errorMsg || !doctor) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-150 shadow-sm space-y-4">
          <p className="text-red-650 font-semibold text-slate-800">{errorMsg || 'Doctor details unavailable.'}</p>
          <Link
            to="/doctors"
            className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline"
          >
            <ChevronLeft className="h-5 w-5" /> Back to specialists directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div id="doctor-details-root" className="py-10 bg-slate-50 min-h-[85vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Breadcrumb Back Button */}
        <button
          onClick={() => navigate('/doctors')}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-650 hover:text-blue-600 mb-6 cursor-pointer"
        >
          <ChevronLeft className="h-4.5 w-4.5" /> Back to Physicians
        </button>

        {/* Profile Card Block */}
        <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12">
          
          {/* Avatar side */}
          <div className="col-span-1 md:col-span-4 bg-gradient-to-tr from-slate-900 to-blue-900 p-8 flex flex-col items-center justify-center text-center text-white">
            <div className="h-24 w-24 rounded-2xl bg-white/10 backdrop-blur-md outline-hidden border border-white/20 flex items-center justify-center font-extrabold text-3xl mb-4">
              {doctor.name ? doctor.name.split(' ').map(n => n[0]).join('').substring(0, 3).toUpperCase() : 'DR'}
            </div>
            <h2 className="text-xl font-bold">{doctor.name}</h2>
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-305 text-sky-300 bg-sky-950/55 px-2.5 py-0.5 rounded-md mt-1.5 border border-sky-900">
              {doctor.specialization}
            </span>
          </div>

          {/* Details side */}
          <div className="col-span-1 md:col-span-8 p-6 md:p-8 space-y-6">
            
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="inline-block text-xs font-bold uppercase tracking-wider text-slate-400">Clinical Background</span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">Medical Specialist Credentials</h3>
              </div>
              {/* Doctor Availability Indicator */}
              <div>
                {doctor.available ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                    Available on Duty
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                    Off duty / Unavailable
                  </span>
                )}
              </div>
            </div>

            {/* Grid of stats */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-450 uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400" /> Professional Experience
                </span>
                <p className="text-base font-bold text-slate-900">{doctor.experience} Years Active Practice</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-450 uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <span className="text-slate-400 font-bold">₹</span> Consulting Service Fee
                </span>
                <p className="text-base font-bold text-slate-900">₹{doctor.fees} / consultation</p>
              </div>

            </div>

            {/* Clinical highlights info list */}
            <div className="space-y-3.5 pt-2 text-sm text-slate-650 text-slate-600">
              <div className="flex gap-2.5 items-start">
                <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <p><strong>Clinical Auditing:</strong> Board-certified specialist equipped to manage advanced medical diagnoses, chronic condition treatment, and general clinical triage.</p>
              </div>
              <div className="flex gap-2.5 items-start">
                <Clock className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <p><strong>Appointment Windows:</strong> Bookings require advance request. Schedule approvals are typically processed within 30 minutes by clinical administrators.</p>
              </div>
            </div>

            {/* Book Now trigger line */}
            <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-450 text-slate-500">Scheduled Consulting Hours</p>
                <p className="text-sm font-bold text-slate-800">Monday &ndash; Saturday, 09:00 AM &ndash; 05:30 PM</p>
              </div>

              {doctor.available ? (
                <Link
                  to={`/book-appointment/${doctor._id}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md cursor-pointer transition-colors"
                >
                  Book Appointment Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-300 text-slate-600 font-bold text-sm rounded-xl cursor-not-allowed"
                >
                  Doctor Temporarily Unavailable
                </button>
              )}
            </div>

          </div>

        </div>

        {/* Administration quick trigger if Admin */}
        {isAdmin && (
          <div className="mt-6 p-4 rounded-2xl bg-purple-50 text-purple-800 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
            <p><strong>Administrative Portal Shortcuts:</strong> You own permissions to adjust medical service pricing and availability parameters.</p>
            <Link
              to={`/edit-doctor/${doctor._id}`}
              className="text-purple-700 hover:text-purple-900 border border-purple-300 hover:border-purple-400 px-3.5 py-1.5 rounded-xl font-bold bg-white text-xs whitespace-nowrap self-start sm:self-center"
            >
              Configure Doctor Profile
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
