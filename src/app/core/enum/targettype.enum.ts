export enum TargetType {
  INCIDENT = 'INCIDENT',
  IMPACT = 'IMPACT',
  CONTROL = 'CONTROL',
  ACTION_PLAN = 'ACTION_PLAN',
  ACTION_PLAN_FROM_INCIDENT = 'ACTION_PLAN_FROM_INCIDENT'
}

export const TargetTypeFolder: Record<TargetType, string> = {
  [TargetType.INCIDENT]: 'incidents',
  [TargetType.IMPACT]: 'impacts',
  [TargetType.CONTROL]: 'controls',
  [TargetType.ACTION_PLAN]: 'action-plans',
  [TargetType.ACTION_PLAN_FROM_INCIDENT]: 'action-plans',
};

export const TargetTypeLabel: Record<TargetType, string> = {
  [TargetType.INCIDENT]: 'Incident',
  [TargetType.IMPACT]: 'Impact',
  [TargetType.CONTROL]: 'Contrôle',
  [TargetType.ACTION_PLAN]: 'Plan d\'action',
  [TargetType.ACTION_PLAN_FROM_INCIDENT]: 'Plan d\'action',
};
