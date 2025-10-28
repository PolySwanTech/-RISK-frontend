import { ControlNature } from "../../enum/ControlNature.enum";
import { ExecutionMode } from "../../enum/exceutionmode.enum";

export class ControlMethodology {
  id!: string;
  controlTemplateId!: string;
  controlNature!: ControlNature;
  executionMode!: ExecutionMode;
  scope?: string;
  sampling?: string;
  createdById!: string;
}

// DTO pour création
export type ControlMethodologyCreateDto = Required<Pick<ControlMethodology, 'controlTemplateId' | 'controlNature' | 'executionMode' | 'createdById'>> & Partial<Pick<ControlMethodology, 'scope' | 'sampling'>>;

// DTO pour mise à jour
export type ControlMethodologyUpdateDto = Partial<Omit<ControlMethodology, 'id' | 'controlTemplateId' | 'createdById'>>;

// DTO affichage
export type ControlMethodologyDto = ControlMethodology;
