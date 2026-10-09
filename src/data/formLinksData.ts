import { ModuleCode, SecteurSlug } from '../types';
import { SECTEURS_DATA } from './secteursData';
import { MODULES_INFO, isModuleApplicable } from './modulesData';

export interface FormLinkEntry {
  token: string;
  secteurSlug: SecteurSlug;
  secteurNom: string;
  moduleCode: ModuleCode;
  moduleTitre: string;
  applicable: boolean;
}

/**
 * Unique, unguessable access tokens for each individual form (Sector x Module).
 * No user can access or guess another form URL without possessing its specific token link.
 */
export const FORM_TOKENS_MAP: Record<SecteurSlug, Record<ModuleCode, string>> = {
  eau: {
    A: 'eau-a-7k9m2x',
    B1: 'eau-b1-4p8n5q',
    B2: 'eau-b2-9w3v6r',
    B3: 'eau-b3-2h5j8t',
    C: 'eau-c-6d1f4y'
  },
  sante: {
    A: 'sante-a-3x8p5k',
    B1: 'sante-b1-7m2q9v',
    B2: 'sante-b2-5n4r8w',
    B3: 'sante-b3-8t6y1b',
    C: 'sante-c-2f9h4d'
  },
  decentralisation: {
    A: 'decent-a-9p4k7m',
    B1: 'decent-b1-6v3x8n',
    B2: 'decent-b2-4r9w2q',
    B3: 'decent-b3-7y5b1t',
    C: 'decent-c-3h8d6f'
  },
  'droits-humains': {
    A: 'dh-a-5k8m3p',
    B1: 'dh-b1-9q4v7x',
    B2: 'dh-b2-2w6n8r',
    B3: 'dh-b3-4b9t3y',
    C: 'dh-c-8d1f5h'
  },
  budget: {
    A: 'budget-a-6m3p9k',
    B1: 'budget-b1-8x5q2v',
    B2: 'budget-b2-3r7w4n',
    B3: 'budget-b3-9t1y6b',
    C: 'budget-c-4f8h2d'
  }
};

/**
 * Returns the unique token for a given sector and module
 */
export function getTokenForForm(secteurSlug: string, moduleCode: string): string | null {
  const s = secteurSlug.toLowerCase() as SecteurSlug;
  const m = moduleCode.toUpperCase() as ModuleCode;
  return FORM_TOKENS_MAP[s]?.[m] || null;
}

/**
 * Returns the relative path for an individual form (e.g. "/f/eau-b1-4p8n5q")
 */
export function getDirectFormPath(secteurSlug: string, moduleCode: string): string {
  const token = getTokenForForm(secteurSlug, moduleCode);
  return token ? `/f/${token}` : '/';
}

/**
 * Returns the full absolute URL for sharing an individual form
 */
export function getDirectFormUrl(secteurSlug: string, moduleCode: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}${getDirectFormPath(secteurSlug, moduleCode)}`;
}

/**
 * Resolves a token (or a pasted full URL containing a token) to its sector and module
 */
export function resolveFormToken(input: string): FormLinkEntry | null {
  if (!input) return null;
  let clean = input.trim().toLowerCase();

  // If the user pasted a full URL like https://.../f/eau-b1-4p8n5q
  if (clean.includes('/f/')) {
    const parts = clean.split('/f/');
    clean = parts[parts.length - 1].split('/')[0].split('?')[0].trim();
  }

  for (const secteur of SECTEURS_DATA) {
    const modMap = FORM_TOKENS_MAP[secteur.slug];
    if (!modMap) continue;

    for (const modInfo of MODULES_INFO) {
      const code = modInfo.code;
      const token = modMap[code];
      if (token && token.toLowerCase() === clean) {
        return {
          token,
          secteurSlug: secteur.slug,
          secteurNom: secteur.nom,
          moduleCode: code,
          moduleTitre: modInfo.titre,
          applicable: isModuleApplicable(secteur, code)
        };
      }
    }
  }

  return null;
}

/**
 * Returns all form links across all sectors for the Admin Dashboard
 */
export function getAllFormLinks(): FormLinkEntry[] {
  const list: FormLinkEntry[] = [];
  for (const secteur of SECTEURS_DATA) {
    for (const modInfo of MODULES_INFO) {
      const token = FORM_TOKENS_MAP[secteur.slug]?.[modInfo.code];
      if (token) {
        list.push({
          token,
          secteurSlug: secteur.slug,
          secteurNom: secteur.nom,
          moduleCode: modInfo.code,
          moduleTitre: modInfo.titre,
          applicable: isModuleApplicable(secteur, modInfo.code)
        });
      }
    }
  }
  return list;
}
