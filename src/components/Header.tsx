import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import { useCase } from '../context/CaseContext';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const [isModulesOpen, setIsModulesOpen] = useState(false);
  const { caseData } = useCase();
  const { user, profile, login, logout } = useAuth();

  const modules = [
    { title: caseData.isCustom ? caseData.title : 'Gaska Tape', link: '/case-study/gaska-tape' },
    { title: 'Success Story 2', link: '#' },
    { title: 'Success Story 3', link: '#' },
    { title: 'Success Story 4', link: '#' },
    { title: 'Success Story 5', link: '#' },
    { title: 'Success Story 6', link: '#' },
  ];

  return (
    <header className="grid grid-cols-3 items-center py-6 px-8 border-b-4 border-black bg-white relative z-50">
      <img 
        src="https://images.squarespace-cdn.com/content/v1/6255bbe95bb22967d455a499/483bf9fa-688a-4826-b6c5-61e4f7f836b8/elkhart.003.jpg" 
        alt="Header Watermark"
        className="absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none" 
      />
      
      <div className="flex justify-start relative z-10">
        <Link 
          to="/" 
          className="inline-block bg-[#060644] p-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        >
          <img 
            src="https://images.squarespace-cdn.com/content/v1/6255bbe95bb22967d455a499/edd00340-64eb-41a9-ac93-48c138feec23/Institute+for+Entrepreneurial+Communities+%281%29.png?format=1500w" 
            alt="Institute for Entrepreneurial Communities" 
            className="h-16 w-auto object-contain"
          />
        </Link>
      </div>

      <div className="flex justify-center relative z-10">
        {/* Center empty or for future use */}
      </div>

      <div className="flex justify-end relative z-10 gap-4">
        {profile?.role === 'professor' || profile?.role === 'admin' ? (
          <>
            <Link
              to="/professor-portal"
              className="flex items-center gap-2 font-display text-lg font-bold text-black uppercase tracking-wide hover:bg-yellow-400 px-4 py-2 border-2 border-transparent hover:border-black transition-all bg-white/50 backdrop-blur-sm"
            >
              Upload Case
            </Link>
            <Link
              to="/professor-dashboard"
              className="flex items-center gap-2 font-display text-lg font-bold text-black uppercase tracking-wide hover:bg-yellow-400 px-4 py-2 border-2 border-transparent hover:border-black transition-all bg-white/50 backdrop-blur-sm"
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Link>
          </>
        ) : (
          <Link
            to="/professor-portal"
            className="flex items-center gap-2 font-display text-lg font-bold text-black uppercase tracking-wide hover:bg-yellow-400 px-4 py-2 border-2 border-transparent hover:border-black transition-all bg-white/50 backdrop-blur-sm"
          >
            Professor Portal
          </Link>
        )}

        {user ? (
          <button
            onClick={logout}
            className="flex items-center gap-2 font-display text-lg font-bold text-black uppercase tracking-wide hover:bg-yellow-400 px-4 py-2 border-2 border-transparent hover:border-black transition-all bg-white/50 backdrop-blur-sm"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        ) : (
          <button
            onClick={login}
            className="flex items-center gap-2 font-display text-lg font-bold text-black uppercase tracking-wide hover:bg-yellow-400 px-4 py-2 border-2 border-transparent hover:border-black transition-all bg-white/50 backdrop-blur-sm"
          >
            <LogIn className="h-5 w-5" />
            Login
          </button>
        )}

        <button
          onClick={() => setIsModulesOpen(!isModulesOpen)}
          className="flex items-center gap-2 font-display text-lg font-bold text-black uppercase tracking-wide hover:bg-yellow-400 px-4 py-2 border-2 border-transparent hover:border-black transition-all bg-white/50 backdrop-blur-sm"
        >
          Modules
          <ChevronDown className={`h-5 w-5 transition-transform ${isModulesOpen ? 'rotate-180' : ''}`} />
        </button>

        {isModulesOpen && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] py-2">
            {modules.map((mod, idx) => (
              <Link
                key={idx}
                to={mod.link}
                onClick={() => setIsModulesOpen(false)}
                className="block px-6 py-3 text-black font-medium hover:bg-yellow-400 transition-colors border-b border-gray-100 last:border-0 font-sans"
              >
                {mod.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
