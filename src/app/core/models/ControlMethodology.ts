import { ControlNature } from "../enum/ControlNature.enum";
import { ExecutionMode } from "../enum/exceutionmode.enum";

export interface ControlMethodology {
  id: string;
  controlTemplateId: string;
  controlTemplateVersion: string;
  controlNature: ControlNature;
  executionMode: ExecutionMode;
  scope?: string | null;
  sampling?: string | null;
  createdBy?: string | null;  
}

export interface ControlMethodologyCreateDto {
  controlTemplateId: string;
  controlTemplateVersion: string;
  controlNature: ControlNature;
  executionMode: ExecutionMode;
  scope?: string;
  sampling?: string;
}