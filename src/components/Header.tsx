import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, ArrowLeft, Shield } from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();

  // La page d'accueil commence directement par la bannière bleue
  if (location.pathname === '/') {
    return null;
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-2xs" id="subpage-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2.5 text-slate-800 hover:text-blue-700 transition" id="subnav-home-link">
              <span className="font-bold text-slate-900 text-sm tracking-tight">
                Baromètre ASCB &bull; Dialogue État-OSC Bénin
              </span>
            </Link>
          </div>

          <nav className="flex items-center gap-2">
            <Link
              to="/"
              id="subnav-home"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Portail</span>
            </Link>

            <Link
              to="/guide"
              id="subnav-guide"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition ${
                location.pathname === '/guide'
                  ? 'bg-blue-50 text-blue-800'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>Guide</span>
            </Link>

            <Link
              to="/admin/dashboard"
              id="subnav-admin"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition ${
                location.pathname.startsWith('/admin')
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Administration</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};
