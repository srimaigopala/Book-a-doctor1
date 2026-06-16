import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios.js';
import Loader from '../components/Loader.jsx';
import { ChevronLeft, Stethoscope, Briefcase, CheckCircle, ShieldAlert, Edit, Trash2 } from 'lucide-react';

export default function EditDoctorPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Form Fields State
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('General Physician');
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [experience, setExperience] = useState('');
  const [fees, setFees] = useState('');
  const [available, setAvailable] = useState(true);

  // States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Dropdown options
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
    const fetchDocProfile = async () => {
      try {
        const res = await api.get(`/api/doctors/${id}`);
        if (res.data.success && res.data.doctor) {
          const doc = res.data.doctor;
          setName(doc.name);
          
          if (standardSpecialties.includes(doc.specialization)) {
            setSpecialization(doc.specialization);
          } else {
            setSpecialization('Other');
            setCustomSpecialty(doc.specialization);
          }
          
          setExperience(doc.experience.toString());
          setFees(doc.fees.toString());
          setAvailable(doc.available !== false);
        } else {
          setErrorMsg('The medical expert profile details could not be read.');
        }
      } catch (err) {
        console.error('Error fetching doctor details for prefill:', err);
        setErrorMsg('The physician record could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocProfile();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please prefill the doctor\'s complete name.');
      return;
    }

    const finalSpec = specialization === 'Other' ? customSpecialty.trim() : specialization;
    if (!finalSpec) {
      setErrorMsg('Please enter the physician\'s clinical specialization.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        name: name.trim(),
        specialization: finalSpec,
        experience: parseInt(experience, 10),
        fees: parseInt(fees, 10),
        available: available // Custom added so state available can also be edited!
      };

      const res = await api.put(`/api/doctors/${id}`, payload);
      if (res.data.success || res.status === 200) {
        setSuccessMsg('Doctor profile details updated successfully!');
        setTimeout(() => {
          navigate('/doctors');
        }, 1500);
      } else {
        setErrorMsg(res.data.message || 'Could not save physician profile modifications.');
      }
    } catch (err) {
      console.error('Error updating doctor:', err);
      setErrorMsg(err.response?.data?.message || 'Database rejected changes. Please double check values.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const confirmText = `Are you sure you want to PERMANENTLY erase the profile for ${name || 'this doctor'}? This action is irreversible and will purge all active appointment slots associated.`;
    if (!window.confirm(confirmText)) {
      return;
    }

    setDeleting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.delete(`/api/doctors/${id}`);
      if (res.data.success || res.status === 200) {
        setSuccessMsg('Doctor profile has been deleted successfully.');
        setTimeout(() => {
          navigate('/doctors');
        }, 1500);
      } else {
        setErrorMsg(res.data.message || 'Could not delete the doctor profile.');
      }
    } catch (err) {
      console.error('Error deleting doctor:', err);
      setErrorMsg('Endpoint deletion rejected. Check credentials.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <Loader message="Accessing specialist database record..." fullPage={true} />;
  }

  return (
    <div id="edit-doctor-root" className="py-10 bg-slate-50 min-h-[85vh]">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        
        {/* Back navigation */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-655 hover:text-blue-600 mb-6 cursor-pointer"
        >
          <ChevronLeft className="h-4.5 w-4.5" /> Back
        </button>

        {/* Outer Box Card */}
        <div className="bg-white rounded-3xl border border-slate-150 p-6 md:p-8 shadow-sm">
          
          {/* Header */}
          <div className="border-b border-slate-100 pb-5 mb-6 text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center sm:justify-start gap-2">
                <Edit className="h-6 w-6 text-blue-650" />
                Configure Physician Profile
              </h1>
              <p className="text-sm text-slate-500 mt-1">Adjust medical billing, clinical experience, or remove record entirely.</p>
            </div>
          </div>

          {/* Messages feedback */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-150 text-red-700 text-sm font-semibold flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 shrink-0 animate-bounce" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-150 text-emerald-850 text-sm font-semibold flex items-center gap-2">
              <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleUpdate} className="space-y-4">
            
            {/* 1. Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Doctor Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-3 text-sm bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 outline-hidden transition-all"
              />
            </div>

            {/* 2. Specialization Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Clinical Specialty</label>
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-3.5 py-3 text-sm bg-slate-50 text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-all cursor-pointer"
              >
                {standardSpecialties.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            {/* Custom specialty */}
            {specialization === 'Other' && (
              <div className="space-y-1 animate-in slide-in-from-top-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Specify Specialty</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Immunologist"
                  value={customSpecialty}
                  onChange={(e) => setCustomSpecialty(e.target.value)}
                  className="w-full px-3.5 py-3 text-sm bg-slate-50 text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 outline-hidden transition-all"
                />
              </div>
            )}

            {/* 3. Experience */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Clinical Experience (Years)</label>
              <input
                type="number"
                required
                min="0"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full px-3.5 py-3 text-sm bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 outline-hidden transition-all"
              />
            </div>

            {/* 4. Consultation Service Fees */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Consultation Fees (₹)</label>
              <input
                type="number"
                required
                min="0"
                value={fees}
                onChange={(e) => setFees(e.target.value)}
                className="w-full px-3.5 py-3 text-sm bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 outline-hidden transition-all"
              />
            </div>

            {/* 5. Custom Added: Availability checkbox status */}
            <div className="pt-2 flex items-center gap-3">
              <input
                type="checkbox"
                id="checkbox-available"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
                className="h-4.5 w-4.5 text-blue-600 border-slate-300 rounded-md focus:ring-blue-500 focus:ring-2 cursor-pointer"
              />
              <label htmlFor="checkbox-available" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                Physician is active &amp; on-duty/available for appointments
              </label>
            </div>

            {/* Primary Action Button sets */}
            <div className="border-t border-slate-100 pt-6 flex flex-col gap-3">
              <button
                type="submit"
                disabled={submitting || deleting}
                className="w-full py-3.5 text-center text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-450 rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                {submitting ? 'Applying modifications...' : 'Save Configuration Changes'}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting || deleting}
                className="w-full py-3.5 text-center text-sm font-bold text-red-600 hover:text-white bg-white hover:bg-red-600 border border-red-200 hover:border-red-650 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="h-4 w-4 shrink-0" />
                {deleting ? 'Eraser database record...' : 'Delete Doctor Profile'}
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}
