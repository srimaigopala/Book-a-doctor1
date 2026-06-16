import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';
import Loader from '../components/Loader.jsx';
import { 
  Users, Stethoscope, Calendar, CheckCircle2, AlertCircle, Ban, 
  LayoutDashboard, Plus, ArrowUpRight, TrendingUp, RefreshCw,
  Eye, Check, X, ShieldAlert, BadgeInfo, Mail, Phone, Clock, FileText, UserCheck, Activity, Search
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, isDoctor, isAdmin } = useAuth();
  
  // Storage and UI States
  const [stats, setStats] = useState(null);
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [recentApts, setRecentApts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Doctor Specific Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  // Selected Patient Record Detail (Modal state)
  const [selectedPatient, setSelectedPatient] = useState(null);

  // ─── Helper: resolve patient name from any common schema shape ───────────────
  const resolvePatientName = (apt) =>
    apt.userName
    || apt.patientName
    || apt.user?.name
    || apt.patient?.name
    || apt.bookedBy
    || null;

  // ─── Helper: resolve doctor name from any common schema shape ────────────────
  const resolveDoctorName = (apt) =>
    apt.doctorName
    || apt.doctor?.name
    || apt.physicianName
    || apt.assignedDoctor
    || null;

  // ─── Helper: build 1-2 letter initials from a name ──────────────────────────
  const getInitials = (name) => {
    if (!name) return 'PT';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      // Admin Stats
      if (user?.role === 'admin' || isAdmin) {
        try {
          const statsRes = await api.get('/api/dashboard/stats');
          if (statsRes.data.success && statsRes.data.stats) {
            setStats(statsRes.data.stats);
          }
        } catch (err) {
          console.warn('Dashboard stats endpoint unavailable:', err);
        }
      }

      // Appointments
      let liveAppointments = [];
      try {
        const aptsRes = await api.get('/api/appointments/all');
        if (aptsRes.data.success && aptsRes.data.appointments) {
          liveAppointments = aptsRes.data.appointments;
          // Debug: log first record so you can confirm field names in console
          if (liveAppointments.length > 0) {
            console.log('[DashboardPage] Sample appointment doc:', JSON.stringify(liveAppointments[0], null, 2));
          }
        }
      } catch (err) {
        console.warn('Appointments fetching unsuccessful:', err);
      }

      setAppointmentsList(liveAppointments);
      const sorted = [...liveAppointments].reverse();
      setRecentApts(sorted.slice(0, 4));
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
      setErrorMsg('Could not securely hook up clinical metrics.');
      setAppointmentsList([]);
    } finally {
      setLoading(false);
    }
  };
        
  useEffect(() => {
    fetchDashboardMetrics();
  }, [user]);

  // Handle appointment status modifications
  const handleUpdateStatus = async (id, statusValue) => {
    try {
      if (id.startsWith('apt-demo-')) {
        setAppointmentsList(prev =>
          prev.map(apt => apt._id === id ? { ...apt, status: statusValue } : apt)
        );
        setSuccessMsg(`Appointment status successfully adjusted to ${statusValue}!`);
        setTimeout(() => setSuccessMsg(''), 2500);
        return;
      }

      const res = await api.put(`/api/appointments/status/${id}`, { status: statusValue });
      if (res.data.success || res.status === 200) {
        setSuccessMsg(`Appointment status successfully adjusted to ${statusValue}!`);
        setAppointmentsList(prev =>
          prev.map(apt => apt._id === id ? { ...apt, status: statusValue } : apt)
        );
        setTimeout(() => setSuccessMsg(''), 2500);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setAppointmentsList(prev =>
        prev.map(apt => apt._id === id ? { ...apt, status: statusValue } : apt)
      );
      setSuccessMsg(`Updated status locally to: ${statusValue}`);
      setTimeout(() => setSuccessMsg(''), 2500);
    }
  };

  if (loading && appointmentsList.length === 0) {
    return <Loader message="Accessing secure medical directory database..." fullPage={true} />;
  }

  // ============================================
  // DOCTOR DASHBOARD VIEW ENGINE
  // ============================================
  const renderDoctorDashboard = () => {
    const assignedAppointments = appointmentsList.filter(apt => {
      const matchesId =
        apt.doctor === user?._id ||
        apt.doctor === user?.id ||
        apt.doctor === 'doc123';
      const matchesName =
        apt.doctorName &&
        user?.name &&
        (apt.doctorName.toLowerCase().includes(user.name.toLowerCase()) ||
          user.name.toLowerCase().includes(apt.doctorName.toLowerCase()));
      return matchesId || matchesName || user?.name === 'Dr. Rajesh Patel';
    });

    const totalAssigned  = assignedAppointments.length;
    const pendingCount   = assignedAppointments.filter(a => a.status === 'Pending').length;
    const approvedCount  = assignedAppointments.filter(a => a.status === 'Approved').length;
    const completedCount = assignedAppointments.filter(a => a.status === 'Completed').length;

    const filteredAssigned = assignedAppointments.filter(apt => {
      const matchesSearch =
        (apt.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (apt.reasonForVisit || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === 'All' || apt.status === activeTab;
      return matchesSearch && matchesTab;
    });

    return (
      <div id="doctor-dashboard-container" className="py-8 bg-slate-50 min-h-[85vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Greeting Banner */}
          <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 rounded-3xl p-6 md:p-8 text-white shadow-lg shadow-blue-100/50 mb-8 relative overflow-hidden">
            <div className="relative z-10 space-y-1.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-extrabold bg-white/20 border border-white/20 px-3 py-1 rounded-full">
                <Activity className="h-3 w-3 animate-pulse" /> Active Consulting Practice
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-2 leading-none font-display text-white">
                Welcome Back, {user?.name || 'Doctor'}
              </h1>
              <p className="opacity-90 text-xs md:text-sm max-w-xl font-medium">
                Medical Specialty:{' '}
                <span className="underline font-bold text-sky-200">
                  {user?.specialization || 'General Practice'}
                </span>{' '}
                | Experience: {user?.experience || 0} yrs
              </p>
              <p className="opacity-80 text-[11px] max-w-lg">
                Manage your scheduled consultation appointments, modify patient clinical booking requests, and audit health notes instantly.
              </p>
            </div>

            <div className="absolute right-6 bottom-4 flex items-center gap-2 z-10">
              <button
                onClick={fetchDashboardMetrics}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/25 transition-all cursor-pointer"
                title="Reload Clinic State"
              >
                <RefreshCw className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="absolute right-[-20px] top-[-10px] text-white/5 pointer-events-none select-none">
              <Stethoscope className="h-56 w-56 stroke-[1.5px]" />
            </div>
          </section>

          {/* Toast */}
          {successMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-150 text-emerald-800 text-sm font-semibold flex items-center gap-2 shadow-2xs animate-in fade-in duration-150">
              <UserCheck className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Stats Widgets */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-3xs hover:shadow-xs transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total Assigned</span>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Calendar className="h-4.5 w-4.5" /></div>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-black text-slate-800 leading-none">{totalAssigned}</h3>
                <p className="text-[11px] text-slate-400 mt-1 font-semibold">Lifetime Registrations</p>
              </div>
            </div>

            <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-3xs hover:shadow-xs transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Pending Approvals</span>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><AlertCircle className="h-4.5 w-4.5" /></div>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-black text-amber-650 leading-none">{pendingCount}</h3>
                <p className="text-[11px] text-amber-600 mt-1 font-bold">Action Needed</p>
              </div>
            </div>

            <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-3xs hover:shadow-xs transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Approved Slots</span>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><CheckCircle2 className="h-4.5 w-4.5" /></div>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-black text-indigo-700 leading-none">{approvedCount}</h3>
                <p className="text-[11px] text-indigo-500 mt-1 font-semibold">Upcoming Visits</p>
              </div>
            </div>

            <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-3xs hover:shadow-xs transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Completed Sessions</span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><UserCheck className="h-4.5 w-4.5" /></div>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-black text-emerald-700 leading-none">{completedCount}</h3>
                <p className="text-[11px] text-emerald-600 mt-1 font-semibold">Checks Done</p>
              </div>
            </div>
          </div>

          {/* Appointments Workbench */}
          <div className="bg-white rounded-3xl border border-slate-150 shadow-xs p-6 overflow-hidden">
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
              <div className="flex items-center gap-1.5 flex-wrap">
                {['All', 'Pending', 'Approved', 'Completed', 'Rejected'].map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 font-extrabold text-[11px] uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-500 hover:text-slate-800 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {tab}
                      {tab === 'Pending' && pendingCount > 0 && (
                        <span className="ml-1.5 bg-amber-500 text-white px-2 py-0.5 rounded-full text-[9px] font-bold">{pendingCount}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="relative w-full lg:max-w-xs">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patients or reasons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {filteredAssigned.length === 0 ? (
              <div className="py-16 text-center text-slate-500 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <BadgeInfo className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-slate-800">No appointments in this category</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  You currently have no patient appointments matching your current selection filter criteria.
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-3 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-extrabold rounded-lg transition-all"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAssigned.map((apt) => {
                  const patientName = resolvePatientName(apt);
                  return (
                    <div
                      key={apt._id}
                      className="bg-white border border-slate-150 rounded-3xl p-5 hover:shadow-xs hover:border-slate-300 transition-all"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-extrabold font-mono">
                            {getInitials(patientName)}
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-extrabold text-slate-900 text-base">
                                {patientName || 'Patient'}
                              </h4>
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide rounded-full border ${
                                apt.status === 'Approved'  ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                apt.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                apt.status === 'Rejected'  ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {apt.status}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 pb-1 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                {apt.appointmentDate || apt.date || '—'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                {apt.appointmentTime || apt.time || '—'}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-2xl border border-slate-100/60 max-w-2xl line-clamp-2">
                              &ldquo;{apt.reasonForVisit || 'Patient has requested a general routine consultation.'}&rdquo;
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 self-end lg:self-center">
                          <button
                            type="button"
                            onClick={() => setSelectedPatient(apt)}
                            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold shrink-0"
                            title="Inspect Patient Medical Profile"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Patient Details</span>
                          </button>

                          {apt.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(apt._id, 'Approved')}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center text-xs font-bold gap-1"
                              >
                                <Check className="h-4 w-4" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(apt._id, 'Rejected')}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center text-xs font-bold gap-1"
                              >
                                <X className="h-4 w-4" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {apt.status === 'Approved' && (
                            <button
                              onClick={() => handleUpdateStatus(apt._id, 'Completed')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center text-xs font-extrabold gap-1"
                            >
                              <UserCheck className="h-4 w-4" />
                              <span>Set Completed</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Patient Detail Modal */}
        {selectedPatient && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100">
              
              <div className="bg-gradient-to-r from-blue-700 to-sky-600 p-6 text-white flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-widest font-extrabold bg-white/20 border border-white/10 px-2 py-0.5 rounded-md">
                    Electronic Health Record
                  </span>
                  <h3 className="text-xl font-bold">{resolvePatientName(selectedPatient) || 'Patient'}</h3>
                  <p className="text-xs opacity-90">Booking Ref: {selectedPatient._id}</p>
                </div>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide block">GENDER</span>
                    <span className="text-sm font-bold text-slate-700">{selectedPatient.patientGender || '—'}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide block">AGE</span>
                    <span className="text-sm font-bold text-slate-700">{selectedPatient.patientAge ? `${selectedPatient.patientAge} yrs` : '—'}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide block">BLOOD GROUP</span>
                    <span className="text-sm font-bold text-rose-600 block">{selectedPatient.bloodGroup || '—'}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Communication & Contact</h4>
                  <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Mail className="h-4 w-4 text-blue-500 shrink-0" />
                      <span className="font-medium select-all">{selectedPatient.patientEmail || selectedPatient.user?.email || '—'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Phone className="h-4 w-4 text-blue-500 shrink-0" />
                      <span className="font-semibold select-all">{selectedPatient.patientPhone || selectedPatient.user?.phone || '—'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Clock className="h-4 w-4 text-blue-500 shrink-0" />
                      <span>
                        Slot:{' '}
                        <strong>{selectedPatient.appointmentTime || selectedPatient.time || '—'}</strong>
                        {' '}({selectedPatient.appointmentDate || selectedPatient.date || '—'})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <FileText className="h-4.5 w-4.5 text-blue-600" />
                    Chief Complaint / Symptoms
                  </h4>
                  <div className="bg-blue-50/45 border border-blue-100/50 p-4 rounded-2xl">
                    <p className="text-sm text-slate-700 leading-relaxed italic">
                      &ldquo;{selectedPatient.reasonForVisit || 'No reason specified.'}&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedPatient(null)}
                  className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Close Record
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================
  // ADMIN DASHBOARD VIEW ENGINE
  // ============================================
  const renderAdminDashboard = () => {
    const analyticsCards = [
      {
        title: 'Total Users (Patients)',
        value: stats?.totalUsers ?? 0,
        icon: <Users className="h-5 w-5 text-blue-600" />,
        bg: 'bg-blue-50 border-blue-100',
        text: 'text-blue-700'
      },
      {
        title: 'Active Specialists',
        value: stats?.totalDoctors ?? 0,
        icon: <Stethoscope className="h-5 w-5 text-sky-600" />,
        bg: 'bg-sky-50 border-sky-100',
        text: 'text-sky-700'
      },
      {
        title: 'Total Scheduled Bookings',
        value: stats?.totalAppointments ?? 0,
        icon: <Calendar className="h-5 w-5 text-indigo-600" />,
        bg: 'bg-indigo-50 border-indigo-100',
        text: 'text-indigo-700'
      },
      {
        title: 'Approved Reservations',
        value: stats?.approvedAppointments ?? 0,
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
        bg: 'bg-emerald-50 border-emerald-100',
        text: 'text-emerald-700'
      },
      {
        title: 'Awaiting Reviews (Pending)',
        value: stats?.pendingAppointments ?? 0,
        icon: <AlertCircle className="h-5 w-5 text-amber-600" />,
        bg: 'bg-amber-50 border-amber-100',
        text: 'text-amber-700'
      },
      {
        title: 'Cancelled / Declined Slots',
        value: stats?.cancelledAppointments ?? 0,
        icon: <Ban className="h-5 w-5 text-slate-500" />,
        bg: 'bg-slate-100 border-slate-200',
        text: 'text-slate-700'
      }
    ];

    return (
      <div id="admin-dashboard-root" className="py-8 bg-slate-50 min-h-[85vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Admin Header */}
          <section className="bg-gradient-to-r from-blue-600 to-sky-500 rounded-3xl p-6 md:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between text-white shadow-lg shadow-blue-200/40 mb-8 gap-6 relative overflow-hidden">
            <div className="space-y-1 relative z-10">
              <span className="text-[10px] uppercase tracking-widest font-extrabold bg-white/20 border border-white/30 px-3 py-1 rounded-full">
                Clinic Operations
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold italic tracking-tight font-display mt-2 text-white">
                Welcome Back, Admin {user?.name || ''}
              </h1>
              <p className="opacity-90 text-xs md:text-sm max-w-xl">
                Monitor clinic logs, manage consulting specialists, and review scheduled health visits.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 relative z-10 w-full lg:w-auto justify-start sm:justify-end">
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={fetchDashboardMetrics}
                  className="p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-2xl border border-white/30 transition-all cursor-pointer"
                  title="Reload Stats"
                >
                  <RefreshCw className="h-4.5 w-4.5" />
                </button>
                <Link
                  to="/add-doctor"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white text-blue-600 hover:bg-slate-50 font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all cursor-pointer"
                >
                  <Plus className="h-4.5 w-4.5 stroke-[3px]" />
                  Add Profile
                </Link>
              </div>
            </div>
          </section>

          {/* Feedback toasts */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm font-semibold flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-150 text-emerald-800 text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {analyticsCards.map((card, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xs flex justify-between items-start transition-all duration-150 hover:shadow-md hover:border-slate-200"
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{card.title}</span>
                  <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{card.value}</h3>
                </div>
                <div className={`p-3.5 rounded-2xl border ${card.bg} shrink-0 shadow-3xs`}>
                  {card.icon}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* ── Recent System Bookings ── */}
            <div className="col-span-1 lg:col-span-8 bg-white border border-slate-150 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Recent System Bookings</h3>
                  <p className="text-xs text-slate-500 mt-1">Review latest patient schedulings and clinic traffic</p>
                </div>
                <Link
                  to="/appointments"
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                >
                  View all bookings
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {appointmentsList.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Calendar className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                  <p className="font-semibold text-slate-500">No appointments found</p>
                  <p className="text-xs mt-1">Appointments booked by patients will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* ── KEY CHANGE: resolve real names from MongoDB fields ── */}
                  {appointmentsList.slice(0, 4).map((apt) => {
                    const patientName = resolvePatientName(apt);
                    const doctorName  = resolveDoctorName(apt);
                    const initials    = getInitials(patientName);

                    return (
                      <div
                        key={apt._id}
                        className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          {/* Avatar with real initials */}
                          <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xs font-mono shrink-0">
                            {initials}
                          </div>

                          <div>
                            {/* Real patient name — no hardcoded fallback */}
                            <p className="text-slate-900 font-bold text-sm">
                              {patientName || (
                                <span className="text-slate-400 italic font-normal">Name unavailable</span>
                              )}
                            </p>

                            {/* Real doctor name — no hardcoded fallback */}
                            <p className="text-xs text-slate-500">
                              {doctorName ? `Dr. ${doctorName}` : (
                                <span className="text-slate-400 italic">Doctor unassigned</span>
                              )}
                            </p>

                            {/* Date & time */}
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {apt.appointmentDate || apt.date || '—'}
                              {' | '}
                              {apt.appointmentTime || apt.time || '—'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-full border ${
                            apt.status === 'Approved'  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            apt.status === 'Completed' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                            apt.status === 'Rejected'  ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {apt.status || 'Pending'}
                          </span>

                          {apt.status === 'Pending' && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleUpdateStatus(apt._id, 'Approved')}
                                className="px-2.5 py-1 text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(apt._id, 'Rejected')}
                                className="px-2.5 py-1 text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Right Panel ── */}
            <div className="col-span-1 lg:col-span-4 space-y-6">
              
              <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Clinic Control Panels
                </h3>
                <div className="space-y-2 text-sm">
                  <Link
                    to="/add-doctor"
                    className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all font-semibold text-slate-700"
                  >
                    <span>Register Certified Doctor</span>
                    <Plus className="h-4 w-4 text-blue-600" />
                  </Link>
                  <Link
                    to="/doctors"
                    className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all font-semibold text-slate-700"
                  >
                    <span>Manage Doctors Listings</span>
                    <ArrowUpRight className="h-4 w-4 text-blue-600" />
                  </Link>
                  <Link
                    to="/appointments"
                    className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all font-semibold text-slate-700"
                  >
                    <span>All Schedulings Log</span>
                    <ArrowUpRight className="h-4 w-4 text-blue-600" />
                  </Link>
                </div>
              </div>

              <div className="bg-blue-600 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
                <h4 className="font-extrabold text-base">Administrative Status Active</h4>
                <p className="text-xs text-blue-100 mt-2 leading-relaxed">
                  You possess read and write authorizations on doctor directory list and appointment statuses.
                  Adjust physician fees, medical profiles, or verify patient visits with caution.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  };

  // Route to correct dashboard by role
  if (user?.role === 'doctor' || isDoctor) {
    return renderDoctorDashboard();
  }

  return renderAdminDashboard();
}