import { Loader2 } from 'lucide-react';

export default function Loader({ message = 'Loading details...', fullPage = false }) {
  if (fullPage) {
    return (
      <div id="full-page-loader" className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/10 backdrop-blur-xs">
        <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center border border-slate-100 max-w-xs text-center">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
          <p className="text-sm font-semibold text-slate-800">{message}</p>
          <p className="text-xs text-slate-500 mt-1">Please wait a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div id="inline-loader" className="flex flex-col items-center justify-center py-12 px-4">
      <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-3" />
      <span className="text-sm text-slate-600 font-medium">{message}</span>
    </div>
  );
}
