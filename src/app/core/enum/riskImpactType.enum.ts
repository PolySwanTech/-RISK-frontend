export enum RiskImpactType {
    FINANCIER = "FINANCIER",
    REPUTATIONEL = "REPUTATIONEL"
}

export const RiskImpactTypeLabels: Record<RiskImpactType, string> = {
  [RiskImpactType.FINANCIER]: 'Financier',
  [RiskImpactType.REPUTATIONEL]: 'Réputationel'
};