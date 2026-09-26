import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Building,
  User,
  Mail,
  Briefcase,
  FileCheck,
  RotateCcw,
  Lock,
  ShieldAlert,
  Download,
  UploadCloud
} from 'lucide-react';
import { Critere, ModuleCode, ReponseIndicateur, Secteur, Soumission } from '../types';
import { getCriteresByModule, isModuleApplicable, MODULES_INFO } from '../data/modulesData';
import { submitEvaluation, getExistingSubmission, getExistingDraft, deleteSoumission, generateUUID, ensureUUID, removeLocalSubmissionForModule, saveDraft } from '../lib/supabase';

interface FormulaireModuleProps {
  moduleCode: ModuleCode;
  secteur: Secteur;
}

export const FormulaireModule: React.FC<FormulaireModuleProps> = ({ moduleCode, secteur }) => {
  const navigate = useNavigate();
  const moduleInfo = MODULES_INFO.find((m) => m.code === moduleCode);
  const criteres: Critere[] = getCriteresByModule(moduleCode);
  const applicable = isModuleApplicable(moduleCode, secteur.slug);

  // Identity / respondent state
  const [nomRepondant, setNomRepondant] = useState('');
  const [nomOrganisation, setNomOrganisation] = useState('');
  const [email, setEmail] = useState('');
  const [fonction, setFonction] = useState('');
  const [organisationsEvaluees, setOrganisationsEvaluees] = useState('');

  // Responses state { [indicateur_id]: ReponseIndicateur }
  const [reponses, setReponses] = useState<Record<string, ReponseIndicateur>>({});

  // Criterion observations { [critere_id]: string }
  const [observations, setObservations] = useState<Record<string, string>>({});

  // Step handling: 'formulaire' | 'synthese'
  const [etapeCourante, setEtapeCourante] = useState<'formulaire' | 'synthese'>('formulaire');
  const [forces, setForces] = useState('');
  const [fragilites, setFragilites] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Mandatory validation states
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [validationErrorMsg, setValidationErrorMsg] = useState<string | null>(null);

  // Check if this module is already submitted
  const [existingSubmission, setExistingSubmission] = useState<Soumission | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [isNewSubmissionMode, setIsNewSubmissionMode] = useState(false);

  const chargerDonneesPrecedentes = () => {
    if (!existingSubmission) return;
    setNomRepondant(existingSubmission.nom_repondant || '');
    setNomOrganisation(existingSubmission.nom_organisation || '');
    setEmail(existingSubmission.email || '');
    setFonction(existingSubmission.fonction || '');
    setOrganisationsEvaluees(existingSubmission.organisations_evaluees || '');
    setReponses(existingSubmission.reponses || {});
    setObservations(existingSubmission.observations_criteres || {});
    if (existingSubmission.synthese) {
      setForces(existingSubmission.synthese.forces || '');
      setFragilites(existingSubmission.synthese.fragilites || '');
    }
    setIsEditingExisting(true);
    setIsNewSubmissionMode(true);
    setValidationErrorMsg(null);
  };

  const reinitialiserPourNouvelleSoumission = () => {
    setNomRepondant('');
    setNomOrganisation('');
    setEmail('');
    setFonction('');
    setOrganisationsEvaluees('');
    setReponses({});
    setObservations({});
    setForces('');
    setFragilites('');
    setIsEditingExisting(false);
    setIsNewSubmissionMode(true);
    setExistingSubmission(null);
    setValidationErrorMsg(null);
    localStorage.removeItem(`draft_${secteur.slug}_${moduleCode}`);
    localStorage.removeItem(`draft_id_${secteur.slug}_${moduleCode}`);
  };

  useEffect(() => {
    let isMounted = true;
    async function verifierSoumissionExistante() {
      setCheckingExisting(true);
      const soum = await getExistingSubmission(secteur.slug, moduleCode);
      if (isMounted) {
        setExistingSubmission(soum);
        if (soum) {
          if (soum.nom_repondant) setNomRepondant(soum.nom_repondant);
          if (soum.nom_organisation) setNomOrganisation(soum.nom_organisation);
          if (soum.email) setEmail(soum.email);
          if (soum.fonction) setFonction(soum.fonction);
          if (soum.organisations_evaluees) setOrganisationsEvaluees(soum.organisations_evaluees);
          if (soum.reponses) setReponses(soum.reponses);
          if (soum.observations_criteres) setObservations(soum.observations_criteres);
          if (soum.synthese?.forces) setForces(soum.synthese.forces);
          if (soum.synthese?.fragilites) setFragilites(soum.synthese.fragilites);
        }
        setCheckingExisting(false);
      }
    }
    verifierSoumissionExistante();
    return () => {
      isMounted = false;
    };
  }, [secteur.slug, moduleCode]);

  const isReadOnly = Boolean(existingSubmission && !isNewSubmissionMode);

  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftNotice, setDraftNotice] = useState<string | null>(null);

  // Load existing draft if available (local or Supabase) only if not read-only
  useEffect(() => {
    if (isReadOnly) return;
    let isMounted = true;
    async function chargerBrouillonExistant() {
      const draft = await getExistingDraft(secteur.slug, moduleCode);
      if (draft && isMounted) {
        if (draft.nom_repondant) setNomRepondant(draft.nom_repondant);
        if (draft.nom_organisation) setNomOrganisation(draft.nom_organisation);
        if (draft.email) setEmail(draft.email);
        if (draft.fonction) setFonction(draft.fonction);
        if (draft.organisations_evaluees) setOrganisationsEvaluees(draft.organisations_evaluees);
        if (draft.reponses) setReponses(draft.reponses);
        if (draft.observations_criteres) setObservations(draft.observations_criteres);
        if (draft.synthese?.forces) setForces(draft.synthese.forces);
        if (draft.synthese?.fragilites) setFragilites(draft.synthese.fragilites);
      }
    }
    chargerBrouillonExistant();
    return () => {
      isMounted = false;
    };
  }, [secteur.slug, moduleCode, isReadOnly]);

  // Save draft helper
  const sauvegarderBrouillon = async () => {
    if (isReadOnly) return;
    setIsSavingDraft(true);
    setDraftNotice(null);

    const draftData = {
      secteur_slug: secteur.slug,
      module_code: moduleCode,
      nom_repondant: nomRepondant,
      nom_organisation: nomOrganisation,
      email,
      fonction,
      organisations_evaluees: organisationsEvaluees,
      reponses,
      observations_criteres: observations,
      synthese: {
        forces,
        fragilites
      }
    };

    const res = await saveDraft(draftData);
    setIsSavingDraft(false);
    setSaveSuccessNotice(true);
    if (res.syncedToSupabase) {
      setDraftNotice("Brouillon sauvegardé et transmis en temps réel à l'espace administrateur !");
    } else {
      setDraftNotice("Brouillon sauvegardé sur cet appareil.");
    }

    setTimeout(() => {
      setSaveSuccessNotice(false);
      setDraftNotice(null);
    }, 4000);
  };

  // Helper to resolve dual keys (e.g. 'b1-1-1' -> 'B1.1.1' or vice versa)
  const getCorrespondingKey = (key: string): string => {
    if (key.includes('-')) {
      const parts = key.split('-');
      if (parts.length === 3) return `${parts[0].toUpperCase()}.${parts[1]}.${parts[2]}`;
    } else if (key.includes('.')) {
      const parts = key.split('.');
      if (parts.length === 3) return `${parts[0].toLowerCase()}-${parts[1]}-${parts[2]}`;
    }
    return key;
  };

  // Response change handlers
  const handleReponseChange = (indicateurId: string, valeurOuiNon: boolean) => {
    if (isReadOnly) return;
    const altKey = getCorrespondingKey(indicateurId);
    setReponses((prev) => {
      const repObj = {
        reponse_oui_non: valeurOuiNon,
        precisions: prev[indicateurId]?.precisions || prev[altKey]?.precisions || '',
        actions_renforcement: prev[indicateurId]?.actions_renforcement || prev[altKey]?.actions_renforcement || ''
      };
      return {
        ...prev,
        [indicateurId]: repObj,
        [altKey]: repObj
      };
    });
  };

  const handlePrecisionsChange = (indicateurId: string, texte: string) => {
    if (isReadOnly) return;
    const altKey = getCorrespondingKey(indicateurId);
    setReponses((prev) => {
      const currentOuiNon = prev[indicateurId]?.reponse_oui_non ?? prev[altKey]?.reponse_oui_non ?? null;
      const currentActions = prev[indicateurId]?.actions_renforcement || prev[altKey]?.actions_renforcement || '';
      const repObj = {
        reponse_oui_non: currentOuiNon,
        precisions: texte,
        actions_renforcement: currentActions
      };
      return {
        ...prev,
        [indicateurId]: repObj,
        [altKey]: repObj
      };
    });
  };

  const handleActionsChange = (indicateurId: string, texte: string) => {
    if (isReadOnly) return;
    const altKey = getCorrespondingKey(indicateurId);
    setReponses((prev) => {
      const currentOuiNon = prev[indicateurId]?.reponse_oui_non ?? prev[altKey]?.reponse_oui_non ?? null;
      const currentPrecisions = prev[indicateurId]?.precisions || prev[altKey]?.precisions || '';
      const repObj = {
        reponse_oui_non: currentOuiNon,
        precisions: currentPrecisions,
        actions_renforcement: texte
      };
      return {
        ...prev,
        [indicateurId]: repObj,
        [altKey]: repObj
      };
    });
  };

  // Debounced auto-save
  useEffect(() => {
    if (isReadOnly) return;
    const hasAnyContent =
      nomRepondant.trim() ||
      nomOrganisation.trim() ||
      email.trim() ||
      fonction.trim() ||
      organisationsEvaluees.trim() ||
      Object.keys(reponses).length > 0 ||
      forces.trim() ||
      fragilites.trim();

    if (!hasAnyContent) return;

    const timer = setTimeout(() => {
      saveDraft({
        secteur_slug: secteur.slug,
        module_code: moduleCode,
        nom_repondant: nomRepondant,
        nom_organisation: nomOrganisation,
        email,
        fonction,
        organisations_evaluees: organisationsEvaluees,
        reponses,
        observations_criteres: observations,
        synthese: {
          forces,
          fragilites
        }
      }).catch((err) => console.warn('Debounced draft save error:', err));
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    nomRepondant,
    nomOrganisation,
    email,
    fonction,
    organisationsEvaluees,
    reponses,
    observations,
    forces,
    fragilites,
    secteur.slug,
    moduleCode,
    isReadOnly
  ]);

  // Indicators statistics
  const totalIndicateurs = criteres.reduce((acc, c) => acc + c.indicateurs.length, 0);
  let repondusIndicateurs = 0;
  criteres.forEach((critere) => {
    critere.indicateurs.forEach((ind) => {
      const rep = reponses[ind.id] || reponses[ind.code] || reponses[getCorrespondingKey(ind.id)];
      if (rep && rep.reponse_oui_non !== null && rep.reponse_oui_non !== undefined) {
        repondusIndicateurs++;
      }
    });
  });
  const progressionPercent = totalIndicateurs > 0 ? Math.min(100, Math.round((repondusIndicateurs / totalIndicateurs) * 100)) : 0;

  // Validation function: returns missing indicator IDs and checks respondent fields
  const verifierChampsObligatoires = () => {
    const missingIndicateurs: string[] = [];
    criteres.forEach((critere) => {
      critere.indicateurs.forEach((ind) => {
        const rep = reponses[ind.id];
        if (!rep || rep.reponse_oui_non === null || rep.reponse_oui_non === undefined) {
          missingIndicateurs.push(ind.id);
        }
      });
    });

    const missingRespondent = !nomRepondant.trim() || !nomOrganisation.trim();
    const missingModuleC = moduleCode === 'C' && !organisationsEvaluees.trim();

    return {
      valide: missingIndicateurs.length === 0 && !missingRespondent && !missingModuleC,
      missingIndicateurs,
      missingRespondent,
      missingModuleC
    };
  };

  // Direct final submission
  const handleValiderEtTransmettre = async () => {
    setHasAttemptedSubmit(true);
    const verification = verifierChampsObligatoires();

    if (!verification.valide) {
      if (verification.missingRespondent) {
        setValidationErrorMsg('Veuillez renseigner vos nom, prénom et organisation dans les champs obligatoires.');
        setEtapeCourante('formulaire');
        const el = document.getElementById('input-nom-repondant');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      if (verification.missingModuleC) {
        setValidationErrorMsg('Veuillez indiquer l’organisation ou les organisations évaluées.');
        setEtapeCourante('formulaire');
        const el = document.getElementById('input-org-evaluees');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      if (verification.missingIndicateurs.length > 0) {
        setValidationErrorMsg(
          `Toutes les questions sont obligatoires : il reste ${verification.missingIndicateurs.length} question(s) non renseignée(s). Veuillez répondre par Oui ou Non avant de valider.`
        );
        setEtapeCourante('formulaire');
        const firstMissingId = verification.missingIndicateurs[0];
        setTimeout(() => {
          const el = document.getElementById(`indicateur-block-${firstMissingId}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        return;
      }
    }

    setValidationErrorMsg(null);
    setIsSubmitting(true);

    // Retrieve active draft ID if any to promote it directly in Supabase
    const activeDraftId = localStorage.getItem(`draft_id_${secteur.slug}_${moduleCode}`);
    const soumissionId = isEditingExisting && existingSubmission
      ? existingSubmission.id
      : activeDraftId
        ? ensureUUID(activeDraftId)
        : generateUUID();

    const soumission: Soumission = {
      id: soumissionId,
      session_id: generateUUID(),
      secteur_id: secteur.id,
      secteur_slug: secteur.slug,
      module_code: moduleCode,
      nom_repondant: nomRepondant.trim(),
      nom_organisation: nomOrganisation.trim(),
      email: email.trim() || 'contact@organisation.bj',
      fonction: fonction.trim() || 'Membre OSC',
      organisations_evaluees: organisationsEvaluees.trim(),
      statut: 'complete',
      date_creation: isEditingExisting && existingSubmission ? existingSubmission.date_creation : new Date().toISOString(),
      date_maj: new Date().toISOString(),
      reponses,
      synthese: {
        forces: forces.trim() || 'Non renseigné',
        fragilites: fragilites.trim() || 'Non renseigné'
      },
      observations_criteres: observations
    };

    const res = await submitEvaluation(soumission);
    setIsSubmitting(false);

    // Clear draft keys from local storage
    localStorage.removeItem(`draft_${secteur.slug}_${moduleCode}`);
    localStorage.removeItem(`draft_id_${secteur.slug}_${moduleCode}`);

    // Navigate to confirmation page
    navigate(`/secteur/${secteur.slug}/module-${moduleCode.toLowerCase()}/confirmation`, {
      state: { soumissionId: res.id, secteurNom: secteur.nom, moduleTitre: moduleInfo?.titre }
    });
  };

  const [isSyncingDirect, setIsSyncingDirect] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [isCheckingAgain, setIsCheckingAgain] = useState(false);

  const handleDownloadJSON = () => {
    if (!existingSubmission) return;
    const jsonStr = JSON.stringify(existingSubmission, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluation-${secteur.slug}-${moduleCode}-${existingSubmission.id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCheckUnlock = async () => {
    setIsCheckingAgain(true);
    setSyncNotice(null);
    const soum = await getExistingSubmission(secteur.slug, moduleCode);
    setIsCheckingAgain(false);
    if (!soum) {
      setExistingSubmission(null);
      reinitialiserPourNouvelleSoumission();
      setSyncNotice("Accès débloqué ! L'administrateur a réinitialisé ce module. Vous pouvez à nouveau remplir le formulaire.");
    } else {
      setSyncNotice("Le formulaire est toujours actif et verrouillé dans le système. Seul l'administrateur peut débloquer ce module depuis l'espace de gestion.");
    }
  };

  // Loading verification
  if (checkingExisting) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-3 text-slate-500">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-medium">Vérification de l'état du formulaire...</p>
      </div>
    );
  }

  // If module is not applicable to this sector
  if (!applicable) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <div className="bg-white rounded-2xl border border-amber-200 p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-3 text-amber-800">
            <AlertCircle className="w-8 h-8 text-amber-600 shrink-0" />
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {moduleInfo?.titre} : Module non applicable
              </h1>
              <p className="text-xs text-amber-800 font-semibold">
                Secteur : {secteur.nom}
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-600 leading-relaxed bg-amber-50/60 p-4 rounded-xl border border-amber-200/80">
            <p className="font-semibold text-slate-800 mb-1">Cadrage méthodologique :</p>
            L'analyse de cadrage issue de la première mission a établi que le secteur {secteur.nom} ne dispose pas d'un mécanisme de dialogue formalisé permanent au niveau national. L'écosystème repose sur son mécanisme de concertation et ses événements de dialogue.
          </div>

          <div className="pt-4 flex flex-wrap gap-3">
            <Link
              to={`/secteur/${secteur.slug}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour au sommaire du secteur</span>
            </Link>

            <Link
              to={`/secteur/${secteur.slug}/module-b3`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition"
            >
              <span>Passer au Module B3 (Événements de dialogue)</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="evaluation-form-container">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-800 transition">Accueil</Link>
        <span>/</span>
        <Link to={`/secteur/${secteur.slug}`} className="hover:text-slate-800 transition">{secteur.nom}</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">{moduleInfo?.code}</span>
      </nav>

      {/* READ-ONLY BANNER WHEN SUBMITTED */}
      {isReadOnly && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/80 pb-3">
            <div className="flex items-center gap-2.5 font-extrabold text-amber-950 text-sm">
              <Lock className="w-5 h-5 text-amber-700 shrink-0" />
              <span>Évaluation transmise et verrouillée (Mode Lecture Seule)</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold">
              Impossibilité de modifier
            </span>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">
            Votre évaluation pour l'organisation <strong>{existingSubmission?.nom_organisation}</strong> par <strong>{existingSubmission?.nom_repondant}</strong> a été enregistrée le {new Date(existingSubmission!.date_creation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}. Seul l'administrateur peut la débloquer depuis l'espace d'administration.
          </p>
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={reinitialiserPourNouvelleSoumission}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Remplir pour une autre organisation</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadJSON}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold text-xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Exporter mon rapport (JSON)</span>
            </button>
          </div>
        </div>
      )}

      {isEditingExisting && !isReadOnly && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Mode modification : Vous mettez à jour l'évaluation pour <strong>{existingSubmission?.nom_organisation}</strong>.</span>
          </div>
          <button
            type="button"
            onClick={reinitialiserPourNouvelleSoumission}
            className="text-blue-700 hover:text-blue-900 underline font-semibold text-left sm:text-right shrink-0"
          >
            Réinitialiser pour une évaluation vierge
          </button>
        </div>
      )}

      {/* Header & Progress Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5 sticky top-20 z-40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                Secteur : {secteur.nom}
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs font-semibold text-slate-600">{moduleInfo?.code}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {moduleInfo?.titre}
            </h1>
            <p className="text-xs text-slate-500">
              {moduleInfo?.description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {!isReadOnly && (
              <button
                type="button"
                onClick={sauvegarderBrouillon}
                disabled={isSavingDraft}
                id="btn-save-draft"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition disabled:opacity-50"
                title="Sauvegarder les réponses actuelles comme brouillon (synchronisé avec l'administration)"
              >
                <Save className={`w-3.5 h-3.5 text-slate-600 ${isSavingDraft ? 'animate-spin' : ''}`} />
                <span>{isSavingDraft ? 'Enregistrement...' : saveSuccessNotice ? 'Brouillon enregistré !' : 'Enregistrer le brouillon'}</span>
              </button>
            )}

            {etapeCourante === 'formulaire' ? (
              <button
                type="button"
                onClick={() => setEtapeCourante('synthese')}
                id="btn-goto-synthese"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition"
              >
                <span>Étape Synthèse</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setEtapeCourante('formulaire')}
                id="btn-backto-form"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Revenir aux questions</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <div className="flex justify-between items-center text-xs text-slate-600 font-semibold">
            <span>Progression de l'évaluation</span>
            <span>{repondusIndicateurs} / {totalIndicateurs} indicateurs renseignés ({progressionPercent}%)</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                progressionPercent === 100
                  ? 'bg-emerald-600'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600'
              }`}
              style={{ width: `${progressionPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {draftNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{draftNotice}</span>
        </div>
      )}

      {etapeCourante === 'formulaire' ? (
        <div className="space-y-8">
          {/* Section Répondant */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-5 h-5 text-emerald-700" />
              <h2 className="text-base font-bold text-slate-900">
                Informations sur le répondant &bull; Structure &amp; Mandat
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Nom et prénom du répondant <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  id="input-nom-repondant"
                  required
                  value={nomRepondant}
                  onChange={(e) => setNomRepondant(e.target.value)}
                  placeholder="Ex: HODONOU Jean-Marc"
                  className={`w-full px-3 py-2 text-xs rounded-lg border transition ${
                    hasAttemptedSubmit && !nomRepondant.trim()
                      ? 'border-rose-500 bg-rose-50/50 ring-1 ring-rose-300'
                      : 'border-slate-300 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white'
                  }`}
                />
                {hasAttemptedSubmit && !nomRepondant.trim() && (
                  <p className="text-[11px] font-semibold text-rose-600">Ce champ est obligatoire.</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Structure / Organisation <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  id="input-nom-organisation"
                  required
                  value={nomOrganisation}
                  onChange={(e) => setNomOrganisation(e.target.value)}
                  placeholder="Ex: Plateforme OSC Santé / Association..."
                  className={`w-full px-3 py-2 text-xs rounded-lg border transition ${
                    hasAttemptedSubmit && !nomOrganisation.trim()
                      ? 'border-rose-500 bg-rose-50/50 ring-1 ring-rose-300'
                      : 'border-slate-300 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white'
                  }`}
                />
                {hasAttemptedSubmit && !nomOrganisation.trim() && (
                  <p className="text-[11px] font-semibold text-rose-600">Ce champ est obligatoire.</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Fonction / Rôle au sein du mécanisme</label>
                <input
                  type="text"
                  value={fonction}
                  onChange={(e) => setFonction(e.target.value)}
                  placeholder="Ex: Secrétaire Exécutif / Point Focal"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Adresse Email de contact</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@organisation.bj"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
                />
              </div>

              {/* Specific to Module C : Organisation(s) évaluée(s) */}
              {moduleCode === 'C' && (
                <div className="sm:col-span-2 space-y-1 p-3 bg-purple-50/60 rounded-xl border border-purple-200">
                  <label className="text-xs font-bold text-purple-900">
                    Organisation(s) évaluée(s) <span className="text-rose-600">*</span> (Spécifique au Module C)
                  </label>
                  <p className="text-[11px] text-purple-700 mb-1">
                    Ce module permet aux OSC d'auto-évaluer leurs propres capacités. Indiquez la ou les organisations concernées par cet auto-positionnement.
                  </p>
                  <input
                    type="text"
                    id="input-org-evaluees"
                    value={organisationsEvaluees}
                    onChange={(e) => setOrganisationsEvaluees(e.target.value)}
                    placeholder="Ex: Réseau National des OSC de surveillance..."
                    className={`w-full px-3 py-2 text-xs rounded-lg border transition ${
                      hasAttemptedSubmit && !organisationsEvaluees.trim()
                        ? 'border-rose-500 bg-rose-50/50 ring-1 ring-rose-300'
                        : 'border-purple-300 focus:outline-purple-600 bg-white'
                    }`}
                  />
                  {hasAttemptedSubmit && !organisationsEvaluees.trim() && (
                    <p className="text-[11px] font-semibold text-rose-600">Veuillez indiquer l'organisation évaluée.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Critères et Indicateurs */}
          {criteres.map((critere) => {
            return (
              <div
                key={critere.id}
                id={`critere-${critere.code.toLowerCase()}`}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-5 p-6 sm:p-8"
              >
                {/* Criterion Header */}
                <div className="border-b border-slate-100 pb-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-bold text-xs">
                      Critère {critere.code}
                    </span>
                    <h2 className="text-base font-bold text-slate-900">
                      {critere.titre}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500">
                    {critere.description}
                  </p>
                </div>

                {/* Indicators list */}
                <div className="space-y-4">
                  {critere.indicateurs.map((ind) => {
                    const currentReponse = reponses[ind.id] || {
                      reponse_oui_non: null,
                      precisions: '',
                      actions_renforcement: ''
                    };

                    const isUnanswered =
                      hasAttemptedSubmit &&
                      (currentReponse.reponse_oui_non === null || currentReponse.reponse_oui_non === undefined);

                    return (
                      <div
                        key={ind.id}
                        id={`indicateur-block-${ind.id}`}
                        className={`p-4 rounded-xl border transition ${
                          isUnanswered
                            ? 'border-2 border-rose-500 bg-rose-50/60 ring-2 ring-rose-200 shadow-xs'
                            : currentReponse.reponse_oui_non !== null
                            ? 'bg-slate-50/80 border-slate-300'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="space-y-1.5 max-w-2xl">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md inline-block">
                                  Indicateur {ind.code}
                                </span>
                                {isUnanswered && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md animate-pulse">
                                    <AlertCircle className="w-3.5 h-3.5" /> Réponse obligatoire
                                  </span>
                                )}
                              </div>
                              <div className="text-xs font-semibold text-slate-800 leading-relaxed">
                                {ind.libelle}
                              </div>
                            </div>

                            {/* Radio buttons Oui / Non */}
                            <div className={`flex items-center gap-2 shrink-0 p-1 rounded-lg border transition ${
                              isUnanswered ? 'bg-white border-rose-400' : 'bg-white border-slate-200'
                            }`}>
                              <button
                                type="button"
                                onClick={() => handleReponseChange(ind.id, true)}
                                className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                  currentReponse.reponse_oui_non === true
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : 'text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Oui
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReponseChange(ind.id, false)}
                                className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                  currentReponse.reponse_oui_non === false
                                    ? 'bg-rose-600 text-white shadow-2xs'
                                    : 'text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                <XCircle className="w-3.5 h-3.5" /> Non
                              </button>
                            </div>
                          </div>

                          {/* Zone Précisions / Preuves et Actions :
                              S'ouvre dès qu'une réponse (Oui ou Non) est sélectionnée */}
                          {currentReponse.reponse_oui_non !== null && currentReponse.reponse_oui_non !== undefined && (
                            <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t mt-2 p-3 rounded-xl ${
                              currentReponse.reponse_oui_non === true
                                ? 'border-emerald-200/80 bg-emerald-50/40'
                                : 'border-slate-200 bg-slate-50/70'
                            }`}>
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                                  <span>Précisions / Preuves</span>
                                  {ind.precisionsLabel && (
                                    <span className="text-slate-500 font-normal italic">({ind.precisionsLabel})</span>
                                  )}
                                </label>
                                <textarea
                                  rows={2}
                                  value={currentReponse.precisions}
                                  onChange={(e) => handlePrecisionsChange(ind.id, e.target.value)}
                                  placeholder="Références des textes, dates, rapports, canaux utilisés..."
                                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-emerald-600 focus:border-emerald-600 bg-white"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-700">
                                  Actions de renforcement proposées
                                </label>
                                <textarea
                                  rows={2}
                                  value={currentReponse.actions_renforcement}
                                  onChange={(e) => handleActionsChange(ind.id, e.target.value)}
                                  placeholder="Besoins d'appui, formation, plaidoyer, formalisation..."
                                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-emerald-600 focus:border-emerald-600 bg-white"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Zone Autres observations pour le critère */}
                <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <label className="text-xs font-bold text-slate-700">
                    Autres Observations / Éléments de contexte ({critere.code}) :
                  </label>
                  <textarea
                    rows={2}
                    value={observations[critere.id] || ''}
                    onChange={(e) => setObservations({ ...observations, [critere.id]: e.target.value })}
                    placeholder="Ajoutez toute remarque qualitative ou contexte particulier sur ce critère..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-emerald-600 bg-white"
                  />
                </div>
              </div>
            );
          })}

          {/* Bannière de confirmation sauvegarde brouillon */}
          {draftNotice && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{draftNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setDraftNotice(null)}
                className="text-emerald-700 hover:text-emerald-950 font-bold px-2 py-0.5 rounded-md hover:bg-emerald-100 transition"
              >
                ✕
              </button>
            </div>
          )}

          {/* Bannière d'erreur de validation si questions non répondues */}
          {hasAttemptedSubmit && validationErrorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-2.5 shadow-xs">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{validationErrorMsg}</span>
            </div>
          )}

          {/* Form Actions bottom */}
          {isReadOnly ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-amber-50 border border-amber-300 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Formulaire verrouillé en mode lecture seule (Impossibilité de modifier).</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownloadJSON}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold text-xs transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Télécharger mon rapport (JSON)</span>
                </button>
                <button
                  type="button"
                  onClick={reinitialiserPourNouvelleSoumission}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Remplir pour une autre organisation</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={sauvegarderBrouillon}
                disabled={isSavingDraft}
                id="btn-bottom-save-draft"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                <Save className={`w-4 h-4 text-emerald-700 ${isSavingDraft ? 'animate-spin' : ''}`} />
                <span>{isSavingDraft ? 'Enregistrement en cours...' : 'Enregistrer le brouillon'}</span>
              </button>

              <button
                type="button"
                onClick={handleValiderEtTransmettre}
                id="btn-bottom-valider-transmettre"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50"
              >
                <FileCheck className="w-4 h-4 text-emerald-100" />
                <span>{isSubmitting ? 'Transmission en cours...' : 'Valider et transmettre'}</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Étape Synthèse & Validation (accessible depuis le bouton du haut) */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 space-y-1">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Étape finale &bull; Synthèse {moduleInfo?.code}
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              Forces et Fragilités observées
            </h2>
            <p className="text-xs text-slate-500">
              Résumez les principaux constats qualitatifs dégagés lors de l'évaluation pour alimenter la feuille de route du secteur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Principales forces constatées :
              </label>
              <textarea
                rows={6}
                disabled={isReadOnly}
                value={forces}
                onChange={(e) => setForces(e.target.value)}
                placeholder="Ex: Structuration claire, adhésion forte des OSC membres, régularité des réunions documentées..."
                className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white disabled:bg-slate-100 disabled:text-slate-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                Principales fragilités / défis identifiés :
              </label>
              <textarea
                rows={6}
                disabled={isReadOnly}
                value={fragilites}
                onChange={(e) => setFragilites(e.target.value)}
                placeholder="Ex: Manque de suivi des décisions issues du dialogue, pérennité financière incertaine, faible couverture des membres périphériques..."
                className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white disabled:bg-slate-100 disabled:text-slate-700"
              />
            </div>
          </div>

          {hasAttemptedSubmit && validationErrorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{validationErrorMsg}</span>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setEtapeCourante('formulaire')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Revenir aux questions
            </button>

            {isReadOnly ? (
              <button
                type="button"
                onClick={reinitialiserPourNouvelleSoumission}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <FileCheck className="w-4 h-4" />
                <span>Remplir pour une autre organisation</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleValiderEtTransmettre}
                id="btn-submit-evaluation"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                <FileCheck className="w-4 h-4 text-emerald-100" />
                <span>{isSubmitting ? 'Transmission en cours...' : 'Valider et transmettre'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
