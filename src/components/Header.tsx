import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Layers, ArrowLeft } from 'lucide-react';
import { SECTEURS_DATA } from '../data/secteursData';

export const Header: React.FC = () => {
  const location = useLocation();

  // La page d'accueil commence directement par la bannière bleue (aucun en-tête au-dessus)
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
                Outil d'Évaluation des Écosystèmes
              </span>
            </Link>
          </div>

          <nav className="flex items-center gap-1">
            <Link
              to="/"
              id="subnav-home"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Accueil</span>
            </Link>

            <div className="relative group">
              <button
                id="subnav-secteurs-btn"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition ${
                  location.pathname.startsWith('/secteur')
                    ? 'bg-blue-50 text-blue-800'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>5 Secteurs</span>
              </button>

              <div className="absolute left-0 mt-1 w-60 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Sélectionner un secteur
                </div>
                {SECTEURS_DATA.map((secteur) => (
                  <Link
                    key={secteur.slug}
                    to={`/secteur/${secteur.slug}`}
                    id={`subnav-link-${secteur.slug}`}
                    className="flex items-center justify-between px-3 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-800"
                  >
                    <span className="font-medium">{secteur.nom}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">
                      #{secteur.ordre}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              to="/guide"
              id="subnav-guide"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition ${
                location.pathname === '/guide'
                  ? 'bg-blue-50 text-blue-800'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>Guide</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};
