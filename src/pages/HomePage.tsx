import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Droplets,
  HeartPulse,
  Building2,
  Scale,
  Coins,
  ArrowRight,
  ShieldCheck,
  Lock,
  Key,
  FileSpreadsheet,
  Users,
  CheckCircle2,
  HelpCircle,
  Shield
} from 'lucide-react';
import { SECTEURS_DATA } from '../data/secteursData';
import { resolveFormToken } from '../data/formLinksData';

const SECTOR_ICONS: Record<string, React.ReactNode> = {
  eau: <Droplets className="w-6 h-6 text-blue-600" />,
  sante: <HeartPulse className="w-6 h-6 text-emerald-600" />,
  decentralisation: <Building2 className="w-6 h-6 text-amber-600" />,
  'droits-humains': <Scale className="w-6 h-6 text-purple-600" />,
  budget: <Coins className="w-6 h-6 text-indigo-600" />
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [formInput, setFormInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAccessForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formInput.trim()) {
      setErrorMsg('Veuillez renseigner votre code ou coller le lien du formulaire.');
      return;
    }

    const resolved = resolveFormToken(formInput.trim());
    if (resolved) {
      navigate(`/f/${resolved.token}`);
    } else {
      setErrorMsg('Code ou lien introuvable. Veuillez vérifier le lien individuel transmis par l’équipe du projet.');
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Official Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-blue-950 to-slate-900 text-white pt-16 pb-16 px-4 sm:px-6 lg:px-8 border-b border-blue-950 shadow-md">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#60a5fa_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Plateforme à accès sécurisé par formulaires séparés</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Outil d'évaluation &amp; d'auto-évaluation des écosystèmes sectoriels de dialogue État–OSC
          </h1>

          <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed">
            PROJET BEN/301 &bull; Appui à la Société Civile au Bénin (ASCB). Direction scientifique : Ralmeg GANDAHO &amp; Montesquieu HOUNHOUI.
          </p>

          {/* Form Access Box */}
          <div className="pt-4 max-w-xl mx-auto">
            <form onSubmit={handleAccessForm} className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/20 shadow-xl space-y-3 text-left">
              <label className="text-xs font-bold text-white flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-emerald-400" />
                  Accéder à votre formulaire d'évaluation :
                </span>
                <span className="text-[11px] text-blue-200 font-normal">Lien individuel requis</span>
              </label>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={formInput}
                  onChange={(e) => {
                    setFormInput(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="Collez votre lien ou votre code (ex: eau-b1-4p8n5q)"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-xs font-mono focus:outline-emerald-500 border border-slate-200"
                />
                <button
                  type="submit"
                  id="btn-access-form"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <span>Ouvrir mon formulaire</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {errorMsg && (
                <div className="text-xs text-rose-300 font-semibold bg-rose-950/60 p-2.5 rounded-lg border border-rose-500/40">
                  {errorMsg}
                </div>
              )}

              <p className="text-[11px] text-blue-200/90 leading-relaxed">
                Chaque formulaire est cloisonné et possède son lien individuel confidentiel. Si vous n'avez pas reçu votre lien, veuillez contacter l'administration du projet.
              </p>
            </form>
          </div>

          <div className="pt-2 flex justify-center">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Espace Gestionnaire &bull; Liens &amp; Résultats</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Règle de cloisonnement et sécurité */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-700" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900">
                Principe de cloisonnement et liens individuels
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                Pour garantir l'intégrité scientifique et la confidentialité des réponses, les formulaires ne sont pas accessibles en libre navigation. Chaque répondant remplit exclusivement le module et le secteur qui lui sont assignés via son URL unique dédiée.
              </p>
            </div>
          </div>

          <Link
            to="/guide"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs shadow-2xs transition shrink-0"
          >
            Consulter le guide méthodologique
          </Link>
        </div>
      </section>

      {/* Structure de l'outil scientifique (Modules) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-5">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              Les 5 Modules Scientifiques d'Évaluation
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Chaque module correspond à un volet d'analyse précis pour chaque écosystème sectoriel.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md inline-block">
                Module A
              </div>
              <div className="font-bold text-slate-900 text-sm">Identification &amp; Contexte</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Configuration A.1 et résultats de la mission A.2 (Lecture seule de cadrage).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md inline-block">
                Module B1
              </div>
              <div className="font-bold text-slate-900 text-sm">Mécanismes de concertation</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Composition exclusive OSC, structuration, mission et consultation interne.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="text-xs font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md inline-block">
                Module B2
              </div>
              <div className="font-bold text-slate-900 text-sm">Mécanismes de dialogue</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dispositifs bipartites État-OSC, influence sur les politiques et suivi.
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
                Auto-positionnement réflexif des organisations de la société civile.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Présentation des 5 Secteurs Prioritaires (Information seulement, pas de liens ouverts) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Périmètre d'application</div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Les 5 Écosystèmes Sectoriels Ciblés
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Les liens vers les formulaires de chaque secteur sont générés et transmis directement aux organisations concernées.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SECTEURS_DATA.map((secteur) => (
            <div
              key={secteur.slug}
              className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  {SECTOR_ICONS[secteur.slug]}
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  Secteur #{secteur.ordre}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">{secteur.nom}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed">
                  {secteur.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Accès au formulaire :</span>
                <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Lien privé individuel
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
