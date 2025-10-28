import { Priority } from "../../enum/Priority";
import { Status } from "../../enum/status.enum";
import { ControlEvaluation } from "./ControlEvaluation";

export class ControlExecution {
  id!: string;
  priority?: Priority;
  status?: Status;
  achievedAt?: string;
  comments?: string;
  resume?: string;
  plannedAt?: string;
  createdAt?: string;
  controlTemplateId!: string;
  performedById?: string;
  evaluatorId?: string;
  evaluations?: ControlEvaluation[];
  actif: boolean = true;
}

// DTO création
export type ControlExecutionCreateDto = Required<Pick<ControlExecution, 'controlTemplateId'>> & Partial<Pick<ControlExecution, 'priority' | 'status' | 'plannedAt' | 'performedById' | 'evaluatorId' | 'comments' | 'resume'>>;

// DTO mise à jour
export type ControlExecutionUpdateDto = Partial<Omit<ControlExecution, 'id' | 'controlTemplateId' | 'createdAt'>>;

// DTO affichage
export type ControlExecutionDto = ControlExecution;
