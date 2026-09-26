import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Soumission, ModuleCode } from '../types';
import { getCriteresByModule, MODULES_INFO } from '../data/modulesData';
import { getSecteurBySlug } from '../data/secteursData';

/**
 * Clean filename helper
 */
function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_').slice(0, 40);
}

function getModuleName(code: ModuleCode): string {
  const mod = MODULES_INFO.find((m) => m.code === code);
  return mod ? mod.titre : `Module ${code}`;
}

/**
 * Safely extracts indicator response data across all possible keys and formats
 */
export function getReponseData(
  soumission: Soumission,
  indCode: string,
  indId: string
): { text: string; ouiNon: boolean | null; precisions: string; actions: string } {
  if (!soumission || !soumission.reponses) {
    return { text: 'Non renseigné', ouiNon: null, precisions: '', actions: '' };
  }

  const reponses = soumission.reponses;
  let rep = reponses[indCode] || reponses[indId];

  if (!rep) {
    // Try case-insensitive or hyphenated lookups
    const lowerCode = (indCode || '').toLowerCase();
    const lowerId = (indId || '').toLowerCase();

    for (const [key, val] of Object.entries(reponses)) {
      const kLower = key.toLowerCase();
      if (kLower === lowerCode || kLower === lowerId) {
        rep = val;
        break;
      }
    }
  }

  if (!rep) {
    return { text: 'Non renseigné', ouiNon: null, precisions: '', actions: '' };
  }

  const val = rep.reponse_oui_non as any;
  let text = 'Non renseigné';
  let ouiNon: boolean | null = null;

  if (val === true || val === 'Oui' || val === 'oui' || val === 'OUI' || val === 'true' || val === 1) {
    text = 'Oui';
    ouiNon = true;
  } else if (val === false || val === 'Non' || val === 'non' || val === 'NON' || val === 'false' || val === 0) {
    text = 'Non';
    ouiNon = false;
  }

  return {
    text,
    ouiNon,
    precisions: rep.precisions || '',
    actions: rep.actions_renforcement || ''
  };
}

// -----------------------------------------------------------------------------
// 1. INDIVIDUAL EXPORTS (SINGLE SUBMISSION)
// -----------------------------------------------------------------------------

/**
 * Export a single submission as a formatted Excel (.xlsx) workbook with full details
 */
export function exportIndividualToExcel(soumission: Soumission): void {
  const secteur = getSecteurBySlug(soumission.secteur_slug);
  const secteurNom = secteur?.nom || soumission.secteur_slug.toUpperCase();
  const moduleTitre = getModuleName(soumission.module_code);
  const criteres = getCriteresByModule(soumission.module_code);

  const wb = XLSX.utils.book_new();

  // 1. Main Detailed Sheet
  const rows: any[] = [];

  // Header Banner
  rows.push(['PROJET BEN/301 - APPUI À LA SOCIÉTÉ CIVILE AU BÉNIN (ASCB)']);
  rows.push(["Outil d'évaluation des écosystèmes de dialogue État-OSC"]);
  rows.push([]);
  rows.push(['FICHE D\'ÉVALUATION DÉTAILLÉE']);
  rows.push(['Identifiant unique', soumission.id]);
  rows.push(['Date de soumission', new Date(soumission.date_creation).toLocaleString('fr-FR')]);
  rows.push(['Dernière mise à jour', new Date(soumission.date_maj || soumission.date_creation).toLocaleString('fr-FR')]);
  rows.push(['Statut', soumission.statut === 'complete' ? 'Validée & transmise' : 'Brouillon en cours']);
  rows.push(['Secteur prioritaire', secteurNom]);
  rows.push(['Module évalué', `${soumission.module_code} - ${moduleTitre}`]);
  rows.push([]);
  rows.push(['INFORMATIONS SUR LE RÉPONDANT']);
  rows.push(['Organisation', soumission.nom_organisation || 'Non renseignée']);
  rows.push(['Nom & Prénom', soumission.nom_repondant || 'Non renseigné']);
  rows.push(['Fonction / Titre', soumission.fonction || 'Non renseignée']);
  rows.push(['Adresse Email', soumission.email || 'Non renseignée']);
  if (soumission.organisations_evaluees) {
    rows.push(['Organisations évaluées', soumission.organisations_evaluees]);
  }
  rows.push([]);

  // Table Headers
  rows.push([
    'Code Critère',
    'Titre du Critère',
    'Code Indicateur',
    'Libellé de l\'Indicateur',
    'Réponse (Oui/Non)',
    'Précisions / Justificatifs fournis',
    'Actions de renforcement proposées',
    'Observations générales du critère'
  ]);

  let totalOui = 0;
  let totalNon = 0;
  let totalNonRenseigne = 0;

  criteres.forEach((c) => {
    const obsCritere = soumission.observations_criteres?.[c.code] || soumission.observations_criteres?.[c.id] || '';
    c.indicateurs.forEach((ind) => {
      const repData = getReponseData(soumission, ind.code, ind.id);
      if (repData.ouiNon === true) {
        totalOui++;
      } else if (repData.ouiNon === false) {
        totalNon++;
      } else {
        totalNonRenseigne++;
      }

      rows.push([
        c.code,
        c.titre,
        ind.code,
        ind.libelle,
        repData.text,
        repData.precisions,
        repData.actions,
        obsCritere
      ]);
    });
  });

  rows.push([]);
  rows.push(['SYNTHÈSE STATISTIQUE']);
  rows.push(['Total indicateurs', totalOui + totalNon + totalNonRenseigne]);
  rows.push(['Réponses OUI', totalOui]);
  rows.push(['Réponses NON', totalNon]);
  rows.push(['Non renseignés', totalNonRenseigne]);
  const tauxConformite = (totalOui + totalNon) > 0 ? Math.round((totalOui / (totalOui + totalNon)) * 100) : 0;
  rows.push(['Taux de conformité Oui (%)', `${tauxConformite}%`]);

  if (soumission.synthese) {
    rows.push([]);
    rows.push(['SYNTHÈSE QUALITATIVE GLOBALE']);
    rows.push(['Principales forces identifiées', soumission.synthese.forces || 'Non renseigné']);
    rows.push(['Principales fragilités et défis', soumission.synthese.fragilites || 'Non renseigné']);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);

  ws['!cols'] = [
    { wch: 15 },
    { wch: 30 },
    { wch: 16 },
    { wch: 55 },
    { wch: 18 },
    { wch: 45 },
    { wch: 45 },
    { wch: 40 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Évaluation détaillée');

  const cleanOrg = sanitizeFileName(soumission.nom_organisation || 'Organisation');
  const filename = `Evaluation_${soumission.secteur_slug.toUpperCase()}_Module${soumission.module_code}_${cleanOrg}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Export a single submission as a formatted Word (.doc / .docx compatible) document
 */
export function exportIndividualToWord(soumission: Soumission): void {
  const secteur = getSecteurBySlug(soumission.secteur_slug);
  const secteurNom = secteur?.nom || soumission.secteur_slug.toUpperCase();
  const moduleTitre = getModuleName(soumission.module_code);
  const criteres = getCriteresByModule(soumission.module_code);

  let totalOui = 0;
  let totalNon = 0;
  let totalInd = 0;

  criteres.forEach((c) => {
    c.indicateurs.forEach((ind) => {
      totalInd++;
      const repData = getReponseData(soumission, ind.code, ind.id);
      if (repData.ouiNon === true) totalOui++;
      if (repData.ouiNon === false) totalNon++;
    });
  });

  const taux = totalInd > 0 ? Math.round((totalOui / totalInd) * 100) : 0;

  const htmlContent = `
    <!DOCTYPE html>
    <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns:m="http://schemas.microsoft.com/office/2004/12/omml" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Évaluation ASCB - ${soumission.nom_organisation}</title>
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
          margin: 1.5cm 1.5cm 1.5cm 1.5cm;
          mso-header-margin: 36.0pt;
          mso-footer-margin: 36.0pt;
          mso-paper-source: 0;
        }
        div.Section1 { page: Section1; }
        body { font-family: Arial, Calibri, sans-serif; font-size: 10pt; line-height: 1.4; color: #1e293b; margin: 0; }
        .header { border-bottom: 2px solid #0f766e; padding-bottom: 12px; margin-bottom: 20px; }
        .title-main { font-size: 15pt; font-weight: bold; color: #0f172a; margin: 0; }
        .subtitle { font-size: 11pt; color: #0f766e; font-weight: bold; margin-top: 4px; }
        .meta-box { background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; margin-bottom: 20px; }
        .meta-table { width: 100% !important; table-layout: fixed !important; border-collapse: collapse !important; }
        .meta-table td { padding: 4px 6px; font-size: 9.5pt; vertical-align: top; word-wrap: break-word !important; word-break: break-word !important; overflow-wrap: break-word !important; }
        .meta-label { font-weight: bold; color: #475569; width: 22%; }
        .meta-val { color: #0f172a; width: 28%; }
        .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 8.5pt; }
        .badge-oui { background-color: #dcfce7; color: #166534; }
        .badge-non { background-color: #fee2e2; color: #991b1b; }
        .badge-na { background-color: #f1f5f9; color: #475569; }
        .section-title { font-size: 12pt; font-weight: bold; color: #0f766e; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-top: 20px; margin-bottom: 12px; }
        table.grid { width: 100% !important; table-layout: fixed !important; border-collapse: collapse !important; margin-bottom: 20px; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; }
        table.grid th { background-color: #0f172a; color: #ffffff; padding: 6px 8px; font-size: 9.5pt; text-align: left; border: 1px solid #334155; word-wrap: break-word !important; word-break: break-word !important; overflow-wrap: break-word !important; }
        table.grid td { padding: 6px 8px; font-size: 9pt; border: 1px solid #cbd5e1; vertical-align: top; word-wrap: break-word !important; word-break: break-word !important; overflow-wrap: break-word !important; white-space: normal !important; }
        .critere-row { background-color: #f1f5f9; font-weight: bold; color: #0f172a; }
        .box-synthesis { background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 6px; margin-bottom: 14px; word-wrap: break-word !important; word-break: break-word !important; }
        .box-fragility { background-color: #fff7ed; border: 1px solid #fed7aa; padding: 12px; border-radius: 6px; margin-bottom: 14px; word-wrap: break-word !important; word-break: break-word !important; }
        .footer { margin-top: 24px; border-top: 1px solid #cbd5e1; padding-top: 10px; font-size: 8.5pt; color: #64748b; text-align: center; }
      </style>
    </head>
    <body>
      <div class="Section1">
        <div class="header">
          <div class="title-main">PROJET BEN/301 - APPUI À LA SOCIÉTÉ CIVILE AU BÉNIN (ASCB)</div>
          <div class="subtitle">Outil d'évaluation des écosystèmes de dialogue État-OSC</div>
        </div>

        <div class="meta-box">
          <table class="meta-table">
            <tr>
              <td class="meta-label">Secteur prioritaire :</td>
              <td class="meta-val"><strong>${secteurNom}</strong></td>
              <td class="meta-label">Date soumission :</td>
              <td class="meta-val">${new Date(soumission.date_creation).toLocaleString('fr-FR')}</td>
            </tr>
            <tr>
              <td class="meta-label">Module évalué :</td>
              <td class="meta-val"><strong>Module ${soumission.module_code} : ${moduleTitre}</strong></td>
              <td class="meta-label">Statut :</td>
              <td class="meta-val">${soumission.statut === 'complete' ? '<span class="badge badge-oui">Validée & transmise</span>' : '<span class="badge badge-na">Brouillon</span>'}</td>
            </tr>
            <tr>
              <td class="meta-label">Organisation :</td>
              <td class="meta-val"><strong>${soumission.nom_organisation || 'Non renseignée'}</strong></td>
              <td class="meta-label">Contact email :</td>
              <td class="meta-val">${soumission.email || 'Non renseigné'}</td>
            </tr>
            <tr>
              <td class="meta-label">Répondant :</td>
              <td class="meta-val">${soumission.nom_repondant || 'Non renseigné'} (${soumission.fonction || 'Membre OSC'})</td>
              <td class="meta-label">Taux conformité Oui :</td>
              <td class="meta-val"><strong>${totalOui} / ${totalInd} (${taux}%)</strong></td>
            </tr>
            ${soumission.organisations_evaluees ? `
            <tr>
              <td class="meta-label">Organisations évaluées :</td>
              <td class="meta-val" colspan="3">${soumission.organisations_evaluees}</td>
            </tr>` : ''}
          </table>
        </div>

        <div class="section-title">Grille détaillée d'évaluation et indicateurs</div>

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
              <th style="width: 22%;">Précisions / Justificatifs</th>
              <th style="width: 22%;">Actions de renforcement</th>
            </tr>
          </thead>
          <tbody>
            ${criteres.map((c) => {
              const obsCritere = soumission.observations_criteres?.[c.code] || soumission.observations_criteres?.[c.id] || '';
              const critereHeader = `
                <tr class="critere-row">
                  <td colspan="5" style="border: 1px solid #cbd5e1; padding: 6px; word-wrap: break-word; word-break: break-word;">
                    <strong>Critère ${c.code} : ${c.titre}</strong>
                    ${c.description ? `<div style="font-weight: normal; font-size: 8.5pt; color: #475569; margin-top: 2px;">${c.description}</div>` : ''}
                    ${obsCritere ? `<div style="font-weight: normal; font-size: 8.5pt; color: #0369a1; margin-top: 2px;"><em>Observation générale sur le critère : ${obsCritere}</em></div>` : ''}
                  </td>
                </tr>
              `;

              const rows = c.indicateurs.map((ind) => {
                const repData = getReponseData(soumission, ind.code, ind.id);
                let valBadge = '<span class="badge badge-na">Non renseigné</span>';
                if (repData.ouiNon === true) {
                  valBadge = '<span class="badge badge-oui">OUI</span>';
                } else if (repData.ouiNon === false) {
                  valBadge = '<span class="badge badge-non">NON</span>';
                }

                return `
                  <tr>
                    <td style="width: 10%;"><strong>${ind.code}</strong></td>
                    <td style="width: 34%;">${ind.libelle}</td>
                    <td style="width: 12%; text-align: center;">${valBadge}</td>
                    <td style="width: 22%;">${repData.precisions ? repData.precisions.replace(/\n/g, '<br/>') : '<em>Aucune précision</em>'}</td>
                    <td style="width: 22%;">${repData.actions ? repData.actions.replace(/\n/g, '<br/>') : '<em>Aucune action</em>'}</td>
                  </tr>
                `;
              }).join('');

              return critereHeader + rows;
            }).join('')}
          </tbody>
        </table>

        ${soumission.synthese ? `
          <div class="section-title">Synthèse qualitative de l'évaluation</div>
          <div class="box-synthesis">
            <strong style="color: #166534; font-size: 10.5pt;">Principales forces identifiées :</strong>
            <p style="margin: 4px 0 0 0;">${soumission.synthese.forces ? soumission.synthese.forces.replace(/\n/g, '<br/>') : 'Non renseigné'}</p>
          </div>
          <div class="box-fragility">
            <strong style="color: #9a3412; font-size: 10.5pt;">Principales fragilités et défis :</strong>
            <p style="margin: 4px 0 0 0;">${soumission.synthese.fragilites ? soumission.synthese.fragilites.replace(/\n/g, '<br/>') : 'Non renseigné'}</p>
          </div>
        ` : ''}

        <div class="footer">
          Fiche générée automatiquement par le Baromètre ASCB - Projet BEN/301 Appui à la Société Civile au Bénin &copy; ${new Date().getFullYear()}
        </div>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const cleanOrg = sanitizeFileName(soumission.nom_organisation || 'Organisation');
  link.setAttribute('download', `Fiche_Evaluation_${soumission.secteur_slug.toUpperCase()}_Module${soumission.module_code}_${cleanOrg}.doc`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export a single submission as a styled, multi-page PDF document using jsPDF & autoTable
 */
export function exportIndividualToPDF(soumission: Soumission): void {
  const secteur = getSecteurBySlug(soumission.secteur_slug);
  const secteurNom = secteur?.nom || soumission.secteur_slug.toUpperCase();
  const moduleTitre = getModuleName(soumission.module_code);
  const criteres = getCriteresByModule(soumission.module_code);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PROJET BEN/301 - APPUI À LA SOCIÉTÉ CIVILE AU BÉNIN (ASCB)', 14, 10);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(52, 211, 153);
  doc.text("Baromètre d'évaluation des écosystèmes de dialogue État-OSC", 14, 17);

  // Metadata Card
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 28, pageWidth - 28, 36, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`${secteurNom} — Module ${soumission.module_code}`, 18, 35);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Organisation :`, 18, 42);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(soumission.nom_organisation || 'Non renseignée', 42, 42);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Répondant :`, 18, 48);
  doc.setTextColor(15, 23, 42);
  doc.text(`${soumission.nom_repondant || 'Non renseigné'} (${soumission.fonction || 'Membre'})`, 42, 48);

  doc.setTextColor(71, 85, 105);
  doc.text(`Email :`, 18, 54);
  doc.setTextColor(15, 23, 42);
  doc.text(soumission.email || 'Non renseigné', 42, 54);

  // Right column
  const rightX = pageWidth / 2 + 10;
  doc.setTextColor(71, 85, 105);
  doc.text(`Date :`, rightX, 42);
  doc.setTextColor(15, 23, 42);
  doc.text(new Date(soumission.date_creation).toLocaleDateString('fr-FR'), rightX + 22, 42);

  doc.setTextColor(71, 85, 105);
  doc.text(`Statut :`, rightX, 48);
  doc.setTextColor(soumission.statut === 'complete' ? 22 : 180, soumission.statut === 'complete' ? 101 : 83, soumission.statut === 'complete' ? 52 : 9);
  doc.setFont('helvetica', 'bold');
  doc.text(soumission.statut === 'complete' ? 'Validée & transmise' : 'Brouillon', rightX + 22, 48);

  // Table rows for AutoTable
  const tableBody: any[] = [];

  let countOui = 0;
  let countNon = 0;

  criteres.forEach((c) => {
    const obs = soumission.observations_criteres?.[c.code] || soumission.observations_criteres?.[c.id] || '';
    tableBody.push([
      {
        content: `Critère ${c.code} : ${c.titre}${obs ? `\nObservation: ${obs}` : ''}`,
        colSpan: 4,
        styles: { fillColor: [241, 245, 249], fontStyle: 'bold', textColor: [15, 23, 42] }
      }
    ]);

    c.indicateurs.forEach((ind) => {
      const repData = getReponseData(soumission, ind.code, ind.id);
      let val = 'Non renseigné';
      if (repData.ouiNon === true) {
        val = 'OUI';
        countOui++;
      } else if (repData.ouiNon === false) {
        val = 'NON';
        countNon++;
      }

      tableBody.push([
        ind.code,
        ind.libelle,
        val,
        `${repData.precisions ? `Précisions : ${repData.precisions}\n` : ''}${repData.actions ? `Actions : ${repData.actions}` : ''}`.trim() || '-'
      ]);
    });
  });

  autoTable(doc, {
    startY: 68,
    head: [['Code', 'Indicateur', 'Réponse', 'Précisions & Actions de renforcement']],
    body: tableBody,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [30, 41, 59]
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    columnStyles: {
      0: { cellWidth: 16, fontStyle: 'bold' },
      1: { cellWidth: 70 },
      2: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 'auto' }
    },
    didParseCell: (data) => {
      if (data.column.index === 2 && data.section === 'body') {
        if (data.cell.text[0] === 'OUI') {
          data.cell.styles.textColor = [22, 101, 52];
          data.cell.styles.fillColor = [220, 252, 231];
        } else if (data.cell.text[0] === 'NON') {
          data.cell.styles.textColor = [153, 27, 27];
          data.cell.styles.fillColor = [254, 226, 226];
        }
      }
    }
  });

  // Synthesis section
  if (soumission.synthese && (soumission.synthese.forces || soumission.synthese.fragilites)) {
    const finalY = (doc as any).lastAutoTable.finalY + 8;
    if (finalY < 240) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Synthèse qualitative :', 14, finalY);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(22, 101, 52);
      doc.text('Forces :', 14, finalY + 6);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      const splitForces = doc.splitTextToSize(soumission.synthese.forces || 'Non renseigné', pageWidth - 35);
      doc.text(splitForces, 32, finalY + 6);

      const offsetFrag = finalY + 6 + (splitForces.length * 4) + 2;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(154, 52, 18);
      doc.text('Fragilités :', 14, offsetFrag);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      const splitFrag = doc.splitTextToSize(soumission.synthese.fragilites || 'Non renseigné', pageWidth - 35);
      doc.text(splitFrag, 32, offsetFrag);
    }
  }

  // Page Numbers
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Baromètre ASCB BEN/301 — ${soumission.nom_organisation || 'Organisation'} — Page ${i} sur ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }

  const cleanOrg = sanitizeFileName(soumission.nom_organisation || 'Organisation');
  doc.save(`Evaluation_${soumission.secteur_slug.toUpperCase()}_Module${soumission.module_code}_${cleanOrg}.pdf`);
}

// -----------------------------------------------------------------------------
// 2. GLOBAL EXPORTS (ALL SUBMISSIONS / FILTERED LIST)
// -----------------------------------------------------------------------------

/**
 * Export all submissions into a comprehensive Excel (.xlsx) workbook
 */
export function exportGlobalToExcel(soumissions: Soumission[]): void {
  const wb = XLSX.utils.book_new();

  // SHEET 1: VUE D'ENSEMBLE
  const summaryRows: any[] = [];
  summaryRows.push(['PROJET BEN/301 - APPUI À LA SOCIÉTÉ CIVILE AU BÉNIN (ASCB)']);
  summaryRows.push(['RÉPERTOIRE GLOBAL DES ÉVALUATIONS & SOUMISSIONS']);
  summaryRows.push(['Date d\'extraction :', new Date().toLocaleString('fr-FR'), 'Total enregistrements :', soumissions.length]);
  summaryRows.push([]);

  summaryRows.push([
    'ID Soumission',
    'Date de création',
    'Secteur',
    'Module',
    'Statut',
    'Organisation',
    'Nom du Répondant',
    'Fonction',
    'Email',
    'Organisations évaluées',
    'Total Indicateurs',
    'Réponses OUI',
    'Réponses NON',
    'Taux de conformité Oui (%)',
    'Synthèse - Forces',
    'Synthèse - Fragilités'
  ]);

  soumissions.forEach((s) => {
    const secteur = getSecteurBySlug(s.secteur_slug);
    const secteurNom = secteur?.nom || s.secteur_slug.toUpperCase();
    const criteres = getCriteresByModule(s.module_code);

    let oui = 0;
    let non = 0;
    let totalInd = 0;

    criteres.forEach((c) => {
      c.indicateurs.forEach((ind) => {
        totalInd++;
        const repData = getReponseData(s, ind.code, ind.id);
        if (repData.ouiNon === true) oui++;
        if (repData.ouiNon === false) non++;
      });
    });

    const taux = (oui + non) > 0 ? Math.round((oui / (oui + non)) * 100) : 0;

    summaryRows.push([
      s.id,
      new Date(s.date_creation).toLocaleString('fr-FR'),
      secteurNom,
      `Module ${s.module_code}`,
      s.statut === 'complete' ? 'Validée' : 'Brouillon',
      s.nom_organisation || 'Non renseignée',
      s.nom_repondant || 'Non renseigné',
      s.fonction || 'Non renseignée',
      s.email || 'Non renseigné',
      s.organisations_evaluees || '',
      totalInd,
      oui,
      non,
      `${taux}%`,
      s.synthese?.forces || '',
      s.synthese?.fragilites || ''
    ]);
  });

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary['!cols'] = [
    { wch: 38 },
    { wch: 18 },
    { wch: 18 },
    { wch: 12 },
    { wch: 12 },
    { wch: 25 },
    { wch: 20 },
    { wch: 20 },
    { wch: 25 },
    { wch: 25 },
    { wch: 14 },
    { wch: 12 },
    { wch: 12 },
    { wch: 14 },
    { wch: 40 },
    { wch: 40 }
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Vue d\'ensemble');

  // SHEET 2: MATRICE DÉTAILLÉE INDICATEURS
  const detailRows: any[] = [];
  detailRows.push([
    'ID Soumission',
    'Date',
    'Secteur',
    'Module',
    'Organisation',
    'Répondant',
    'Statut',
    'Code Critère',
    'Titre du Critère',
    'Code Indicateur',
    'Libellé de l\'Indicateur',
    'Réponse (Oui/Non)',
    'Précisions / Justificatifs',
    'Actions de renforcement',
    'Observations du Critère'
  ]);

  soumissions.forEach((s) => {
    const secteur = getSecteurBySlug(s.secteur_slug);
    const secteurNom = secteur?.nom || s.secteur_slug.toUpperCase();
    const criteres = getCriteresByModule(s.module_code);

    criteres.forEach((c) => {
      const obsCritere = s.observations_criteres?.[c.code] || s.observations_criteres?.[c.id] || '';
      c.indicateurs.forEach((ind) => {
        const repData = getReponseData(s, ind.code, ind.id);

        detailRows.push([
          s.id,
          new Date(s.date_creation).toLocaleDateString('fr-FR'),
          secteurNom,
          `Module ${s.module_code}`,
          s.nom_organisation || 'Non renseignée',
          s.nom_repondant || 'Non renseigné',
          s.statut === 'complete' ? 'Validée' : 'Brouillon',
          c.code,
          c.titre,
          ind.code,
          ind.libelle,
          repData.text,
          repData.precisions,
          repData.actions,
          obsCritere
        ]);
      });
    });
  });

  const wsDetail = XLSX.utils.aoa_to_sheet(detailRows);
  wsDetail['!cols'] = [
    { wch: 38 },
    { wch: 12 },
    { wch: 16 },
    { wch: 12 },
    { wch: 22 },
    { wch: 18 },
    { wch: 10 },
    { wch: 12 },
    { wch: 25 },
    { wch: 14 },
    { wch: 50 },
    { wch: 16 },
    { wch: 40 },
    { wch: 40 },
    { wch: 35 }
  ];
  XLSX.utils.book_append_sheet(wb, wsDetail, 'Matrice Indicateurs Détaillée');

  // SHEET 3: STATISTIQUES PAR SECTEUR
  const statsRows: any[] = [];
  statsRows.push(['SYNTHÈSE STATISTIQUE PAR SECTEUR']);
  statsRows.push([]);
  statsRows.push(['Secteur', 'Total Soumissions', 'Validées', 'Brouillons', 'Organisations uniques']);

  const secteursList = ['eau', 'sante', 'decentralisation', 'droits-humains', 'budget'] as const;
  secteursList.forEach((slug) => {
    const sectSoums = soumissions.filter((s) => s.secteur_slug === slug);
    const valid = sectSoums.filter((s) => s.statut === 'complete').length;
    const brouillon = sectSoums.filter((s) => s.statut === 'brouillon').length;
    const orgs = new Set(sectSoums.map((s) => (s.nom_organisation || '').trim().toLowerCase()).filter(Boolean)).size;
    const nomSect = getSecteurBySlug(slug)?.nom || slug;
    statsRows.push([nomSect, sectSoums.length, valid, brouillon, orgs]);
  });

  const wsStats = XLSX.utils.aoa_to_sheet(statsRows);
  wsStats['!cols'] = [{ wch: 25 }, { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(wb, wsStats, 'Stats par Secteur');

  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Evaluations_ASCB_BEN301_Export_Complet_${dateStr}.xlsx`);
}

/**
 * Export all submissions into a compiled Word document dossier (.doc)
 */
export function exportGlobalToWord(soumissions: Soumission[]): void {
  const dateStr = new Date().toLocaleDateString('fr-FR');

  const evaluationsHtml = soumissions.map((s, idx) => {
    const secteur = getSecteurBySlug(s.secteur_slug);
    const secteurNom = secteur?.nom || s.secteur_slug.toUpperCase();
    const moduleTitre = getModuleName(s.module_code);
    const criteres = getCriteresByModule(s.module_code);

    let oui = 0;
    let non = 0;
    let totalInd = 0;

    criteres.forEach((c) => {
      c.indicateurs.forEach((ind) => {
        totalInd++;
        const repData = getReponseData(s, ind.code, ind.id);
        if (repData.ouiNon === true) oui++;
        if (repData.ouiNon === false) non++;
      });
    });

    const taux = (oui + non) > 0 ? Math.round((oui / (oui + non)) * 100) : 0;

    return `
      <div style="page-break-before: ${idx > 0 ? 'always' : 'auto'}; margin-bottom: 30px;">
        <h2 style="color: #0f172a; border-bottom: 2px solid #0f766e; padding-bottom: 6px;">
          ${idx + 1}. ${secteurNom} — Module ${s.module_code} : ${s.nom_organisation || 'Organisation'}
        </h2>

        <table style="width: 100% !important; table-layout: fixed !important; border-collapse: collapse !important; background: #f8fafc; border: 1px solid #cbd5e1; margin-bottom: 14px;">
          <tr>
            <td style="padding: 6px 10px; font-size: 10pt; word-wrap: break-word !important; word-break: break-word !important;"><strong>Date :</strong> ${new Date(s.date_creation).toLocaleString('fr-FR')}</td>
            <td style="padding: 6px 10px; font-size: 10pt; word-wrap: break-word !important; word-break: break-word !important;"><strong>Statut :</strong> ${s.statut === 'complete' ? '<span style="color: #166534; font-weight: bold;">Validée & transmise</span>' : '<span style="color: #b45309; font-weight: bold;">Brouillon</span>'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 10px; font-size: 10pt; word-wrap: break-word !important; word-break: break-word !important;"><strong>Organisation :</strong> ${s.nom_organisation || 'N/A'}</td>
            <td style="padding: 6px 10px; font-size: 10pt; word-wrap: break-word !important; word-break: break-word !important;"><strong>Répondant :</strong> ${s.nom_repondant || 'N/A'} (${s.fonction || 'Membre'})</td>
          </tr>
          <tr>
            <td style="padding: 6px 10px; font-size: 10pt; word-wrap: break-word !important; word-break: break-word !important;"><strong>Email :</strong> ${s.email || 'N/A'}</td>
            <td style="padding: 6px 10px; font-size: 10pt; word-wrap: break-word !important; word-break: break-word !important;"><strong>Score conformité :</strong> ${oui}/${totalInd} (${taux}% OUI)</td>
          </tr>
        </table>

        <table style="width: 100% !important; table-layout: fixed !important; border-collapse: collapse !important; margin-bottom: 14px; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;">
          <colgroup>
            <col style="width: 10%;" />
            <col style="width: 34%;" />
            <col style="width: 12%;" />
            <col style="width: 22%;" />
            <col style="width: 22%;" />
          </colgroup>
          <thead>
            <tr style="background: #0f172a; color: white;">
              <th style="border: 1px solid #334155; padding: 6px; font-size: 9pt; width: 10%; word-wrap: break-word !important; word-break: break-word !important;">Code</th>
              <th style="border: 1px solid #334155; padding: 6px; font-size: 9pt; width: 34%; word-wrap: break-word !important; word-break: break-word !important;">Indicateur</th>
              <th style="border: 1px solid #334155; padding: 6px; font-size: 9pt; width: 12%; word-wrap: break-word !important; word-break: break-word !important;">Réponse</th>
              <th style="border: 1px solid #334155; padding: 6px; font-size: 9pt; width: 22%; word-wrap: break-word !important; word-break: break-word !important;">Précisions</th>
              <th style="border: 1px solid #334155; padding: 6px; font-size: 9pt; width: 22%; word-wrap: break-word !important; word-break: break-word !important;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${criteres.map((c) => {
              const obs = s.observations_criteres?.[c.code] || s.observations_criteres?.[c.id] || '';
              const cHead = `
                <tr style="background: #f1f5f9; font-weight: bold;">
                  <td colspan="5" style="border: 1px solid #cbd5e1; padding: 6px; font-size: 9pt; word-wrap: break-word !important; word-break: break-word !important;">
                    Critère ${c.code} : ${c.titre}
                    ${obs ? `<div style="font-weight: normal; font-size: 8pt; color: #0284c7;">Obs : ${obs}</div>` : ''}
                  </td>
                </tr>
              `;
              const rows = c.indicateurs.map((ind) => {
                const repData = getReponseData(s, ind.code, ind.id);
                const repVal = repData.ouiNon === true ? '<strong style="color: #166534;">OUI</strong>' : repData.ouiNon === false ? '<strong style="color: #991b1b;">NON</strong>' : '-';
                return `
                  <tr>
                    <td style="border: 1px solid #cbd5e1; padding: 6px; font-size: 8.5pt; word-wrap: break-word !important; word-break: break-word !important;">${ind.code}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 6px; font-size: 8.5pt; word-wrap: break-word !important; word-break: break-word !important;">${ind.libelle}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 6px; font-size: 8.5pt; text-align: center; word-wrap: break-word !important; word-break: break-word !important;">${repVal}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 6px; font-size: 8pt; word-wrap: break-word !important; word-break: break-word !important; white-space: normal !important;">${repData.precisions ? repData.precisions.replace(/\n/g, '<br/>') : '-'}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 6px; font-size: 8pt; word-wrap: break-word !important; word-break: break-word !important; white-space: normal !important;">${repData.actions ? repData.actions.replace(/\n/g, '<br/>') : '-'}</td>
                  </tr>
                `;
              }).join('');
              return cHead + rows;
            }).join('')}
          </tbody>
        </table>

        ${s.synthese ? `
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 10px; margin-bottom: 8px; font-size: 9pt;">
            <strong style="color: #166534;">Forces identifiées :</strong> ${s.synthese.forces ? s.synthese.forces.replace(/\n/g, '<br/>') : 'Non renseigné'}
          </div>
          <div style="background: #fff7ed; border: 1px solid #fed7aa; padding: 10px; font-size: 9pt;">
            <strong style="color: #9a3412;">Fragilités identifiées :</strong> ${s.synthese.fragilites ? s.synthese.fragilites.replace(/\n/g, '<br/>') : 'Non renseigné'}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>Dossier Global Évaluations ASCB</title>
      <style>
        body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #1e293b; margin: 20px; }
      </style>
    </head>
    <body>
      <div style="text-align: center; border-bottom: 3px solid #0f766e; padding-bottom: 16px; margin-bottom: 30px;">
        <h1 style="font-size: 20pt; color: #0f172a; margin: 0;">PROJET BEN/301 - APPUI À LA SOCIÉTÉ CIVILE AU BÉNIN (ASCB)</h1>
        <h2 style="font-size: 14pt; color: #0f766e; margin: 6px 0 0 0;">DOSSIER COMPLET DES ÉVALUATIONS DES ÉCOSYSTÈMES DE DIALOGUE ÉTAT-OSC</h2>
        <p style="font-size: 10pt; color: #64748b; margin-top: 8px;">Extrait le ${dateStr} &bull; Total des fiches : ${soumissions.length}</p>
      </div>

      ${evaluationsHtml}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + html], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Dossier_Global_Evaluations_ASCB_${new Date().toISOString().slice(0, 10)}.doc`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export all submissions as a structured global PDF summary report
 */
export function exportGlobalToPDF(soumissions: Soumission[]): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PROJET BEN/301 - APPUI À LA SOCIÉTÉ CIVILE AU BÉNIN (ASCB)', 14, 9);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(52, 211, 153);
  doc.text(`Rapport général des évaluations extraites au ${new Date().toLocaleDateString('fr-FR')} — ${soumissions.length} évaluation(s)`, 14, 16);

  const tableData = soumissions.map((s) => {
    const secteur = getSecteurBySlug(s.secteur_slug);
    const secteurNom = secteur?.nom || s.secteur_slug.toUpperCase();
    const criteres = getCriteresByModule(s.module_code);

    let oui = 0;
    let non = 0;
    let totalInd = 0;

    criteres.forEach((c) => {
      c.indicateurs.forEach((ind) => {
        totalInd++;
        const repData = getReponseData(s, ind.code, ind.id);
        if (repData.ouiNon === true) oui++;
        if (repData.ouiNon === false) non++;
      });
    });

    const taux = (oui + non) > 0 ? `${Math.round((oui / (oui + non)) * 100)}%` : '0%';

    return [
      new Date(s.date_creation).toLocaleDateString('fr-FR'),
      secteurNom,
      `Mod. ${s.module_code}`,
      s.nom_organisation || 'Non renseignée',
      s.nom_repondant || 'Non renseigné',
      s.statut === 'complete' ? 'Validée' : 'Brouillon',
      `${oui}/${totalInd} (${taux})`,
      s.synthese?.forces ? s.synthese.forces.slice(0, 80) + '...' : '-'
    ];
  });

  autoTable(doc, {
    startY: 28,
    head: [['Date', 'Secteur', 'Module', 'Organisation', 'Répondant', 'Statut', 'Score OUI', 'Forces clés']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [30, 41, 59]
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 28, fontStyle: 'bold' },
      2: { cellWidth: 18 },
      3: { cellWidth: 50 },
      4: { cellWidth: 40 },
      5: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
      6: { cellWidth: 28, halign: 'center' },
      7: { cellWidth: 'auto' }
    },
    didParseCell: (data) => {
      if (data.column.index === 5 && data.section === 'body') {
        if (data.cell.text[0] === 'Validée') {
          data.cell.styles.textColor = [22, 101, 52];
          data.cell.styles.fillColor = [220, 252, 231];
        } else {
          data.cell.styles.textColor = [180, 83, 9];
          data.cell.styles.fillColor = [254, 243, 199];
        }
      }
    }
  });

  // Page Numbers
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Projet BEN/301 ASCB — Rapport global — Page ${i} sur ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }

  doc.save(`Rapport_Global_ASCB_BEN301_${new Date().toISOString().slice(0, 10)}.pdf`);
}
