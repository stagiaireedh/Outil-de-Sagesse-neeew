import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Key, ExternalLink } from 'lucide-react';
import { resolveFormToken } from '../data/formLinksData';
import { getSecteurBySlug } from '../data/secteursData';
import { FormulaireModule } from '../components/FormulaireModule';
import { ModuleAPage } from './ModuleAPage';

export const StandaloneFormPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const formEntry = resolveFormToken(token || '');

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const resolved = resolveFormToken(inputCode.trim());
    if (resolved) {
      navigate(`/f/${resolved.token}`);
    } else {
      setErrorMsg('Code ou lien de formulaire invalide. Veuillez vérifier le lien qui vous a été transmis.');
    }
  };

  // If token is invalid or missing
  if (!formEntry) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900">
            Accès restreint &bull; Formulaire introuvable
          </h1>
          <p className="text-slate-600 text-sm max-w-lg mx-auto leading-relaxed">
            Chaque formulaire d'évaluation dispose d'un <strong>lien individuel strictement séparé</strong>. Vous ne pouvez pas accéder à un formulaire sans son lien direct d'accès.
          </p>
        </div>

        <form onSubmit={handleManualSubmit} className="max-w-md mx-auto p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 text-left">
          <label className="text-xs font-bold text-slate-700 block">
            Vous avez reçu un code ou un lien d'accès ?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value);
                setErrorMsg('');
              }}
              placeholder="Ex: eau-b1-4p8n5q ou collez le lien"
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shrink-0 cursor-pointer"
            >
              Accéder
            </button>
          </div>
          {errorMsg && (
            <p className="text-xs text-rose-600 font-semibold">{errorMsg}</p>
          )}
        </form>

        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" /> Retour à la page d'accueil
          </Link>
        </div>
      </div>
    );
  }

  const secteur = getSecteurBySlug(formEntry.secteurSlug);
  if (!secteur) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-xl font-bold text-slate-900">Secteur introuvable</h1>
        <Link to="/" className="text-xs text-emerald-700 font-semibold">Retour à l'accueil</Link>
      </div>
    );
  }

  // Render Module A or FormulaireModule
  if (formEntry.moduleCode === 'A') {
    return <ModuleAPage standaloneToken={formEntry.token} />;
  }

  return (
    <FormulaireModule
      moduleCode={formEntry.moduleCode}
      secteur={secteur}
      standaloneToken={formEntry.token}
    />
  );
};
