import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="app-footer" className="bg-white border-t border-slate-200 py-6 px-8 flex flex-col md:flex-row items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest gap-4">
      <div>&copy; {currentYear} Book-A-Doctor Medical Systems</div>
      <div className="flex items-center gap-6">
        <span className="hover:text-blue-600 cursor-pointer transition-colors">Privacy Policy</span>
        <span className="text-slate-300">•</span>
        <span className="hover:text-blue-600 cursor-pointer transition-colors">Terms of Service</span>
        <span className="text-slate-300">•</span>
        <span className="hover:text-blue-600 cursor-pointer transition-colors">Help Center</span>
      </div>
    </footer>
  );
}
