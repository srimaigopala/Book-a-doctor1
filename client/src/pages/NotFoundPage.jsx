import { Link } from 'react-router-dom';
import { ShieldQuestion, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div id="not-found-container" className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-16 text-center bg-slate-50">
      <div className="max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        
        {/* Visual Graphic Icon */}
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 animate-bounce">
          <ShieldQuestion className="h-9 w-9" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
          <h2 className="text-xl font-bold text-slate-800">Page Not Found</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            The medical page or consultant record directory you were attempting to access does not exist, or has been temporarily repositioned.
          </p>
        </div>

        {/* Action Link button */}
        <div className="pt-2">
          <Link
            to="/"
            className="w-full inline-flex items-center justify-center gap-1.5 px-5 py-3 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Home className="h-4 w-4" />
            <span>Back to Home Portal</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
