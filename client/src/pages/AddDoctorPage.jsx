import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios.js';
import { ChevronLeft, Stethoscope, Briefcase, PlusCircle, CheckCircle, ShieldAlert } from 'lucide-react';

export default function AddDoctorPage() {
  const navigate = useNavigate();

  // Form Fields State
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('General Physician');
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [experience, setExperience] = useState('');
  const [fees, setFees] = useState('');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Standard specialties dropdown option list
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    if (!name.trim()) {
      setErrorMsg('Please prefill the doctor\'s complete name.');
      return;
    }

    const finalSpecialization = specialization === 'Other' ? customSpecialty.trim() : specialization;
    if (!finalSpecialization) {
      setErrorMsg('Please enter the physician\'s medical field specialization.');
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
        name: name.trim().startsWith('Dr. ') ? name.trim() : 'Dr. ' + name.trim(),
        specialization: finalSpecialization,
        experience: parseInt(experience, 10),
        fees: parseInt(fees, 10)
      };

      const res = await api.post('/api/doctors/add', payload);

      if (res.data.success || res.status === 200 || res.status === 201) {
        setSuccessMsg('Doctor profile registered successfully!');
        setName('');
        setExperience('');
        setFees('');
        setCustomSpecialty('');
        
        setTimeout(() => {
          navigate('/doctors');
        }, 1500);
      } else {
        setErrorMsg(res.data.message || 'Could not insert doctor profile. Try again.');
      }
    } catch (err) {
      console.error('Error adding doctor:', err);
      setErrorMsg(err.response?.data?.message || 'clinical backend rejected doctor profile insertion. Please verify database schema.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="add-doctor-root" className="py-10 bg-slate-50 min-h-[85vh]">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        
        {/* Back navigation */}
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-650 hover:text-blue-600 mb-6 cursor-pointer"
        >
          <ChevronLeft className="h-4.5 w-4.5" /> Back to Admin
        </button>

        {/* Form Container Card */}
        <div className="bg-white rounded-3xl border border-slate-150 p-6 md:p-8 shadow-sm">
          
          {/* Header */}
          <div className="border-b border-slate-100 pb-5 mb-6 text-center sm:text-left">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center sm:justify-start gap-2">
              <PlusCircle className="h-6 w-6 text-blue-650" />
              Add Doctor Profile
            </h1>
            <p className="text-sm text-slate-500 mt-1">Register a certified practitioner in the clinic registry directory.</p>
          </div>

          {/* Feedback alerts */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-150 text-red-700 text-sm font-semibold flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-150 text-emerald-850 text-sm font-semibold flex items-center gap-2">
              <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Core Form input fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* 1. Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Full Doctor Name</label>
              <div className="relative">
                <Stethoscope className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Rajesh Patel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10.5 pr-4 py-3 text-sm bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-all duration-150"
                />
              </div>
            </div>

            {/* 2. Specialization Selection */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Clinical Specialty</label>
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-3 py-3 text-sm bg-slate-50 text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-all cursor-pointer"
              >
                {standardSpecialties.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            {/* Custom specialty (if selected Other) */}
            {specialization === 'Other' && (
              <div className="space-y-1 animate-in slide-in-from-top-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Specify Specialty</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Neurologist, Otolaryngologist"
                  value={customSpecialty}
                  onChange={(e) => setCustomSpecialty(e.target.value)}
                  className="w-full px-3.5 py-3 text-sm bg-slate-50 text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 outline-hidden transition-all"
                />
              </div>
            )}

            {/* 3. Experience */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Clinical Experience (Years)</label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  required
                  min="0"
                  max="60"
                  placeholder="10"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full pl-10.5 pr-4 py-3 text-sm bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-all duration-150"
                />
              </div>
            </div>

            {/* 4. Consultation Fees */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Consultation Fees (₹)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 font-semibold text-slate-400 text-sm">₹</span>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="500"
                  value={fees}
                  onChange={(e) => setFees(e.target.value)}
                  className="w-full pl-10.5 pr-4 py-3 text-sm bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-all duration-150"
                />
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 text-center text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-450 rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                {submitting ? 'Registering specialist profile...' : 'Register Doctor Profile'}
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}
