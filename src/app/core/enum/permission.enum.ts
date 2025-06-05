export enum PermissionName {
  ENTER_INCIDENT = 'ENTER_INCIDENT',
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
  CREATE_CARTOGRAPHIE = 'CREATE_CARTOGRAPHIE',
  MANAGE_CRITICAL_INCIDENTS = 'MANAGE_CRITICAL_INCIDENTS',
  MONITOR_SENSITIVE_INCIDENTS = 'MONITOR_SENSITIVE_INCIDENTS',
  PREPARE_REPORTS = 'PREPARE_REPORTS',
  MANAGE_USERS = 'MANAGE_USERS',
  MANAGE_PROCESS = 'MANAGE_PROCESS',
  MANAGE_CONTROLS = 'MANAGE_CONTROLS',
  CONFIGURE_WORKFLOWS = 'CONFIGURE_WORKFLOWS',
  PERFORM_MAINTENANCE = 'PERFORM_MAINTENANCE',
  VIEW_DASHBOARDS = 'VIEW_DASHBOARDS',
  VIEW_REPORTS = 'VIEW_REPORTS',
  VIEW_INCIDENTS = 'VIEW_INCIDENTS'
  }

  export type PermissionNameType = `${PermissionName}`; // 👈 magique

  type PermissionLabelsType = Record<PermissionName, string>;
  
  export const permissionLabels: PermissionLabelsType = {
      [PermissionName.ENTER_INCIDENT]: 'Saisir un incident',
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
      [PermissionName.CREATE_CARTOGRAPHIE]: 'Créer une cartographie des risques',
      [PermissionName.MANAGE_CRITICAL_INCIDENTS]: 'Gérer les incidents critiques',
      [PermissionName.MONITOR_SENSITIVE_INCIDENTS]: 'Suivre les incidents sensibles',
      [PermissionName.PREPARE_REPORTS]: 'Préparer des rapports',
      [PermissionName.MANAGE_USERS]: 'Gérer les utilisateurs',
      [PermissionName.MANAGE_PROCESS]: 'Gérer les processus',
      [PermissionName.MANAGE_CONTROLS]: 'Gérer les contrôles',
      [PermissionName.CONFIGURE_WORKFLOWS]: 'Configurer les workflows',
      [PermissionName.PERFORM_MAINTENANCE]: 'Effectuer la maintenance',
      [PermissionName.VIEW_DASHBOARDS]: 'Voir les tableaux de bord',
      [PermissionName.VIEW_REPORTS]: 'Voir les rapports',
      [PermissionName.VIEW_INCIDENTS]: 'Voir les incidents'
    };