import { RiskLevel } from "../enum/riskLevel.enum";
import { RiskTemplate, RiskId } from './RiskTemplate';

export interface RiskEvaluation {

  /** Identifiant unique */
  id: string;                // UUID

  /** Valeur du risque net */
  riskNet: RiskLevel;

  /** Identifiant (UUID) de l’évaluateur */
  evaluator: string;

  /**
   * Référence au template évalué.
   * Si le back renvoie l’objet complet → laisser `RiskTemplate | null`.
   * Si le back ne renvoie que les clés → remplacer par `RiskId`.
   */
  riskTemplate: RiskTemplate | null;

  /** Horodatage UTC ISO-8601 */
  createdAt: string;
}
