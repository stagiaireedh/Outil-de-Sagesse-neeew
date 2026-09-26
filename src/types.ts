export type SectorSlug = 'eau' | 'sante' | 'decentralisation' | 'droits-humains' | 'budget';

export interface EcosystemComponent {
  composante: string;
  presente: boolean;
  nombre: number;
  denomination: string;
}

export interface Secteur {
  id: string;
  nom: string;
  slug: SectorSlug;
  description: string;
  ordre: number;
  badgeCouleur: string;
  iconName: string;
  configuration_ecosysteme: EcosystemComponent[];
  analyse_premiere_mission: string;
}

export type ModuleCode = 'A' | 'B1' | 'B2' | 'B3' | 'C';

export interface ModuleInfo {
  code: ModuleCode;
  titre: string;
  sousTitre: string;
  description: string;
  estInformatif?: boolean;
}

export interface Indicateur {
  id: string;
  code: string;
  libelle: string;
  type_reponse: 'oui_non' | 'texte';
  precisionsLabel?: string;
  ordre: number;
}

export interface Critere {
  id: string;
  module_code: ModuleCode;
  code: string;
  titre: string;
  description?: string;
  ordre: number;
  indicateurs: Indicateur[];
}

export interface ReponseIndicateur {
  reponse_oui_non: boolean | null;
  precisions: string;
  actions_renforcement: string;
}

export interface FormulaireRepondant {
  nom_repondant: string;
  nom_organisation: string;
  fonction: string;
  email: string;
  organisations_evaluees?: string; // Pour Module C
  observations_criteres?: Record<string, string>; // observations spécifiques par critère
}

export interface Soumission {
  id: string;
  session_id?: string;
  secteur_id: string;
  secteur_slug: SectorSlug;
  module_code: ModuleCode;
  nom_repondant: string;
  nom_organisation: string;
  email: string;
  fonction: string;
  organisations_evaluees?: string;
  statut: 'brouillon' | 'complete';
  date_creation: string;
  date_maj: string;
  reponses: Record<string, ReponseIndicateur>;
  synthese?: {
    forces: string;
    fragilites: string;
    recommandations?: string;
  };
  observations_criteres?: Record<string, string>;
}
