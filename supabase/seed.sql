-- ==============================================================================
-- PROJET BEN/301 - ASCB : SEED INITIAL DES 5 SECTEURS PRIORITAIRES
-- ==============================================================================

INSERT INTO public.secteurs (nom, slug, description, ordre, configuration_ecosysteme, analyse_premiere_mission)
VALUES
(
  'Eau',
  'eau',
  'Secteur Eau, Hygiène et Assainissement (EHA) - Analyse de l''écosystème national de dialogue',
  1,
  '[
    {"composante": "Mécanisme(s) de concertation", "presente": true, "nombre": 1, "denomination": "Cadre de Concertation des Acteurs Non Étatiques des secteurs de l''eau et de l''assainissement (CANEA)"},
    {"composante": "Mécanisme(s) de dialogue", "presente": false, "nombre": 0, "denomination": ""},
    {"composante": "Événement(s) de dialogue", "presente": true, "nombre": 2, "denomination": "Revue Sectorielle EHA et les CODIR élargis eau"}
  ]'::jsonb,
  'Configuration de l''écosystème. L''écosystème du secteur de l''eau s''articule autour du mécanisme de concertation (le CANEA), et de deux événements de dialogue (la Revue Sectorielle EHA et les CODIR élargis eau).

Résultats de l''analyse multicritères (mécanisme de concertation). Le CANEA satisfait à l''ensemble des quatre critères retenus pour les mécanismes de concertation : composition exclusivement OSC, structuration, mission orientée vers l''effectivité des services publics du secteur eau, et capacité de consultation interne, de documentation, de rapportage et de restitution. Il constitue l''un des mécanismes de concertation les mieux structurés au niveau national.

Résultats de l''analyse multicritères (événements de dialogue). La Revue Sectorielle EHA et les CODIR élargis eau satisfont aux trois critères retenus : composition bipartite, objet portant sur l''effectivité des services publics et fréquence de tenue. La corrélation positive entre le travail préparatoire du CANEA et la qualité des contributions portées lors de ces événements a été spécifiquement documentée par la mission.

Principaux défis identifiés. La question de la pérennité financière du CANEA au-delà des financements de projets, et la nécessité de renforcer la diversité des organisations membres du CANEA.'
),
(
  'Santé',
  'sante',
  'Secteur de la Santé publique - Coordination PNUSS, dialogue CNCO/FMSTP et CODIR élargis',
  2,
  '[
    {"composante": "Mécanisme(s) de concertation", "presente": true, "nombre": 1, "denomination": "Plateforme Nationale des Utilisateurs des Services de Santé (PNUSS)"},
    {"composante": "Mécanisme(s) de dialogue", "presente": true, "nombre": 1, "denomination": "Conseil National de Coordination et d''Orientation (CNCO/FMSTP/BÉNIN)"},
    {"composante": "Événement(s) de dialogue", "presente": true, "nombre": 1, "denomination": "CODIR élargi santé"}
  ]'::jsonb,
  'Configuration de l''écosystème au niveau national. L''écosystème santé comprend au niveau national un mécanisme de concertation (la PNUSS), un mécanisme de dialogue (le CNCO/FMSTP) et un événement de dialogue (les CODIR élargis santé). L''analyse de la présente mission se limite strictement à ces trois composantes nationales.

Résultats de l''analyse multicritères (mécanisme de concertation). La PNUSS satisfait à l''ensemble des quatre critères des mécanismes de concertation : composition exclusivement OSC, structuration, mission orientée vers l''effectivité des services de santé publique, et capacité de consultation interne, de documentation, de rapportage et de restitution. Elle constitue le principal espace de coordination entre les OSC du secteur en amont de leur participation au dialogue avec les autorités sanitaires.

Résultats de l''analyse multicritères (mécanisme de dialogue). Le CNCO/FMSTP satisfait aux critères de composition bipartite, de structuration et d''influence sur les politiques publiques, notamment dans le domaine de la lutte contre le VIH/SIDA, la tuberculose et le paludisme. Comme l''ensemble des mécanismes de dialogue au niveau national, il ne garantit pas le suivi des décisions issues du dialogue, ce déficit constituant le constat le plus structurant de la mission.

Résultats de l''analyse multicritères (événements de dialogue). Les CODIR élargis santé satisfont aux trois critères retenus pour les événements de dialogue : composition bipartite, objet portant sur l''effectivité des services de santé publique et fréquence de tenue. Ils constituent des espaces d''échanges périodiques entre les autorités sanitaires et les OSC du secteur.

Principaux défis identifiés. Le déficit de garantie de suivi des décisions au niveau du mécanisme de dialogue demeure le principal enjeu structurel. La mission a également relevé la nécessité de renforcer les capacités de la PNUSS en matière de documentation et de rapportage afin d''améliorer la qualité et la pertinence des contributions portées dans les espaces de dialogue avec le Ministère de la Santé.'
),
(
  'Décentralisation',
  'decentralisation',
  'Secteur Décentralisation et gouvernance locale - Revue sectorielle MDGL et cadre OSC',
  3,
  '[
    {"composante": "Mécanisme(s) de concertation", "presente": true, "nombre": 1, "denomination": "Cadre de concertation des OSC participantes à la revue sectorielle de la décentralisation"},
    {"composante": "Mécanisme(s) de dialogue", "presente": false, "nombre": 0, "denomination": ""},
    {"composante": "Événement(s) de dialogue", "presente": true, "nombre": 1, "denomination": "Revue sectorielle de la décentralisation"}
  ]'::jsonb,
  'Configuration de l''écosystème. L''écosystème de la décentralisation comprend un mécanisme de concertation (le Cadre de concertation des OSC participantes à la revue sectorielle de la décentralisation) et un événement de dialogue (la Revue sectorielle de la décentralisation, rattachée au Ministère de la Décentralisation et de la Gouvernance Locale).

Résultats de l''analyse multicritères (mécanisme de concertation). Le Cadre de concertation des OSC participantes à la revue sectorielle de la décentralisation satisfait à l''ensemble des quatre critères : composition exclusivement OSC, structuration, mission orientée vers l''effectivité des services publics relevant du secteur de la décentralisation, et capacité de consultation interne, de documentation, de rapportage et de restitution.

Résultats de l''analyse multicritères (événements de dialogue). La Revue sectorielle de la décentralisation satisfait aux trois critères retenus. Il constitue un espace d''échange entre les OSC et le MDGL sur les enjeux de la gouvernance locale.

Principaux défis identifiés. L''absence d''un mécanisme de dialogue formalisé rattaché à cet écosystème au niveau national, laissant les événements de dialogue comme seuls espaces d''interface directe avec l''État, sans les garanties institutionnelles d''un mécanisme permanent. La question de la pérennité financière du Cadre de concertation au-delà des appuis de projets, et la nécessité d''assurer une dynamique descendante vers les mécanismes communaux de dialogue relevant de la décentralisation.'
),
(
  'Droits humains',
  'droits-humains',
  'Secteur Droits de l''Homme - Groupe de travail EPU, rapports alternatifs et revues',
  4,
  '[
    {"composante": "Mécanisme(s) de concertation", "presente": true, "nombre": 1, "denomination": "Groupe de travail des OSC pour l''EPU"},
    {"composante": "Mécanisme(s) de dialogue", "presente": false, "nombre": 0, "denomination": ""},
    {"composante": "Événement(s) de dialogue", "presente": true, "nombre": 2, "denomination": "Ateliers de validation des rapports alternatifs (organes de traités, Conseil des droits de l''Homme), revues alternatives sectorielles"}
  ]'::jsonb,
  'Configuration de l''écosystème. L''écosystème des droits humains est structuré autour d''un mécanisme de concertation (le Groupe de travail des OSC pour l''EPU) et d''un événement de dialogue (les Ateliers de validation de rapports alternatifs aux organes de traités et au Conseil des droits de l''Homme de l''ONU, et les revues alternatives sectorielles). Aucun mécanisme de dialogue formalisé n''a été recensé dans cet écosystème au niveau national.

Résultats de l''analyse multicritères (mécanisme de concertation). Le Groupe de travail des OSC pour l''EPU satisfait à l''ensemble des quatre critères des mécanismes de concertation. Bien qu''informel dans sa structure, il regroupe des membres formellement constitués. Dans le cadre de son processus de documentation et de rapportage, il interagit régulièrement avec le CANEA, la PNUSS, Social Watch Bénin, ALCRER et d''autres organisations impliquées dans le dialogue. La mission l''a explicitement identifié, aux côtés de l''UAB, comme un exemple de bonne pratique dont la capacité à contribuer en qualité dans le dialogue avec l''État est réelle et documentée.

Résultats de l''analyse multicritères (événement de dialogue). Les ateliers de validation de rapports alternatifs satisfont aux trois critères retenus. La mission a mis en évidence la corrélation directe et positive entre le travail préparatoire conduit au sein du Groupe de travail des OSC pour l''EPU (documentation du niveau d''effectivité des droits, harmonisation des positions, structuration du plaidoyer) et la qualité des contributions portées lors de ces événements.

Principaux défis identifiés. L''absence d''un mécanisme de dialogue formalisé dans cet écosystème, ce qui prive les OSC d''un cadre permanent et institutionnalisé d''échange avec l''État sur les droits humains. La dépendance du Groupe de travail à un nombre limité d''organisations spécialisées constitue également un risque de fragilité à long terme. La mission recommande la diversification des membres et le transfert de savoir-faire vers de nouvelles organisations.'
),
(
  'Budget',
  'budget',
  'Secteur Finances publiques et transparence budgétaire - Unité d''Analyse Budgétaire (UAB)',
  5,
  '[
    {"composante": "Mécanisme(s) de concertation", "presente": true, "nombre": 1, "denomination": "Unité d''Analyse Budgétaire"},
    {"composante": "Mécanisme(s) de dialogue", "presente": false, "nombre": 0, "denomination": ""},
    {"composante": "Événement(s) de dialogue", "presente": true, "nombre": 1, "denomination": "Initiatives de consultation relatives au processus budgétaire"}
  ]'::jsonb,
  'Configuration de l''écosystème. L''écosystème budget est l''un des deux écosystèmes identifiés par la mission comme des exemples de bonne pratique à valoriser. Il articule un mécanisme de concertation (l''Unité d''Analyse Budgétaire, portée par Social Watch Bénin) et un événement de dialogue (les Initiatives de consultation relatives au processus budgétaire).

Résultats de l''analyse multicritères (mécanisme de concertation). L''UAB satisfait à l''ensemble des quatre critères des mécanismes de concertation. Elle offre un espace de concertation préparatoire au dialogue avec les acteurs étatiques, principalement la Direction Générale du Budget, et contribue à la participation de la société civile au suivi des finances publiques, à la transparence et à la redevabilité dans la gestion des ressources publiques. La mission a documenté la corrélation directe entre le travail préparatoire de l''UAB et la qualité des contributions des OSC lors des initiatives de consultation budgétaire.

Résultats de l''analyse multicritères (événement de dialogue). Les initiatives de consultation relatives au processus budgétaire satisfont aux trois critères. Elles constituent des moments d''échanges entre le Ministère de l''Économie et des Finances, l''Assemblée nationale et les OSC.

Principaux défis identifiés. Malgré la maturité de l''UAB, sa composition est principalement constituée d''organisations à profil technique dans les domaines des finances publiques et de la gouvernance économique. Une ouverture à des organisations actives dans le domaine des droits humains permettrait d''enrichir les contributions dans une logique de budgétisation sensible aux droits.'
)
ON CONFLICT (slug) DO UPDATE SET
  configuration_ecosysteme = EXCLUDED.configuration_ecosysteme,
  analyse_premiere_mission = EXCLUDED.analyse_premiere_mission;
