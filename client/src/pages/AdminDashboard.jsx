import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Stethoscope,
  Users,
  Calendar,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import Loader from '../components/Loader.jsx';

export default function AdminDashboard() {
  const { user } = useAuth();
  
  const [stats, setStats] = useState(null);
  const [recentApts, setRecentApts] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        setErrorMsg('');

        const statsRes = await api.get('/api/dashboard/stats');
        if (statsRes.data.success && statsRes.data.stats) {
          setStats(statsRes.data.stats);
        }
        
        const pendingRes = await api.get('/api/admin/pending-doctors');
        if (pendingRes.data.success) {
          setPendingDoctors(pendingRes.data.doctors || []);
        }

        const logsRes = await api.get('/api/admin/audit-logs');
        if (logsRes.data.success) {
          setAuditLogs(logsRes.data.logs || []);
        }

        // Fetch recent appointments for admin view
        const aptsRes = await api.get('/api/appointments/all');
        if (aptsRes.data.success) {
          const sorted = aptsRes.data.appointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setRecentApts(sorted.slice(0, 5));
        }

      } catch (err) {
        console.warn('Dashboard admin endpoints unavailable:', err);
        setErrorMsg('Could not fetch all administrative data.');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  const handleApproveDoctor = async (doctorId) => {
    try {
      const res = await api.put(`/api/admin/approve-doctor/${doctorId}`);
      if (res.data.success) {
        setPendingDoctors(prev => prev.filter(d => d._id !== doctorId));
        setSuccessMsg('Doctor approved successfully.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setErrorMsg('Failed to approve doctor.');
    }
  };

  const handleRejectDoctor = async (doctorId) => {
    if (!window.confirm("Are you sure you want to reject and remove this doctor application?")) return;
    try {
      const res = await api.put(`/api/admin/reject-doctor/${doctorId}`);
      if (res.data.success) {
        setPendingDoctors(prev => prev.filter(d => d._id !== doctorId));
        setSuccessMsg('Doctor application rejected.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setErrorMsg('Failed to reject doctor.');
    }
  };

  if (loading) {
    return <Loader message="Compiling system metrics..." fullPage={true} />;
  }

  return (
    <div id="admin-dashboard-root" className="bg-slate-50 min-h-[85vh] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
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

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
              System Admin Active
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight font-display">
              Management Command
            </h1>
            <p className="text-sm text-slate-500 mt-1">Global oversight of clinic activity, personnel, and records.</p>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Users className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Patients</span>
            </div>
            <p className="text-3xl font-black text-slate-900">{stats?.totalPatients || 0}</p>
          </div>
          
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                <Stethoscope className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Doctors</span>
            </div>
            <p className="text-3xl font-black text-slate-900">{stats?.totalDoctors || 0}</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Calendar className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bookings</span>
            </div>
            <p className="text-3xl font-black text-slate-900">{stats?.totalAppointments || 0}</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Activity className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today</span>
            </div>
            <p className="text-3xl font-black text-slate-900">{stats?.todayAppointments || 0}</p>
          </div>
        </div>

        {/* Mid Section layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Activity Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Appointments */}
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
              <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-extrabold text-slate-800">Latest Platform Activity</h3>
                <Link to="/appointments" className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest">
                  View All
                </Link>
              </div>
              <div className="divide-y divide-slate-100">
                {recentApts.length === 0 ? (
                  <p className="p-8 text-center text-slate-500 text-sm">No recent appointments found.</p>
                ) : (
                  recentApts.map(apt => (
                    <div key={apt._id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="text-sm font-extrabold text-slate-900">{apt.user?.name || 'Unknown Patient'}</p>
                        <p className="text-xs text-slate-500 font-medium">with {apt.doctor?.name || 'Unknown'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{apt.appointmentDate}</p>
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          apt.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                          apt.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="font-extrabold text-slate-800 mb-4">Quick Links</h3>
              <div className="space-y-3">
                <Link
                  to="/doctors"
                  className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all font-semibold text-slate-700"
                >
                  <span>Browse Verified Doctors</span>
                  <ArrowUpRight className="h-4 w-4 text-blue-600" />
                </Link>
                <Link
                  to="/appointments"
                  className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all font-semibold text-slate-700"
                >
                  <span>All Bookings Log</span>
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

        {/* ── Pending Doctors & Audit Logs Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          
          {/* Pending Doctors */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col max-h-[500px]">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-4 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Pending Doctor Applications</h3>
                <p className="text-xs text-slate-500 mt-1">Review and approve new clinical staff</p>
              </div>
            </div>

            {pendingDoctors.length === 0 ? (
              <div className="py-12 text-center text-slate-400 flex-grow flex flex-col items-center justify-center">
                <Stethoscope className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                <p className="font-semibold text-slate-500">No Pending Applications</p>
              </div>
            ) : (
              <div className="overflow-y-auto pr-2 space-y-4">
                {pendingDoctors.map((doc) => (
                  <div key={doc._id} className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <p className="text-slate-900 font-bold text-sm">Dr. {doc.name}</p>
                        {doc.userId?.email && (
                          <p className="text-[10px] text-slate-400 mt-0.5">{doc.userId.email}</p>
                        )}
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">{doc.specialization} • {doc.experience} yrs exp</p>
                        <p className="text-[10px] text-slate-400 mt-1">Consultation Fee: ₹{doc.fees}</p>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button
                          onClick={() => handleApproveDoctor(doc._id)}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectDoctor(doc._id)}
                          className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audit Logs */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col max-h-[500px]">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-4 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-900">System Audit Logs</h3>
                <p className="text-xs text-slate-500 mt-1">Recent platform activity and security events</p>
              </div>
            </div>

            {auditLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 flex-grow flex flex-col items-center justify-center">
                <Activity className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                <p className="font-semibold text-slate-500">No Logs Available</p>
              </div>
            ) : (
              <div className="overflow-y-auto pr-2 space-y-3">
                {auditLogs.map((log) => (
                  <div key={log._id} className="text-sm bg-slate-50 border border-slate-100 p-3 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded text-indigo-700 bg-indigo-100 uppercase">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700">{log.details}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
