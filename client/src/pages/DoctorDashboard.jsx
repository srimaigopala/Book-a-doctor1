import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Stethoscope, 
  CheckCircle,
  Clock,
  Ban,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import Loader from '../components/Loader.jsx';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [doctorProfile, setDoctorProfile] = useState(null);
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Doctor Specific Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMsg('');

        // Doctor Profile
        if (user) {
          try {
            const profileRes = await api.get('/api/doctors/me');
            if (profileRes.data.success) {
              setDoctorProfile(profileRes.data.doctor);
            }
          } catch (err) {
            console.warn('Could not fetch doctor profile', err);
          }

          // Doctor Appointments (server already scopes these to this doctor)
          try {
            const aptsRes = await api.get('/api/appointments/doctor');
            if (aptsRes.data.success) {
              setAppointmentsList(aptsRes.data.appointments);
            }
          } catch (err) {
            console.warn('Appointments endpoint unavailable for doctor:', err);
          }
        }
      } catch (err) {
        setErrorMsg('Failed to load dashboard data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.put(`/api/appointments/status/${id}`, { status });
      if (res.data.success) {
        setSuccessMsg(`Appointment marked as ${status}`);
        // Refresh local appointments
        const aptsRes = await api.get('/api/appointments/doctor');
        if (aptsRes.data.success) setAppointmentsList(aptsRes.data.appointments);
        
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg(res.data.message);
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Failed to update status.');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'PT';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return <Loader message="Loading doctor workspace..." fullPage={true} />;
  }

  // ============================================
  // DOCTOR DASHBOARD VIEW ENGINE
  // ============================================
  
  if (doctorProfile?.status === 'pending') {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center bg-slate-50 min-h-[85vh]">
        <Activity className="h-16 w-16 text-teal-500 mb-4 animate-pulse" />
        <h2 className="text-2xl font-bold text-slate-800">Verification Pending</h2>
        <p className="text-slate-500 mt-2 max-w-md">
          Your clinical profile has been submitted and is currently under review by our medical administration team. You will have full access once approved.
        </p>
      </div>
    );
  }

  if (doctorProfile?.status === 'incomplete') {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center bg-slate-50 min-h-[85vh]">
        <Stethoscope className="h-16 w-16 text-teal-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-slate-800">Profile Incomplete</h2>
        <p className="text-slate-500 mt-2 max-w-md">
          Please complete your clinical onboarding to start accepting appointments.
        </p>
        <button
          onClick={() => navigate('/onboarding')}
          className="mt-6 px-6 py-2.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-sm"
        >
          Complete Onboarding
        </button>
      </div>
    );
  }

  if (doctorProfile?.status === 'rejected') {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center bg-slate-50 min-h-[85vh]">
        <Ban className="h-16 w-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Application Not Approved</h2>
        <p className="text-slate-500 mt-2 max-w-md">
          Your application was reviewed but not approved by the administration team. You may update your details and resubmit for review.
        </p>
        <button
          onClick={() => navigate('/onboarding')}
          className="mt-6 px-6 py-2.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-sm"
        >
          Update & Resubmit
        </button>
      </div>
    );
  }

  // Appointments are already scoped to this doctor by the server; just search/filter.
  const assignedAppointments = appointmentsList.filter(apt => {
    const patientName = apt.user?.name || '';
    const matchesSearch = patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (apt.reason || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' ? true : apt.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div id="doctor-dashboard-root" className="bg-slate-50 min-h-[85vh] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Alerts */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-red-800 text-sm font-semibold">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold">
            {successMsg}
          </div>
        )}

        {/* Workspace Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
              <Stethoscope className="h-3.5 w-3.5" /> Clinical Workspace Active
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight font-display">
              Doctor's Desk
            </h1>
            <p className="text-sm text-slate-500 mt-1">Manage your appointments, patient records, and schedule availability.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Patients</p>
              <p className="text-xl font-black text-teal-600">{assignedAppointments.length}</p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search patients or reasons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {['All', 'Pending', 'Approved', 'Cancelled', 'Rejected'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  statusFilter === status
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Clinical Roster List */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/50">
            <h3 className="font-extrabold text-slate-800">My Appointments Roster</h3>
          </div>
          
          {assignedAppointments.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <Stethoscope className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-bold text-slate-600">No records found</p>
              <p className="text-sm mt-1">There are no appointments matching your current filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {assignedAppointments.map(apt => (
                <div key={apt._id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-6 md:items-center justify-between">
                  
                  {/* Patient Info Card */}
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-lg shrink-0 shadow-inner">
                      {getInitials(apt.user?.name)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-extrabold text-slate-900 text-base">{apt.user?.name || 'Unknown Patient'}</h4>
                        {apt.status === 'Pending' && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>}
                        {apt.status === 'Approved' && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                        {(apt.status === 'Cancelled' || apt.status === 'Rejected') && <span className="w-2 h-2 rounded-full bg-rose-500"></span>}
                      </div>
                      {apt.user?.email && (
                        <p className="text-[11px] text-slate-400 font-medium mb-1">{apt.user.email}</p>
                      )}
                      <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                        <span className="font-semibold text-slate-700">Reason:</span> {apt.reason || 'Not specified'}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                          <Clock className="h-3 w-3" /> {apt.appointmentDate} @ {apt.appointmentTime}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-200 px-2 py-0.5 rounded-md">
                          {apt.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="flex flex-row md:flex-col gap-2 shrink-0 border-t border-slate-100 md:border-t-0 pt-4 md:pt-0">
                    {apt.status === 'Pending' ? (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(apt._id, 'Approved')}
                          className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                        >
                          <CheckCircle className="h-4 w-4" /> Approve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(apt._id, 'Rejected')}
                          className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition-colors"
                        >
                          <Ban className="h-4 w-4" /> Reject
                        </button>
                      </>
                    ) : (
                      <div className="flex-1 text-right text-xs font-bold text-slate-400 flex items-center justify-end gap-1 px-2">
                        No actions required
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
