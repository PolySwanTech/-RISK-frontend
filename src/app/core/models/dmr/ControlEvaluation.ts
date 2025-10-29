import { EvaluationControl } from "../../enum/evaluation-controle.enum";
import { ReviewStatus } from "../../enum/reviewStatus.enum";

export class ControlEvaluation {
  id!: string;
  evaluation?: EvaluationControl;
  resume?: string;
  createdAt?: string;
  comments?: string;
  reviewStatus: ReviewStatus = ReviewStatus.PENDING;
  reviewedAt?: string;
  reviewComment?: string;
  cycleNo: number = 1;
  executionId!: string;
  performedById?: string;
  reviewedById?: string;
  reexamOfId?: string;
}

// DTO création
export type ControlEvaluationCreateDto = Required<Pick<ControlEvaluation, 'executionId'>> & Partial<Pick<ControlEvaluation, 'evaluation' | 'comments' | 'resume' | 'performedById' | 'reviewedById' | 'reexamOfId'>>;

// DTO mise à jour
export type ControlEvaluationUpdateDto = Partial<Omit<ControlEvaluation, 'id' | 'executionId' | 'createdAt'>>;

// DTO affichage
export type ControlEvaluationDto = ControlEvaluation;
