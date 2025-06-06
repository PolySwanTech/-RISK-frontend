import { RiskLevel } from "../enum/riskLevel.enum";
import { Risk } from './Risk';

export interface RiskEvaluation {
  id: string;
  riskNet: RiskLevel;
  evaluator: string;
  riskTemplateId: Risk; // Ou string si tu ne veux que l’id
  createdAt: string;
}
