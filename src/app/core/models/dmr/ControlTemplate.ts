import { ControlType } from "../../enum/controltype.enum";
import { ControlDegree } from "../../enum/degree.enum";
import { EvaluationControl } from "../../enum/evaluation-controle.enum";
import { Recurrence } from "../../enum/recurrence.enum";
import { ControlExecution } from "./ControlExecution";

export class ControlTemplate {
  id!: string;
  reference?: string;
  libelle!: string;
  description?: string;
  frequency?: Recurrence;
  controlType?: ControlType;
  level?: ControlDegree;
  generalEvaluation?: EvaluationControl;
  creatorId?: string;
  actif: boolean = true;
  riskId?: string;
  controlExecutions?: ControlExecution[];
}

// DTO pour la création
export type ControlTemplateCreateDto = Required<Pick<ControlTemplate, 'libelle' | 'riskId'>> & Partial<Pick<ControlTemplate, 'reference' | 'description' | 'frequency' | 'controlType' | 'level' | 'generalEvaluation'>>;

// DTO pour la mise à jour
export type ControlTemplateUpdateDto = Partial<Omit<ControlTemplate, 'id' | 'creatorId' | 'riskId'>>;

// DTO complet pour affichage
export type ControlTemplateDto = ControlTemplate;
