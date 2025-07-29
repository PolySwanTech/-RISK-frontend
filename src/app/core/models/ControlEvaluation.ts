import { Evaluation } from "../enum/evaluation.enum";

export class ControlEvaluation {
  executionId!: string;
  evaluation!: Evaluation;
  resume!: string;
  comments!: string;
}