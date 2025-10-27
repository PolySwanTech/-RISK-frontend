import { EvaluationControl } from "../enum/evaluation-controle.enum";

export class AttenuationMetrics {
  id!: string;             // UUID
  reference: string = '';
  libelle: string = '';
  description: string = '';

  /** Date de création en ISO (Instant côté back) */
  creation!: string;

  actif: boolean = true;

  /** UUID du créateur */
  creatorId!: string;
  creatorName!: string

  createdAt!: Date;

  type!: AttenuationMetricsTypeDto;

  evaluation?: EvaluationControl;

  /** Relation vers Risk (clé composite côté back, simplifiée côté front) */
  riskId?: string;
  riskVersion?: string;

  /** constructeur pratique */
  constructor(init?: Partial<AttenuationMetrics>) {
    Object.assign(this, init);
  }
}

// DTO pour la création
export interface AttenuationMetricsCreateDto {
  libelle: string;
  description: string;
  riskId: string;
  type: string;
}

export interface AttenuationMetricsTypeDto {
  code: string;
  definition: string | null;
  parentCode: string | null;
  label: string;
}