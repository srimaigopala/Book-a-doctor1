import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';
import { ChevronLeft, Calendar, Clock, Stethoscope, CheckCircle, ShieldAlert, ArrowRight } from 'lucide-react';
import Loader from '../components/Loader.jsx';

export default function BookAppointmentPage() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [doctorsList, setDoctorsList] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctorId || '');
  const [selectedDocDetails, setSelectedDocDetails] = useState(null);
  
  // Form fields
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('10:00 AM'); // Default slot
  const [reason, setReason] = useState('');

  // UI state
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Pre-configured clinic consultation time slots
  const timeSlots = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM'
  ];

  // Fetch doctors on mount
  useEffect(() => {
    const fetchDoctorsData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/doctors/all');
        if (res.data.success && res.data.doctors) {
          // Keep only available doctors for scheduling
          const activeDocs = res.data.doctors.filter(d => d.available);
          setDoctorsList(activeDocs);
          
          if (doctorId) {
            const match = activeDocs.find(d => d._id === doctorId);
            if (match) setSelectedDocDetails(match);
          }
        }
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setErrorMsg('Could not fetch active doctor calendars. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorsData();
  }, [doctorId]);

  // Handle doctor lookup change in dropdown
  useEffect(() => {
    if (selectedDoctorId && doctorsList.length > 0) {
      const match = doctorsList.find(d => d._id === selectedDoctorId);
      setSelectedDocDetails(match || null);
    } else {
      setSelectedDocDetails(null);
    }
  }, [selectedDoctorId, doctorsList]);

  // Set minimum date to today's date
  const getTodayDateString = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const yyyy = today.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      setErrorMsg('Please select a health specialist for your appointment.');
      return;
    }
    if (!appointmentDate) {
      setErrorMsg('Please select a booking date.');
      return;
    }
    if (!appointmentTime) {
      setErrorMsg('Please select a preferred consulting time slot.');
      return;
    }
    if (!reason.trim()) {
      setErrorMsg('Please describe the reason for your visit so the doctor can review it.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // The patient is taken from the auth token on the server, never sent from here.
      const payload = {
        doctor: selectedDoctorId,
        appointmentDate,
        appointmentTime,
        reason: reason.trim()
      };

      const res = await api.post('/api/appointments/book', payload);
      if (res.data.success || res.status === 200 || res.status === 201) {
        setSuccessMsg(`Your appointment with ${selectedDocDetails?.name || 'the doctor'} has been successfully registered!`);
        setTimeout(() => {
          navigate('/appointments');
        }, 1500);
      } else {
        setErrorMsg(res.data.message || 'The clinic calendar could not schedule this slot. Please try another date/time.');
      }
    } catch (err) {
      console.error('Error booking appointment:', err);
      setErrorMsg(err.response?.data?.message || 'The slot could not be booked. Clinical scheduling system returned an error.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader message="Accessing specialist calendars..." fullPage={true} />;
  }

  return (
    <div id="booking-page-root" className="py-10 bg-slate-50 min-h-[85vh]">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        
        {/* Back navigation */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.25 text-sm font-semibold text-slate-600 hover:text-blue-600 mb-6 cursor-pointer"
        >
          <ChevronLeft className="h-4.5 w-4.5" /> Back to Profile
        </button>

        {/* Core block containing booking form */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
          
          {/* Header */}
          <div className="border-b border-slate-100 pb-5 mb-6 text-center sm:text-left">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center sm:justify-start gap-2">
              <Calendar className="h-6 w-6 text-blue-600 shrink-0" />
              Schedule Doctor Consultation
            </h1>
            <p className="text-sm text-slate-500 mt-1">Book an appointment for on-duty diagnostic consulting.</p>
          </div>

          {/* Feedback banners */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-red-700 text-red-700 text-sm font-semibold flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
              <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Booking Form */}
          <form onSubmit={handleBookingSubmit} className="space-y-6">
            
            {/* 1. Doctor Selection Dropdown */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Select Specialist Clinician</label>
              <div className="relative">
                <Stethoscope className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <select
                  disabled={!!doctorId}
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full pl-10.5 pr-4 py-3 text-sm bg-slate-50 disabled:bg-slate-100/80 disabled:cursor-not-allowed text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-all cursor-pointer"
                >
                  <option value="">-- Choose target physician --</option>
                  {doctorsList.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.name} - {doc.specialization} (Fee: ₹{doc.fees})
                    </option>
                  ))}
                </select>
              </div>
              {doctorId && (
                <p className="text-[11px] text-slate-400 text-emerald-600 font-semibold mt-1">✓ Lock set on: {selectedDocDetails?.name || 'Practitioner'}</p>
              )}
            </div>

            {/* Specialist Profile Snip */}
            {selectedDocDetails && (
              <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 flex items-center gap-4.5">
                <div className="h-11 w-11 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  DR
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{selectedDocDetails.name}</h4>
                  <div className="flex gap-2.5 text-xs text-slate-500 text-slate-600 flex-wrap">
                    <span className="font-semibold text-blue-700 uppercase">{selectedDocDetails.specialization}</span>
                    <span>&bull;</span>
                    <span>{selectedDocDetails.experience} Years Active Practice</span>
                    <span>&bull;</span>
                    <span className="font-bold text-slate-900">Fee: ₹{selectedDocDetails.fees}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Date Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Preferred Consultation Date</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  required
                  min={getTodayDateString()}
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full pl-10.5 pr-4 py-3 text-sm bg-slate-50 text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-all"
                />
              </div>
            </div>

            {/* 3. Time Slots */}
            <div className="space-y-3.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Select Available Time Slot</label>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((slot) => {
                  const isSelected = appointmentTime === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setAppointmentTime(slot)}
                      className={`py-2 px-1 text-center font-bold text-xs rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Reason for visit */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Reason for Visit</label>
              <textarea
                required
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly describe your symptoms or the reason for this consultation..."
                className="w-full px-4 py-3 text-sm bg-slate-50 text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"
              />
              <p className="text-[11px] text-slate-400">This is shared with the doctor to help them review your request.</p>
            </div>

            {/* Submit Action */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? 'Scheduling consultation...' : 'Proceed with Booking'}
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}
