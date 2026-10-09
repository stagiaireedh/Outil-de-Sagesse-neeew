import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  XCircle,
  Building,
  User,
  Mail,
  Calendar,
  Shield,
  Trash2,
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import { Soumission } from '../types';
import { getSubmissionById, deleteSoumission } from '../lib/supabase';
import { getCriteresByModule } from '../data/modulesData';
import { getSecteurBySlug } from '../data/secteursData';
import { exportIndividualToExcel, exportIndividualToWord, exportIndividualToPDF } from '../lib/exportUtils';

export const AdminSoumissionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [soumission, setSoumission] = useState<Soumission | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    setDeleteError(null);
    const res = await deleteSoumission(id);
    setIsDeleting(false);
    if (res.success) {
      navigate('/admin/dashboard', {
        state: { message: `L'évaluation a été supprimée avec succès. Le formulaire est de nouveau accessible.` }
      });
    } else {
      setDeleteError(res.error || 'Erreur lors de la suppression.');
    }
  };

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      const found = await getSubmissionById(id);
      setSoumission(found || null);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
        Chargement des détails de l'évaluation...
      </div>
    );
  }

  if (!soumission) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-xl font-bold text-slate-900">Soumission introuvable</h1>
        <p className="text-xs text-slate-500">L'évaluation demandée n'existe pas ou a été archivée.</p>
        <Link to="/admin/dashboard" className="text-xs text-emerald-700 font-bold inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Retour au tableau de bord
        </Link>
      </div>
    );
  }

  const secteur = getSecteurBySlug(soumission.secteur_slug);
  const criteres = getCriteresByModule(soumission.module_code);

  const exporterExcel = () => {
    exportIndividualToExcel(soumission);
  };

  const exporterWord = () => {
    exportIndividualToWord(soumission);
  };

  const exporterPDF = () => {
    exportIndividualToPDF(soumission);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="submission-detail-view">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Retour à la liste des soumissions
        </Link>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exporterExcel}
            id="btn-export-excel"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
            title="Télécharger la fiche d'évaluation complète au format Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel (.xlsx)</span>
          </button>

          <button
            onClick={exporterWord}
            id="btn-export-word"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
            title="Télécharger la fiche d'évaluation au format Word (.doc)"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Export Word (.doc)</span>
          </button>

          <button
            onClick={exporterPDF}
            id="btn-export-pdf"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
            title="Télécharger le rapport PDF officiel"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export PDF (.pdf)</span>
          </button>

          <button
            onClick={() => window.print()}
            id="btn-print-view"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
            title="Imprimer cette page"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Imprimer</span>
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            id="btn-delete-detail-submission"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
            <span>Supprimer</span>
          </button>
        </div>
      </div>

      {deleteError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{deleteError}</span>
        </div>
      )}

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white font-bold text-xs">
                Module {soumission.module_code}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs uppercase">
                Secteur {secteur?.nom || soumission.secteur_slug}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Fiche détaillée d'évaluation
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              ID : {soumission.id} &bull; Date de soumission : {new Date(soumission.date_creation).toLocaleString('fr-FR')}
            </p>
          </div>

          {soumission.statut === 'brouillon' ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Brouillon en cours
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Statut Validé &amp; Transmis
            </span>
          )}
        </div>

        {/* Info répondant */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Répondant</span>
            <strong className="text-slate-900 text-sm">{soumission.nom_repondant}</strong>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Organisation</span>
            <strong className="text-slate-900 text-sm">{soumission.nom_organisation}</strong>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Fonction</span>
            <span className="text-slate-700">{soumission.fonction || 'Non précisé'}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Email</span>
            <span className="text-slate-700">{soumission.email || 'Non précisé'}</span>
          </div>
          {soumission.organisations_evaluees && (
            <div className="sm:col-span-2 md:col-span-4 pt-2 border-t border-slate-200">
              <span className="text-slate-400 block font-medium">Organisation(s) évaluée(s) :</span>
              <strong className="text-purple-900">{soumission.organisations_evaluees}</strong>
            </div>
          )}
        </div>

        {/* Détail par critère */}
        <div className="space-y-6">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            Réponses aux critères et indicateurs
          </h2>

          {criteres.map((critere) => {
            return (
              <div key={critere.id} className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2.5 flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">
                    {critere.code} : {critere.titre}
                  </span>
                </div>

                <div className="divide-y divide-slate-100 bg-white">
                  {critere.indicateurs.map((ind) => {
                    const rep = soumission.reponses[ind.code] || soumission.reponses[ind.id];
                    const reponseVal = rep ? rep.reponse_oui_non : null;

                    return (
                      <div key={ind.id} className="p-4 space-y-2 text-xs">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-0.5">
                            <span className="font-mono text-[11px] font-bold text-slate-500">
                              {ind.code}
                            </span>
                            <div className="font-medium text-slate-800">
                              {ind.libelle}
                            </div>
                          </div>

                          <div className="shrink-0">
                            {reponseVal === true ? (
                              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md text-xs">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Oui
                              </span>
                            ) : reponseVal === false ? (
                              <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-md text-xs">
                                <XCircle className="w-3.5 h-3.5" /> Non
                              </span>
                            ) : (
                              <span className="text-slate-400 italic text-xs">Non renseigné</span>
                            )}
                          </div>
                        </div>

                        {(rep?.precisions || rep?.actions_renforcement) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-[11px] bg-slate-50 p-3 rounded-lg border border-slate-100">
                            {rep.precisions && (
                              <div>
                                <span className="font-bold text-slate-600 block">Précisions / Preuves :</span>
                                <p className="text-slate-800">{rep.precisions}</p>
                              </div>
                            )}
                            {rep.actions_renforcement && (
                              <div>
                                <span className="font-bold text-slate-600 block">Actions de renforcement :</span>
                                <p className="text-slate-800">{rep.actions_renforcement}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {soumission.observations_criteres && soumission.observations_criteres[critere.id] && (
                  <div className="bg-slate-50/70 p-3 border-t border-slate-100 text-xs">
                    <span className="font-bold text-slate-600">Autres observations : </span>
                    <span className="text-slate-800">{soumission.observations_criteres[critere.id]}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Synthèse finale */}
        {soumission.synthese && (
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              Synthèse &bull; Forces et Fragilités
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
                <span className="font-bold text-emerald-900 block">Forces constatées :</span>
                <p className="text-slate-800 whitespace-pre-line">{soumission.synthese.forces}</p>
              </div>

              <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 text-xs space-y-1">
                <span className="font-bold text-rose-900 block">Fragilités / Défis identifiés :</span>
                <p className="text-slate-800 whitespace-pre-line">{soumission.synthese.fragilites}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Deletion */}
      {showDeleteModal && soumission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">
                Supprimer cette évaluation ?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Êtes-vous certain de vouloir supprimer cette évaluation pour le{' '}
                <strong>Module {soumission.module_code}</strong> ({soumission.secteur_slug.toUpperCase()}) ?
              </p>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                <strong>Attention :</strong> La suppression efface définitivement les réponses enregistrées et <strong>rouvre immédiatement le formulaire</strong> pour permettre une nouvelle transmission.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                id="btn-confirm-delete-detail"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Suppression...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirmer la suppression</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
