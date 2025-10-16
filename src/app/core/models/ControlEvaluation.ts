import { EvaluationControl } from "../enum/evaluation-controle.enum";
import { Evaluation } from "../enum/evaluation.enum";
import { ReviewStatus } from "../enum/reviewStatus.enum";

export class ControlEvaluation {
  executionId!: string;
  evaluation!: Evaluation;
  resume!: string;
  comments!: string;
}

export interface ControlEvaluationView {
  id: string;
  evaluation: EvaluationControl;
  resume: string;
  comments: string;
  evaluatedAt: string;
  plannedAt: string;
  performedBy: string;
  reviewStatus: ReviewStatus;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewComment?: string;
  cycleNo?: number;
  reexamOf?: string;
}