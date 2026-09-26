import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  XCircle,
  FileText,
  Users,
  MessageSquare,
  Building,
  ArrowRight,
  Info,
  Calendar,
  Layers
} from 'lucide-react';
import { getSecteurBySlug } from '../data/secteursData';
import { MODULES_INFO, isModuleApplicable } from '../data/modulesData';
import { getExistingSubmission } from '../lib/supabase';
import { Lock } from 'lucide-react';

export const SecteurOverviewPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const secteur = getSecteurBySlug(slug || '');

  // Submissions status map (only completed submissions for this user/device)
  const [completedModules, setCompletedModules] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    async function loadStatus() {
      if (!secteur) return;
      const map: Record<string, string> = {};
      for (const mod of MODULES_INFO) {
        const soum = await getExistingSubmission(secteur.slug, mod.code);
        if (soum) {
          map[mod.code] = soum.id;
        }
      }
      setCompletedModules(map);
    }
    loadStatus();
  }, [secteur?.slug]);

  if (!secteur) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Secteur introuvable</h1>
        <p className="text-slate-600">Le secteur demandé n'existe pas dans la base des 5 secteurs prioritaires.</p>
        <Link to="/" className="inline-flex items-center gap-2 text-emerald-700 font-semibold">
          <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
        </Link>
      </div>
    );
  }

  const concertation = secteur.configuration_ecosysteme.find((c) =>
    c.composante.toLowerCase().includes('concertation')
  );
  const dialogue = secteur.configuration_ecosysteme.find((c) =>
    c.composante.toLowerCase().includes('mécanisme(s) de dialogue')
  );
  const evenements = secteur.configuration_ecosysteme.find((c) =>
    c.composante.toLowerCase().includes('événement')
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link to="/" className="hover:text-emerald-700 transition">Accueil</Link>
        <span>/</span>
        <span className="text-slate-400">Secteurs prioritaires</span>
        <span>/</span>
        <span className="text-slate-900 font-bold">{secteur.nom}</span>
      </nav>

      {/* Sector Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase">
                Secteur Prioritaire N°{secteur.ordre}
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs text-slate-500 font-medium">ASCB - PROJET BEN/301</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Secteur {secteur.nom}
            </h1>
            <p className="text-sm text-slate-600 max-w-3xl">
              {secteur.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/secteur/${secteur.slug}/module-a`}
              id="btn-goto-module-a"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-semibold text-xs shadow-sm transition"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Consulter Module A (Contexte)
            </Link>
          </div>
        </div>

        {/* Tableau récapitulatif des composantes du secteur */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Configuration constatée au niveau national (Tableau A.1) :
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Concertation */}
            <div className={`p-4 rounded-xl border ${concertation?.presente ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Mécanisme de concertation</span>
                {concertation?.presente ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3 h-3" /> Présent ({concertation.nombre})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-md">
                    <XCircle className="w-3 h-3" /> Absent
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-slate-900 mt-2">
                {concertation?.denomination || 'Aucun mécanisme formalisé'}
              </p>
            </div>

            {/* Dialogue */}
            <div className={`p-4 rounded-xl border ${dialogue?.presente ? 'bg-teal-50/60 border-teal-200' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Mécanisme de dialogue</span>
                {dialogue?.presente ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3 h-3" /> Présent ({dialogue.nombre})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                    <Info className="w-3 h-3 text-amber-600" /> Non applicable
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-slate-900 mt-2">
                {dialogue?.presente ? dialogue.denomination : 'Aucun mécanisme national formalisé'}
              </p>
            </div>

            {/* Événements */}
            <div className={`p-4 rounded-xl border ${evenements?.presente ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Événement(s) de dialogue</span>
                {evenements?.presente ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3 h-3" /> Présent ({evenements.nombre})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-md">
                    <XCircle className="w-3 h-3" /> Absent
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-slate-900 mt-2">
                {evenements?.denomination || 'Aucun événement répertorié'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modules List for this Sector */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Parcours d'évaluation du secteur
            </h2>
            <p className="text-xs text-slate-500">
              Accédez aux formulaires d'évaluation selon l'applicabilité aux écosystèmes du secteur {secteur.nom}.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {MODULES_INFO.map((mod) => {
            const applicable = isModuleApplicable(secteur, mod.code);
            const isModuleA = mod.code === 'A';
            const routePath = isModuleA
              ? `/secteur/${secteur.slug}/module-a`
              : `/secteur/${secteur.slug}/module-${mod.code.toLowerCase()}`;

            return (
              <div
                key={mod.code}
                id={`module-row-${mod.code.toLowerCase()}`}
                className={`rounded-2xl border transition p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                  applicable
                    ? 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                    : 'bg-slate-50/80 border-slate-200 opacity-80'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      isModuleA
                        ? 'bg-slate-900 text-white'
                        : mod.code === 'B1'
                        ? 'bg-blue-600 text-white'
                        : mod.code === 'B2'
                        ? 'bg-teal-600 text-white'
                        : mod.code === 'B3'
                        ? 'bg-amber-600 text-white'
                        : 'bg-purple-600 text-white'
                    }`}
                  >
                    {mod.code}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        {mod.titre}
                      </h3>

                      {isModuleA && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                          Informatif (Lecture seule)
                        </span>
                      )}

                      {completedModules[mod.code] && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Évaluation transmise
                        </span>
                      )}

                      {!applicable && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 inline-flex items-center gap-1">
                          <Info className="w-3 h-3 text-amber-700" /> Non applicable à ce secteur
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-semibold text-emerald-700">
                      {mod.sousTitre}
                    </div>

                    <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                      {mod.description}
                    </p>

                    {!applicable && (
                      <p className="text-xs text-amber-800 italic mt-1">
                        * Le secteur {secteur.nom} ne possède pas de mécanisme de dialogue formalisé à l'échelle nationale. Le Module B2 n'est donc pas à renseigner.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-end md:self-center">
                  {completedModules[mod.code] ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold">
                        <Lock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Transmis &amp; Verrouillé</span>
                      </span>
                      <Link
                        to={routePath}
                        id={`btn-view-locked-${mod.code.toLowerCase()}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition"
                      >
                        <span>Consulter le statut</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ) : applicable ? (
                    <Link
                      to={routePath}
                      id={`btn-start-${mod.code.toLowerCase()}`}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition ${
                        isModuleA
                          ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                          : 'bg-emerald-700 text-white hover:bg-emerald-800'
                      }`}
                    >
                      {isModuleA ? 'Consulter le Module A' : 'Remplir le formulaire'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <button
                      onClick={() => navigate(`/secteur/${secteur.slug}/module-b3`)}
                      id={`btn-skip-${mod.code.toLowerCase()}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 transition"
                    >
                      <span>Passer au module B3</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
