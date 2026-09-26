import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, BookOpen, AlertCircle } from 'lucide-react';
import { getSecteurBySlug } from '../data/secteursData';

export const ModuleAPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const secteur = getSecteurBySlug(slug || '');

  if (!secteur) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Secteur introuvable</h1>
        <Link to="/" className="text-emerald-700 font-semibold inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
        </Link>
      </div>
    );
  }

  // Split paragraphs of A.2 to render cleanly
  const paragraphsA2 = secteur.analyse_premiere_mission.split('\n\n').filter(Boolean);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="module-a-container">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link to="/" className="hover:text-emerald-700 transition">Accueil</Link>
        <span>/</span>
        <Link to={`/secteur/${secteur.slug}`} className="hover:text-emerald-700 transition">
          Secteur {secteur.nom}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">Module A</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              A
            </span>
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Module Informatif &bull; Lecture Seule
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                MODULE A : IDENTIFICATION ET CONTEXTUALISATION DE L'ÉCOSYSTÈME SECTORIEL
              </h1>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
            Secteur : {secteur.nom}
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
          Ce module présente la configuration validée lors de la première mission pour le secteur <strong>{secteur.nom}</strong>.
          Les données ci-dessous reproduisent fidèlement les documents scientifiques officiels du <strong>PROJET BEN/301 - ASCB</strong>.
        </p>
      </div>

      {/* A.1 : Configuration de l'écosystème */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            A.1 : Configuration de l'écosystème
          </h2>
          <span className="text-xs text-slate-400 font-medium">Tableau officiel de cadrage</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200 tracking-wider">
                <th className="py-3 px-4">Composante de l'écosystème</th>
                <th className="py-3 px-4 w-36">Présente dans ce secteur ?</th>
                <th className="py-3 px-4 w-24">Nombre</th>
                <th className="py-3 px-4">Dénomination exacte</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {secteur.configuration_ecosysteme.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {item.composante}
                  </td>
                  <td className="py-3.5 px-4">
                    {item.presente ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Oui
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-bold border border-slate-200">
                        <XCircle className="w-3.5 h-3.5 text-slate-400" /> Non
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    {item.nombre}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {item.denomination || (
                      <span className="text-slate-400 italic">Aucune dénomination (absent)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* A.2 : Rappel des principaux résultats de la première mission */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            A.2 : Rappel des principaux résultats de la première mission relatifs à cet écosystème
          </h2>
        </div>

        <div className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed space-y-4">
          {paragraphsA2.map((p, index) => {
            // Check if paragraph starts with a specific title format (e.g. "Configuration de l'écosystème.")
            const dotIndex = p.indexOf('.');
            if (dotIndex > 0 && dotIndex < 70) {
              const prefix = p.substring(0, dotIndex + 1);
              const remainder = p.substring(dotIndex + 1);
              return (
                <div key={index} className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
                  <strong className="text-slate-900 block font-bold text-sm mb-1">{prefix}</strong>
                  <span className="text-slate-700 text-xs leading-relaxed">{remainder}</span>
                </div>
              );
            }
            return (
              <p key={index} className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 text-xs leading-relaxed text-slate-700">
                {p}
              </p>
            );
          })}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <Link
          to={`/secteur/${secteur.slug}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Retour à la vue d'ensemble du secteur
        </Link>

        <button
          onClick={() => navigate(`/secteur/${secteur.slug}/module-b1`)}
          id="btn-goto-b1"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition"
        >
          <span>Accéder au Module B1 (Concertation)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
