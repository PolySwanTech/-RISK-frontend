export enum RiskLevel {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    VERY_HIGH = "VERY_HIGH",
}

export const RiskLevelScores: Record<RiskLevel, number> = {
  [RiskLevel.LOW]       : 1,
  [RiskLevel.MEDIUM]    : 3,
  [RiskLevel.HIGH]      : 4,
  [RiskLevel.VERY_HIGH] : 5,
};

export const RiskLevelLabels: Record<RiskLevel, string> = {
  [RiskLevel.LOW]: 'Low',
  [RiskLevel.MEDIUM]: 'Medium',
  [RiskLevel.HIGH]: 'High',
  [RiskLevel.VERY_HIGH]: 'Very High'
};