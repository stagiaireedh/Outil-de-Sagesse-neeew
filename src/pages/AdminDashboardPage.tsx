import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Shield,
  FileText,
  Users,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  Download,
  Upload,
  FileEdit,
  RotateCcw,
  Trash2,
  AlertTriangle,
  Database,
  Check,
  HelpCircle,
  X,
  Lock,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import { Soumission } from '../types';
import {
  fetchAllSoumissions,
  getLocalBrouillons,
  deleteSoumission,
  unlockSectorModule,
  getSupabaseCredentials,
  setCustomSupabaseCredentials,
  testSupabaseConnection,
  syncPendingLocalSubmissions,
  syncAllLocalDrafts,
  exportAllSubmissionsAsJSON,
  importSubmissionsFromJSON
} from '../lib/supabase';
import {
  exportGlobalToExcel,
  exportGlobalToWord,
  exportGlobalToPDF,
  exportIndividualToExcel,
  exportIndividualToWord,
  exportIndividualToPDF
} from '../lib/exportUtils';
import { SECTEURS_DATA } from '../data/secteursData';

export const AdminDashboardPage: React.FC = () => {
  const [toutesLesSoumissions, setToutesLesSoumissions] = useState<Soumission[]>([]);
  const [loading, setLoading] = useState(true);
  const [ongletActif, setOngletActif] = useState<'tous' | 'completes' | 'brouillons'>('tous');
  const [filtreSecteur, setFiltreSecteur] = useState<string>('all');
  const [filtreModule, setFiltreModule] = useState<string>('all');
  const [recherche, setRecherche] = useState<string>('');

  // Unlock module state
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockSecteur, setUnlockSecteur] = useState('eau');
  const [unlockModule, setUnlockModule] = useState('B1');
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Delete state
  const [soumissionASupprimer, setSoumissionASupprimer] = useState<Soumission | null>(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [messageNotification, setMessageNotification] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Supabase connection settings modal
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [dbCreds, setDbCreds] = useState(getSupabaseCredentials());
  const [inputUrl, setInputUrl] = useState('');
  const [inputKey, setInputKey] = useState('');
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; rowCount?: number } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Import JSON modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const chargerDonnees = async () => {
    setLoading(true);
    // Background auto-sync of any pending drafts & submissions
    try {
      await syncAllLocalDrafts();
      await syncPendingLocalSubmissions();
    } catch {
      // ignore
    }
    const allData = await fetchAllSoumissions();
    setToutesLesSoumissions(allData);
    setDbCreds(getSupabaseCredentials());
    setLoading(false);
  };

  const executerSuppression = async () => {
    if (!soumissionASupprimer) return;
    setSuppressionEnCours(true);
    const res = await deleteSoumission(soumissionASupprimer.id);
    setSuppressionEnCours(false);
    if (res.success) {
      setMessageNotification({
        type: 'success',
        text: `L'enregistrement (${soumissionASupprimer.secteur_slug.toUpperCase()} - Module ${soumissionASupprimer.module_code}) a bien été supprimé de la base. L'accès pour ce répondant est automatiquement réactivé.`
      });
      setSoumissionASupprimer(null);
      chargerDonnees();
    } else {
      setMessageNotification({
        type: 'error',
        text: res.error || 'Erreur lors de la suppression.'
      });
    }
  };

  const handleExecuteUnlock = async () => {
    setIsUnlocking(true);
    const res = await unlockSectorModule(unlockSecteur, unlockModule);
    setIsUnlocking(false);
    setMessageNotification({
      type: res.success ? 'success' : 'error',
      text: res.message
    });
    setShowUnlockModal(false);
    chargerDonnees();
  };

  const handleTestConnection = async () => {
    setIsTestingDb(true);
    setTestResult(null);
    const res = await testSupabaseConnection(inputUrl || dbCreds.url, inputKey || dbCreds.anonKey);
    setIsTestingDb(false);
    setTestResult(res);
  };

  const handleSaveDbConfig = async () => {
    if (inputUrl && inputKey) {
      setCustomSupabaseCredentials(inputUrl, inputKey);
      setDbCreds(getSupabaseCredentials());
      setMessageNotification({
        type: 'success',
        text: 'Configuration Supabase enregistrée avec succès. Synchronisation en cours...'
      });
      setShowConfigModal(false);
      await chargerDonnees();
    }
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    const [draftsRes, subsRes] = await Promise.all([
      syncAllLocalDrafts(),
      syncPendingLocalSubmissions()
    ]);
    setIsSyncing(false);
    const totalSynced = draftsRes + subsRes.syncedCount;
    setMessageNotification({
      type: subsRes.errors.length > 0 ? 'info' : 'success',
      text: `Synchronisation terminée : ${totalSynced} enregistrement(s) vérifié(s) et actualisé(s) avec Supabase.${subsRes.errors.length > 0 ? ' (' + subsRes.errors.length + ' avertissement(s))' : ''}`
    });
    chargerDonnees();
  };

  const handleExportExcel = () => {
    const listToExport = filtered.length > 0 ? filtered : toutesLesSoumissions;
    if (listToExport.length === 0) {
      setMessageNotification({ type: 'info', text: 'Aucune donnée à exporter.' });
      return;
    }
    exportGlobalToExcel(listToExport);
    setMessageNotification({
      type: 'success',
      text: `Export Excel (.xlsx) généré avec succès avec toutes les réponses et indicateurs (${listToExport.length} évaluation(s)).`
    });
  };

  const handleExportWord = () => {
    const listToExport = filtered.length > 0 ? filtered : toutesLesSoumissions;
    if (listToExport.length === 0) {
      setMessageNotification({ type: 'info', text: 'Aucune donnée à exporter.' });
      return;
    }
    exportGlobalToWord(listToExport);
    setMessageNotification({
      type: 'success',
      text: `Dossier Word (.doc) complet généré avec succès (${listToExport.length} évaluation(s)).`
    });
  };

  const handleExportPDF = () => {
    const listToExport = filtered.length > 0 ? filtered : toutesLesSoumissions;
    if (listToExport.length === 0) {
      setMessageNotification({ type: 'info', text: 'Aucune donnée à exporter.' });
      return;
    }
    exportGlobalToPDF(listToExport);
    setMessageNotification({
      type: 'success',
      text: `Rapport PDF synthétique généré avec succès (${listToExport.length} évaluation(s)).`
    });
  };

  const handleExportJSON = async () => {
    const jsonStr = await exportAllSubmissionsAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluations-ben301-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = async () => {
    if (!importJsonText.trim()) return;
    setIsImporting(true);
    setImportError(null);
    const res = await importSubmissionsFromJSON(importJsonText);
    setIsImporting(false);
    if (res.success) {
      setMessageNotification({
        type: 'success',
        text: `${res.count} évaluation(s) importée(s) et intégrée(s) avec succès !`
      });
      setShowImportModal(false);
      setImportJsonText('');
      chargerDonnees();
    } else {
      setImportError(res.error || "Erreur lors de l'import");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) setImportJsonText(content);
    };
    reader.readAsText(file);
  };

  const location = useLocation();

  useEffect(() => {
    chargerDonnees();
    if (location.state && (location.state as any).message) {
      setMessageNotification({
        type: 'success',
        text: (location.state as any).message
      });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Derived counts
  const soumissionsValidees = toutesLesSoumissions.filter((s) => s.statut === 'complete');
  const brouillonsEnCours = toutesLesSoumissions.filter((s) => s.statut === 'brouillon');

  const totalSoumissions = soumissionsValidees.length;
  const totalBrouillons = brouillonsEnCours.length;
  const totalEnregistrements = toutesLesSoumissions.length;

  // Filtered list
  const filtered = toutesLesSoumissions.filter((s) => {
    if (ongletActif === 'completes' && s.statut !== 'complete') return false;
    if (ongletActif === 'brouillons' && s.statut !== 'brouillon') return false;

    const matchSecteur = filtreSecteur === 'all' || s.secteur_slug === filtreSecteur;
    const matchModule = filtreModule === 'all' || s.module_code === filtreModule;
    const matchText =
      (s.nom_organisation || '').toLowerCase().includes(recherche.toLowerCase()) ||
      (s.nom_repondant || '').toLowerCase().includes(recherche.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(recherche.toLowerCase()));
    return matchSecteur && matchModule && matchText;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="admin-dashboard">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-4 h-4" /> Espace Administrateur
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Tableau de bord de suivi des évaluations
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            Supervision des soumissions transmises et des brouillons en cours pour les 5 secteurs prioritaires.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowUnlockModal(true)}
            id="btn-unlock-module"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition"
            title="Débloquer l'accès pour un secteur et un module"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Débloquer un module</span>
          </button>

          <button
            onClick={() => {
              setInputUrl(dbCreds.url);
              setInputKey(dbCreds.anonKey);
              setTestResult(null);
              setShowConfigModal(true);
            }}
            id="btn-settings-supabase"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            title="Paramètres de la base de données Supabase"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Connexion Supabase</span>
          </button>

          <button
            onClick={chargerDonnees}
            id="btn-refresh-dashboard"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            title="Rafraîchir les données"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>

          <Link
            to="/"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            Portail public
          </Link>
        </div>
      </div>

      {/* Notification banner */}
      {messageNotification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold ${
            messageNotification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : messageNotification.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {messageNotification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : messageNotification.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            ) : (
              <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
            )}
            <span>{messageNotification.text}</span>
          </div>
          <button
            onClick={() => setMessageNotification(null)}
            className="text-slate-400 hover:text-slate-700 font-bold px-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Diagnostic banner if Supabase credentials are missing in production */}
      {dbCreds.source === 'none' && (
        <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-slate-900">
                  Des participants ont soumis des rapports mais ils n'apparaissent pas ici ?
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                  Lorsque des répondants soumettent depuis leurs propres téléphones ou ordinateurs, leurs données sont envoyées à la base distante Supabase. Si votre application Vercel n'est pas encore connectée à votre base Supabase, les données restent sur les appareils des participants. Connectez la base pour synchroniser instantanément toutes les soumissions.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setInputUrl(dbCreds.url);
                  setInputKey(dbCreds.anonKey);
                  setShowConfigModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-xs transition"
              >
                Connecter la base Supabase
              </button>
              <button
                type="button"
                onClick={() => setShowImportModal(true)}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs shadow-xs transition"
              >
                Importer un fichier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Soumissions validées</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{totalSoumissions}</div>
          <div className="text-[11px] text-slate-500">Transmises et enregistrées</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Brouillons en cours</span>
            <FileEdit className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{totalBrouillons}</div>
          <div className="text-[11px] text-slate-500">Enregistrés par les répondants (temps réel)</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total suivi</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalEnregistrements}</div>
          <div className="text-[11px] text-slate-500">Soumissions + Brouillons actifs</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Secteurs couverts</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {new Set(toutesLesSoumissions.map((s) => s.secteur_slug)).size} / 5
          </div>
          <div className="text-[11px] text-slate-500">Eau, Santé, Déc., DH, Budget</div>
        </div>
      </div>

      {/* Filter and Search Bar + Action Tools */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        {/* Navigation Tabs (Tous / Complètes / Brouillons) + Export Tools */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOngletActif('tous')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                ongletActif === 'tous'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>Tout voir</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-700/40 text-slate-200">
                {totalEnregistrements}
              </span>
            </button>
            <button
              onClick={() => setOngletActif('completes')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                ongletActif === 'completes'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Soumissions validées</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-800/40 text-emerald-100">
                {totalSoumissions}
              </span>
            </button>
            <button
              onClick={() => setOngletActif('brouillons')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                ongletActif === 'brouillons'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>Brouillons en cours</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-700/40 text-amber-100">
                {totalBrouillons}
              </span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
              title="Synchroniser les données locales vers Supabase"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronisation...' : 'Synchroniser'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              id="btn-global-export-excel"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs shadow-2xs transition cursor-pointer"
              title="Télécharger l'ensemble des évaluations dans un classeur Excel multi-feuilles (.xlsx) avec la matrice complète des indicateurs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Export Excel (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={handleExportWord}
              id="btn-global-export-word"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 font-bold text-xs shadow-2xs transition cursor-pointer"
              title="Télécharger le dossier complet des évaluations au format Word (.doc) avec toutes les grilles et synthèses"
            >
              <FileText className="w-3.5 h-3.5 text-blue-700" />
              <span>Export Word (.doc)</span>
            </button>

            <button
              type="button"
              onClick={handleExportPDF}
              id="btn-global-export-pdf"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-2xs transition cursor-pointer"
              title="Télécharger le rapport général synthétique en PDF (.pdf)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export PDF (.pdf)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
              title="Importer des données depuis un fichier JSON"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Importer</span>
            </button>

            <button
              type="button"
              onClick={handleExportJSON}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
              title="Télécharger l'ensemble des données au format JSON complet"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-700">Filtres :</span>
            </div>

            {/* Filter by Sector */}
            <select
              value={filtreSecteur}
              onChange={(e) => setFiltreSecteur(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-emerald-600"
            >
              <option value="all">Tous les secteurs (5)</option>
              {SECTEURS_DATA.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.nom}
                </option>
              ))}
            </select>

            {/* Filter by Module */}
            <select
              value={filtreModule}
              onChange={(e) => setFiltreModule(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-emerald-600"
            >
              <option value="all">Tous les modules (B1, B2, B3, C)</option>
              <option value="B1">Module B1 (Concertation)</option>
              <option value="B2">Module B2 (Dialogue)</option>
              <option value="B3">Module B3 (Événements)</option>
              <option value="C">Module C (Auto-évaluation)</option>
            </select>
          </div>

          {/* Search input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher une organisation, répondant..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-emerald-600"
            />
          </div>
        </div>

        {/* Submissions & Drafts Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200 tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Secteur</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Organisation</th>
                <th className="py-3 px-4">Répondant</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Chargement des évaluations...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 space-y-2">
                    <p className="font-semibold text-slate-700">Aucun enregistrement trouvé</p>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Aucune évaluation ne correspond aux filtres ou n'a encore été synchronisée. Utilisez le bouton « Connexion Supabase » pour vérifier la liaison de base.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const estBrouillon = s.statut === 'brouillon';
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        {new Date(s.date_creation).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 capitalize">
                        {s.secteur_slug}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                            s.module_code === 'B1'
                              ? 'bg-blue-100 text-blue-800'
                              : s.module_code === 'B2'
                              ? 'bg-teal-100 text-teal-800'
                              : s.module_code === 'B3'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          Module {s.module_code}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 max-w-[200px] truncate">
                        {s.nom_organisation || <span className="text-slate-400 italic">Non renseignée</span>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {s.nom_repondant || <span className="text-slate-400 italic">Non renseigné</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        {estBrouillon ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                            <Clock className="w-3 h-3 text-amber-600" /> Brouillon en cours
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Validée &amp; transmise
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Quick row exports */}
                          <button
                            type="button"
                            onClick={() => exportIndividualToExcel(s)}
                            id={`btn-row-excel-${s.id}`}
                            className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition border border-transparent hover:border-emerald-200 cursor-pointer"
                            title="Exporter cette évaluation en Excel (.xlsx)"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => exportIndividualToWord(s)}
                            id={`btn-row-word-${s.id}`}
                            className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-50 transition border border-transparent hover:border-blue-200 cursor-pointer"
                            title="Exporter cette évaluation en Word (.doc)"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => exportIndividualToPDF(s)}
                            id={`btn-row-pdf-${s.id}`}
                            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition border border-transparent hover:border-slate-300 cursor-pointer"
                            title="Exporter cette évaluation en PDF (.pdf)"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {estBrouillon ? (
                            <Link
                              to={`/secteur/${s.secteur_slug}/module-${s.module_code.toLowerCase()}`}
                              id={`btn-resume-draft-${s.id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-semibold text-xs transition"
                            >
                              <FileEdit className="w-3.5 h-3.5" />
                              <span>Reprendre</span>
                            </Link>
                          ) : (
                            <Link
                              to={`/admin/soumissions/${s.id}`}
                              id={`btn-view-submission-${s.id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition"
                            >
                              <span>Détails</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          )}

                          {!estBrouillon && (
                            <button
                              onClick={() => {
                                setUnlockSecteur(s.secteur_slug);
                                setUnlockModule(s.module_code);
                                setShowUnlockModal(true);
                              }}
                              id={`btn-quick-unlock-${s.id}`}
                              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-semibold text-xs transition cursor-pointer"
                              title="Débloquer ce module pour autoriser une nouvelle saisie"
                            >
                              <Lock className="w-3 h-3 text-amber-700" />
                              <span>Débloquer</span>
                            </button>
                          )}

                          {/* Delete button */}
                          <button
                            onClick={() => setSoumissionASupprimer(s)}
                            id={`btn-delete-submission-${s.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition border border-transparent hover:border-red-200 cursor-pointer"
                            title={estBrouillon ? 'Supprimer ce brouillon' : 'Supprimer cette évaluation'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supabase Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Configuration Base de Données Supabase</h3>
                  <p className="text-xs text-slate-500">
                    Centralisation des évaluations soumises par tous les participants.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Origine actuelle :</span>
                  <span className="px-2 py-0.5 rounded-full font-bold text-[11px] bg-slate-200 text-slate-800">
                    {dbCreds.source === 'env'
                      ? 'Variables d’environnement Vercel'
                      : dbCreds.source === 'custom'
                      ? 'Navigateur local'
                      : 'Non configuré'}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Pour que tous les participants envoient automatiquement leurs rapports sur votre base sans manipulation, définissez <code>VITE_SUPABASE_URL</code> et <code>VITE_SUPABASE_ANON_KEY</code> dans les paramètres de votre projet Vercel (Settings &gt; Environment Variables).
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">URL du Projet Supabase :</label>
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:outline-emerald-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Clé API Publique (anon key) :</label>
                <textarea
                  rows={2}
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:outline-emerald-600"
                />
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-start gap-2 ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div>{testResult.message}</div>
                    {testResult.rowCount !== undefined && (
                      <div className="font-normal text-[11px] mt-0.5">
                        Nombre d'évaluations dans la table : <strong>{testResult.rowCount}</strong>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTestingDb}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
              >
                {isTestingDb ? 'Test en cours...' : 'Tester la connexion'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs transition"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={handleSaveDbConfig}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition"
                >
                  Enregistrer &amp; Synchroniser
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Importer des Évaluations (JSON)</h3>
                  <p className="text-xs text-slate-500">
                    Importez des rapports sauvegardés depuis un autre terminal.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Charger un fichier JSON :</label>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Ou coller directement le contenu JSON :</label>
                <textarea
                  rows={5}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder="[{ id: 'sub_...', nom_organisation: '...', ... }]"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-[11px] focus:outline-emerald-600"
                />
              </div>

              {importError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-semibold">
                  {importError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleImportSubmit}
                disabled={isImporting || !importJsonText.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition disabled:opacity-50"
              >
                {isImporting ? 'Importation...' : 'Lancer l’importation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deletion */}
      {soumissionASupprimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">
                Confirmer la suppression ?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Vous êtes sur le point de supprimer l'évaluation du{' '}
                <strong>Module {soumissionASupprimer.module_code}</strong> pour le secteur{' '}
                <strong className="capitalize">{soumissionASupprimer.secteur_slug}</strong>
                {soumissionASupprimer.nom_organisation ? ` (${soumissionASupprimer.nom_organisation})` : ''}.
              </p>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs">
                Cette suppression retirera cet enregistrement de la base et réactivera automatiquement l'accès pour ce participant/secteur, lui permettant de resoumettre immédiatement.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSoumissionASupprimer(null)}
                disabled={suppressionEnCours}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={executerSuppression}
                disabled={suppressionEnCours}
                id="btn-confirm-delete-modal"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
              >
                {suppressionEnCours ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Suppression...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer & Réactiver l'accès</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Déblocage direct d'un module */}
      {showUnlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Réactiver l'accès / Débloquer un module
                </h3>
              </div>
              <button onClick={() => setShowUnlockModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="text-xs text-slate-600 leading-relaxed space-y-3">
              <p>
                Sélectionnez le secteur et le module pour lesquels vous souhaitez redonner la main aux participants. Toute évaluation enregistrée pour cette combinaison sera effacée et le formulaire redeviendra immédiatement accessible à la saisie.
              </p>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Secteur :</label>
                <select
                  value={unlockSecteur}
                  onChange={(e) => setUnlockSecteur(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-medium focus:outline-emerald-600"
                >
                  {SECTEURS_DATA.map((s) => (
                    <option key={s.slug} value={s.slug}>{s.nom}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Module :</label>
                <select
                  value={unlockModule}
                  onChange={(e) => setUnlockModule(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-medium focus:outline-emerald-600"
                >
                  <option value="B1">Module B1 (Concertation)</option>
                  <option value="B2">Module B2 (Dialogue)</option>
                  <option value="B3">Module B3 (Événements de dialogue)</option>
                  <option value="C">Module C (Auto-évaluation OSC)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowUnlockModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleExecuteUnlock}
                disabled={isUnlocking}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition disabled:opacity-50"
              >
                {isUnlocking ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Déblocage...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Débloquer ce module</span>
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
