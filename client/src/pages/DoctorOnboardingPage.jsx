import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';
import { Stethoscope, Briefcase, CheckCircle, ShieldAlert, Activity } from 'lucide-react';
import Loader from '../components/Loader.jsx';

export default function DoctorOnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Form Fields State
  const [specialization, setSpecialization] = useState('General Physician');
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [experience, setExperience] = useState('');
  const [fees, setFees] = useState('');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Standard specialties
  const standardSpecialties = [
    'General Physician',
    'Cardiologist',
    'Pediatrician',
    'Dermatologist',
    'Neurologist',
    'Orthopedic',
    'Gynecologist',
    'Other'
  ];

  useEffect(() => {
    // Check if the doctor is already pending or approved
    const checkStatus = async () => {
      try {
        const res = await api.get('/api/doctors/me');
        if (res.data.success) {
          if (res.data.doctor.status === 'pending' || res.data.doctor.status === 'approved') {
            navigate('/doctor-dashboard');
          } else {
            setLoading(false);
          }
        }
      } catch (err) {
        // If 404, it means they are newly registered and haven't onboarded, so show the form.
        setLoading(false);
      }
    };
    if (user && user.role === 'doctor') {
      checkStatus();
    } else if (user && user.role !== 'doctor') {
      navigate('/patient-dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const finalSpecialization = specialization === 'Other' ? customSpecialty.trim() : specialization;
    if (!finalSpecialization) {
      setErrorMsg('Please enter your medical field specialization.');
      return;
    }

    if (!experience || parseInt(experience) < 0) {
      setErrorMsg('Please enter a valid amount of clinical experience years.');
      return;
    }

    if (!fees || parseInt(fees) < 0) {
      setErrorMsg('Please specify consulting service fees.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        specialization: finalSpecialization,
        experience: parseInt(experience, 10),
        fees: parseInt(fees, 10)
      };

      const res = await api.post('/api/doctors/onboarding', payload);

      if (res.data.success || res.status === 200 || res.status === 201) {
        setSuccessMsg('Onboarding submitted successfully! Redirecting to dashboard...');
        
        setTimeout(() => {
          navigate('/doctor-dashboard');
        }, 2000);
      } else {
        setErrorMsg(res.data.message || 'Could not submit details. Try again.');
      }
    } catch (err) {
      console.error('Error submitting onboarding:', err);
      setErrorMsg(err.response?.data?.message || 'Server rejected submission. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader message="Checking profile status..." fullPage={true} />;
  }

  return (
    <div id="doctor-onboarding-root" className="py-10 bg-slate-50 min-h-[85vh] flex items-center justify-center">
      <div className="max-w-xl w-full mx-auto px-4 sm:px-6">
        
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xl relative overflow-hidden">
          
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-teal-600" />

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl mb-4 bg-teal-50 text-teal-600 border border-teal-200 shadow-sm">
              <Activity className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display">
              Complete Your Profile
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Welcome, Dr. {user?.name?.replace('Dr. ', '')}! Please provide your clinical details to complete your registration.
            </p>
          </div>

          {/* Feedback alerts */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-red-800 text-sm font-semibold flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
              <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Specialization Selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">Clinical Specialty</label>
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-4 py-3.5 text-sm bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-xl border border-slate-200 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20 outline-none transition-all cursor-pointer"
              >
                {standardSpecialties.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            {/* Custom specialty */}
            {specialization === 'Other' && (
              <div className="space-y-1.5 animate-in slide-in-from-top-2">
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">Specify Specialty</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Neurologist, Otolaryngologist"
                  value={customSpecialty}
                  onChange={(e) => setCustomSpecialty(e.target.value)}
                  className="w-full px-4 py-3.5 text-sm bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-xl border border-slate-200 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                />
              </div>
            )}

            {/* Experience */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">Clinical Experience (Years)</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  required
                  min="0"
                  max="60"
                  placeholder="10"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 text-sm bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-xl border border-slate-200 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Consultation Fees */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">Consultation Fees (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-3 font-semibold text-slate-400 text-base">₹</span>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="500"
                  value={fees}
                  onChange={(e) => setFees(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 text-sm bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-xl border border-slate-200 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 text-center text-sm font-extrabold uppercase tracking-wide text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-70 rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                {submitting ? 'Submitting Profile...' : 'Submit for Verification'}
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}
