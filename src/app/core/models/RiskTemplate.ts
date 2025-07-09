import { BaloiseCategoryEnum } from "../enum/baloisecategory.enum";
import { RiskImpactType } from "../enum/riskImpactType.enum";
import { RiskLevel } from "../enum/riskLevel.enum";
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

  libelle = '';
  description = '';

  /** Enum à iso avec le back */
  riskBrut: RiskLevel = RiskLevel.LOW;

  /** UUID du process concerné */
  processId = '';

  reference = '';

  category?: BaloiseCategoryEnum;

  /** Set côté back → tableau côté front  */
  impactTypes: RiskImpactType[] = [];

  /** actif par défaut */
  active = true;

  /* relations */
  riskEvaluations?: RiskEvaluation[];
  controlTemplates?: ControlTemplate[];

  creator?: string; // UUID de l'utilisateur qui a créé le risque

  buName : string = ''

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
  libelle:        string;
  description: string;
  processId:   string;                 // UUID
  riskBrut:    RiskLevel;
  category:  BaloiseCategoryEnum;      // objet complet (cf. back)
  impactTypes: RiskImpactType[];       // tableau → Set côté Java
  parent ?: string; // optionnel, pour les risques enfants
}