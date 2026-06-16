import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  CheckCircle,
  XCircle,
  AlertCircle,
  Ban,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function AppointmentCard({
  appointment,
  onStatusChange,
  onCancel,
}) {
  const { isAdmin } = useAuth();

  const {
    _id,
    user: patient,
    doctor,
    appointmentDate,
    appointmentTime,
    status,
  } = appointment;

  const doctorDisplayName = doctor?.name || "Doctor Portal";
  const patientDisplayName = patient?.name || "Unknown Patient";

  const getStatusStyles = (statusVal) => {
    switch (statusVal) {
      case "Approved":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
          icon: (
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          ),
        };

      case "Rejected":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          dot: "bg-rose-500",
          icon: (
            <XCircle className="h-4 w-4 text-rose-600" />
          ),
        };

      case "Cancelled":
        return {
          bg: "bg-slate-100 text-slate-600 border-slate-200",
          dot: "bg-slate-400",
          icon: (
            <Ban className="h-4 w-4 text-slate-500" />
          ),
        };

      case "Pending":
      default:
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
          icon: (
            <AlertCircle className="h-4 w-4 text-amber-600" />
          ),
        };
    }
  };

  const statusStyle = getStatusStyles(status);

  return (
    <div
      id={`appointment-card-${_id}`}
      className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs hover:shadow-md transition-all duration-200"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        
        {/* Appointment Info */}
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Calendar className="h-5 w-5" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-slate-900 flex items-center gap-1.5 text-base">
                <Stethoscope className="h-4.5 w-4.5 text-blue-650" />
                {doctorDisplayName}
              </span>

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold rounded-full border ${statusStyle.bg}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                ></span>
                {status}
              </span>
            </div>

            <div className="flex items-center gap-4 mt-3 text-xs font-bold uppercase tracking-wider text-slate-500 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                {appointmentDate}
              </span>

              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                {appointmentTime}
              </span>

              {isAdmin && (
                <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-100 text-slate-700 uppercase tracking-wide">
                  <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  Patient: {patientDisplayName}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 sm:self-center">
          
          {isAdmin && status === "Pending" && (
            <>
              <button
                onClick={() =>
                  onStatusChange(_id, "Approved")
                }
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full transition-all shadow-xs cursor-pointer"
              >
                Approve
              </button>

              <button
                onClick={() =>
                  onStatusChange(_id, "Rejected")
                }
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-full transition-all shadow-xs cursor-pointer"
              >
                Reject
              </button>
            </>
          )}

          {!isAdmin &&
            (status === "Pending" ||
              status === "Approved") && (
              <button
                onClick={() => onCancel(_id)}
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-white bg-slate-100 hover:bg-red-600 rounded-full border border-transparent transition-all cursor-pointer"
              >
                Cancel Appointment
              </button>
            )}

          {isAdmin && status === "Approved" && (
            <button
              onClick={() =>
                onStatusChange(_id, "Cancelled")
              }
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-white bg-slate-100 hover:bg-red-600 rounded-full transition-all cursor-pointer"
            >
              Cancel Block
            </button>
          )}
        </div>
      </div>
    </div>
  );
}