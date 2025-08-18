import { RiskLevel } from "../enum/riskLevel.enum";
import { RiskId } from './RiskTemplate';
import { Utilisateur } from "./Utilisateur";
/* ----------------------------------------- */
/*  models/RiskEvaluation.ts                 */
/* ----------------------------------------- */

/** --- DTO envoyé au back lors de la création --- */
export interface RiskEvaluationCreateDto {
  riskNet      : RiskLevel;
  probability ?: number | null;           // facultatif
  commentaire : string;
}

/** --- objet retourné par l’API --- */
export interface RiskEvaluation {
  id           : string;      // UUID
  evaluation      : RiskLevel;
  evaluator    : Utilisateur;      // UUID de l’évaluateur
  probability ?: number;
  createdAt    : Date;      // ISO
  riskId : string; // UUID du risque
}