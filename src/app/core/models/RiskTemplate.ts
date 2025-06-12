import { RiskImpactType } from "../enum/riskImpactType.enum";
import { RiskLevel } from "../enum/riskLevel.enum";
import { BaloiseCategoryL2 } from "./BaloiseCategory";
import { ControlTemplate } from "./ControlTemplate";
import { RiskEvaluation } from "./RiskEvaluation";



// -------------  TYPES COMPLÉMENTAIRES -------------
export interface RiskId {
  /** UUID généré côté back */
  id: string;
  /** Instant ISO 8601 retourné par le back */
  version: string;
}


// -------------  MODÈLE PRINCIPAL -------------
export class RiskTemplate {

  /** Identifiant composite (UUID + version) */
  id!: RiskId;

  name = '';
  description = '';

  /** Enum à iso avec le back */
  riskBrut: RiskLevel = RiskLevel.LOW;

  /** UUID du process concerné */
  processId = '';

  probability?: number;

  categoryL2?: BaloiseCategoryL2;

  /** Set côté back → tableau côté front  */
  impactTypes: RiskImpactType[] = [];

  /** actif par défaut */
  active = true;

  /* relations */
  riskEvaluations?: RiskEvaluation[];
  controlTemplates?: ControlTemplate[];

  /** constructeur pratique pour `Object.assign(new RiskTemplate(), dto)` */
  constructor(init?: Partial<RiskTemplate>) {
    Object.assign(this, init);
  }
}

// -------------  DTO -------------
export interface RiskTemplateCreateDto {
  name:        string;
  description: string;
  processId:   string;                 // UUID
  riskBrut:    RiskLevel;
  probability: number | null;
  categoryL2:  BaloiseCategoryL2;      // objet complet (cf. back)
  impactTypes: RiskImpactType[];       // tableau → Set côté Java
}