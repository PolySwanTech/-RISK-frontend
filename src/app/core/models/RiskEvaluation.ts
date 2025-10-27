import { RiskLevel } from "../enum/riskLevel.enum";
import { Utilisateur } from "./Utilisateur";
/* ----------------------------------------- */
/*  models/RiskEvaluation.ts                 */
/* ----------------------------------------- */

/** --- objet retourné par l’API --- */
export interface RiskEvaluation {
  id           : string;      // UUID
  evaluation      : RiskLevel;
  evaluator    : Utilisateur;      // UUID de l’évaluateur
  probability ?: number;
  createdAt    : Date;      // ISO
  riskId : string; // UUID du risque
}

/** --- objet retourné par l’API --- */
export interface RiskEvaluationDto {
  id           : string;      
  evaluation      : RiskLevel;
  evaluatorId   : string;   
  evaluatorName    : string;   
  createdAt    : Date;
  riskId : string;
  commentaire : string;
  exercicePeriod: ExercicePeriod;
  brut: boolean;
}

export interface ExercicePeriod {
  start: Date;
  end: Date;
}