import { RiskTemplate } from "./RiskTemplate";

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
  riskId: string;     // UUID du risk
}
