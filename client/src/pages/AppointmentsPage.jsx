import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import AppointmentCard from '../components/AppointmentCard.jsx';
import Loader from '../components/Loader.jsx';
import { CalendarCheck2, Search, Filter, ShieldCheck, Inbox } from 'lucide-react';

export default function AppointmentsPage() {
  const { user, isAdmin } = useAuth();
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Filtering and Searching
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchAppointmentsList = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.get('/api/appointments/all');
      if (res.data.success && res.data.appointments) {
        setAppointments(res.data.appointments);
      } else {
        setAppointments([]);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setErrorMsg('Could not fetch clinical appointments directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointmentsList();
  }, []);

  // Update Status Action (Admin only)
  const handleUpdateStatus = async (id, statusValue) => {
    try {
      const res = await api.put(`/api/appointments/status/${id}`, { status: statusValue });
      if (res.data.success || res.status === 200) {
        setSuccessMsg(`Appointment status successfully set to: ${statusValue}`);
        
        // Update local state instantly
        setAppointments(prev => prev.map(apt => 
          apt._id === id ? { ...apt, status: statusValue } : apt
        ));

        setTimeout(() => setSuccessMsg(''), 2500);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setErrorMsg('Could not update appointment status.');
    }
  };

  // Cancel Appointment Action (User or Admin)
  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled appointment slot?')) {
      return;
    }
    try {
      const res = await api.put(`/api/appointments/cancel/${id}`);
      if (res.data.success || res.status === 200) {
        setSuccessMsg('Your appointment slot has been successfully cancelled.');
        
        // Update local state instantly to visual Cancelled
        setAppointments(prev => prev.map(apt => 
          apt._id === id ? { ...apt, status: 'Cancelled' } : apt
        ));

        setTimeout(() => setSuccessMsg(''), 2500);
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setErrorMsg('Could not process the cancellation request.');
    }
  };

  // Segregate appointments based on current authenticated patient session vs admin dashboard access
  const visibleAppointments = appointments.filter((apt) => {
  if (!isAdmin) {
    return (
      apt.user?._id === user?._id ||
      apt.user?._id === user?.id
    );
  }
  return true;
});

  // Apply search query and status filter on visible listings
 const filteredAppointments = visibleAppointments.filter((apt) => {
  const matchesSearch =
    (apt.doctor?.name || '')
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
    (apt.user?.name || '')
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

  const matchesStatus =
    statusFilter === 'All' ||
    apt.status === statusFilter;

  return matchesSearch && matchesStatus;
});

  // Quick statuses lists
  const statusBadges = ['All', 'Pending', 'Approved', 'Rejected', 'Cancelled'];

  return (
    <div id="appointments-page-root" className="py-8 bg-slate-50 min-h-[85vh]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Header Title Grid */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <CalendarCheck2 className="h-7.5 w-7.5 text-blue-600" />
              {isAdmin ? 'Clinic Bookings Registry' : 'My Clinical Appointments'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {isAdmin 
                ? 'Clinical Admin View: Manage approvals, completions, and scheduling conflicts.' 
                : 'Patient Portal: Track your upcoming specialist checkups and reservation history.'}
            </p>
          </div>
        </div>

        {/* Messaging Toasts */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-150 text-red-700 text-sm font-semibold">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-150 text-emerald-850 text-emerald-800 text-sm font-semibold">
            ✓ {successMsg}
          </div>
        )}

        {/* Searching and Filter Tabs row */}
        <div className="bg-white border border-slate-150 p-4 rounded-2xl shadow-3xs mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAdmin ? "Search by doctor or patient name..." : "Search appointments by doctor name..."}
                className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap pt-1.5 border-t border-slate-50">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-2 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Quick Filter Status:
            </span>
            {statusBadges.map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 font-semibold text-xs rounded-full border transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-650 text-slate-700 border-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Main Appointment Items Grid layout */}
        {loading ? (
          <Loader message="Accessing calendar registry charts..." />
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-white border border-slate-150 rounded-2xl p-16 text-center shadow-3xs">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400 mb-3">
              <Inbox className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">No scheduled consultations found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              {isAdmin 
                ? 'No active appointments in the directory registry matching the selected filters.' 
                : 'You have not booked any specialist visits yet.'}
            </p>
            {!isAdmin && (
              <button
                onClick={() => navigate('/doctors')}
                className="mt-4 px-4 py-2 font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs cursor-pointer"
              >
                Book Your First Visit
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((apt) => (
              <AppointmentCard
                key={apt._id}
                appointment={apt}
                onStatusChange={handleUpdateStatus}
                onCancel={handleCancelAppointment}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}