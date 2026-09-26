import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ArrowRight,
  Home,
  ArrowLeft,
  Layers,
  ShieldCheck,
  Download,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { getSecteurBySlug } from '../data/secteursData';
import { isModuleApplicable } from '../data/modulesData';
import { getSubmissionById } from '../lib/supabase';
import { Soumission } from '../types';
import { exportIndividualToExcel, exportIndividualToWord, exportIndividualToPDF } from '../lib/exportUtils';

export const ConfirmationPage: React.FC = () => {
  const { slug, moduleCode } = useParams<{ slug: string; moduleCode: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const secteur = getSecteurBySlug(slug || '');
  const [soumission, setSoumission] = useState<Soumission | null>(null);

  const normalizedModuleCode = (moduleCode || '').replace('module-', '').toUpperCase();
  const stateData = location.state as { soumissionId?: string; secteurNom?: string; moduleTitre?: string } | null;

  useEffect(() => {
    async function load() {
      if (stateData?.soumissionId) {
        const found = await getSubmissionById(stateData.soumissionId);
        if (found) setSoumission(found);
      }
    }
    load();
  }, [stateData?.soumissionId]);

  const nextRoute = (): string => {
    if (!secteur) return '/';
    if (normalizedModuleCode === 'B1') {
      const b2Applicable = isModuleApplicable(secteur, 'B2');
      return b2Applicable
        ? `/secteur/${secteur.slug}/module-b2`
        : `/secteur/${secteur.slug}/module-b3`;
    }
    if (normalizedModuleCode === 'B2') return `/secteur/${secteur.slug}/module-b3`;
    if (normalizedModuleCode === 'B3') return `/secteur/${secteur.slug}/module-c`;
    return `/secteur/${secteur.slug}`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8" id="confirmation-view">
      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs animate-bounce">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-3">
        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
          Soumission enregistrée avec succès
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Évaluation enregistrée !
        </h1>
        <p className="text-slate-600 text-sm max-w-xl mx-auto leading-relaxed">
          Votre évaluation pour le <strong>Module {normalizedModuleCode}</strong> du secteur <strong>{secteur?.nom || slug}</strong> a bien été prise en compte et intégrée aux données du PROJET BEN/301.
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

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <Link
          to={`/secteur/${secteur?.slug || ''}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
        >
          <Layers className="w-4 h-4" />
          <span>Vue d'ensemble du secteur</span>
        </Link>

        <button
          onClick={() => navigate(nextRoute())}
          id="btn-continue-next-module"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
        >
          <span>Poursuivre vers le module suivant</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="pt-2">
        <Link
          to={`/secteur/${secteur?.slug || ''}/module-${normalizedModuleCode.toLowerCase()}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-700 font-medium transition"
        >
          <span>Consulter l'évaluation transmise pour ce module</span>
        </Link>
      </div>
    </div>
  );
};
