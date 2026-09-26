import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { FormulaireModule } from '../components/FormulaireModule';
import { getSecteurBySlug } from '../data/secteursData';
import { ModuleCode } from '../types';

interface ModuleFormPageProps {
  moduleCodeOverride?: ModuleCode;
}

export const ModuleFormPage: React.FC<ModuleFormPageProps> = ({ moduleCodeOverride }) => {
  const { slug, moduleCode: paramModuleCode } = useParams<{ slug: string; moduleCode?: string }>();
  const secteur = getSecteurBySlug(slug || '');

  let determinedCode: ModuleCode = 'B1';
  if (moduleCodeOverride) {
    determinedCode = moduleCodeOverride;
  } else if (paramModuleCode) {
    const clean = paramModuleCode.replace('module-', '').toUpperCase();
    if (clean === 'B1' || clean === 'B2' || clean === 'B3' || clean === 'C') {
      determinedCode = clean as ModuleCode;
    }
  }

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

  return <FormulaireModule moduleCode={determinedCode} secteur={secteur} />;
};
