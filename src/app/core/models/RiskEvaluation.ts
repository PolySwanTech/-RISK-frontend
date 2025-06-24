import { RiskLevel } from "../enum/riskLevel.enum";
import { RiskTemplate, RiskId } from './RiskTemplate';
/* ----------------------------------------- */
/*  models/RiskEvaluation.ts                 */
/* ----------------------------------------- */

/** --- DTO envoyé au back lors de la création --- */
export interface RiskEvaluationCreateDto {
  riskNet      : RiskLevel;
  probability ?: number | null;           // facultatif
  /** On n’envoie que l’identifiant composite */
  taxonomie : string;
}

/** --- objet retourné par l’API --- */
export interface RiskEvaluation {
  id           : string;      // UUID
  riskNet      : RiskLevel;
  evaluator    : string;      // UUID de l’évaluateur
  probability ?: number;
  createdAt    : string;      // ISO
  taxonomie : { id: RiskId };
}