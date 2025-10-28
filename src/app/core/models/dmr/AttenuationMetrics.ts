import { EvaluationControl } from "../../enum/evaluation-controle.enum";

export class AttenuationMetrics {
  id!: string;             // UUID
  reference: string = '';
  libelle: string = '';
  description: string = '';
  creation!: Date;       // ISO date string
  actif: boolean = true;
  creatorId!: string;
  creatorName!: string;
  createdAt!: Date;
  type!: AttenuationMetricsTypeDto;
  evaluation?: EvaluationControl;
  riskId?: string;
  riskVersion?: string;

  constructor(init?: Partial<AttenuationMetrics>) {
    Object.assign(this, init);
  }
}

export interface AttenuationMetricsTypeDto {
  code: string;
  definition: string | null;
  parentCode: string | null;
  label: string;
}

export type AttenuationMetricsDto = Required<
  Pick<
    AttenuationMetrics,
    | 'id'
    | 'reference'
    | 'libelle'
    | 'description'
    | 'createdAt'
    | 'actif'
    | 'type'
    | 'evaluation'
    | 'creatorId'
    | 'creatorName'
    | 'riskId'
  >
>;

export type AttenuationMetricsCreateDto = Pick<
  Required<AttenuationMetrics>,
  'libelle' | 'description' | 'riskId' | 'type'
>;

export type AttenuationMetricsUpdateDto = Partial<
  Omit<AttenuationMetrics, 'id' | 'creatorId' | 'creatorName' | 'createdAt'>
> & { id: string };

export type AttenuationMetricsLightDto = Pick<
  AttenuationMetrics,
  'id' | 'libelle' | 'actif' | 'type'
>;