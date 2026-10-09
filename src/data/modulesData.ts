import { Critere, ModuleCode, ModuleInfo, Secteur } from '../types';
import { getSecteurBySlug } from './secteursData';

export const MODULES_INFO: ModuleInfo[] = [
  {
    code: 'A',
    titre: "Module A : Identification et contextualisation",
    sousTitre: "Configuration de l'écosystème sectoriel",
    description: "Présentation des composantes nationales (concertation, dialogue, événements) et rappel des principaux résultats de la mission de cartographie.",
    estInformatif: true
  },
  {
    code: 'B1',
    titre: "Module B1 : Évaluation des mécanismes de concertation",
    sousTitre: "Coordination interne entre OSC préparatoire au dialogue",
    description: "Évalue la composition, la structuration, la mission et les capacités de consultation interne, de documentation et de restitution des OSC."
  },
  {
    code: 'B2',
    titre: "Module B2 : Évaluation des mécanismes de dialogue",
    sousTitre: "Dispositifs formels ou informels État-OSC",
    description: "Évalue la composition bipartite, le niveau de fonctionnement, l'influence sur les politiques publiques et la garantie de suivi des décisions."
  },
  {
    code: 'B3',
    titre: "Module B3 : Évaluation des événements de dialogue",
    sousTitre: "Rencontres ponctuelles ou périodiques État-OSC",
    description: "Évalue la composition bipartite, l'objet du dialogue, la fréquence et le potentiel d'institutionnalisation vers un mécanisme formel."
  },
  {
    code: 'C',
    titre: "Module C : Auto-évaluation des OSC membres",
    sousTitre: "Processus réflexif et non évaluatif des organisations",
    description: "Auto-positionnement des OSC membres sur leurs capacités de consultation, préparation, documentation, restitution et participation effective."
  }
];

export const CRITERES_B1: Critere[] = [
  {
    id: 'critere-b1-1',
    module_code: 'B1',
    code: 'B1.1',
    titre: 'Composition',
    description: "Ce critère examine si le mécanisme est composé exclusivement d'organisations de la société civile, condition définitoire d'un mécanisme de concertation au sens de la mission.",
    ordre: 1,
    indicateurs: [
      {
        id: 'b1-1-1',
        code: 'B1.1.1',
        libelle: "Le mécanisme est composé exclusivement d'organisations de la société civile.",
        type_reponse: 'oui_non',
        ordre: 1
      },
      {
        id: 'b1-1-2',
        code: 'B1.1.2',
        libelle: "Les OSC membres représentent une diversité suffisante (géographiques, taille) pour garantir la représentativité de la concertation.",
        type_reponse: 'oui_non',
        ordre: 2
      },
      {
        id: 'b1-1-3',
        code: 'B1.1.3',
        libelle: "Des règles formelles ou informelles définissent les critères d'adhésion ou de participation.",
        type_reponse: 'oui_non',
        precisionsLabel: "Préciser ces critères dans la partie observations",
        ordre: 3
      }
    ]
  },
  {
    id: 'critere-b1-2',
    module_code: 'B1',
    code: 'B1.2',
    titre: 'Structuration et fonctionnement',
    description: "Ce critère porte sur l'existence d'une base légale ou réglementaire, la régularité des réunions et la formalisation des échanges.",
    ordre: 2,
    indicateurs: [
      {
        id: 'b1-2-1',
        code: 'B1.2.1',
        libelle: "Le mécanisme dispose d'un acte fondateur (texte réglementaire, statuts, convention de partenariat ou accord formel entre membres).",
        type_reponse: 'oui_non',
        precisionsLabel: "Préciser la date et le cadre d'adoption (ou les raisons de l'absence d'acte)",
        ordre: 1
      },
      {
        id: 'b1-2-2',
        code: 'B1.2.2',
        libelle: "Les réunions du mécanisme se tiennent de manière régulière et prévisible (fréquence définie et respectée).",
        type_reponse: 'oui_non',
        precisionsLabel: "Préciser la fréquence et la date de la dernière réunion (ou motifs d'irrégularité)",
        ordre: 2
      },
      {
        id: 'b1-2-3',
        code: 'B1.2.3',
        libelle: "Les échanges font l'objet d'une formalisation (ordre du jour, comptes rendus, procès-verbaux).",
        type_reponse: 'oui_non',
        precisionsLabel: "Fournir les preuves ou éléments justificatifs",
        ordre: 3
      },
      {
        id: 'b1-2-4',
        code: 'B1.2.4',
        libelle: "Les rôles et responsabilités des membres sont clairement définis et connus de tous.",
        type_reponse: 'oui_non',
        precisionsLabel: "Fournissez les documents qui décrivent ces rôles",
        ordre: 4
      }
    ]
  },
  {
    id: 'critere-b1-3',
    module_code: 'B1',
    code: 'B1.3',
    titre: 'Mission et objectifs',
    description: "Ce critère évalue si le mécanisme sert effectivement de cadre à la concertation entre OSC en vue de leur participation au dialogue sur l'effectivité des services publics dans le secteur concerné.",
    ordre: 3,
    indicateurs: [
      {
        id: 'b1-3-1',
        code: 'B1.3.1',
        libelle: "La mission et les objectifs du mécanisme sont explicitement orientés vers la préparation du dialogue avec l'État sur l'effectivité des services publics.",
        type_reponse: 'oui_non',
        precisionsLabel: "Quel document précise cette mission et les objectifs ?",
        ordre: 1
      },
      {
        id: 'b1-3-2',
        code: 'B1.3.2',
        libelle: "Les membres du mécanisme partagent une compréhension commune de son rôle dans l'écosystème de dialogue.",
        type_reponse: 'oui_non',
        ordre: 2
      },
      {
        id: 'b1-3-3',
        code: 'B1.3.3',
        libelle: "Le mécanisme produit des positions communes sur les enjeux sectoriels avant chaque session de dialogue avec l'État.",
        type_reponse: 'oui_non',
        precisionsLabel: "Fournir des exemples de production",
        ordre: 3
      }
    ]
  },
  {
    id: 'critere-b1-4',
    module_code: 'B1',
    code: 'B1.4',
    titre: 'Consultation interne, documentation, rapportage et restitution',
    description: "Ce critère est central : il évalue la capacité du mécanisme à consulter ses membres en amont du dialogue, à documenter les positions produites et à restituer les résultats du dialogue en aval. C'est la colonne vertébrale de son efficacité.",
    ordre: 4,
    indicateurs: [
      {
        id: 'b1-4-1',
        code: 'B1.4.1',
        libelle: "Le mécanisme dispose d'un processus structuré de consultation interne de ses membres avant chaque session de dialogue (assemblées, comités techniques, groupes de travail thématiques).",
        type_reponse: 'oui_non',
        precisionsLabel: "Présenter le processus de consultation (Produire le document qui décrit son déroulement)",
        ordre: 1
      },
      {
        id: 'b1-4-2',
        code: 'B1.4.2',
        libelle: "Les membres les plus éloignés (zones périphériques, petites organisations) sont associés à la consultation.",
        type_reponse: 'oui_non',
        precisionsLabel: "Quelle disposition particulière ?",
        ordre: 2
      },
      {
        id: 'b1-4-3',
        code: 'B1.4.3',
        libelle: "Les prises de positions produites lors de la concertation interne font l'objet d'une documentation écrite et d'un archivage accessible à l'ensemble des membres.",
        type_reponse: 'oui_non',
        ordre: 3
      },
      {
        id: 'b1-4-4',
        code: 'B1.4.4',
        libelle: "Le mécanisme produit régulièrement des rapports de surveillance, documentation ou rapportage sur l'effectivité des services publics dans son secteur.",
        type_reponse: 'oui_non',
        precisionsLabel: "Produire des exemplaires de rapport",
        ordre: 4
      },
      {
        id: 'b1-4-5',
        code: 'B1.4.5',
        libelle: "Après chaque session de dialogue avec l'État, les résultats et décisions sont restitués à l'ensemble des membres du mécanisme par des canaux formalisés.",
        type_reponse: 'oui_non',
        precisionsLabel: "Suivant quel délai ? Avec quel outil ? À quelle occasion ? Est-ce que cette restitution est documentée ?",
        ordre: 5
      },
      {
        id: 'b1-4-6',
        code: 'B1.4.6',
        libelle: "Les membres les plus éloignés (zones périphériques, petites organisations) bénéficient effectivement des restitutions.",
        type_reponse: 'oui_non',
        precisionsLabel: "Quelle disposition particulière ?",
        ordre: 6
      }
    ]
  }
];

export const CRITERES_B2: Critere[] = [
  {
    id: 'critere-b2-1',
    module_code: 'B2',
    code: 'B2.1',
    titre: 'Composition bipartite des acteurs',
    description: "Ce critère évalue la qualité et la représentativité des acteurs animant l'espace de dialogue, notamment la présence effective à la fois de l'État et des OSC dans une logique de discussion et de co-construction.",
    ordre: 1,
    indicateurs: [
      {
        id: 'b2-1-1',
        code: 'B2.1.1',
        libelle: "L'État et les OSC sont tous deux présents dans la composition formelle du mécanisme.",
        type_reponse: 'oui_non',
        precisionsLabel: "Citez les institutions qui représentent chaque catégorie",
        ordre: 1
      },
      {
        id: 'b2-1-2',
        code: 'B2.1.2',
        libelle: "Les représentants de l'État présents disposent du niveau décisionnel nécessaire pour mettre en œuvre les conclusions du dialogue.",
        type_reponse: 'oui_non',
        precisionsLabel: "Expliquer",
        ordre: 2
      },
      {
        id: 'b2-1-3',
        code: 'B2.1.3',
        libelle: "Les OSC participantes sont représentatives du secteur (diversité thématique et géographique).",
        type_reponse: 'oui_non',
        precisionsLabel: "Expliquer",
        ordre: 3
      },
      {
        id: 'b2-1-4',
        code: 'B2.1.4',
        libelle: "Les groupes vulnérables ou marginalisés (femmes, jeunes, populations éloignées) sont représentés au sein des OSC membres.",
        type_reponse: 'oui_non',
        precisionsLabel: "Citer les OSC qui représentent chaque groupe présent",
        ordre: 4
      }
    ]
  },
  {
    id: 'critere-b2-2',
    module_code: 'B2',
    code: 'B2.2',
    titre: 'Niveau de structuration et de fonctionnement',
    description: "Ce critère évalue l'existence d'une base légale ou réglementaire, la régularité des réunions, la formalisation des échanges et la clarté des rôles.",
    ordre: 2,
    indicateurs: [
      {
        id: 'b2-2-1',
        code: 'B2.2.1',
        libelle: "Le mécanisme est adossé à une base légale ou réglementaire (loi, décret, arrêté, accord formel).",
        type_reponse: 'oui_non',
        precisionsLabel: "Préciser les références du texte et fournir un exemplaire",
        ordre: 1
      },
      {
        id: 'b2-2-2',
        code: 'B2.2.2',
        libelle: "Les réunions du mécanisme se tiennent de manière régulière et suivant les formes (prévisible ou imprévisible) prévues par la base légale ou réglementaire.",
        type_reponse: 'oui_non',
        precisionsLabel: "Préciser la fréquence (et les modalités de réunion extraordinaires)",
        ordre: 2
      },
      {
        id: 'b2-2-3',
        code: 'B2.2.3',
        libelle: "Un secrétariat ou un dispositif de coordination assure la continuité du fonctionnement entre deux sessions.",
        type_reponse: 'oui_non',
        precisionsLabel: "Décrire comment cela fonctionne",
        ordre: 3
      },
      {
        id: 'b2-2-4',
        code: 'B2.2.4',
        libelle: "Les rôles des différents organes (présidence, secrétariat, rapporteur) sont définis et stables.",
        type_reponse: 'oui_non',
        precisionsLabel: "Expliquer le fonctionnement de ces organes (et préciser la référence)",
        ordre: 4
      }
    ]
  },
  {
    id: 'critere-b2-3',
    module_code: 'B2',
    code: 'B2.3',
    titre: 'Influence sur les politiques publiques',
    description: "Ce critère évalue la capacité effective du mécanisme à alimenter l'élaboration, l'ajustement ou l'amélioration des politiques publiques dans le secteur concerné.",
    ordre: 3,
    indicateurs: [
      {
        id: 'b2-3-1',
        code: 'B2.3.1',
        libelle: "L'objet du dialogue porte explicitement sur l'effectivité des services publics dans le secteur concerné.",
        type_reponse: 'oui_non',
        precisionsLabel: "Modalités d'influence sur la formulation, la mise en œuvre et l'évaluation",
        ordre: 1
      },
      {
        id: 'b2-3-2',
        code: 'B2.3.2',
        libelle: "Les OSC membres du mécanisme formulent des contributions citoyennes structurées sur les politiques sectorielles.",
        type_reponse: 'oui_non',
        ordre: 2
      },
      {
        id: 'b2-3-3',
        code: 'B2.3.3',
        libelle: "Les contributions des OSC sont présentées et discutées avec les porteurs de responsabilité.",
        type_reponse: 'oui_non',
        ordre: 3
      },
      {
        id: 'b2-3-4',
        code: 'B2.3.4',
        libelle: "Des exemples documentés attestent de l'intégration de contributions citoyennes dans des décisions publiques sectorielles.",
        type_reponse: 'oui_non',
        precisionsLabel: "Sous quel format ? (produire des exemplaires)",
        ordre: 4
      },
      {
        id: 'b2-3-5',
        code: 'B2.3.5',
        libelle: "Les OSC perçoivent leur participation comme ayant un impact réel sur les politiques ou services publics.",
        type_reponse: 'oui_non',
        ordre: 5
      }
    ]
  },
  {
    id: 'critere-b2-4',
    module_code: 'B2',
    code: 'B2.4',
    titre: 'Garantie de suivi des décisions',
    description: "Ce critère (identifié comme le déficit le plus structurant par le rapport de cartographie) évalue si les décisions issues du dialogue font l'objet d'un suivi institutionnalisé et si les autorités rendent compte des suites données aux contributions reçues.",
    ordre: 4,
    indicateurs: [
      {
        id: 'b2-4-1',
        code: 'B2.4.1',
        libelle: "Il existe un moyen formel (tableau de suivi, registre des engagements) consignant les décisions issues de chaque session de dialogue.",
        type_reponse: 'oui_non',
        precisionsLabel: "Préciser le moyen. Fournir des exemplaires",
        ordre: 1
      },
      {
        id: 'b2-4-2',
        code: 'B2.4.2',
        libelle: "Les autorités fournissent un retour justifié sur les propositions reçues entre deux sessions de dialogue.",
        type_reponse: 'oui_non',
        precisionsLabel: "Sous quel format ? Suivant quelle échéance ?",
        ordre: 2
      },
      {
        id: 'b2-4-3',
        code: 'B2.4.3',
        libelle: "Un mécanisme conjoint État–OSC assure le suivi de la mise en œuvre des décisions entre les sessions.",
        type_reponse: 'oui_non',
        precisionsLabel: "Dénomination du mécanisme. Quel est son fonctionnement ?",
        ordre: 3
      },
      {
        id: 'b2-4-4',
        code: 'B2.4.4',
        libelle: "Les OSC disposent d'un accès régulier aux informations sur les suites données à leurs contributions.",
        type_reponse: 'oui_non',
        precisionsLabel: "Citer les sources d'information et les modalités d'accès",
        ordre: 4
      }
    ]
  }
];

export const CRITERES_B3: Critere[] = [
  {
    id: 'critere-b3-1',
    module_code: 'B3',
    code: 'B3.1',
    titre: 'Composition bipartite',
    description: "Vérifie la participation conjointe des pouvoirs publics et de la société civile avec un niveau décisionnel suffisant.",
    ordre: 1,
    indicateurs: [
      {
        id: 'b3-1-1',
        code: 'B3.1.1',
        libelle: "L'événement réunit conjointement des représentants des pouvoirs publics et des OSC.",
        type_reponse: 'oui_non',
        precisionsLabel: "Citer les organisations qui participent",
        ordre: 1
      },
      {
        id: 'b3-1-2',
        code: 'B3.1.2',
        libelle: "Les représentants de l'État présents disposent du niveau décisionnel nécessaire pour mettre en œuvre les conclusions du dialogue.",
        type_reponse: 'oui_non',
        ordre: 2
      },
      {
        id: 'b3-1-3',
        code: 'B3.1.3',
        libelle: "Les OSC participantes sont représentatives du secteur (diversité thématique et géographique).",
        type_reponse: 'oui_non',
        ordre: 3
      },
      {
        id: 'b3-1-4',
        code: 'B3.1.4',
        libelle: "Les groupes vulnérables ou marginalisés (femmes, jeunes, populations éloignées) sont représentés au sein des OSC membres.",
        type_reponse: 'oui_non',
        precisionsLabel: "Citer les OSC qui représentent chaque groupe présent",
        ordre: 4
      }
    ]
  },
  {
    id: 'critere-b3-2',
    module_code: 'B3',
    code: 'B3.2',
    titre: 'Objet du dialogue',
    description: "Évalue la focalisation sur l'effectivité des services publics et la formalisation des contributions citoyennes.",
    ordre: 2,
    indicateurs: [
      {
        id: 'b3-2-1',
        code: 'B3.2.1',
        libelle: "L'événement porte explicitement sur l'effectivité des services publics dans le secteur concerné.",
        type_reponse: 'oui_non',
        ordre: 1
      },
      {
        id: 'b3-2-2',
        code: 'B3.2.2',
        libelle: "Les OSC y formulent des contributions structurées (positions documentées, propositions argumentées).",
        type_reponse: 'oui_non',
        ordre: 2
      },
      {
        id: 'b3-2-3',
        code: 'B3.2.3',
        libelle: "Est-ce qu'il y a un rapporteur qui consigne les prises de parole ou les contributions des OSC ?",
        type_reponse: 'oui_non',
        precisionsLabel: "Comment se fait la désignation ?",
        ordre: 3
      },
      {
        id: 'b3-2-4',
        code: 'B3.2.4',
        libelle: "Est-ce qu'un compte rendu ou un procès-verbal est rédigé à l'issue de l'événement, et ce document mentionne-t-il explicitement les contributions, propositions ou observations formulées par les OSC ?",
        type_reponse: 'oui_non',
        precisionsLabel: "Fournir des exemplaires",
        ordre: 4
      }
    ]
  },
  {
    id: 'critere-b3-3',
    module_code: 'B3',
    code: 'B3.3',
    titre: "Fréquence et potentiel d'institutionnalisation",
    description: "Examine la régularité, l'ancrage institutionnel et l'opportunité d'évolution vers un mécanisme de dialogue permanent.",
    ordre: 3,
    indicateurs: [
      {
        id: 'b3-3-1',
        code: 'B3.3.1',
        libelle: "L'événement se tient selon une périodicité définie et prévisible.",
        type_reponse: 'oui_non',
        precisionsLabel: "Préciser la périodicité et les moyens d'identification des participants et d'invitation",
        ordre: 1
      },
      {
        id: 'b3-3-2',
        code: 'B3.3.2',
        libelle: "L'événement bénéficie d'un ancrage institutionnel (convocation officielle, cadre formel d'organisation).",
        type_reponse: 'oui_non',
        precisionsLabel: "Préciser le cadre et produire le document si disponible",
        ordre: 2
      },
      {
        id: 'b3-3-3',
        code: 'B3.3.3',
        libelle: "Les résultats de l'événement font l'objet d'un compte rendu ou d'une note officielle.",
        type_reponse: 'oui_non',
        precisionsLabel: "Fournir un exemplaire",
        ordre: 3
      },
      {
        id: 'b3-3-4',
        code: 'B3.3.4',
        libelle: "Existe-t-il une volonté de migration vers un mécanisme de dialogue formalisé ?",
        type_reponse: 'oui_non',
        precisionsLabel: "Citer les raisons en précisant ce qu'une formalisation pourrait apporter qualitativement",
        ordre: 4
      },
      {
        id: 'b3-3-5',
        code: 'B3.3.5',
        libelle: "Cette volonté de migration est-elle partagée par les autres acteurs qui interviennent au sein de votre évènement de dialogue ?",
        type_reponse: 'oui_non',
        precisionsLabel: "Préciser quels acteurs partagent cette volonté et les convergences constatées",
        ordre: 5
      }
    ]
  }
];

export const CRITERES_C: Critere[] = [
  {
    id: 'critere-c-1',
    module_code: 'C',
    code: 'C.1',
    titre: 'Capacité de consultation interne en amont du dialogue',
    description: "Examine l'existence d'instances internes démocratiques et le mandat clair des représentants.",
    ordre: 1,
    indicateurs: [
      {
        id: 'c-1-1',
        code: 'C.1.1',
        libelle: "L'organisation dispose d'instances internes de délibération (assemblée générale, comité technique, bureau) qui se réunissent avant chaque session de dialogue.",
        type_reponse: 'oui_non',
        ordre: 1
      },
      {
        id: 'c-1-2',
        code: 'C.1.2',
        libelle: "Les membres de l'organisation sont consultés sur les positions à porter avant que leur représentant ne les engage dans un espace de dialogue ou de concertation.",
        type_reponse: 'oui_non',
        ordre: 2
      },
      {
        id: 'c-1-3',
        code: 'C.1.3',
        libelle: "Les représentants de l'organisation engagés dans les mécanismes disposent d'un mandat clair et formalisé de leurs membres.",
        type_reponse: 'oui_non',
        ordre: 3
      }
    ]
  },
  {
    id: 'critere-c-2',
    module_code: 'C',
    code: 'C.2',
    titre: 'Capacité de préparation et de formulation des positions',
    description: "Évalue l'aptitude technique de l'OSC à concevoir un plaidoyer rigoureux et documenté.",
    ordre: 2,
    indicateurs: [
      {
        id: 'c-2-1',
        code: 'C.2.1',
        libelle: "L'organisation est capable de mobiliser les principes, critères et indicateurs d'effectivité du service public de son secteur pour identifier les enjeux à porter dans le dialogue.",
        type_reponse: 'oui_non',
        ordre: 1
      },
      {
        id: 'c-2-2',
        code: 'C.2.2',
        libelle: "L'organisation prépare, avant les sessions, des positions institutionnelles structurées, argumentées et assorties de propositions ou recommandations précises.",
        type_reponse: 'oui_non',
        precisionsLabel: "Format propre ou fourni par la faîtière ? (Fournir le modèle)",
        ordre: 2
      },
      {
        id: 'c-2-3',
        code: 'C.2.3',
        libelle: "L'organisation dispose, en son sein, de personnes capables de construire un argumentaire de plaidoyer et de porter ses positions auprès des interlocuteurs étatiques.",
        type_reponse: 'oui_non',
        precisionsLabel: "Comment ces compétences ont-elles été acquises ?",
        ordre: 3
      },
      {
        id: 'c-2-4',
        code: 'C.2.4',
        libelle: "L'organisation est capable d'identifier et de mobiliser les informations techniques pertinentes pour étayer ses positions dans les espaces de dialogue.",
        type_reponse: 'oui_non',
        precisionsLabel: "Préciser les sources d'information et les modalités d'accès",
        ordre: 4
      }
    ]
  },
  {
    id: 'critere-c-3',
    module_code: 'C',
    code: 'C.3',
    titre: 'Capacité de documentation et de rapportage',
    description: "Cette dimension est directement liée au critère de consultation interne, documentation, rapportage et restitution identifié comme déterminant dans le rapport sur la cartographie.",
    ordre: 3,
    indicateurs: [
      {
        id: 'c-3-1',
        code: 'C.3.1',
        libelle: "L'organisation produit, selon une périodicité définie, des rapports de surveillance ou de documentation sur l'effectivité des services publics dans son secteur.",
        type_reponse: 'oui_non',
        ordre: 1
      },
      {
        id: 'c-3-2',
        code: 'C.3.2',
        libelle: "L'organisation dispose d'outils ou de méthodes formalisés et adaptés à son contexte pour collecter les données et informations nécessaires à ses activités de surveillance et de documentation.",
        type_reponse: 'oui_non',
        ordre: 2
      },
      {
        id: 'c-3-3',
        code: 'C.3.3',
        libelle: "Les données collectées sont analysées et synthétisées aux fins d'être utilisées dans les espaces de dialogue.",
        type_reponse: 'oui_non',
        precisionsLabel: "Sous quelles formes les résultats sont-ils documentés ? (rapport, note, fiche, tableau de bord, base de données, etc.)",
        ordre: 3
      },
      {
        id: 'c-3-4',
        code: 'C.3.4',
        libelle: "L'organisation archive de manière accessible ses productions documentaires.",
        type_reponse: 'oui_non',
        ordre: 4
      }
    ]
  },
  {
    id: 'critere-c-4',
    module_code: 'C',
    code: 'C.4',
    titre: "Capacité de circulation de l'information et de restitution aux mandants",
    description: "La restitution interne en aval correspond à la capacité de l'organisation à informer l'ensemble de ses membres des résultats des sessions de dialogue et des décisions prises, condition de la confiance et de la légitimité de la représentation.",
    ordre: 4,
    indicateurs: [
      {
        id: 'c-4-1',
        code: 'C.4.1',
        libelle: "L'organisation dispose de canaux de communication interne permettant de diffuser rapidement les informations issues des sessions de dialogue.",
        type_reponse: 'oui_non',
        precisionsLabel: "Préciser les canaux",
        ordre: 1
      },
      {
        id: 'c-4-2',
        code: 'C.4.2',
        libelle: "Après chaque session de dialogue ou de concertation, une restitution est faite à l'ensemble des membres de l'organisation.",
        type_reponse: 'oui_non',
        precisionsLabel: "Avec quel outil ? À quelle occasion ?",
        ordre: 2
      },
      {
        id: 'c-4-3',
        code: 'C.4.3',
        libelle: "Les membres les plus éloignés (zones rurales, petites structures) bénéficient effectivement des restitutions.",
        type_reponse: 'oui_non',
        precisionsLabel: "Avec quel outil ?",
        ordre: 3
      },
      {
        id: 'c-4-4',
        code: 'C.4.4',
        libelle: "L'organisation assure la transparence de la représentation : ses membres savent ce qui a été dit et décidé en leur nom.",
        type_reponse: 'oui_non',
        ordre: 4
      }
    ]
  },
  {
    id: 'critere-c-5',
    module_code: 'C',
    code: 'C.5',
    titre: 'Participation effective aux mécanismes',
    description: "Mesure la constance, la substance des interventions et les ressources de l'organisation pour participer durablement.",
    ordre: 5,
    indicateurs: [
      {
        id: 'c-5-1',
        code: 'C.5.1',
        libelle: "L'organisation participe de manière régulière et continue aux sessions du mécanisme dont elle est membre.",
        type_reponse: 'oui_non',
        ordre: 1
      },
      {
        id: 'c-5-2',
        code: 'C.5.2',
        libelle: "La participation est substantielle : l'organisation prend la parole, formule des positions et contribue aux décisions collectives.",
        type_reponse: 'oui_non',
        ordre: 2
      },
      {
        id: 'c-5-3',
        code: 'C.5.3',
        libelle: "L'organisation dispose des ressources logistiques et financières minimales pour assurer sa participation régulière (formulation des propositions et portage au moment du dialogue le cas échéant).",
        type_reponse: 'oui_non',
        ordre: 3
      },
      {
        id: 'c-5-4',
        code: 'C.5.4',
        libelle: "La participation de l'organisation dans le mécanisme contribue à renforcer ses propres capacités institutionnelles.",
        type_reponse: 'oui_non',
        ordre: 4
      }
    ]
  }
];

export function getCriteresByModule(moduleCode: ModuleCode): Critere[] {
  switch (moduleCode) {
    case 'B1':
      return CRITERES_B1;
    case 'B2':
      return CRITERES_B2;
    case 'B3':
      return CRITERES_B3;
    case 'C':
      return CRITERES_C;
    default:
      return [];
  }
}

export function isModuleApplicable(param1: Secteur | ModuleCode, param2: ModuleCode | string): boolean {
  let secteurObj: Secteur | undefined;
  let code: ModuleCode;

  if (typeof param1 === 'object' && param1 !== null && 'configuration_ecosysteme' in param1) {
    secteurObj = param1 as Secteur;
    code = param2 as ModuleCode;
  } else {
    code = param1 as ModuleCode;
    if (typeof param2 === 'string') {
      secteurObj = getSecteurBySlug(param2);
    }
  }

  if (code === 'A' || code === 'C') return true;
  if (!secteurObj) return true;

  if (code === 'B1') {
    const concertation = secteurObj.configuration_ecosysteme.find(
      (c) => c.composante.toLowerCase().includes('concertation')
    );
    return concertation ? concertation.presente : false;
  }

  if (code === 'B2') {
    const dialogue = secteurObj.configuration_ecosysteme.find(
      (c) => c.composante.toLowerCase().includes('mécanisme(s) de dialogue')
    );
    return dialogue ? dialogue.presente : false;
  }

  if (code === 'B3') {
    const evenements = secteurObj.configuration_ecosysteme.find(
      (c) => c.composante.toLowerCase().includes('événement')
    );
    return evenements ? evenements.presente : false;
  }

  return true;
}
