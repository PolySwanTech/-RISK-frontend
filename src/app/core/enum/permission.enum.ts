export enum PermissionName {
  VIEW_TODO = 'VIEW_TODO',
  VIEW_DASHBOARDS = 'VIEW_DASHBOARDS',
  VIEW_INCIDENTS = 'VIEW_INCIDENTS',
  VIEW_CARTOGRAPHIE = 'VIEW_CARTOGRAPHIE',
  VIEW_ACTION_PLAN = 'VIEW_ACTION_PLAN',
  VIEW_CONTROLES = 'VIEW_CONTROLES',
  VIEW_CALCUL_FONDS_PROPRE = 'VIEW_CALCUL_FONDS_PROPRE',

  CREATE_INCIDENT = 'CREATE_INCIDENT',
  UPDATE_INCIDENT = 'UPDATE_INCIDENT',
  CLOSED_INCIDENT = 'CLOSED_INCIDENT',

  CREATE_AUDIT_COMMENTAIRE = 'CREATE_AUDIT_COMMENTAIRE',

  CREATE_ACTION_PLAN = 'CREATE_ACTION_PLAN',
  UPDATE_ACTION_PLAN = 'UPDATE_ACTION_PLAN',

  CREATE_CONTROLE = 'CREATE_CONTROLE',
  UPDATE_CONTROLE = 'UPDATE_CONTROLE',
  VALIDER_CONTROLE = 'VALIDER_CONTROLE',

  CREATE_CARTOGRAPHIE = 'CREATE_CARTOGRAPHIE',

  VIEW_REPORTS = 'VIEW_REPORTS',
  TRACK_INCIDENT = 'TRACK_INCIDENT',
  ATTACH_DOCUMENT = 'ATTACH_DOCUMENT',
  ANALYZE_INCIDENT = 'ANALYZE_INCIDENT',
  CLASSIFY_EVENT = 'CLASSIFY_EVENT',
  ASSESS_IMPACTS = 'ASSESS_IMPACTS',
  VERIFY_COMPLIANCE = 'VERIFY_COMPLIANCE',
  TRACK_ACTION_PLAN = 'TRACK_ACTION_PLAN',
  ASSESS_ACTIVITY_RISKS = 'ASSESS_ACTIVITY_RISKS',
  SUGGEST_CORRECTIVE_MEASURES = 'SUGGEST_CORRECTIVE_MEASURES',
  PARTICIPATE_RISK_ASSESSMENT = 'PARTICIPATE_RISK_ASSESSMENT',
  FILL_MATRIX = 'FILL_MATRIX',
  MANAGE_CRITICAL_INCIDENTS = 'MANAGE_CRITICAL_INCIDENTS',
  MONITOR_SENSITIVE_INCIDENTS = 'MONITOR_SENSITIVE_INCIDENTS',
  PREPARE_REPORTS = 'PREPARE_REPORTS',
  MANAGE_USERS = 'MANAGE_USERS',
  MANAGE_PROCESS = 'MANAGE_PROCESS',
  MANAGE_CONTROLS = 'MANAGE_CONTROLS',
  CONFIGURE_WORKFLOWS = 'CONFIGURE_WORKFLOWS',
  PERFORM_MAINTENANCE = 'PERFORM_MAINTENANCE',
}

export type PermissionNameType = `${PermissionName}`;

type PermissionLabelsType = Record<PermissionName, string>;

export const PermissionLabels: PermissionLabelsType = {
  [PermissionName.VIEW_TODO]: 'Voir les tâches',
  [PermissionName.VIEW_DASHBOARDS]: 'Voir les tableaux de bord',
  [PermissionName.VIEW_INCIDENTS]: 'Voir les incidents',
  [PermissionName.VIEW_CARTOGRAPHIE]: 'Voir la cartographie',
  [PermissionName.VIEW_ACTION_PLAN]: 'Voir le plan d’action',
  [PermissionName.VIEW_CONTROLES]: 'Voir les contrôles',
  [PermissionName.VIEW_CALCUL_FONDS_PROPRE]: 'Voir le calcul des fonds propres',
  
  [PermissionName.CREATE_INCIDENT]: 'Saisir un incident',
  [PermissionName.UPDATE_INCIDENT]: 'Modifier un incident',
  [PermissionName.CLOSED_INCIDENT]: 'Clôturer un incident',

  [PermissionName.CREATE_AUDIT_COMMENTAIRE]: 'Ajouter un commentaire d’audit',
  [PermissionName.CREATE_ACTION_PLAN]: 'Créer un plan d’action',
  [PermissionName.UPDATE_ACTION_PLAN]: 'Modifier un plan d’action',

  [PermissionName.CREATE_CONTROLE]: 'Créer un contrôle',
  [PermissionName.UPDATE_CONTROLE]: 'Modifier un contrôle',
  [PermissionName.VALIDER_CONTROLE]: 'Valider un contrôle',

  [PermissionName.CREATE_CARTOGRAPHIE]: 'Créer une cartographie des risques',

  [PermissionName.TRACK_INCIDENT]: 'Suivre un incident',
  [PermissionName.ATTACH_DOCUMENT]: 'Joindre un document',
  [PermissionName.ANALYZE_INCIDENT]: 'Analyser un incident',
  [PermissionName.CLASSIFY_EVENT]: 'Classifier un événement',
  [PermissionName.ASSESS_IMPACTS]: 'Évaluer les impacts',
  [PermissionName.VERIFY_COMPLIANCE]: 'Vérifier la conformité',
  [PermissionName.TRACK_ACTION_PLAN]: 'Suivre un plan d’action',
  [PermissionName.ASSESS_ACTIVITY_RISKS]: 'Évaluer les risques d’activité',
  [PermissionName.SUGGEST_CORRECTIVE_MEASURES]: 'Suggérer des mesures correctives',
  [PermissionName.PARTICIPATE_RISK_ASSESSMENT]: 'Participer à l’évaluation des risques',
  [PermissionName.FILL_MATRIX]: 'Remplir la matrice des risques',
  [PermissionName.MANAGE_CRITICAL_INCIDENTS]: 'Gérer les incidents critiques',
  [PermissionName.MONITOR_SENSITIVE_INCIDENTS]: 'Suivre les incidents sensibles',
  [PermissionName.PREPARE_REPORTS]: 'Préparer des rapports',
  [PermissionName.MANAGE_USERS]: 'Gérer les utilisateurs',
  [PermissionName.MANAGE_PROCESS]: 'Gérer les processus',
  [PermissionName.MANAGE_CONTROLS]: 'Gérer les contrôles',
  [PermissionName.CONFIGURE_WORKFLOWS]: 'Configurer les workflows',
  [PermissionName.PERFORM_MAINTENANCE]: 'Effectuer la maintenance',
  [PermissionName.VIEW_REPORTS]: 'Voir les rapports'
};