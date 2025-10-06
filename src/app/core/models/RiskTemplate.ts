import { AttenuationMetrics } from "./AttenuationMetrics";
import { ControlTemplate } from "./ControlTemplate";
import { RiskEvaluation } from "./RiskEvaluation";
import { RiskReferentiel } from "./RiskReferentiel";



export interface Dmr {
  controls: ControlTemplate[];
  attenuationMetrics: AttenuationMetrics[];
}

// -------------  MODÈLE PRINCIPAL -------------
export class RiskTemplate {

  id!: string;

  libelle!: string;

  reference!: string;

  riskReferentiel!: RiskReferentiel;

  /** actif par défaut */
  active = true;

  creator!: string;

  buName: string = '';
  processName: string = '';
  processId?: string;

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
  libelle: string;
  riskReferentielId: string;
  processId:   string;                 // UUID
}