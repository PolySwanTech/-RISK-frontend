import { Type } from "../enum/controltype.enum";
import { Degree } from "../enum/degree.enum";
import { Priority } from "../enum/Priority";
import { Recurrence } from "../enum/recurrence.enum";
import { RiskLevel } from "../enum/riskLevel.enum";
import { ControlExecution } from "./ControlExecution";

export interface ControlTemplate {

    id: string;
    reference: string;
    libelle: string;
    description: string;
    frequency: Recurrence;
    controlLevel: Degree;
    controlType: Type;
    processName: string;
    responsable: string;
    planDate: Date;
    realizeDate: Date;
    execution: ControlExecution | null;
    nextExecution : string;
    actif : boolean;
    riskLevel : RiskLevel;
    creator: string;
    riskName: string;
    level: Degree;
}

export type ControlTemplateListViewDto = Omit<
  ControlTemplate,
  'planDate' | 'realizeDate' | 'description' | 'execution' | 'riskName' | 'level'
>;

export type ControlDetailsView = Omit<
  ControlTemplate,
  'planDate' | 'realizeDate' | 'execution' | 'riskLevel'
>;

export type ControlTemplateCreateDto = Required<Pick<
  ControlTemplate,
  'libelle' | 'description' | 'frequency' | 'controlType' | 'level'
> & {
  priority: Priority;
  processId: string;
  riskId: string;
}>;