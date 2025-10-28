import { ControlNature } from "../enum/ControlNature.enum";
import { ExecutionMode } from "../enum/exceutionmode.enum";

export interface ControlMethodology {
  controlTemplateId: string;
  controlNature: ControlNature;
  executionMode: ExecutionMode;
  scope?: string | null;
  sampling?: string | null;  
}

export type ControlMethodologyViewDto = Required<Pick<
  ControlMethodology,
  'controlNature' | 'executionMode' | 'scope' | 'sampling'
>>;

export type ControlMethodologyCreateDto = Pick<
  ControlMethodology,
  'controlTemplateId' | 'controlNature' | 'executionMode' | 'scope' | 'sampling'
>;