import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Home,
  ArrowLeft,
  ShieldCheck,
  Download,
  FileSpreadsheet,
  FileText,
  Lock
} from 'lucide-react';
import { getSecteurBySlug } from '../data/secteursData';
import { resolveFormToken, getTokenForForm } from '../data/formLinksData';
import { getSubmissionById } from '../lib/supabase';
import { Soumission } from '../types';
import { exportIndividualToExcel, exportIndividualToWord, exportIndividualToPDF } from '../lib/exportUtils';

export const ConfirmationPage: React.FC = () => {
  const { token, slug, moduleCode } = useParams<{ token?: string; slug?: string; moduleCode?: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const stateData = location.state as {
    soumissionId?: string;
    secteurNom?: string;
    moduleTitre?: string;
    standaloneToken?: string;
  } | null;

  // Resolve token and sector/module info
  const activeToken = token || stateData?.standaloneToken;
  const formEntry = activeToken ? resolveFormToken(activeToken) : null;

  const resolvedSlug = formEntry?.secteurSlug || slug || '';
  const secteur = getSecteurBySlug(resolvedSlug);
  const normalizedModuleCode = formEntry?.moduleCode || (moduleCode || '').replace('module-', '').toUpperCase();

  const [soumission, setSoumission] = useState<Soumission | null>(null);

  useEffect(() => {
    async function load() {
      if (stateData?.soumissionId) {
        const found = await getSubmissionById(stateData.soumissionId);
        if (found) setSoumission(found);
      }
    }
    load();
  }, [stateData?.soumissionId]);

  const returnFormPath = activeToken
    ? `/f/${activeToken}`
    : secteur
    ? `/f/${getTokenForForm(secteur.slug, normalizedModuleCode)}`
    : '/';

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8" id="confirmation-view">
      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-3">
        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 inline-flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Soumission enregistrée &amp; sécurisée
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Évaluation enregistrée avec succès !
        </h1>
        <p className="text-slate-600 text-sm max-w-xl mx-auto leading-relaxed">
          Votre évaluation pour le <strong>Module {normalizedModuleCode}</strong> du secteur{' '}
          <strong>{secteur?.nom || resolvedSlug}</strong> a bien été enregistrée et transmise dans le cadre du PROJET BEN/301 (ASCB).
        </p>
      </div>

      {stateData?.soumissionId && (
        <div className="inline-block p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600">
          <span>Identifiant de soumission : </span>
          <code className="font-mono font-bold text-slate-900">{stateData.soumissionId}</code>
        </div>
      )}

      {/* Export options */}
      {soumission && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs max-w-lg mx-auto space-y-3 text-left">
          <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span>Télécharger une copie de vos réponses :</span>
            <span className="text-[11px] text-emerald-700 font-semibold">Format officiel ASCB</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => exportIndividualToExcel(soumission)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel (.xlsx)</span>
            </button>
            <button
              type="button"
              onClick={() => exportIndividualToWord(soumission)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Word (.doc)</span>
            </button>
            <button
              type="button"
              onClick={() => exportIndividualToPDF(soumission)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>PDF (.pdf)</span>
            </button>
          </div>
        </div>
      )}

      {/* Actions: Revenir à mon formulaire / Accueil */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <Link
          to={returnFormPath}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
        >
          <Lock className="w-4 h-4 text-amber-600" />
          <span>Consulter mon formulaire transmis</span>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition"
        >
          <Home className="w-4 h-4" />
          <span>Retour au portail d'accueil</span>
        </Link>
      </div>

      <div className="text-[11px] text-slate-400">
        Les formulaires d'évaluation sont strictement séparés. Chaque formulaire nécessite son propre lien d'accès confidentiel.
      </div>
    </div>
  );
};
