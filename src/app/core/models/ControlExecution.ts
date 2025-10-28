import { EvaluationControl } from "../enum/evaluation-controle.enum";
import { Priority } from "../enum/Priority";
import { Status } from "../enum/status.enum";

export interface ControlExecution {
  id: string;
  priority: Priority;
  usedData: string;
  controlData: string;
  achievedAt: Date | null;
  plannedAt: Date | null;
  performedBy: string;
  status: Status;
  evaluation: EvaluationControl;
  evaluator: string;
  resume: string;
  comments: string;
}

export type ControlExecutionDetails = Omit<
  ControlExecution,
  'priority' | 'usedData' | 'controlData' | 'resume' | 'comments'
>;

export type ControlExecutionTableView = Omit<
  ControlExecution,
  'usedData' | 'controlData' | 'resume' | 'comments' | 'evaluator' | 'id'
>;

export type ControlExecutionView = Pick<
  ControlExecution,
  'id' | 'status' | 'evaluation' | 'performedBy' | 'plannedAt'
>