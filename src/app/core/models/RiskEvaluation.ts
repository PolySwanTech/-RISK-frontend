import { RiskLevel } from "../enum/riskLevel.enum";
import { Utilisateur } from "./Utilisateur";

export interface RiskEvaluation {
  id           : string;      // UUID
  evaluation      : RiskLevel;
  evaluator    : Utilisateur;      // UUID de l’évaluateur
  probability ?: number;
  createdAt    : Date;      // ISO
  riskId : string; // UUID du risque
  evaluationPeriod: string;

}

export interface RiskEvaluationDto {
  id           : string;      
  evaluation      : RiskLevel;
  evaluatorId   : string;   
  evaluatorName    : string;   
  createdAt    : Date;
  riskId : string;
  commentaire : string;
  brut: boolean;
  evaluationPeriod: string;
}

export interface EvaluationIndicatorDto {
  frequenceId: number;
  severiteId: number;
}

export interface RiskEvaluationCreateDto {
  evaluation: string;
  brut?: boolean;
  commentaire?: string;
  riskId: string;
  indicators?: EvaluationIndicatorDto[];  
}