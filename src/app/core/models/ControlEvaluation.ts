import { Evaluation } from "../enum/evaluation.enum";

export class ControlEvaluation {
  executionId!: string;
  evaluation!: Evaluation;
  resume!: string;
  comments!: string;
}

export interface ControlEvaluationView {
  id: string;
  evaluation: string;
  resume: string;
  comments: string;
  evaluatedAt: string;
  plannedAt: string;
  performedBy: string;
  reviewStatus: 'PENDING' | 'APPROVED' | 'REEXAM_REQUESTED';
  reviewedAt?: string;
  reviewedBy?: string;
  reviewComment?: string;
  cycleNo?: number;
  reexamOf?: string;
}