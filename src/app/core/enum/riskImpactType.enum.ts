export enum RiskImpactType {
  OPERATIONNEL = 'OPERATIONNEL', 
  COMPTABLE  = 'COMPTABLE', 
  CREDIT = 'CREDIT', 
  FISCAL = 'FISCAL', 
  RH = 'RH', 
  LIQUIDITE = 'LIQUIDITE', 
  REPUTATION = 'REPUTATION', 
  REGLEMENTAIRE = 'REGLEMENTAIRE', 
  ENVIRONNEMENTAL = 'ENVIRONNEMENTAL',

}

export const RiskImpactTypeLabels: Record<RiskImpactType, string> = {
  [RiskImpactType.OPERATIONNEL]: 'OPERATIONNEL',
  [RiskImpactType.COMPTABLE]: 'COMPTABLE',
  [RiskImpactType.CREDIT]: 'CREDIT',
  [RiskImpactType.FISCAL]: 'FISCAL',
  [RiskImpactType.RH]: 'RH',
  [RiskImpactType.LIQUIDITE]: 'LIQUIDITE',
  [RiskImpactType.REPUTATION]: 'REPUTATION',
  [RiskImpactType.REGLEMENTAIRE]: 'REGLEMENTAIRE',
  [RiskImpactType.ENVIRONNEMENTAL]: 'ENVIRONNEMENTAL',
};