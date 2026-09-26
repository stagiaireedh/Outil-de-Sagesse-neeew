# Skill: Evaluation Form Platform Engine (Multi-Sector & Multi-Module)

This skill provides a complete, production-grade architectural blueprint, database schema, state management pattern, and export engine for building multi-sector and multi-module evaluation platforms (Barometers, Audits, Self-Assessments, Diagnostic Tools).

---

## 🎯 Architectural Overview

1. **Multi-Sector & Multi-Module Structure**:
   - Organized into **Sectors** (e.g. Eau, Santé, Décentralisation) and **Modules** (e.g. A, B1, B2, B3, C).
   - Each module contains hierarchical **Criteria** (`C.1`, `C.2`) and **Indicators** (`C.1.1`, `C.1.2`).

2. **Database & Data Model (Supabase PostgreSQL)**:
   - `soumissions` : Parent record storing metadata (organisation, respondent, status, sector, module, timestamps).
   - `reponses` : Child records storing choice (`reponse_oui_non`), text details (`precisions`), and action plans (`actions_renforcement`). Unique constraint on `(soumission_id, indicateur_id)`.
   - `syntheses` : Qualitative synthesis (`forces`, `fragilites`).

3. **Key System Discipline**:
   - **UUID Deduplication**: Always deduplicate response payloads by indicator UUID (`Map<string, ReponsePayload>`) before inserting into Supabase to prevent PostgreSQL constraint violation `23505`.
   - **Progress Calculation**: Compute form completion progress against unique criteria indicators. Always cap progress bars at 100% using `Math.min(100, ...)`.
   - **Tri-Format Exports**: Provide exports in **Excel (.xlsx)**, **Word (.doc)**, and **PDF (.pdf)**. Word exports MUST use `@page Section1`, `table-layout: fixed !important`, and `word-wrap: break-word !important` to prevent text overflow.

---

## 🗄️ 1. Database Schema (`supabase/migration.sql`)

```sql
-- Sectors table
CREATE TABLE IF NOT EXISTS secteurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  date_creation TIMESTAMPTZ DEFAULT NOW()
);

-- Submissions table
CREATE TABLE IF NOT EXISTS soumissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  secteur_id UUID REFERENCES secteurs(id),
  secteur_slug TEXT NOT NULL,
  module_code TEXT NOT NULL,
  nom_organisation TEXT NOT NULL,
  nom_repondant TEXT NOT NULL,
  email TEXT,
  fonction TEXT,
  organisations_evaluees TEXT,
  observations_criteres JSONB DEFAULT '{}'::jsonb,
  statut TEXT NOT NULL DEFAULT 'complete',
  date_creation TIMESTAMPTZ DEFAULT NOW(),
  date_maj TIMESTAMPTZ DEFAULT NOW()
);

-- Responses table with strict unique constraint
CREATE TABLE IF NOT EXISTS reponses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  soumission_id UUID REFERENCES soumissions(id) ON DELETE CASCADE,
  indicateur_id UUID NOT NULL,
  reponse_oui_non BOOLEAN,
  precisions TEXT,
  actions_renforcement TEXT,
  date_creation TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT reponses_soumission_id_indicateur_id_key UNIQUE (soumission_id, indicateur_id)
);

-- Syntheses table
CREATE TABLE IF NOT EXISTS syntheses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  soumission_id UUID REFERENCES soumissions(id) ON DELETE CASCADE,
  module_code TEXT NOT NULL,
  forces TEXT,
  fragilites TEXT,
  date_creation TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔄 2. Submission & UUID Deduplication Strategy

When saving responses to Supabase, form keys may exist in multiple formats (e.g., `c-1-1` and `C.1.1`). To prevent Postgres unique key errors (`code 23505`), deduplicate entries using a `Map` before performing the insert:

```typescript
// Deduplicate responses by indicator UUID
const mapByUuid = new Map<string, any>();

for (const [indicateurCode, rep] of Object.entries(soumission.reponses || {})) {
  if (!rep) continue;
  const indUuid = getIndicateurUuid(sectorSlug, indicateurCode);
  if (indUuid) {
    mapByUuid.set(indUuid, {
      id: generateUUID(),
      soumission_id: validSubmissionId,
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
  await supabase.from('reponses').delete().eq('soumission_id', validSubmissionId);
  await supabase.from('reponses').insert(reponsesArray);
}
```

---

## 📊 3. Form Progress Discipline (Cap at 100%)

Calculate form progress strictly against unique indicators present in the criteria definition:

```typescript
// Compute total unique indicators
const totalIndicateurs = criteres.reduce((acc, c) => acc + c.indicateurs.length, 0);

// Count unique answered indicators
let repondusIndicateurs = 0;
criteres.forEach((critere) => {
  critere.indicateurs.forEach((ind) => {
    const rep = reponses[ind.id] || reponses[ind.code];
    if (rep && rep.reponse_oui_non !== null && rep.reponse_oui_non !== undefined) {
      repondusIndicateurs++;
    }
  });
});

// Strictly cap progress at 100%
const progressionPercent = totalIndicateurs > 0
  ? Math.min(100, Math.round((repondusIndicateurs / totalIndicateurs) * 100))
  : 0;
```

---

## 📄 4. Word (.doc) Table Overflow Prevention

Word HTML exports require specific MS Word styles to prevent text overflow outside table cells and page margins:

```html
<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 {
      size: 21.0cm 29.7cm;
      margin: 1.5cm;
      mso-header-margin: 36.0pt;
      mso-footer-margin: 36.0pt;
    }
    div.Section1 { page: Section1; }
    body { font-family: Arial, sans-serif; font-size: 10pt; color: #1e293b; margin: 0; }
    
    table.grid {
      width: 100% !important;
      table-layout: fixed !important;
      border-collapse: collapse !important;
      margin-bottom: 20px;
      mso-table-lspace: 0pt !important;
      mso-table-rspace: 0pt !important;
    }
    
    table.grid th, table.grid td {
      border: 1px solid #cbd5e1;
      padding: 6px 8px;
      vertical-align: top;
      word-wrap: break-word !important;
      word-break: break-word !important;
      overflow-wrap: break-word !important;
      white-space: normal !important;
    }
  </style>
</head>
<body>
  <div class="Section1">
    <table class="grid">
      <colgroup>
        <col style="width: 10%;" />
        <col style="width: 34%;" />
        <col style="width: 12%;" />
        <col style="width: 22%;" />
        <col style="width: 22%;" />
      </colgroup>
      <thead>
        <tr>
          <th style="width: 10%;">Code</th>
          <th style="width: 34%;">Indicateur</th>
          <th style="width: 12%;">Réponse</th>
          <th style="width: 22%;">Précisions</th>
          <th style="width: 22%;">Actions</th>
        </tr>
      </thead>
      <tbody>
        <!-- Table rows with inline width styles on cells -->
      </tbody>
    </table>
  </div>
</body>
</html>
```

---

## 🛠️ Reusability Checklist for New Platform Builds

When deploying a new evaluation platform using this skill:
1. Apply the PostgreSQL schema in Supabase (`soumissions`, `reponses`, `syntheses`, `secteurs`).
2. Define sector and module criteria JSON configs.
3. Integrate `submitEvaluation` with `Map` UUID deduplication.
4. Implement `FormulaireModule` component with capped progress indicator (100%).
5. Configure `exportUtils` for Excel, Word (A4 fixed layout), and PDF downloads.
