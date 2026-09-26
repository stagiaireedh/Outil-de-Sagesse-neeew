-- ==============================================================================
-- PROJET BEN/301 - APPUI À LA SOCIÉTÉ CIVILE AU BÉNIN (ASCB)
-- Schéma de base de données PostgreSQL / Supabase
-- Tables : secteurs, modules, criteres, indicateurs, soumissions, reponses, syntheses, admins
-- ==============================================================================

-- 1. Table des secteurs prioritaires
CREATE TABLE IF NOT EXISTS public.secteurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  ordre INT NOT NULL DEFAULT 1,
  configuration_ecosysteme JSONB NOT NULL DEFAULT '[]'::jsonb,
  analyse_premiere_mission TEXT NOT NULL,
  date_creation TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Table des modules (A, B1, B2, B3, C)
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  secteur_id UUID REFERENCES public.secteurs(id) ON DELETE CASCADE,
  code TEXT NOT NULL CHECK (code IN ('A', 'B1', 'B2', 'B3', 'C')),
  titre TEXT NOT NULL,
  description TEXT,
  ordre INT NOT NULL DEFAULT 1,
  actif BOOLEAN NOT NULL DEFAULT true,
  date_creation TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Table des critères
CREATE TABLE IF NOT EXISTS public.criteres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  titre TEXT NOT NULL,
  description TEXT,
  ordre INT NOT NULL DEFAULT 1,
  date_creation TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Table des indicateurs
CREATE TABLE IF NOT EXISTS public.indicateurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  critere_id UUID REFERENCES public.criteres(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  libelle TEXT NOT NULL,
  type_reponse TEXT NOT NULL CHECK (type_reponse IN ('oui_non', 'texte')),
  ordre INT NOT NULL DEFAULT 1,
  date_creation TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Table des soumissions (Évaluations soumises par les répondants)
CREATE TABLE IF NOT EXISTS public.soumissions (
  id TEXT PRIMARY KEY,
  secteur_id TEXT NOT NULL,
  secteur_slug TEXT,
  module_code TEXT,
  nom_organisation TEXT NOT NULL,
  nom_repondant TEXT NOT NULL,
  email TEXT,
  fonction TEXT,
  organisations_evaluees TEXT,
  observations_criteres JSONB DEFAULT '{}'::jsonb,
  statut TEXT NOT NULL DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'complete')),
  date_creation TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date_maj TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migration automatique si les tables avaient été créées avec l'ancienne version
ALTER TABLE public.soumissions ADD COLUMN IF NOT EXISTS secteur_slug TEXT;
ALTER TABLE public.soumissions ADD COLUMN IF NOT EXISTS module_code TEXT;
ALTER TABLE public.soumissions ADD COLUMN IF NOT EXISTS organisations_evaluees TEXT;
ALTER TABLE public.soumissions ADD COLUMN IF NOT EXISTS observations_criteres JSONB DEFAULT '{}'::jsonb;

-- 6. Table des réponses aux indicateurs
CREATE TABLE IF NOT EXISTS public.reponses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  soumission_id TEXT REFERENCES public.soumissions(id) ON DELETE CASCADE,
  indicateur_id TEXT NOT NULL,
  reponse_oui_non BOOLEAN,
  precisions TEXT,
  actions_renforcement TEXT,
  date_creation TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Table des synthèses
CREATE TABLE IF NOT EXISTS public.syntheses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  soumission_id TEXT REFERENCES public.soumissions(id) ON DELETE CASCADE,
  module_code TEXT NOT NULL,
  forces TEXT,
  fragilites TEXT,
  date_creation TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Table des administrateurs
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  email TEXT NOT NULL UNIQUE,
  nom TEXT NOT NULL,
  date_creation TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- SÉCURITÉ & POLITIQUES ROW LEVEL SECURITY (RLS)
-- Les répondants remplissent anonymement sans compte Supabase Auth.
-- ==============================================================================

ALTER TABLE public.secteurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.criteres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicateurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soumissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reponses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syntheses ENABLE ROW LEVEL SECURITY;

-- Lecture publique des métadonnées de cadrage
CREATE POLICY "Lecture publique des secteurs" ON public.secteurs FOR SELECT USING (true);
CREATE POLICY "Lecture publique des modules" ON public.modules FOR SELECT USING (true);
CREATE POLICY "Lecture publique des critères" ON public.criteres FOR SELECT USING (true);
CREATE POLICY "Lecture publique des indicateurs" ON public.indicateurs FOR SELECT USING (true);

-- Autorisation INSERT / UPDATE / SELECT publique pour les soumissions, réponses et synthèses
CREATE POLICY "Insert public des soumissions" ON public.soumissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Update public des soumissions" ON public.soumissions FOR UPDATE USING (true);
CREATE POLICY "Select public des soumissions" ON public.soumissions FOR SELECT USING (true);

CREATE POLICY "Insert public des réponses" ON public.reponses FOR INSERT WITH CHECK (true);
CREATE POLICY "Update public des réponses" ON public.reponses FOR UPDATE USING (true);
CREATE POLICY "Select public des réponses" ON public.reponses FOR SELECT USING (true);

CREATE POLICY "Insert public des synthèses" ON public.syntheses FOR INSERT WITH CHECK (true);
CREATE POLICY "Update public des synthèses" ON public.syntheses FOR UPDATE USING (true);
CREATE POLICY "Select public des synthèses" ON public.syntheses FOR SELECT USING (true);

-- Politiques de suppression pour l'administration
CREATE POLICY "Delete public des soumissions" ON public.soumissions FOR DELETE USING (true);
CREATE POLICY "Delete public des réponses" ON public.reponses FOR DELETE USING (true);
CREATE POLICY "Delete public des synthèses" ON public.syntheses FOR DELETE USING (true);
