import { BaloiseCategoryEnum } from "../enum/baloisecategory.enum";
import { RiskImpactType } from "../enum/riskImpactType.enum";
import { RiskLevel } from "../enum/riskLevel.enum";
import { ControlTemplate } from "./ControlTemplate";
import { RiskEvaluation } from "./RiskEvaluation";
import { RPC } from "./RPC";



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

  libellePerso = '';
  libelleBalois = '';
  description = '';

  /** Enum à iso avec le back */
  riskBrut: RiskLevel = RiskLevel.LOW;

  /** UUID du process concerné */
  processId = '';

  reference = '';

  category?: BaloiseCategoryEnum;

  /** Set côté back → tableau côté front  */
  // impactTypes: RiskImpactType[] = [];

  /** actif par défaut */
  active = true;

  /* relations */
  riskEvaluations?: RiskEvaluation[];
  controlTemplates?: ControlTemplate[];

  rpc : RPC[] = []

  creator?: string; // UUID de l'utilisateur qui a créé le risque

  buName : string = ''
  processName: string = '';

  parent: RiskTemplate | null = null; // pour les risques parents, sinon null

  children: RiskTemplate[] = []; // pour les risques enfants

  level: number = 0; // niveau de profondeur dans l'arborescence

  /** constructeur pratique pour Object.assign(new RiskTemplate(), dto) */
  constructor(init?: Partial<RiskTemplate>) {
    Object.assign(this, init);
  }
}

// -------------  DTO -------------
export interface RiskTemplateCreateDto {
  libellePerso:        string;
  libelleBalois:        string;
  description: string;
  processId:   string;                 // UUID
  riskBrut:    RiskLevel;
  impactTypes: RiskImpactType[];       // tableau → Set côté Java
  parent? : string | null; // optionnel, pour les risques enfants
}