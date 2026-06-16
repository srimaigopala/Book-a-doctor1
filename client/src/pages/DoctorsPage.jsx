import { useState, useEffect } from 'react';
import { Search, Stethoscope, Filter, RefreshCw } from 'lucide-react';
import api from '../api/axios.js';
import DoctorCard from '../components/DoctorCard.jsx';
import Loader from '../components/Loader.jsx';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchDoctorsList = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.get('/api/doctors/all');
      if (res.data.success && res.data.doctors) {
        setDoctors(res.data.doctors);
      } else {
        setDoctors([]);
      }
    } catch (err) {
      console.error('Error loading doctors list:', err);
      setErrorMsg('Could not fetch certified specialist listings. Please verify the active backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorsList();
  }, []);

  // Filter list of doctors based on search queries and selected specialties
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpecialty = selectedSpecialty === 'All' || 
                             doc.specialization.toLowerCase() === selectedSpecialty.toLowerCase();
    
    return matchesSearch && matchesSpecialty;
  });

  // Get unique list of specializations for rapid filter badges
  const specialties = ['All', ...new Set(doctors.map(d => d.specialization))];

  return (
    <div id="doctors-page-root" className="py-8 bg-slate-50 min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Block */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none italic font-display">Our Registered Physicians</h1>
            <p className="text-sm text-slate-500 mt-2 font-medium">Browse, search, and schedule consultations with board-verified doctors.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchDoctorsList}
              className="p-3 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl text-slate-600 hover:text-slate-900 transition-colors shadow-2xs shrink-0 cursor-pointer"
              title="Refresh Listings"
            >
              <RefreshCw className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Search and Quick Filters Row */}
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-xs mb-8 space-y-4">
          <div className="flex items-center gap-1">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-4 h-4.5 w-4.5 text-blue-600" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search physicians by name or clinical specialty..."
                className="w-full pl-11 pr-4 py-3.5 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-all duration-155"
              />
            </div>
          </div>

          {/* Specialization Fast Badges */}
          {specialties.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-slate-50">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mr-2 flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" /> Quick Filter:
              </span>
              {specialties.map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpecialty(spec)}
                  className={`px-4 py-1.5 font-extrabold text-[10px] uppercase tracking-wider rounded-full border transition-all cursor-pointer ${
                    selectedSpecialty === spec
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs shadow-blue-150'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Warning */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-semibold flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-amber-600" />
            <div>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        {/* main listings grid */}
        {loading ? (
          <Loader message="Loading clinician schedules from database registry..." />
        ) : filteredDoctors.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-xs">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400 mb-3">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">No doctors match your query</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">We couldn't find any medical experts matching is search parameter. Try clearing search filters or entering different query parameters.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSpecialty('All');
              }}
              className="mt-4 px-4 py-2 font-bold text-sm text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-100 rounded-xl transition-all cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => (
              <DoctorCard key={doc._id} doctor={doc} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
