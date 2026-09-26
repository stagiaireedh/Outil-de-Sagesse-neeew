import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, HelpCircle, ArrowRight, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import { SECTEURS_DATA } from '../data/secteursData';

export const GuidePage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10" id="guide-page">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <BookOpen className="w-8 h-8 text-emerald-600" />
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Cadre méthodologique &bull; BEN/301 - ASCB
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Guide d'utilisation de l'outil d'évaluation
            </h1>
          </div>
        </div>

        <p className="text-slate-600 text-sm leading-relaxed">
          Le présent outil a été conçu dans le cadre du <strong>PROJET BEN/301 - Appui à la Société Civile au Bénin (ASCB)</strong>, financé par le Gouvernement du Grand-Duché de Luxembourg et l'Union Européenne. Il opérationnalise la grille d'analyse multicritères issue de la mission de cartographie menée par <strong>Ralmeg GANDAHO</strong> (Chef de mission) et <strong>Montesquieu HOUNHOUI</strong> (Expert en plaidoyer et recherche).
        </p>
      </div>

      {/* Les 4 Modules d'évaluation */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
          Typologie des modules et critères d'évaluation
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-bold">
              Module B1 &bull; Mécanismes de concertation
            </span>
            <h3 className="font-bold text-slate-900 text-base">
              Coordination interne et préparation du plaidoyer
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Examine les dispositifs regroupant exclusivement des OSC en amont du dialogue avec l'État.
            </p>
            <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
              <li><strong>B1.1 Composition :</strong> Exclusivement OSC, représentativité et diversité.</li>
              <li><strong>B1.2 Structuration :</strong> Acte fondateur, régularité et formalisation.</li>
              <li><strong>B1.3 Mission &amp; Objectifs :</strong> Orientation vers l'effectivité des services publics.</li>
              <li><strong>B1.4 Consultation &amp; Restitution :</strong> Circulation de l'information avec les mandants.</li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <span className="px-2.5 py-1 rounded-md bg-teal-100 text-teal-800 text-xs font-bold">
              Module B2 &bull; Mécanismes de dialogue
            </span>
            <h3 className="font-bold text-slate-900 text-base">
              Dispositifs bipartites permanents État–OSC
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dispositifs institutionnalisés organisant les échanges structurés entre autorités et OSC.
            </p>
            <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
              <li><strong>B2.1 Composition bipartite :</strong> Présence effective de l'État et des OSC.</li>
              <li><strong>B2.2 Structuration :</strong> Base légale, régularité et secrétariat permanent.</li>
              <li><strong>B2.3 Influence :</strong> Prise en compte réelle dans les politiques publiques.</li>
              <li><strong>B2.4 Suivi des décisions :</strong> Garantie de suivi (déficit structurant national).</li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 text-xs font-bold">
              Module B3 &bull; Événements de dialogue
            </span>
            <h3 className="font-bold text-slate-900 text-base">
              Rencontres sectorielles et revues périodiques
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Rencontres ponctuelles ou annuelles (revues sectorielles, CODIR élargis, ateliers).
            </p>
            <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
              <li><strong>B3.1 Composition bipartite :</strong> Présence des pouvoirs publics et société civile.</li>
              <li><strong>B3.2 Objet du dialogue :</strong> Effectivité des services publics et PV formels.</li>
              <li><strong>B3.3 Potentiel d'institutionnalisation :</strong> Volonté de migration vers un mécanisme.</li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <span className="px-2.5 py-1 rounded-md bg-purple-100 text-purple-800 text-xs font-bold">
              Module C &bull; Auto-évaluation des OSC
            </span>
            <h3 className="font-bold text-slate-900 text-base">
              Cadre réflexif et bienveillant des capacités internes
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Auto-positionnement non évaluatif des organisations membres du mécanisme de concertation.
            </p>
            <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
              <li><strong>C.1 Consultation interne :</strong> Délibération préalable et mandat clair.</li>
              <li><strong>C.2 Préparation &amp; Formulation :</strong> Arguments techniques et plaidoyer.</li>
              <li><strong>C.3 Documentation &amp; Rapportage :</strong> Rapports de surveillance et archivage.</li>
              <li><strong>C.4 Restitution aux mandants :</strong> Transparence auprès des membres.</li>
              <li><strong>C.5 Participation effective :</strong> Régularité et ressources logistiques.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Appel à l'action */}
      <div className="p-6 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-base">Prêt à démarrer une évaluation ?</h3>
          <p className="text-xs text-slate-400">Choisissez l'un des 5 secteurs pour renseigner la grille.</p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
        >
          <span>Choisir un secteur</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
