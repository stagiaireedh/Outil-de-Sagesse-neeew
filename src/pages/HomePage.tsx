import React from 'react';
import { Link } from 'react-router-dom';
import {
  Droplets,
  HeartPulse,
  Building2,
  Scale,
  Coins,
  ArrowRight,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Users,
  MessageSquare
} from 'lucide-react';
import { SECTEURS_DATA } from '../data/secteursData';

const SECTOR_ICONS: Record<string, React.ReactNode> = {
  eau: <Droplets className="w-6 h-6 text-blue-600" />,
  sante: <HeartPulse className="w-6 h-6 text-emerald-600" />,
  decentralisation: <Building2 className="w-6 h-6 text-amber-600" />,
  'droits-humains': <Scale className="w-6 h-6 text-purple-600" />,
  budget: <Coins className="w-6 h-6 text-indigo-600" />
};

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-12 pb-16">
      {/* Official Hero Banner - Starts directly with the title */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-blue-950 to-slate-900 text-white pt-16 pb-16 px-4 sm:px-6 lg:px-8 border-b border-blue-950 shadow-md">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#60a5fa_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="relative max-w-4xl mx-auto text-center space-y-5">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Outil d'évaluation &amp; d'auto-évaluation des écosystèmes sectoriels de dialogue État–OSC
          </h1>

          {/* Badges discrets d'information */}
          <div className="pt-2 flex flex-wrap justify-center items-center gap-3 text-xs text-blue-200 font-medium">
            <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10">
              5 Secteurs : Eau, Santé, Décentralisation, Droits humains, Budget
            </span>
            <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10">
              Direction : Ralmeg GANDAHO &bull; Montesquieu HOUNHOUI
            </span>
          </div>
        </div>
      </section>

      {/* Structure de l'outil scientifique */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                Structure normalisée de l'outil scientifique
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                L'outil est structuré en 5 modules rigoureusement calibrés pour cartographier et évaluer chaque écosystème sectoriel.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md inline-block">
                Module A
              </div>
              <div className="font-bold text-slate-900 text-sm">Identification &amp; Contexte</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Configuration A.1 et résultats de la mission A.2 (Lecture seule).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md inline-block">
                Module B1
              </div>
              <div className="font-bold text-slate-900 text-sm">Mécanismes de concertation</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Composition OSC, structuration, mission et consultation interne.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="text-xs font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md inline-block">
                Module B2
              </div>
              <div className="font-bold text-slate-900 text-sm">Mécanismes de dialogue</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Composition bipartite, influence et suivi des décisions [si présent].
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md inline-block">
                Module B3
              </div>
              <div className="font-bold text-slate-900 text-sm">Événements de dialogue</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rencontres ponctuelles ou périodiques et potentiel de formalisation.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="text-xs font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-md inline-block">
                Module C
              </div>
              <div className="font-bold text-slate-900 text-sm">Auto-évaluation OSC</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Auto-positionnement des OSC membres.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Les 5 Secteurs Prioritaires */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6" id="secteurs">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Sélectionnez un secteur</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Les 5 Écosystèmes Sectoriels Prioritaires
            </h2>
          </div>
          <p className="text-sm text-slate-500 max-w-md">
            Chaque secteur dispose de son contexte spécifique, de sa configuration validée en mission et de ses modules d'évaluation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SECTEURS_DATA.map((secteur) => {
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
              <div
                key={secteur.slug}
                id={`card-secteur-${secteur.slug}`}
                className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-500/50 hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-6 space-y-5">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-105 transition">
                      {SECTOR_ICONS[secteur.slug]}
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      Ordre {secteur.ordre}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition">
                      {secteur.nom}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {secteur.description}
                    </p>
                  </div>

                  {/* Checklist des composantes réelles de l'écosystème */}
                  <div className="space-y-2 text-xs border-t border-slate-100 pt-4">
                    <div className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                      Composantes de l'écosystème :
                    </div>

                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1.5">
                        {concertation?.presente ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-slate-300" />
                        )}
                        Concertation (B1)
                      </span>
                      <span className="font-medium text-slate-900 truncate max-w-[170px]" title={concertation?.denomination}>
                        {concertation?.presente ? concertation.denomination.split('(')[1]?.replace(')', '') || concertation.denomination.substring(0, 15) + '...' : 'Absent'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1.5">
                        {dialogue?.presente ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-slate-300" />
                        )}
                        Dialogue (B2)
                      </span>
                      <span className="font-medium text-slate-900 truncate max-w-[170px]">
                        {dialogue?.presente ? dialogue.denomination.split('(')[1]?.replace(')', '') || 'Présent' : <span className="text-slate-400 italic">Non applicable</span>}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1.5">
                        {evenements?.presente ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-slate-300" />
                        )}
                        Événements (B3)
                      </span>
                      <span className="font-medium text-slate-900 truncate max-w-[170px]">
                        {evenements?.presente ? `${evenements.nombre} événement(s)` : 'Absent'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">
                    Accéder à l'évaluation
                  </span>
                  <Link
                    to={`/secteur/${secteur.slug}`}
                    id={`btn-open-secteur-${secteur.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:text-emerald-800 bg-white border border-slate-200 hover:border-emerald-400 px-3 py-1.5 rounded-lg shadow-2xs transition"
                  >
                    Ouvrir le secteur
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
