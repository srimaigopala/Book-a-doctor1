import { useNavigate } from 'react-router-dom';

export default function DoctorCard({ doctor }) {
  const navigate = useNavigate();

  const { _id, name, specialization, experience, fees, available } = doctor;

  return (
    <div id={`doctor-card-${_id}`} className="bg-white rounded-3xl border border-slate-100 hover:border-blue-200 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group p-5">
      
      <div className="flex items-start gap-4">
        {/* Doctor Initials Block */}
        <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 text-blue-600 flex items-center justify-center font-extrabold text-base shrink-0 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all">
          {name ? name.split(' ').map(n => n[0]).join('').substring(0, 3).toUpperCase() : 'DR'}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            {available ? (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
                Online
              </span>
            ) : (
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
                Offline
              </span>
            )}
            <span className="text-xs text-slate-500 font-semibold">• {experience} yrs exp</span>
          </div>

          <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition-colors leading-tight truncate">
            {name}
          </h3>
          <p className="text-xs text-slate-500 font-medium truncate">
            {specialization}
          </p>
        </div>
      </div>

      {/* Footer stats & booking */}
      <div className="pt-4 mt-4 border-t border-slate-50 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Fee</span>
          <span className="font-extrabold text-blue-600 text-base">₹{fees}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigate(`/doctors/${_id}`)}
            className="bg-slate-50 text-blue-600 text-[11px] font-extrabold py-2 px-4 rounded-xl border border-blue-50 hover:bg-blue-600 hover:text-white hover:border-blue-600 uppercase tracking-wider transition-colors cursor-pointer"
          >
            Check Schedule
          </button>
        </div>
      </div>

    </div>
  );
}
