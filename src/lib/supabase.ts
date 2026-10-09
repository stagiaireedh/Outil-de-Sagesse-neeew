import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Soumission, SectorSlug, ModuleCode, ReponseIndicateur } from '../types';
import supabaseMapping from '../data/supabaseMapping.json';

// Local storage keys
const APP_DEPLOYMENT_VERSION = 'ascb_v2026_09_25_fresh_reset';
const LOCAL_STORAGE_KEY = 'ascb_ben301_soumissions_v2';
const CUSTOM_SUPABASE_URL_KEY = 'ascb_custom_supabase_url';
const CUSTOM_SUPABASE_KEY_KEY = 'ascb_custom_supabase_key';

/**
 * Ensures all participants land on a 100% clean, fresh slate for this new deployment
 */
export function checkAndPerformAppReset(): void {
  try {
    const currentVersion = localStorage.getItem('ascb_deployment_version');
    if (currentVersion !== APP_DEPLOYMENT_VERSION) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith('draft_') ||
            key.startsWith('ascb_ben301_') ||
            key.startsWith('soumission_') ||
            key === 'ascb_submissions' ||
            key === 'ascb_ben301_soumissions_v1')
        ) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      localStorage.setItem('ascb_deployment_version', APP_DEPLOYMENT_VERSION);
      console.info('Plateforme réinitialisée avec succès : formulaire vierge pour ce déploiement.');
    }
  } catch (e) {
    console.warn('Erreur reset local storage:', e);
  }
}

// Automatically run reset check on module import
checkAndPerformAppReset();

// Default live Supabase project configuration (ensures all users & admins are connected out-of-the-box)
export const DEFAULT_SUPABASE_URL = 'https://jpsawynbiqirysclistw.supabase.co';
export const DEFAULT_SUPABASE_KEY = 'sb_publishable_l5TIhSug6bQ_E9ohvp2FeQ_bcJTrjn-';

// Sector UUID mappings
export const SECTEUR_UUIDS: Record<string, string> = supabaseMapping.secteurUuids;

export const UUID_TO_SECTEUR_SLUG: Record<string, SectorSlug> = {
  '4d3e8422-c8a8-468c-9b8a-0dc2b35105d5': 'eau',
  '14fa2293-00f2-4e7f-ac99-e0afbc65cb25': 'sante',
  '5ffee8c6-7c84-43a0-a67c-ed6b80a44144': 'decentralisation',
  'c6d448c3-6c6e-4ca1-846d-45139567a191': 'droits-humains',
  'ded4d122-8e4b-4193-91f8-f48607047769': 'budget'
};

// Indicator UUID mappings
export const INDICATEUR_UUIDS: Record<string, string> = supabaseMapping.indicateurUuids;

// Reverse mapping: UUID -> Indicator Code (e.g. 'B1.1.1')
export const UUID_TO_INDICATEUR_CODE: Record<string, string> = {};
for (const [key, uuid] of Object.entries(INDICATEUR_UUIDS)) {
  const parts = key.split('_');
  const code = parts.slice(1).join('_');
  UUID_TO_INDICATEUR_CODE[uuid] = code;
}

/**
 * Safely resolves any indicator key ('b1-1-1', 'B1.1.1', 'eau_B1.1.1', or UUID) to its corresponding Supabase database UUID
 */
export function getIndicateurUuid(secteurSlug: string, key: string): string | null {
  if (!key) return null;
  const normalizedSlug = (secteurSlug || 'eau').toLowerCase();

  // 1. If key is already a valid UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(key)) {
    return key;
  }

  // 2. Direct lookup in INDICATEUR_UUIDS with sector prefix e.g. "eau_B1.1.1"
  const directKey = `${normalizedSlug}_${key}`;
  if (INDICATEUR_UUIDS[directKey]) {
    return INDICATEUR_UUIDS[directKey];
  }

  // 3. Convert key formatted like "b1-1-1" or "b1_1_1" to "B1.1.1"
  let convertedCode = key.toUpperCase();
  if (/^[a-z0-9]+-[0-9]+-[0-9]+$/i.test(key)) {
    const parts = key.split('-');
    convertedCode = `${parts[0].toUpperCase()}.${parts[1]}.${parts[2]}`; // "B1.1.1"
  } else if (/^[a-z0-9]+_[0-9]+_[0-9]+$/i.test(key)) {
    const parts = key.split('_');
    convertedCode = `${parts[0].toUpperCase()}.${parts[1]}.${parts[2]}`;
  }

  const convertedKey = `${normalizedSlug}_${convertedCode}`;
  if (INDICATEUR_UUIDS[convertedKey]) {
    return INDICATEUR_UUIDS[convertedKey];
  }

  // 4. Fallback search across all entries
  for (const [mapKey, uuid] of Object.entries(INDICATEUR_UUIDS)) {
    if (mapKey.endsWith(`_${convertedCode}`) || mapKey.endsWith(`_${key.toUpperCase()}`)) {
      return uuid;
    }
  }

  return null;
}

/**
 * Maps database response rows into a clean, dual-keyed Record ('B1.1.1' AND 'b1-1-1')
 */
export function mapRowsToReponses(reponsesArray: any[]): Record<string, ReponseIndicateur> {
  const map: Record<string, ReponseIndicateur> = {};
  if (Array.isArray(reponsesArray)) {
    reponsesArray.forEach((r: any) => {
      if (!r) return;
      const code = UUID_TO_INDICATEUR_CODE[r.indicateur_id] || r.indicateur_id;

      // Handle boolean or string responses safely
      let ouiNonVal: boolean | null = null;
      if (r.reponse_oui_non === true || r.reponse_oui_non === 'true' || r.reponse_oui_non === 'Oui' || r.reponse_oui_non === 'oui' || r.reponse_oui_non === 1) {
        ouiNonVal = true;
      } else if (r.reponse_oui_non === false || r.reponse_oui_non === 'false' || r.reponse_oui_non === 'Non' || r.reponse_oui_non === 'non' || r.reponse_oui_non === 0) {
        ouiNonVal = false;
      }

      const repObj: ReponseIndicateur = {
        reponse_oui_non: ouiNonVal,
        precisions: r.precisions || '',
        actions_renforcement: r.actions_renforcement || ''
      };

      if (code) {
        // Store under primary code (e.g. "B1.1.1")
        map[code] = repObj;

        // Also store under lowercase hyphenated id (e.g. "b1-1-1")
        if (typeof code === 'string' && code.includes('.')) {
          const parts = code.split('.');
          if (parts.length === 3) {
            const idFormat = `${parts[0].toLowerCase()}-${parts[1]}-${parts[2]}`;
            map[idFormat] = repObj;
          }
        }
      }
    });
  }
  return map;
}

/**
 * UUID v4 Generator
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Validate or convert string to a proper UUID
 */
export function ensureUUID(id?: string): string {
  if (!id) return generateUUID();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) return id;
  return generateUUID();
}

/**
 * Resolve Supabase configuration dynamically:
 * Priority 1: Environment variables
 * Priority 2: Stored custom credentials in localStorage (configured via Admin interface)
 * Priority 3: Default live Supabase project
 */
export function getSupabaseCredentials(): { url: string; anonKey: string; source: 'env' | 'custom' | 'default' } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  const isEnvValid = Boolean(
    envUrl &&
    envKey &&
    envUrl !== 'https://your-project.supabase.co' &&
    envKey !== 'your-anon-key'
  );

  if (isEnvValid) {
    return { url: envUrl, anonKey: envKey, source: 'env' };
  }

  try {
    const customUrl = (localStorage.getItem(CUSTOM_SUPABASE_URL_KEY) || '').trim();
    const customKey = (localStorage.getItem(CUSTOM_SUPABASE_KEY_KEY) || '').trim();
    if (customUrl && customKey && customUrl.startsWith('https://')) {
      return { url: customUrl, anonKey: customKey, source: 'custom' };
    }
  } catch {
    // localStorage not accessible
  }

  return { url: DEFAULT_SUPABASE_URL, anonKey: DEFAULT_SUPABASE_KEY, source: 'default' };
}

let cachedClient: SupabaseClient | null = null;
let lastClientUrl = '';
let lastClientKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();
  if (!url || !anonKey) return null;

  if (cachedClient && lastClientUrl === url && lastClientKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey);
    lastClientUrl = url;
    lastClientKey = anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Erreur initialisation SupabaseClient:', err);
    return null;
  }
}

export const isSupabaseConfigured = true;
export const supabase: SupabaseClient | null = getSupabaseClient();

/**
 * Configure Supabase credentials manually from Admin UI
 */
export function setCustomSupabaseCredentials(url: string, anonKey: string): void {
  try {
    if (!url || !anonKey) {
      localStorage.removeItem(CUSTOM_SUPABASE_URL_KEY);
      localStorage.removeItem(CUSTOM_SUPABASE_KEY_KEY);
    } else {
      localStorage.setItem(CUSTOM_SUPABASE_URL_KEY, url.trim());
      localStorage.setItem(CUSTOM_SUPABASE_KEY_KEY, anonKey.trim());
    }
    cachedClient = null;
    lastClientUrl = '';
    lastClientKey = '';
  } catch (e) {
    console.error('Erreur sauvegarde custom Supabase:', e);
  }
}

/**
 * Test connectivity with a Supabase project
 */
export async function testSupabaseConnection(url?: string, anonKey?: string): Promise<{ success: boolean; message: string; rowCount?: number }> {
  try {
    const client = url && anonKey ? createClient(url.trim(), anonKey.trim()) : getSupabaseClient();
    if (!client) {
      return { success: false, message: "URL ou clé API Supabase manquante." };
    }

    const { data, error, count } = await client
      .from('soumissions')
      .select('id', { count: 'exact', head: true });

    if (error) {
      return { success: false, message: `Erreur Supabase: ${error.message} (Code: ${error.code || 'Inconnu'})` };
    }

    return {
      success: true,
      message: 'Connexion établie avec succès !',
      rowCount: count ?? (Array.isArray(data) ? data.length : 0)
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, message: `Échec de connexion : ${msg}` };
  }
}

// -----------------------------------------------------------------------------
// LOCAL STORAGE MANAGEMENT
// -----------------------------------------------------------------------------

export function getLocalSoumissions(): Soumission[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Erreur lecture localStorage', err);
    return [];
  }
}

export function saveLocalSoumission(soumission: Soumission): void {
  try {
    const soumissions = getLocalSoumissions();
    const index = soumissions.findIndex((s) => s.id === soumission.id);
    if (index >= 0) {
      soumissions[index] = soumission;
    } else {
      soumissions.unshift(soumission);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(soumissions));
  } catch (err) {
    console.error('Erreur sauvegarde localStorage', err);
  }
}

export function removeLocalSubmissionForModule(secteurSlug: string, moduleCode: string): void {
  try {
    const soumissions = getLocalSoumissions();
    const filtered = soumissions.filter(
      (s) => !(s.secteur_slug === secteurSlug && s.module_code === moduleCode)
    );
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    localStorage.removeItem(`draft_${secteurSlug}_${moduleCode}`);
    localStorage.removeItem(`draft_id_${secteurSlug}_${moduleCode}`);
    localStorage.removeItem(`submitted_id_${secteurSlug}_${moduleCode}`);
  } catch (err) {
    console.error('Erreur suppression locale pour module', err);
  }
}

export function getLocalBrouillons(): Soumission[] {
  const brouillons: Soumission[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('draft_') && !key.startsWith('draft_id_')) {
        const parts = key.split('_'); // draft_secteurSlug_moduleCode
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          const hasContent =
            Boolean(parsed.nomRepondant) ||
            Boolean(parsed.nomOrganisation) ||
            (parsed.reponses && Object.keys(parsed.reponses).length > 0);

          if (hasContent) {
            const secteurSlug = (parts[1] || 'eau') as SectorSlug;
            const moduleCode = (parts[2] || 'B1') as ModuleCode;
            const storedId = localStorage.getItem(`draft_id_${secteurSlug}_${moduleCode}`) || parsed.id || `brouillon_${secteurSlug}_${moduleCode}`;
            brouillons.push({
              id: storedId,
              session_id: generateUUID(),
              secteur_id: SECTEUR_UUIDS[secteurSlug] || `secteur-${secteurSlug}`,
              secteur_slug: secteurSlug,
              module_code: moduleCode,
              nom_repondant: parsed.nomRepondant || 'Répondant non renseigné',
              nom_organisation: parsed.nomOrganisation || 'Organisation en cours',
              email: parsed.email || 'brouillon@repondant.bj',
              fonction: parsed.fonction || 'Non renseignée',
              organisations_evaluees: parsed.organisationsEvaluees || '',
              statut: 'brouillon',
              date_creation: parsed.savedAt || new Date().toISOString(),
              date_maj: parsed.savedAt || new Date().toISOString(),
              reponses: parsed.reponses || {},
              synthese: {
                forces: parsed.forces || '',
                fragilites: parsed.fragilites || ''
              },
              observations_criteres: parsed.observations || {}
            });
          }
        }
      }
    }
  } catch (err) {
    console.error('Erreur lecture brouillons localStorage', err);
  }
  return brouillons;
}

// -----------------------------------------------------------------------------
// DRAFT PERSISTENCE (SUPABASE + LOCAL STORAGE)
// -----------------------------------------------------------------------------

export interface DraftData {
  id?: string;
  secteur_slug: SectorSlug;
  module_code: ModuleCode;
  nom_repondant: string;
  nom_organisation: string;
  email?: string;
  fonction?: string;
  organisations_evaluees?: string;
  reponses?: Record<string, ReponseIndicateur>;
  observations_criteres?: Record<string, string>;
  synthese?: {
    forces?: string;
    fragilites?: string;
  };
}

/**
 * Save draft both locally AND to Supabase with statut = 'brouillon'.
 * Guarantees drafts appear in real-time in the Admin Dashboard!
 */
export async function saveDraft(
  draft: DraftData
): Promise<{ success: boolean; id: string; syncedToSupabase: boolean; error?: string }> {
  const secteurSlug = draft.secteur_slug;
  const moduleCode = draft.module_code;
  const draftIdKey = `draft_id_${secteurSlug}_${moduleCode}`;
  const draftDataKey = `draft_${secteurSlug}_${moduleCode}`;

  // 1. Resolve or generate a stable UUID for this draft
  let draftId = draft.id ? ensureUUID(draft.id) : null;
  if (!draftId) {
    const storedId = localStorage.getItem(draftIdKey);
    if (storedId) {
      draftId = ensureUUID(storedId);
    } else {
      draftId = generateUUID();
    }
  }
  localStorage.setItem(draftIdKey, draftId);

  // 2. Save locally first to guarantee offline availability
  const localDraftPayload = {
    ...draft,
    id: draftId,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(draftDataKey, JSON.stringify(localDraftPayload));

  // 3. Save to Supabase
  const client = getSupabaseClient();
  if (!client) {
    console.info('Supabase non disponible : brouillon sauvegardé localement sur cet appareil.');
    return { success: true, id: draftId, syncedToSupabase: false };
  }

  try {
    const normalizedSlug = (secteurSlug || 'eau').toLowerCase();
    const secteurUuid = SECTEUR_UUIDS[normalizedSlug] || SECTEUR_UUIDS['eau'] || ensureUUID();
    const sessionId = generateUUID();

    const soumPayload = {
      id: draftId,
      session_id: sessionId,
      secteur_id: secteurUuid,
      secteur_slug: secteurSlug,
      module_code: moduleCode,
      nom_organisation: draft.nom_organisation.trim() || 'Brouillon - En cours de saisie',
      nom_repondant: draft.nom_repondant.trim() || 'Répondant en cours',
      email: (draft.email || '').trim() || 'brouillon@organisation.bj',
      fonction: (draft.fonction || '').trim() || 'Membre OSC',
      organisations_evaluees: draft.organisations_evaluees || '',
      observations_criteres: draft.observations_criteres || {},
      statut: 'brouillon',
      date_creation: new Date().toISOString(),
      date_maj: new Date().toISOString()
    };

    const { error: soumError } = await client
      .from('soumissions')
      .upsert(soumPayload);

    if (soumError) {
      console.warn('Erreur synchronisation brouillon Supabase:', soumError.message);
      return { success: true, id: draftId, syncedToSupabase: false, error: soumError.message };
    }

    // Save responses if any (deduplicated by indicator UUID to prevent unique constraint 23505 error)
    const reponsesEntries = Object.entries(draft.reponses || {});
    if (reponsesEntries.length > 0) {
      const mapByUuid = new Map<string, any>();
      for (const [indicateurCode, rep] of reponsesEntries) {
        if (!rep) continue;
        const indUuid = getIndicateurUuid(secteurSlug, indicateurCode);
        if (indUuid) {
          mapByUuid.set(indUuid, {
            id: generateUUID(),
            soumission_id: draftId,
            indicateur_id: indUuid,
            reponse_oui_non: rep.reponse_oui_non,
            precisions: rep.precisions || '',
            actions_renforcement: rep.actions_renforcement || '',
            date_creation: new Date().toISOString()
          });
        }
      }
      const reponsesArray = Array.from(mapByUuid.values());

      if (reponsesArray.length > 0) {
        await client.from('reponses').delete().eq('soumission_id', draftId);
        await client.from('reponses').insert(reponsesArray);
      }
    }

    // Save synthese if any
    if (draft.synthese && (draft.synthese.forces || draft.synthese.fragilites)) {
      await client.from('syntheses').delete().eq('soumission_id', draftId);
      await client.from('syntheses').insert({
        id: generateUUID(),
        soumission_id: draftId,
        module_code: moduleCode,
        forces: draft.synthese.forces || '',
        fragilites: draft.synthese.fragilites || '',
        date_creation: new Date().toISOString()
      });
    }

    return { success: true, id: draftId, syncedToSupabase: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    console.warn('Échec saveDraft Supabase:', msg);
    return { success: true, id: draftId, syncedToSupabase: false, error: msg };
  }
}

/**
 * Retrieve existing draft for a sector and module (locally or from Supabase)
 */
export async function getExistingDraft(
  secteurSlug: string,
  moduleCode: string
): Promise<Soumission | null> {
  const draftKey = `draft_${secteurSlug}_${moduleCode}`;
  const draftIdKey = `draft_id_${secteurSlug}_${moduleCode}`;
  const storedId = localStorage.getItem(draftIdKey);

  // 1. Check local draft first
  const draftRaw = localStorage.getItem(draftKey);
  if (draftRaw) {
    try {
      const parsed = JSON.parse(draftRaw);
      const activeId = storedId || parsed.id || generateUUID();
      return {
        id: activeId,
        session_id: generateUUID(),
        secteur_id: SECTEUR_UUIDS[secteurSlug] || SECTEUR_UUIDS['eau'],
        secteur_slug: secteurSlug as SectorSlug,
        module_code: moduleCode as ModuleCode,
        nom_repondant: parsed.nomRepondant || '',
        nom_organisation: parsed.nomOrganisation || '',
        email: parsed.email || '',
        fonction: parsed.fonction || '',
        organisations_evaluees: parsed.organisationsEvaluees || '',
        statut: 'brouillon',
        date_creation: parsed.savedAt || new Date().toISOString(),
        date_maj: parsed.savedAt || new Date().toISOString(),
        reponses: parsed.reponses || {},
        synthese: {
          forces: parsed.forces || '',
          fragilites: parsed.fragilites || ''
        },
        observations_criteres: parsed.observations || {}
      };
    } catch {
      // ignore
    }
  }

  // 2. Check remote draft in Supabase ONLY IF this device/user created this draft ID
  if (!storedId) {
    return null;
  }

  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('soumissions')
        .select('*, reponses(*), syntheses(*)')
        .eq('id', storedId)
        .eq('statut', 'brouillon')
        .limit(1);

      if (!error && data && data.length > 0) {
        const row = data[0];
        const reponsesMap = mapRowsToReponses(row.reponses);
        const syntheseRow = Array.isArray(row.syntheses) && row.syntheses.length > 0 ? row.syntheses[0] : null;

        return {
          id: row.id,
          session_id: row.session_id,
          secteur_id: row.secteur_id,
          secteur_slug: (row.secteur_slug || UUID_TO_SECTEUR_SLUG[row.secteur_id] || secteurSlug) as SectorSlug,
          module_code: row.module_code || moduleCode,
          nom_repondant: row.nom_repondant || '',
          nom_organisation: row.nom_organisation || '',
          email: row.email || '',
          fonction: row.fonction || '',
          organisations_evaluees: row.organisations_evaluees || '',
          statut: 'brouillon',
          date_creation: row.date_creation,
          date_maj: row.date_maj || row.date_creation,
          reponses: reponsesMap,
          synthese: syntheseRow
            ? {
                forces: syntheseRow.forces || '',
                fragilites: syntheseRow.fragilites || ''
              }
            : undefined,
          observations_criteres: row.observations_criteres || {}
        };
      }
    } catch (e) {
      console.warn('Erreur vérification brouillon Supabase:', e);
    }
  }

  return null;
}

/**
 * Automatically sync any local draft found in localStorage to Supabase
 */
export async function syncAllLocalDrafts(): Promise<number> {
  let synced = 0;
  try {
    const client = getSupabaseClient();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('draft_') && !key.startsWith('draft_id_')) {
        const parts = key.split('_'); // draft_secteurSlug_moduleCode
        if (parts.length >= 3) {
          const sSlug = parts[1] as SectorSlug;
          const mCode = parts[2] as ModuleCode;

          // If Supabase already has a completed submission for this module, delete stale draft key
          if (client) {
            const normalizedSlug = (sSlug || 'eau').toLowerCase();
            const secteurUuid = SECTEUR_UUIDS[normalizedSlug] || SECTEUR_UUIDS['eau'];
            const { data: comp } = await client
              .from('soumissions')
              .select('id')
              .or(`secteur_slug.eq.${normalizedSlug},secteur_id.eq.${secteurUuid}`)
              .eq('module_code', mCode)
              .eq('statut', 'complete')
              .limit(1);

            if (comp && comp.length > 0) {
              localStorage.removeItem(key);
              localStorage.removeItem(`draft_id_${sSlug}_${mCode}`);
              continue;
            }
          }

          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            const hasContent =
              Boolean(parsed.nomRepondant) ||
              Boolean(parsed.nomOrganisation) ||
              (parsed.reponses && Object.keys(parsed.reponses).length > 0);

            if (hasContent) {
              const res = await saveDraft({
                secteur_slug: sSlug,
                module_code: mCode,
                nom_repondant: parsed.nomRepondant || '',
                nom_organisation: parsed.nomOrganisation || '',
                email: parsed.email || '',
                fonction: parsed.fonction || '',
                organisations_evaluees: parsed.organisationsEvaluees || '',
                reponses: parsed.reponses || {},
                observations_criteres: parsed.observations || {},
                synthese: {
                  forces: parsed.forces || '',
                  fragilites: parsed.fragilites || ''
                }
              });
              if (res.syncedToSupabase) synced++;
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('Erreur syncAllLocalDrafts:', err);
  }
  return synced;
}

// -----------------------------------------------------------------------------
// SUBMISSION LOGIC (SYNCS TO SUPABASE + LOCAL STORAGE)
// -----------------------------------------------------------------------------

/**
 * Submit evaluation to local storage AND Supabase.
 * Properly formats UUIDs, resolves sector UUIDs, indicator UUIDs and session IDs
 * so PostgreSQL constraints and RLS are strictly satisfied.
 */
export async function submitEvaluation(
  soumission: Soumission
): Promise<{ success: boolean; id: string; syncedToSupabase: boolean; error?: string }> {
  // 1. Ensure valid UUIDs
  const validId = ensureUUID(soumission.id);
  const validSessionId = ensureUUID(soumission.session_id);
  const normalizedSlug = (soumission.secteur_slug || 'eau').toLowerCase();
  const secteurUuid = SECTEUR_UUIDS[normalizedSlug] || SECTEUR_UUIDS['eau'] || '4d3e8422-c8a8-468c-9b8a-0dc2b35105d5';

  // Update object with normalized IDs
  soumission.id = validId;
  soumission.session_id = validSessionId;
  soumission.secteur_id = secteurUuid;
  soumission.secteur_slug = normalizedSlug as SectorSlug;

  // 2. Always save locally first to guarantee zero data loss
  saveLocalSoumission(soumission);

  const client = getSupabaseClient();
  if (!client) {
    console.info('Supabase non disponible : soumission enregistrée localement sur cet appareil.');
    return { success: true, id: validId, syncedToSupabase: false };
  }

  try {
    // 3. Insert or update soumissions table
    const soumPayload = {
      id: validId,
      session_id: validSessionId,
      secteur_id: secteurUuid,
      secteur_slug: normalizedSlug,
      module_code: soumission.module_code,
      nom_organisation: soumission.nom_organisation.trim() || 'Organisation anonyme',
      nom_repondant: soumission.nom_repondant.trim() || 'Répondant',
      email: (soumission.email || '').trim() || 'contact@organisation.bj',
      fonction: (soumission.fonction || '').trim() || 'Membre OSC',
      organisations_evaluees: soumission.organisations_evaluees || '',
      observations_criteres: soumission.observations_criteres || {},
      statut: soumission.statut || 'complete',
      date_creation: soumission.date_creation || new Date().toISOString(),
      date_maj: new Date().toISOString()
    };

    const { error: soumError } = await client
      .from('soumissions')
      .upsert(soumPayload);

    if (soumError) {
      console.error('Erreur insertion table soumissions:', soumError.message, soumError);
      return { success: true, id: validId, syncedToSupabase: false, error: soumError.message };
    }

    // 4. Insert or update reponses table with resolved indicateur UUIDs (deduplicated)
    const reponsesEntries = Object.entries(soumission.reponses || {});
    if (reponsesEntries.length > 0) {
      const mapByUuid = new Map<string, any>();
      for (const [indicateurCode, rep] of reponsesEntries) {
        if (!rep) continue;
        const indUuid = getIndicateurUuid(normalizedSlug, indicateurCode);
        if (indUuid) {
          mapByUuid.set(indUuid, {
            id: generateUUID(),
            soumission_id: validId,
            indicateur_id: indUuid,
            reponse_oui_non: rep.reponse_oui_non,
            precisions: rep.precisions || '',
            actions_renforcement: rep.actions_renforcement || '',
            date_creation: new Date().toISOString()
          });
        }
      }
      const reponsesArray = Array.from(mapByUuid.values());

      if (reponsesArray.length > 0) {
        // Delete previous responses for this submission to avoid duplicate rows
        await client.from('reponses').delete().eq('soumission_id', validId);
        const { error: repError } = await client.from('reponses').insert(reponsesArray);
        if (repError) {
          console.warn('Erreur insertion table reponses:', repError.message);
        }
      }
    }

    // 5. Insert or update syntheses table
    if (soumission.synthese) {
      await client.from('syntheses').delete().eq('soumission_id', validId);
      const { error: synError } = await client.from('syntheses').insert({
        id: generateUUID(),
        soumission_id: validId,
        module_code: soumission.module_code,
        forces: soumission.synthese.forces || 'Non renseigné',
        fragilites: soumission.synthese.fragilites || 'Non renseigné',
        date_creation: new Date().toISOString()
      });
      if (synError) {
        console.warn('Erreur insertion table syntheses:', synError.message);
      }
    }

    // 6. Clean up active draft for this sector and module, and save submitted_id for this device
    try {
      localStorage.removeItem(`draft_${normalizedSlug}_${soumission.module_code}`);
      localStorage.removeItem(`draft_id_${normalizedSlug}_${soumission.module_code}`);
      localStorage.setItem(`submitted_id_${normalizedSlug}_${soumission.module_code}`, validId);

      await client
        .from('soumissions')
        .delete()
        .eq('id', validId)
        .eq('statut', 'brouillon');
    } catch {
      // ignore
    }

    return { success: true, id: validId, syncedToSupabase: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erreur inconnue';
    console.warn('Échec synchronisation Supabase distante, enregistrement local conservé:', msg);
    return { success: true, id: validId, syncedToSupabase: false, error: msg };
  }
}

/**
 * Auto-sync any pending local submissions to Supabase.
 */
export async function syncPendingLocalSubmissions(): Promise<{ syncedCount: number; errors: string[] }> {
  const client = getSupabaseClient();
  if (!client) return { syncedCount: 0, errors: ['Supabase non configuré'] };

  const localList = getLocalSoumissions();
  if (localList.length === 0) return { syncedCount: 0, errors: [] };

  let syncedCount = 0;
  const errors: string[] = [];

  for (const s of localList) {
    try {
      const res = await submitEvaluation(s);
      if (res.syncedToSupabase) {
        syncedCount++;
      } else if (res.error) {
        errors.push(`${s.id}: ${res.error}`);
      }
    } catch (err: unknown) {
      errors.push(`${s.id}: ${err instanceof Error ? err.message : 'Erreur'}`);
    }
  }

  return { syncedCount, errors };
}

// -----------------------------------------------------------------------------
// CHECK SUBMISSION STATUS (FOR PARTICIPANTS & LOCK SCREEN)
// -----------------------------------------------------------------------------

/**
 * Check if a submission already exists in Supabase for a sector and module code.
 *
 * THE SINGLE SOURCE OF TRUTH IS SUPABASE:
 * - If Supabase has an active completed submission: returns it so the form is locked.
 * - If Supabase has NO completed submission (or if deleted/unlocked by admin):
 *   returns null so the participant has full access to fill and submit!
 */
export async function getExistingSubmission(
  secteurSlug: string,
  moduleCode: string
): Promise<Soumission | null> {
  const normalizedSlug = (secteurSlug || 'eau').toLowerCase();
  const submittedKey = `submitted_id_${normalizedSlug}_${moduleCode}`;
  const submittedId = localStorage.getItem(submittedKey);

  // If this device/user has not submitted an evaluation for this module, return null
  if (!submittedId) {
    return null;
  }

  const client = getSupabaseClient();

  if (client) {
    try {
      const { data, error } = await client
        .from('soumissions')
        .select('*, reponses(*), syntheses(*)')
        .eq('id', submittedId)
        .eq('statut', 'complete')
        .limit(1);

      if (!error && data && data.length > 0) {
        const row = data[0];
        let reponsesMap = mapRowsToReponses(row.reponses);
        if (Object.keys(reponsesMap).length === 0) {
          const localMatch = getLocalSoumissions().find((s) => s.id === submittedId);
          if (localMatch?.reponses && Object.keys(localMatch.reponses).length > 0) {
            reponsesMap = localMatch.reponses;
          }
        }
        const syntheseRow = Array.isArray(row.syntheses) && row.syntheses.length > 0 ? row.syntheses[0] : null;

        const soum: Soumission = {
          id: row.id,
          session_id: row.session_id,
          secteur_id: row.secteur_id,
          secteur_slug: (row.secteur_slug || UUID_TO_SECTEUR_SLUG[row.secteur_id] || secteurSlug) as SectorSlug,
          module_code: row.module_code || moduleCode,
          nom_repondant: row.nom_repondant,
          nom_organisation: row.nom_organisation,
          email: row.email || '',
          fonction: row.fonction || '',
          organisations_evaluees: row.organisations_evaluees || '',
          statut: row.statut || 'complete',
          date_creation: row.date_creation,
          date_maj: row.date_maj || row.date_creation,
          reponses: reponsesMap,
          synthese: syntheseRow
            ? {
                forces: syntheseRow.forces || '',
                fragilites: syntheseRow.fragilites || ''
              }
            : undefined,
          observations_criteres: row.observations_criteres || {}
        };

        return soum;
      }
    } catch (e) {
      console.warn('Erreur vérification soumission Supabase:', e);
    }
  }

  // Fallback to local storage if offline for this submittedId
  const localList = getLocalSoumissions();
  const localMatch = localList.find((s) => s.id === submittedId && s.statut === 'complete');
  if (localMatch) return localMatch;

  return null;
}

// -----------------------------------------------------------------------------
// DELETION & UNLOCKING (ADMIN & RECOVERY)
// -----------------------------------------------------------------------------

/**
 * Delete a submission by ID from Supabase and local storage.
 * Automatically gives back access to the participant for that sector & module.
 */
export async function deleteSoumission(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. If draft with legacy id format 'brouillon_'
    if (id.startsWith('brouillon_')) {
      const parts = id.replace('brouillon_', '').split('_');
      const secteurSlug = parts[0];
      const moduleCode = parts[1];
      localStorage.removeItem(`draft_${secteurSlug}_${moduleCode}`);
      localStorage.removeItem(`draft_id_${secteurSlug}_${moduleCode}`);
      const client = getSupabaseClient();
      if (client) {
        const secteurUuid = SECTEUR_UUIDS[secteurSlug];
        await client
          .from('soumissions')
          .delete()
          .or(`secteur_slug.eq.${secteurSlug},secteur_id.eq.${secteurUuid}`)
          .eq('module_code', moduleCode)
          .eq('statut', 'brouillon');
      }
      return { success: true };
    }

    // 2. Remove from local storage
    const localList = getLocalSoumissions();
    const target = localList.find((s) => s.id === id);
    const updated = localList.filter((s) => s.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

    if (target) {
      localStorage.removeItem(`draft_${target.secteur_slug}_${target.module_code}`);
      localStorage.removeItem(`draft_id_${target.secteur_slug}_${target.module_code}`);
    }

    // 3. Remove from Supabase if configured
    const client = getSupabaseClient();
    if (client) {
      await client.from('reponses').delete().eq('soumission_id', id);
      await client.from('syntheses').delete().eq('soumission_id', id);
      const { error } = await client.from('soumissions').delete().eq('id', id);
      if (error) {
        console.warn('Supabase delete error:', error.message);
        return { success: false, error: error.message };
      }
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur lors de la suppression';
    console.error('Erreur deleteSoumission:', msg);
    return { success: false, error: msg };
  }
}

/**
 * Explicitly unlock a module for a given sector by deleting any active submissions
 */
export async function unlockSectorModule(
  secteurSlug: string,
  moduleCode: string
): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Clear locally
    removeLocalSubmissionForModule(secteurSlug, moduleCode);

    // 2. Clear on Supabase
    const client = getSupabaseClient();
    if (client) {
      const secteurUuid = SECTEUR_UUIDS[secteurSlug];
      // Find IDs to delete
      const { data: rows } = await client
        .from('soumissions')
        .select('id')
        .or(`secteur_slug.eq.${secteurSlug},secteur_id.eq.${secteurUuid}`)
        .eq('module_code', moduleCode);

      if (rows && rows.length > 0) {
        for (const r of rows) {
          await client.from('reponses').delete().eq('soumission_id', r.id);
          await client.from('syntheses').delete().eq('soumission_id', r.id);
          await client.from('soumissions').delete().eq('id', r.id);
        }
      }
    }

    return {
      success: true,
      message: `L'accès au Module ${moduleCode} pour le secteur ${secteurSlug.toUpperCase()} a été réinitialisé avec succès. Les participants peuvent à nouveau soumettre.`
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur';
    return { success: false, message: `Échec du déblocage: ${msg}` };
  }
}

/**
 * Retrieve submission by ID (checking Supabase directly first)
 */
export async function getSubmissionById(id: string): Promise<Soumission | null> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('soumissions')
        .select('*, reponses(*), syntheses(*)')
        .eq('id', id)
        .single();

      if (!error && data) {
        let reponsesMap = mapRowsToReponses(data.reponses);
        if (Object.keys(reponsesMap).length === 0) {
          const localMatch = getLocalSoumissions().find((s) => s.id === id);
          if (localMatch?.reponses && Object.keys(localMatch.reponses).length > 0) {
            reponsesMap = localMatch.reponses;
          }
        }
        const syntheseRow = Array.isArray(data.syntheses) && data.syntheses.length > 0 ? data.syntheses[0] : null;

        return {
          id: data.id,
          session_id: data.session_id,
          secteur_id: data.secteur_id,
          secteur_slug: (data.secteur_slug || UUID_TO_SECTEUR_SLUG[data.secteur_id] || 'eau') as SectorSlug,
          module_code: data.module_code || (syntheseRow ? syntheseRow.module_code : 'B1'),
          nom_repondant: data.nom_repondant,
          nom_organisation: data.nom_organisation,
          email: data.email || '',
          fonction: data.fonction || '',
          organisations_evaluees: data.organisations_evaluees || '',
          statut: data.statut || 'complete',
          date_creation: data.date_creation,
          date_maj: data.date_maj || data.date_creation,
          reponses: reponsesMap,
          synthese: syntheseRow
            ? {
                forces: syntheseRow.forces || '',
                fragilites: syntheseRow.fragilites || ''
              }
            : undefined,
          observations_criteres: data.observations_criteres || {}
        };
      }
    } catch (e) {
      console.warn('Erreur getSubmissionById Supabase', e);
    }
  }

  // Fallback to local storage only if offline
  const localList = getLocalSoumissions();
  const inLocal = localList.find((s) => s.id === id);
  if (inLocal) return inLocal;

  const localDrafts = getLocalBrouillons();
  const inDraft = localDrafts.find((s) => s.id === id);
  if (inDraft) return inDraft;

  return null;
}

// -----------------------------------------------------------------------------
// ADMIN FETCH ALL & EXPORT / IMPORT
// -----------------------------------------------------------------------------

export async function fetchAllSoumissions(): Promise<Soumission[]> {
  const client = getSupabaseClient();

  if (!client) {
    const localData = getLocalSoumissions();
    const localDrafts = getLocalBrouillons();
    return [...localData, ...localDrafts];
  }

  try {
    const { data, error } = await client
      .from('soumissions')
      .select('*, reponses(*), syntheses(*)')
      .order('date_creation', { ascending: false });

    if (error || !data) {
      console.warn('Supabase fetch failed:', error?.message);
      return [];
    }

    const localList = [...getLocalSoumissions(), ...getLocalBrouillons()];
    const localMap = new Map<string, Soumission>();
    localList.forEach((l) => {
      if (l && l.id) localMap.set(l.id, l);
    });

    const remoteSoumissions: Soumission[] = data.map((row: any) => {
      let reponsesMap = mapRowsToReponses(row.reponses);
      const localMatch = localMap.get(row.id);

      if ((!reponsesMap || Object.keys(reponsesMap).length === 0) && localMatch?.reponses && Object.keys(localMatch.reponses).length > 0) {
        reponsesMap = localMatch.reponses;
      }

      const syntheseRow = Array.isArray(row.syntheses) && row.syntheses.length > 0 ? row.syntheses[0] : null;

      return {
        id: row.id,
        session_id: row.session_id,
        secteur_id: row.secteur_id,
        secteur_slug: (row.secteur_slug || UUID_TO_SECTEUR_SLUG[row.secteur_id] || 'eau') as SectorSlug,
        module_code: row.module_code || (syntheseRow ? syntheseRow.module_code : 'B1'),
        nom_repondant: row.nom_repondant || 'Répondant en cours',
        nom_organisation: row.nom_organisation || 'Organisation en cours',
        email: row.email || '',
        fonction: row.fonction || '',
        organisations_evaluees: row.organisations_evaluees || '',
        statut: (row.statut || 'complete') as 'complete' | 'brouillon',
        date_creation: row.date_creation,
        date_maj: row.date_maj || row.date_creation,
        reponses: reponsesMap,
        synthese: syntheseRow
          ? {
              forces: syntheseRow.forces || '',
              fragilites: syntheseRow.fragilites || ''
            }
          : undefined,
        observations_criteres: row.observations_criteres || {}
      };
    });

    return remoteSoumissions.sort(
      (a, b) => new Date(b.date_maj || b.date_creation).getTime() - new Date(a.date_maj || a.date_creation).getTime()
    );
  } catch (e) {
    console.error('Erreur fetchAllSoumissions', e);
    return [];
  }
}

export async function exportAllSubmissionsAsJSON(): Promise<string> {
  const all = await fetchAllSoumissions();
  return JSON.stringify(all, null, 2);
}

export async function importSubmissionsFromJSON(
  rawJson: string
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const parsed = JSON.parse(rawJson);
    const items: Soumission[] = Array.isArray(parsed) ? parsed : [parsed];
    if (items.length === 0) {
      return { success: false, count: 0, error: 'Le fichier ne contient aucune donnée.' };
    }

    let added = 0;
    for (const item of items) {
      if (item && item.nom_organisation) {
        item.id = ensureUUID(item.id);
        saveLocalSoumission(item);
        // Sync to Supabase in background
        submitEvaluation(item).catch(() => {});
        added++;
      }
    }

    return { success: true, count: added };
  } catch (err: unknown) {
    return { success: false, count: 0, error: err instanceof Error ? err.message : 'Format JSON invalide' };
  }
}
