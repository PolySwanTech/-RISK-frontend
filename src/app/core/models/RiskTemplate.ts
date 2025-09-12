import { AttenuationMetrics } from "./AttenuationMetrics";
import { ControlTemplate } from "./ControlTemplate";
import { RiskEvaluation } from "./RiskEvaluation";


// -------------  TYPES COMPLÉMENTAIRES -------------
export interface RiskId {
  /** UUID généré côté back */
  id: string;
  /** Instant ISO 8601 retourné par le back */
  version: string;
}

export interface Dmr {
  controls: ControlTemplate[];
  attenuationMetrics: AttenuationMetrics[];
}



// -------------  MODÈLE PRINCIPAL -------------
export class RiskTemplate {

  /** Identifiant composite (UUID + version) */
  id!: RiskId;

  reference = '';
  libellePerso = '';
  description = '';

  /** Set côté back → tableau côté front  */
  // impactTypes: RiskImpactType[] = [];

  /** actif par défaut */
  active = true;

  /** UUID du créateur */
  creator!: string;

  category!: BaloiseCategoryDto;

  /** nom de la BU et du process (injectés par le back) */
  buName: string = '';
  processName: string = '';
  processId?: string; // UUID du process

  /** relations */
  parent: RiskTemplate | null = null; 
  children: RiskTemplate[] = []; 

  riskNet?: RiskEvaluation[];
  riskBrut?: RiskEvaluation[];

  /** champ dérivé côté back (@Transient) */
  dmr?: Dmr;

  // Accès pratiques (si tu veux manipuler sans repasser par dmr?.)
  get controls(): ControlTemplate[] {
    return this.dmr?.controls ?? [];
  }
  get attenuationMetrics(): AttenuationMetrics[] {
    return this.dmr?.attenuationMetrics ?? [];
  }

  /** profondeur dans l’arborescence */
  level: number = 0;

  /** constructeur pratique pour Object.assign(new RiskTemplate(), dto) */
  constructor(init?: Partial<RiskTemplate>) {
    Object.assign(this, init);
  }
}

// -------------  DTO -------------
export interface RiskTemplateCreateDto {
  libellePerso:        string;
  category: BaloiseCategoryDto;
  description: string;
  processId:   string;                 // UUID
  parent? : string | null; // optionnel, pour les risques enfants
}

export interface BaloiseCategoryDto {
  libelle: string;
  definition: string | null;
  parent: string | null;
  label: string;
}