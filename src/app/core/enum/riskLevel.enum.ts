// risk-level.model.ts

// ✅ Enum pour les valeurs autorisées
export enum RiskLevelEnum {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  VERY_HIGH = "VERY_HIGH",
}

// ✅ Interface qui représente exactement ce que renvoie le backend
export interface RiskLevel {
  name: RiskLevelEnum; // le backend renvoie "LOW", "MEDIUM", ...
  color: string;       // le backend renvoie une couleur hexadécimale
}

// ✅ Scores associés à chaque niveau de risque
export const RiskLevelScores: Record<RiskLevelEnum, number> = {
  [RiskLevelEnum.LOW]: 1,
  [RiskLevelEnum.MEDIUM]: 3,
  [RiskLevelEnum.HIGH]: 4,
  [RiskLevelEnum.VERY_HIGH]: 5,
};

// ✅ Labels associés (affichage lisible en UI)
export const RiskLevelLabels: Record<RiskLevelEnum, string> = {
  [RiskLevelEnum.LOW]: "Low",
  [RiskLevelEnum.MEDIUM]: "Medium",
  [RiskLevelEnum.HIGH]: "High",
  [RiskLevelEnum.VERY_HIGH]: "Very High",
};
